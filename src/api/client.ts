const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(path: string, token?: string, body?: unknown, method = 'GET'): Promise<T> {
  if (!base) throw new ApiError(0, 'The RiskSense API is not configured for this website.');
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  } catch { throw new ApiError(0, 'The RiskSense service is unavailable. Please try again.'); }
  if (!response.ok) {
    if (response.status === 401) throw new ApiError(401, 'Your session has expired. Please sign in again.');
    if (response.status === 403) throw new ApiError(403, 'This account is not permitted to complete patient access setup.');
    if (response.status === 404) throw new ApiError(404, 'The requested record was not found. Please check the details.');
    if (response.status === 409) throw new ApiError(409, 'A request already exists or conflicts with the current access state.');
    throw new ApiError(response.status, 'The request could not be completed. Please check your details and try again.');
  }
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<{ access_token: string }> {
  if (!base) throw new ApiError(0, 'The RiskSense API is not configured for this website.');
  let response: Response;
  try { response = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ username: email, password }), cache: 'no-store' }); }
  catch { throw new ApiError(0, 'The RiskSense service is unavailable. Please try again.'); }
  if (!response.ok) throw new ApiError(response.status, response.status === 401 ? 'Incorrect email or password.' : 'Sign-in failed. Please try again.');
  return response.json();
}
