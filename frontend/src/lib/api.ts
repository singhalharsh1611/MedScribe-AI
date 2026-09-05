const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

const get = <T = any>(path: string) => request<T>(path);
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
    me: (id: number) => get(`/auth/me/${id}`),
    update: (id: number, data: any) => patch(`/auth/me/${id}`, data),
  },

  // ── Clinics ────────────────────────────────────────────────
  clinics: {
    create: (data: any) => post('/clinics', data),
    list: () => get('/clinics'),
    get: (id: number) => get(`/clinics/${id}`),
    update: (id: number, data: any) => patch(`/clinics/${id}`, data),
    doctors: (id: number) => get(`/clinics/${id}/doctors`),
    stats: (id: number) => get(`/clinics/${id}/stats`),
    join: (userId: number, clinicId: number) => post('/clinics/join', { userId, clinicId }),
  },

  // ── Patients ───────────────────────────────────────────────
  patients: {
    create: (data: any) => post('/patients', data),
    list: (clinicId?: number, search?: string) =>
      get(`/patients?${clinicId ? `clinic_id=${clinicId}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
    get: (id: number) => get(`/patients/${id}`),
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
    list: (clinicId?: number, doctorId?: number) =>
      get(`/appointments?${clinicId ? `clinic_id=${clinicId}` : ''}${doctorId ? `&doctor_id=${doctorId}` : ''}`),
    get: (id: number) => get(`/appointments/${id}`),
    update: (id: number, data: any) => patch(`/appointments/${id}`, data),
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
  },

  // ── Encounters ─────────────────────────────────────────────
  encounters: {
    create: (data: any) => post('/encounters', data),
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
};

// ── Local storage helpers ─────────────────────────────────────
export function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}
export function setUser(user: any) { localStorage.setItem('user', JSON.stringify(user)); }
export function clearUser() { localStorage.removeItem('user'); localStorage.removeItem('registerData'); }
export function getSuperAdmin() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('superAdmin') || 'null'); } catch { return null; }
}
