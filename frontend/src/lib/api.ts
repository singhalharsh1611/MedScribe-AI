const BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  if (opts.body !== undefined && !(opts.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...opts,
      credentials: 'include',
      headers,
    });
  } catch (error) {
    throw new ApiError('Unable to reach the API server.', 0, 'NETWORK_ERROR', error);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get('content-type')?.toLowerCase() || '';
  const raw = await res.text();
  let data: any = null;
  if (raw && contentType.includes('json')) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed with HTTP ${res.status}`;
    if (res.status === 401 && data?.code === 'AUTH_REQUIRED' && typeof window !== 'undefined') {
      clearUser();
      const currentPath = `${window.location.pathname}${window.location.search}`;
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace(`/login?next=${encodeURIComponent(currentPath)}`);
      }
    }
    throw new ApiError(message, res.status, data?.code || 'HTTP_REQUEST_FAILED', data);
  }

  if (!raw) return undefined as T;
  if (!contentType.includes('json')) return raw as T;
  if (data === null) {
    throw new ApiError('The server returned an invalid response.', res.status, 'INVALID_RESPONSE');
  }
  return data as T;
}

const pendingGets = new Map<string, Promise<any>>();
const get = <T = any>(path: string): Promise<T> => {
  const existing = pendingGets.get(path);
  if (existing) return existing as Promise<T>;
  const pending = request<T>(path).finally(() => pendingGets.delete(path));
  pendingGets.set(path, pending);
  return pending;
};
const post = <T = any>(path: string, body: any) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
const patch = <T = any>(path: string, body: any) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = <T = any>(path: string) => request<T>(path, { method: 'DELETE' });

// ── Auth ─────────────────────────────────────────────────────
export const api = {
  auth: {
    checkPhone: (phone: string) => post('/auth/check-phone', { phone }),
    register: (data: { name: string; phone: string; specialty?: string; npi?: string; pin: string; email?: string }) =>
      post('/auth/register', data),
    login: (data: { phone: string; pin: string }) => post('/auth/login', data),
    logout: () => post('/auth/logout', {}),
    me: (id: number) => get(`/auth/me/${id}`),
    update: (id: number, data: any) => patch(`/auth/me/${id}`, data),
    updatePin: (id: number, data: any) => patch(`/auth/pin/${id}`, data),
  },

  // ── Clinics ────────────────────────────────────────────────
  clinics: {
    create: (data: any) => post('/clinics', data),
    list: () => get('/clinics'),
    get: (id: number) => get(`/clinics/${id}`),
    update: (id: number, data: any) => patch(`/clinics/${id}`, data),
    doctors: (id: number) => get(`/clinics/${id}/doctors`),
    stats: (id: number) => get(`/clinics/${id}/stats`),
    auditLogs: (id: number) => get(`/clinics/${id}/audit-logs`),
    removeUser: (clinicId: number, userId: number) => post(`/clinics/${clinicId}/remove-user`, { userId }),
    join: (userId: number, clinicId: number) => post('/clinics/join', { userId, clinicId }),
  },

  // ── Patients ───────────────────────────────────────────────
  patients: {
    create: (data: any) => post('/patients', data),
    list: (clinicId?: number, search?: string, options?: { doctorId?: number; page?: number; limit?: number }) => {
      const params = new URLSearchParams();
      if (clinicId) params.set('clinic_id', String(clinicId));
      if (search) params.set('search', search);
      if (options?.doctorId) params.set('doctor_id', String(options.doctorId));
      if (options?.page) params.set('page', String(options.page));
      if (options?.limit) params.set('limit', String(options.limit));
      return get(`/patients?${params.toString()}`);
    },
    get: (id: number, doctorId?: number) => get(`/patients/${id}${doctorId ? `?doctor_id=${doctorId}` : ''}`),
    update: (id: number, data: any) => patch(`/patients/${id}`, data),
  },

  // ── Queue ──────────────────────────────────────────────────
  queue: {
    get: (clinicId: number, doctorId?: number) =>
      get(`/queue?clinic_id=${clinicId}${doctorId ? `&doctor_id=${doctorId}` : ''}`),
    add: (data: any) => post('/queue', data),
    updateStatus: (id: number, status: string) => patch(`/queue/${id}/status`, { status }),
    remove: (id: number) => del(`/queue/${id}`),
  },

  // ── Appointments ───────────────────────────────────────────
  appointments: {
    create: (data: any) => post('/appointments', data),
    list: (clinicId?: number, doctorId?: number, date?: string) =>
      get(`/appointments?${clinicId ? `clinic_id=${clinicId}` : ''}${doctorId ? `&doctor_id=${doctorId}` : ''}${date ? `&date=${encodeURIComponent(date)}` : ''}`),
    get: (id: number) => get(`/appointments/${id}`),
    update: (id: number, data: any) => patch(`/appointments/${id}`, data),
    delete: (id: number) => del(`/appointments/${id}`),
  },

  // ── Join Requests ──────────────────────────────────────────
  joinRequests: {
    create: (userId: number, clinicId: number, message?: string) =>
      post('/join-requests', { user_id: userId, clinic_id: clinicId, message }),
    list: (clinicId?: number, status?: string) =>
      get(`/join-requests?${clinicId ? `clinic_id=${clinicId}` : ''}${status ? `&status=${status}` : ''}`),
    myRequest: (userId: number) => get(`/join-requests/user/${userId}`),
    review: (id: number, action: 'approve' | 'reject', reviewedBy: number) =>
      patch(`/join-requests/${id}`, { action, reviewed_by: reviewedBy }),
  },

  // ── Staff ──────────────────────────────────────────────────
  staff: {
    list: (clinicId: number) => get(`/staff?clinic_id=${clinicId}`),
    add: (data: any) => post('/staff', data),
    update: (id: number, data: any) => patch(`/staff/${id}`, data),
    remove: (id: number) => del(`/staff/${id}`),
    resetPin: (id: number) => post(`/staff/${id}/reset-pin`, {}),
  },

  // ── Encounters ─────────────────────────────────────────────
  encounters: {
    create: (data: any) => post('/encounters', data),
    startWalkIn: (data: any) => post('/encounters/walk-in', data),
    finalize: (data: any) => post('/encounters/finalize', data),
    list: (opts: { doctorId?: number; patientId?: number; clinicId?: number }) =>
      get(`/encounters?${opts.doctorId ? `doctor_id=${opts.doctorId}` : ''}${opts.patientId ? `&patient_id=${opts.patientId}` : ''}${opts.clinicId ? `&clinic_id=${opts.clinicId}` : ''}`),
    get: (id: number) => get(`/encounters/${id}`),
    update: (id: number, data: any) => patch(`/encounters/${id}`, data),
  },

  // ── Super Admin ────────────────────────────────────────────
  superAdmin: {
    login: (username: string, password: string) => post('/superadmin/login', { username, password }),
    doctors: (status?: string) => get(`/superadmin/doctors${status ? `?status=${status}` : ''}`),
    verifyDoctor: (id: number, action: 'approve' | 'reject') =>
      patch(`/superadmin/doctors/${id}/verify`, { action }),
    clinics: () => get('/superadmin/clinics'),
    stats: () => get('/superadmin/stats'),
  },

  // Prescriptions
  prescriptions: {
    history: () => get('/prescription/history'),
    record: (id: number) => get(`/prescription/record/${id}`),
    send: (id: number) => post(`/prescription/record/${id}/send`, {}),
    get: (id: number) => get(`/prescription/history/${id}`),
    save: (data: any) => post('/prescription/save', data)
  },
};

// ── Local storage helpers ─────────────────────────────────────
export function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
export function setUser(user: any) { localStorage.setItem('user', JSON.stringify(user)); }
export function clearConsultationState() {
  if (typeof window === 'undefined') return;
  [
    'activeQueueEntry',
    'activePatientId',
    'activeEncounter',
    'transcriptionResult',
    'extractionResult',
    'generatedPrescription',
  ].forEach((key) => localStorage.removeItem(key));
}
export function clearUser() {
  if (typeof window === 'undefined') return;
  localStorage.clear();
  sessionStorage.clear();
}
export function getSuperAdmin() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('superAdmin') || 'null'); } catch { return null; }
}
