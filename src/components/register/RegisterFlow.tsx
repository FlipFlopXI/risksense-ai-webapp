'use client';

import { useEffect, useRef, useState } from 'react';
import { api, ApiError, login } from '@/api/client';
import { completeActivation, exchangeActivation, getActivationContext, issueActivation, lookupClinician } from '@/api/activationApi';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { ActivationSuccess } from './ActivationSuccess';
import { DemoPaymentForm } from './DemoPaymentForm';
import { clearActivationSession, readActivationSession, saveActivationSession } from '@/api/activationSession';

type Clinician = { risk_sense_id: string; first_name: string; last_name: string; professional_title?: string; specialization?: string; institution?: string };
type Step = 'account' | 'access' | 'clinician' | 'payment' | 'review' | 'complete' | 'signed_in';
const steps: Step[] = ['account', 'access', 'clinician', 'payment', 'review', 'complete'];
const names = ['Account', 'Access', 'Clinician', 'Payment', 'Review', 'Complete'];

export function RegisterFlow() {
  const [step, setStep] = useState<Step>('account');
  const [credential, setCredential] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<'subscription' | 'insurance'>('subscription');
  const [plan, setPlan] = useState<'standard' | 'premium'>('standard');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [provider, setProvider] = useState('');
  const [policy, setPolicy] = useState('');
  const [member, setMember] = useState('');
  const [clinicianId, setClinicianId] = useState('');
  const [clinician, setClinician] = useState<Clinician | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const handoffStarted = useRef(false);

  useEffect(() => {
    if (handoffStarted.current) return;
    handoffStarted.current = true;
    const currentUrl = new URL(window.location.href);
    const token = new URLSearchParams(currentUrl.hash.slice(1)).get('token') ?? currentUrl.searchParams.get('token');
    if (token) {
      window.history.replaceState(null, '', '/register/complete');
      clearActivationSession();
      void exchangeActivation(token).then(async context => {
        saveActivationSession(context);
        setCredential(context.activation_credential);
        setEmail(context.email);
        const status = await getActivationContext(context.activation_credential);
        setStep(status.existing_access ? 'signed_in' : 'access');
      }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'The activation link could not be exchanged.')).finally(() => setInitializing(false));
      return;
    }
    try {
      const saved = readActivationSession();
      if (saved && Date.parse(saved.expires_at) > Date.now()) {
        setCredential(saved.activation_credential);
        setEmail(saved.email);
        void getActivationContext(saved.activation_credential).then(context => {
          setStep(context.existing_access ? 'signed_in' : 'access');
        }).catch(() => {
          clearActivationSession();
          setCredential('');
          setStep('account');
        }).finally(() => setInitializing(false));
        return;
      } else clearActivationSession();
    } catch { clearActivationSession(); }
    setInitializing(false);
  }, []);

  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError('');
    try { await action(); }
    catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { setCredential(''); clearActivationSession(); setStep('account'); }
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.');
    } finally { inFlight.current = false; setBusy(false); }
  }

  async function signIn() {
    const session = await login(email, password);
    const user = await api<{ role: string; is_active: boolean }>('/api/v1/auth/me', session.access_token);
    if (user.role !== 'patient' || !user.is_active) throw new ApiError(403, 'Use an active RiskSense patient account.');
    const issued = await issueActivation(session.access_token);
    const url = new URL(issued.activation_url);
    const emulatorOrigin = window.location.hostname === '10.0.2.2' &&
      ['localhost', '127.0.0.1'].includes(url.hostname) &&
      url.port === window.location.port;
    if (url.origin !== window.location.origin && !emulatorOrigin)
      throw new ApiError(0, 'The backend activation website origin does not match this site.');
    const handoff = new URLSearchParams(url.hash.slice(1)).get('token');
    if (!handoff) throw new ApiError(0, 'The backend did not return an activation token.');
    const context = await exchangeActivation(handoff);
    saveActivationSession(context);
    setCredential(context.activation_credential);
    setPassword('');
    const status = await getActivationContext(context.activation_credential);
    setStep(status.existing_access ? 'signed_in' : 'access');
  }

  const field = 'mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-paper outline-none focus:border-brass';
  const primary = 'rounded-lg bg-brass px-6 py-3 font-semibold text-ink transition hover:bg-paper disabled:cursor-wait disabled:opacity-50';
  const secondary = 'rounded-lg border border-white/30 px-6 py-3 text-paper hover:bg-white/10';

  return <><Nav /><main id="main" className="min-h-screen bg-ink px-5 pb-24 pt-28 text-paper sm:px-8"><div className="mx-auto max-w-3xl">
    {!initializing && step === 'complete' ? <ActivationSuccess /> : !initializing && step === 'signed_in' ? <ActivationSuccess existing /> : <>
    <p className="micro text-brass">Complete your registration</p>
    <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Set up RiskSense access</h1>
    <p className="mt-4 max-w-2xl text-paper/70">Arriving from the mobile app verifies your account automatically. Choose one demo access method, confirm an approved clinician, then explicitly activate through FastAPI.</p>
    <ol aria-label="Registration progress" className="mt-10 grid grid-cols-6 gap-1 text-center text-xs sm:gap-2 sm:text-sm">{steps.map((value, index) => <li key={value} aria-current={step === value ? 'step' : undefined} className={`rounded-md px-1 py-3 ${steps.indexOf(step) >= index ? 'bg-brass text-ink' : 'bg-white/10 text-paper/60'}`}>{names[index]}</li>)}</ol>
    <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl sm:p-9">
      {initializing && <p role="status">Checking activation link…</p>}
      {error && <p role="alert" className="mb-6 rounded-lg border border-red-400/50 bg-red-500/10 p-4 text-red-100">{error}</p>}
      {!initializing && step === 'account' && <form onSubmit={e => { e.preventDefault(); void run(signIn); }}>
        <h2 className="text-2xl font-semibold">Sign in to RiskSense AI</h2><p className="mt-2 text-paper/65">Existing subscription and insurance members can sign in here. If access is not yet activated, you can complete registration after signing in. Your password is not stored.</p>
        <label className="mt-6 block">Email<input className={field} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="mt-5 block">Password<input className={field} type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className={`${primary} mt-7`} disabled={busy}>{busy ? 'Signing in…' : 'Sign In or Complete Registration'}</button>
      </form>}
      {!initializing && step === 'access' && <div><h2 className="text-2xl font-semibold">Choose access method</h2><p className="mt-2 text-paper/65">Choose one demonstration access method. FastAPI will validate it before activation.</p>
        <fieldset className="mt-6 grid gap-3 sm:grid-cols-2"><legend className="sr-only">Access method</legend>{(['subscription', 'insurance'] as const).map(value => <label key={value} className={`cursor-pointer rounded-xl border p-5 ${method === value ? 'border-brass bg-brass/10' : 'border-white/20'}`}><input type="radio" name="method" checked={method === value} onChange={() => { setMethod(value); setPaymentConfirmed(false); }} /> <span className="ml-2 capitalize">{value}</span></label>)}</fieldset>
        {method === 'subscription' ? <label className="mt-6 block">Demo plan<select className={field} value={plan} onChange={e => { setPlan(e.target.value as typeof plan); setPaymentConfirmed(false); }}><option className="text-black" value="standard">Standard</option><option className="text-black" value="premium">Premium</option></select></label> : <div className="mt-6 grid gap-5"><label>Insurer name<input className={field} maxLength={150} value={provider} onChange={e => setProvider(e.target.value)} /></label><label>Policy number (if applicable)<input className={field} maxLength={100} value={policy} onChange={e => setPolicy(e.target.value)} /></label><label>Member number (if applicable)<input className={field} maxLength={100} value={member} onChange={e => setMember(e.target.value)} /></label><p className="text-sm text-amber-200">Insurance verification is simulated. Entering a provider does not confirm coverage or a partnership.</p></div>}
        <button className={`${primary} mt-7`} onClick={() => { if (method === 'insurance' && !provider.trim()) { setError('Enter the insurer name.'); return; } setError(''); setStep('clinician'); }}>Continue</button>
      </div>}
      {!initializing && step === 'clinician' && <form onSubmit={e => { e.preventDefault(); const id = clinicianId.trim().toUpperCase(); if (!/^RS-CLN-[0-9]{5}$/.test(id)) { setError('Enter a clinician ID in the format RS-CLN-00000.'); return; } void run(async () => { const found = await lookupClinician(credential, id); setClinicianId(id); setClinician(found); setStep(method === 'subscription' ? 'payment' : 'review'); }); }}><h2 className="text-2xl font-semibold">Link your clinician</h2><p className="mt-2 text-paper/65">We check the ID against approved RiskSense clinicians. FastAPI links the relationship during activation.</p><label className="mt-6 block">RiskSense clinician ID<input className={field} required maxLength={12} placeholder="RS-CLN-00000" value={clinicianId} onChange={e => { setClinicianId(e.target.value.toUpperCase()); setClinician(null); }} /></label><div className="mt-7 flex flex-wrap gap-3"><button type="button" className={secondary} onClick={() => setStep('access')}>Back</button><button className={primary} disabled={busy}>{busy ? 'Checking…' : 'Verify clinician'}</button></div></form>}
      {!initializing && step === 'payment' && <DemoPaymentForm plan={plan} onBack={() => setStep('clinician')} onComplete={() => { setPaymentConfirmed(true); setStep('review'); }} />}
      {!initializing && step === 'review' && <div><h2 className="text-2xl font-semibold">Review your activation</h2><dl className="mt-6 grid gap-4 rounded-xl bg-white/10 p-5"><div><dt className="text-sm text-paper/55">Account</dt><dd>{email}</dd></div><div><dt className="text-sm text-paper/55">Access</dt><dd>{method === 'subscription' ? `${plan === 'standard' ? 'Standard' : 'Premium'} demonstration subscription · payment step complete` : `Simulated insurance: ${provider}`}</dd></div><div><dt className="text-sm text-paper/55">Clinician</dt><dd>{clinician?.professional_title} {clinician?.first_name} {clinician?.last_name} · {clinicianId}</dd><dd className="text-paper/60">{clinician?.institution} {clinician?.specialization}</dd></div></dl><p className="mt-5 text-sm text-amber-200">This is a demonstration activation. No real charge or external insurer verification occurs.</p><div className="mt-7 flex flex-wrap gap-3"><button className={secondary} disabled={busy} onClick={() => setStep(method === 'subscription' ? 'payment' : 'clinician')}>Back</button><button className={primary} disabled={busy || (method === 'subscription' && !paymentConfirmed)} onClick={() => void run(async () => { if (method === 'subscription' && !paymentConfirmed) throw new ApiError(0, 'Complete the demonstration payment step first.'); const result = await completeActivation(credential, { method, clinician_risk_sense_id: clinicianId, ...(method === 'subscription' ? { plan } : { provider_name: provider.trim(), policy_number: policy.trim() || null, membership_number: member.trim() || null }) }); if (!result.active || !result.clinician_linked) throw new ApiError(0, 'Backend activation was not confirmed.'); setStep('complete'); })}>{busy ? 'Activating…' : 'Activate RiskSense'}</button></div></div>}
    </div>
    </>}
  </div></main><Footer /></>;
}
