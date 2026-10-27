import type { ActivationContext } from './activationApi';

const key = 'rs-activation-context';

export function readActivationSession(): ActivationContext | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) || 'null') as ActivationContext | null;
    if (value?.activation_credential && Date.parse(value.expires_at) > Date.now()) return value;
  } catch { /* Treat malformed local session state as signed out. */ }
  sessionStorage.removeItem(key);
  return null;
}

export function saveActivationSession(value: ActivationContext): void {
  sessionStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('risksense-session-change'));
}

export function clearActivationSession(): void {
  sessionStorage.removeItem(key);
  window.dispatchEvent(new Event('risksense-session-change'));
}
