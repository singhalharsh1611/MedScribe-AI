import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import pool from '../services/db.service';

export type SessionPrincipal = {
  id: number;
  role: string;
  permissions?: string[];
  clinicId: number | null;
  kind: 'user' | 'superadmin';
  pinResetRequired?: boolean;
  iat: number;
  exp: number;
};

const LEGACY_SESSION_COOKIE = 'sleekcare_session';
const USER_SESSION_COOKIE = 'sleekcare_user_session';
const SUPERADMIN_SESSION_COOKIE = 'sleekcare_superadmin_session';
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 60 * 60);
const AUTHORIZATION_CACHE_MS = Number(process.env.AUTHORIZATION_CACHE_MS || 10_000);
const runtimeSecret = crypto.randomBytes(32).toString('hex');
type AuthorizationCacheEntry = { principal: SessionPrincipal | null; expiresAt: number };
const authorizationCache = new Map<string, AuthorizationCacheEntry>();
const pendingAuthorizations = new Map<string, Promise<SessionPrincipal | null>>();

const getSecret = () => {
  const configured = process.env.SESSION_SECRET;
  if (configured) {
    if (process.env.NODE_ENV === 'production' && configured.length < 32) {
      throw new Error('SESSION_SECRET must contain at least 32 characters in production');
    }
    return configured;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET is required in production');
  }
  return runtimeSecret;
};

const sign = (payload: string) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

export const createSessionToken = (
  principal: Omit<SessionPrincipal, 'iat' | 'exp'>
) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    ...principal,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};

const readCookie = (req: Pick<Request, 'headers'>, name: string) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
};

export const verifySessionToken = (token: string): SessionPrincipal | null => {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) return null;

  try {
    const principal = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionPrincipal;
    if (!principal.id || !principal.role || principal.exp <= Math.floor(Date.now() / 1000)) return null;
    return principal;
  } catch {
    return null;
  }
};

