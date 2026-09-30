import { api } from './client';

export type ActivationContext = { activation_credential: string; expires_at: string; email: string };
export type ActivationResult = { active: boolean; status: 'active'; access_method: 'subscription' | 'insurance'; clinician_linked: boolean };

export async function issueActivation(authToken: string) {
  return api<{ activation_url: string; expires_at: string; expires_in: number }>('/api/v1/access/activation-session', authToken, {}, 'POST');
}

export async function exchangeActivation(token: string) {
  return api<ActivationContext>('/api/v1/access/activation-session/exchange', undefined, { token }, 'POST');
}

export async function getActivationContext(credential: string) {
  return api<{ email: string; active: boolean; expires_at: string }>('/api/v1/access/activation/context', credential);
}

export async function lookupClinician(credential: string, id: string) {
  return api<{ risk_sense_id: string; first_name: string; last_name: string; professional_title?: string; specialization?: string; institution?: string }>(`/api/v1/access/activation/clinicians/lookup/${encodeURIComponent(id)}`, credential);
}

export async function completeActivation(credential: string, body: object) {
  return api<ActivationResult>('/api/v1/access/activation/complete', credential, body, 'POST');
}