const cookieAttributes = (name: string, maxAge: number) => {
  const secure = process.env.NODE_ENV === 'production';
  return [
    `${name}=`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAge}`,
    secure ? 'SameSite=None' : 'SameSite=Lax',
    secure ? 'Secure' : '',
  ].filter(Boolean);
};

export const setSessionCookie = (res: Response, token: string) => {
  const principal = verifySessionToken(token);
  const cookieName = principal?.kind === 'superadmin'
    ? SUPERADMIN_SESSION_COOKIE
    : USER_SESSION_COOKIE;
  const attributes = cookieAttributes(cookieName, SESSION_TTL_SECONDS);
  attributes[0] += encodeURIComponent(token);
  res.setHeader('Set-Cookie', attributes.join('; '));
};

export const clearSessionCookie = (res: Response) => {
  res.setHeader('Set-Cookie', [
    cookieAttributes(USER_SESSION_COOKIE, 0).join('; '),
    cookieAttributes(SUPERADMIN_SESSION_COOKIE, 0).join('; '),
    cookieAttributes(LEGACY_SESSION_COOKIE, 0).join('; '),
  ]);
};

export const getPrincipal = (req: Request) =>
  (req as Request & { auth?: SessionPrincipal }).auth;

const reloadPrincipal = async (claimed: SessionPrincipal): Promise<SessionPrincipal | null> => {
  if (claimed.kind === 'superadmin') {
    const result = await pool.query('SELECT id FROM super_admins WHERE id=$1', [claimed.id]);
    return result.rows.length ? claimed : null;
  }

  const result = await pool.query(
    `SELECT id, role, permissions, clinic_id, pin_reset_required, status
     FROM users WHERE id=$1`,
    [claimed.id]
  );
  if (!result.rows.length || ['inactive', 'disabled', 'deleted'].includes(result.rows[0].status)) {
    return null;
  }
  const user = result.rows[0];
  let permissions: string[] = [];
  try {
    const value = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    if (Array.isArray(value)) permissions = value.filter((permission): permission is string => typeof permission === 'string');
  } catch {
    permissions = [];
  }
  return {
    ...claimed,
    role: user.role || 'doctor',
    permissions,
    clinicId: user.clinic_id === null ? null : Number(user.clinic_id),
    pinResetRequired: Boolean(user.pin_reset_required),
  };
};

export const authenticateRequest = async (
  req: Pick<Request, 'headers'> & Partial<Pick<Request, 'baseUrl' | 'originalUrl'>>
): Promise<SessionPrincipal | null> => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const requestPath = req.baseUrl || req.originalUrl || '';
  const preferredCookies = requestPath.startsWith('/api/superadmin')
    ? [SUPERADMIN_SESSION_COOKIE, LEGACY_SESSION_COOKIE, USER_SESSION_COOKIE]
    : [USER_SESSION_COOKIE, LEGACY_SESSION_COOKIE, SUPERADMIN_SESSION_COOKIE];
  const cookieTokens = preferredCookies
    .map((name) => readCookie(req, name))
    .filter((token): token is string => Boolean(token));
  const tokenCandidates = bearer ? [bearer] : cookieTokens;
  const token = tokenCandidates.find((candidate) => verifySessionToken(candidate));
  const claimed = token ? verifySessionToken(token) : null;
  if (!claimed) return null;

  const cacheKey = crypto.createHash('sha256').update(token!).digest('base64url');
  const now = Date.now();
  const cached = authorizationCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.principal;

  const inFlight = pendingAuthorizations.get(cacheKey);
  if (inFlight) return inFlight;

  const lookup = reloadPrincipal(claimed)
    .then((principal) => {
      authorizationCache.set(cacheKey, { principal, expiresAt: Date.now() + AUTHORIZATION_CACHE_MS });
      if (authorizationCache.size > 1_000) {
        for (const [key, entry] of authorizationCache) {
          if (entry.expiresAt <= Date.now()) authorizationCache.delete(key);
        }
      }
      return principal;
    })
    .finally(() => pendingAuthorizations.delete(cacheKey));
  pendingAuthorizations.set(cacheKey, lookup);
  return lookup;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const principal = await authenticateRequest(req);
    if (!principal) return res.status(401).json({ code: 'AUTH_REQUIRED', error: 'Authentication required' });
    (req as Request & { auth?: SessionPrincipal }).auth = principal;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const principal = getPrincipal(req);
    if (!principal) return res.status(401).json({ code: 'AUTH_REQUIRED', error: 'Authentication required' });
    if (principal.kind === 'superadmin') return next();
    if (!roles.includes('superadmin') && roles.includes(principal.role)) return next();
    return res.status(403).json({ code: 'INSUFFICIENT_PERMISSIONS', error: 'Insufficient permissions' });
  };

export const requireRoleOrPermission = (roles: string[], permissions: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const principal = getPrincipal(req);
    if (!principal) return res.status(401).json({ code: 'AUTH_REQUIRED', error: 'Authentication required' });
    if (principal.kind === 'superadmin') return next();
    if (roles.includes(principal.role) || permissions.some((permission) => principal.permissions?.includes(permission))) {
      return next();
    }
    return res.status(403).json({ code: 'INSUFFICIENT_PERMISSIONS', error: 'Insufficient permissions' });
  };

export const requirePinResetComplete = (req: Request, res: Response, next: NextFunction) => {
  const principal = getPrincipal(req);
  if (!principal) return res.status(401).json({ code: 'AUTH_REQUIRED', error: 'Authentication required' });
  if (principal.kind === 'user' && principal.pinResetRequired) {
    return res.status(403).json({ code: 'PIN_RESET_REQUIRED', error: 'PIN reset is required before accessing clinic data' });
  }
  next();
};

export const requireClinicBoundary = (req: Request, res: Response, next: NextFunction) => {
  const principal = getPrincipal(req);
  if (!principal) return res.status(401).json({ code: 'AUTH_REQUIRED', error: 'Authentication required' });
  if (principal.kind === 'superadmin') return next();
  if (principal.clinicId === null) {
    return res.status(403).json({ code: 'CLINIC_MEMBERSHIP_REQUIRED', error: 'Clinic membership is required' });
  }

  const requested = req.body?.clinic_id ?? req.body?.clinicId ?? req.query?.clinic_id ?? req.query?.clinicId;
  if (requested !== undefined && Number(requested) !== principal.clinicId) {
    return res.status(403).json({ code: 'CROSS_CLINIC_ACCESS_DENIED', error: 'Cross-clinic access is not permitted' });
  }
  if (req.method === 'GET') req.query.clinic_id = String(principal.clinicId);
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) req.body.clinic_id = principal.clinicId;
  next();
};

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  const identity = String(req.body?.phone || req.body?.username || getPrincipal(req)?.id || '').toLowerCase();
  const key = `${req.ip}:${identity}`;
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return next();
  }
  if (current.count >= 5) {
    res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
    return res.status(429).json({ code: 'AUTH_RATE_LIMITED', error: 'Too many authentication attempts. Try again later.' });
  }
  current.count += 1;
  next();
};
