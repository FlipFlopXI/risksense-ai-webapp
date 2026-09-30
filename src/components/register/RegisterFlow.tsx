'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api, ApiError, login } from '@/api/client';
import { completeActivation, exchangeActivation, getActivationContext, issueActivation, lookupClinician, type ActivationContext } from '@/api/activationApi';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';

type Clinician = { risk_sense_id: string; first_name: string; last_name: string; professional_title?: string; specialization?: string; institution?: string };
type Step = 'account' | 'access' | 'clinician' | 'review' | 'complete';
const steps: Step[] = ['account', 'access', 'clinician', 'review', 'complete'];
const names = ['Account', 'Access', 'Clinician', 'Review', 'Complete'];

export function RegisterFlow() {
  const [step, setStep] = useState<Step>('account');
  const [credential, setCredential] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [method, setMethod] = useState<'subscription' | 'insurance'>('subscription');
  const [plan, setPlan] = useState<'free' | 'standard' | 'premium'>('free');
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
      sessionStorage.removeItem('rs-activation-context');
      void exchangeActivation(token).then(context => {
        sessionStorage.setItem('rs-activation-context', JSON.stringify(context));
        setCredential(context.activation_credential);
        setEmail(context.email);
        setStep('access');
      }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'The activation link could not be exchanged.')).finally(() => setInitializing(false));
      return;
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem('rs-activation-context') || 'null') as ActivationContext | null;
      if (saved && Date.parse(saved.expires_at) > Date.now()) {
        setCredential(saved.activation_credential);
        setEmail(saved.email);
        void getActivationContext(saved.activation_credential).then(context => {
          setStep(context.active ? 'complete' : 'access');
        }).catch(() => {
          sessionStorage.removeItem('rs-activation-context');
          setCredential('');
          setStep('account');
        }).finally(() => setInitializing(false));
        return;
      } else sessionStorage.removeItem('rs-activation-context');
    } catch { sessionStorage.removeItem('rs-activation-context'); }
    setInitializing(false);
  }, []);

  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setError('');
    try { await action(); }
    catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) { setCredential(''); sessionStorage.removeItem('rs-activation-context'); setStep('account'); }
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.');
    } finally { inFlight.current = false; setBusy(false); }
  }

  const field = 'mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-paper outline-none focus:border-cyan-300';
  const primary = 'rounded-lg bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-wait disabled:opacity-50';
  const secondary = 'rounded-lg border border-white/30 px-6 py-3 text-paper hover:bg-white/10';

  return <><Nav /><main id="main" className="min-h-screen bg-ink px-5 pb-24 pt-28 text-paper sm:px-8"><div className="mx-auto max-w-3xl">
    <p className="micro text-cyan-300">Complete your registration</p>
    <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Set up RiskSense access</h1>
    <p className="mt-4 max-w-2xl text-paper/70">Arriving from the mobile app verifies your account automatically. Choose one demo access method, confirm an approved clinician, then explicitly activate through FastAPI.</p>
    <ol aria-label="Registration progress" className="mt-10 grid grid-cols-5 gap-1 text-center text-xs sm:gap-2 sm:text-sm">{steps.map((value, index) => <li key={value} aria-current={step === value ? 'step' : undefined} className={`rounded-md px-1 py-3 ${steps.indexOf(step) >= index ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-paper/60'}`}>{names[index]}</li>)}</ol>
    <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl sm:p-9">
      {initializing && <p role="status">Checking activation link…</p>}
      {error && <p role="alert" className="mb-6 rounded-lg border border-red-400/50 bg-red-500/10 p-4 text-red-100">{error}</p>}
      {!initializing && step === 'account' && <form onSubmit={e => { e.preventDefault(); void run(async () => { const session = await login(email, password); const user = await api<{ role: string; is_active: boolean }>('/api/v1/auth/me', session.access_token); if (user.role !== 'patient' || !user.is_active) throw new ApiError(403, 'Use an active RiskSense patient account.'); const issued = await issueActivation(session.access_token); const url = new URL(issued.activation_url); if (url.origin !== window.location.origin) throw new ApiError(0, 'The backend activation website origin does not match this site.'); const handoff = new URLSearchParams(url.hash.slice(1)).get('token') ?? url.searchParams.get('token'); if (!handoff) throw new ApiError(0, 'The backend did not return an activation token.'); const context = await exchangeActivation(handoff); sessionStorage.setItem('rs-activation-context', JSON.stringify(context)); setCredential(context.activation_credential); setPassword(''); setStep('access'); }); }}>
        <h2 className="text-2xl font-semibold">Verify your account</h2><p className="mt-2 text-paper/65">If you opened this page directly, sign in to start a short-lived activation session. Your password is not stored.</p>
        <label className="mt-6 block">Email<input className={field} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="mt-5 block">Password<input className={field} type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button className={`${primary} mt-7`} disabled={busy}>{busy ? 'Verifying…' : 'Verify account'}</button>
      </form>}
      {!initializing && step === 'access' && <div><h2 className="text-2xl font-semibold">Choose access method</h2><p className="mt-2 text-paper/65">Choose one demonstration access method. FastAPI will validate it before activation.</p>
        <fieldset className="mt-6 grid gap-3 sm:grid-cols-2"><legend className="sr-only">Access method</legend>{(['subscription', 'insurance'] as const).map(value => <label key={value} className={`cursor-pointer rounded-xl border p-5 ${method === value ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/20'}`}><input type="radio" name="method" checked={method === value} onChange={() => setMethod(value)} /> <span className="ml-2 capitalize">{value}</span></label>)}</fieldset>
        {method === 'subscription' ? <label className="mt-6 block">Demo plan<select className={field} value={plan} onChange={e => setPlan(e.target.value as typeof plan)}><option className="text-black" value="free">Free</option><option className="text-black" value="standard">Standard</option><option className="text-black" value="premium">Premium</option></select></label> : <div className="mt-6 grid gap-5"><label>Insurer name<input className={field} maxLength={150} value={provider} onChange={e => setProvider(e.target.value)} /></label><label>Policy number (if applicable)<input className={field} maxLength={100} value={policy} onChange={e => setPolicy(e.target.value)} /></label><label>Member number (if applicable)<input className={field} maxLength={100} value={member} onChange={e => setMember(e.target.value)} /></label><p className="text-sm text-amber-200">Insurance verification is simulated. Entering a provider does not confirm coverage or a partnership.</p></div>}
        <button className={`${primary} mt-7`} onClick={() => { if (method === 'insurance' && !provider.trim()) { setError('Enter the insurer name.'); return; } setError(''); setStep('clinician'); }}>Continue</button>
      </div>}
      {!initializing && step === 'clinician' && <form onSubmit={e => { e.preventDefault(); const id = clinicianId.trim().toUpperCase(); if (!/^RS-CLN-[0-9]{5}$/.test(id)) { setError('Enter a clinician ID in the format RS-CLN-00000.'); return; } void run(async () => { const found = await lookupClinician(credential, id); setClinicianId(id); setClinician(found); setStep('review'); }); }}><h2 className="text-2xl font-semibold">Link your clinician</h2><p className="mt-2 text-paper/65">We check the ID against approved RiskSense clinicians. FastAPI links the relationship during activation.</p><label className="mt-6 block">RiskSense clinician ID<input className={field} required maxLength={12} placeholder="RS-CLN-00000" value={clinicianId} onChange={e => { setClinicianId(e.target.value.toUpperCase()); setClinician(null); }} /></label><div className="mt-7 flex flex-wrap gap-3"><button type="button" className={secondary} onClick={() => setStep('access')}>Back</button><button className={primary} disabled={busy}>{busy ? 'Checking…' : 'Verify clinician'}</button></div></form>}
      {!initializing && step === 'review' && <div><h2 className="text-2xl font-semibold">Review your activation</h2><dl className="mt-6 grid gap-4 rounded-xl bg-white/10 p-5"><div><dt className="text-sm text-paper/55">Account</dt><dd>{email}</dd></div><div><dt className="text-sm text-paper/55">Access</dt><dd>{method === 'subscription' ? `Demo ${plan} subscription` : `Simulated insurance: ${provider}`}</dd></div><div><dt className="text-sm text-paper/55">Clinician</dt><dd>{clinician?.professional_title} {clinician?.first_name} {clinician?.last_name} · {clinicianId}</dd><dd className="text-paper/60">{clinician?.institution} {clinician?.specialization}</dd></div></dl><p className="mt-5 text-sm text-amber-200">This is a demonstration activation. No real charge or external insurer verification occurs.</p><div className="mt-7 flex flex-wrap gap-3"><button className={secondary} disabled={busy} onClick={() => setStep('clinician')}>Back</button><button className={primary} disabled={busy} onClick={() => void run(async () => { const result = await completeActivation(credential, { method, clinician_risk_sense_id: clinicianId, ...(method === 'subscription' ? { plan } : { provider_name: provider.trim(), policy_number: policy.trim() || null, membership_number: member.trim() || null }) }); if (!result.active || !result.clinician_linked) throw new ApiError(0, 'Backend activation was not confirmed.'); setStep('complete'); })}>{busy ? 'Activating…' : 'Activate RiskSense'}</button></div></div>}
      {!initializing && step === 'complete' && <div role="status"><h2 className="text-2xl font-semibold">RiskSense Access Activated</h2><ul className="mt-5 space-y-2 text-cyan-200"><li>✓ Account verified</li><li>✓ Access method configured</li><li>✓ Clinician linked</li><li>✓ Access active</li></ul><p className="mt-5 text-paper/70">The app will independently refresh your access status from FastAPI.</p>{process.env.NEXT_PUBLIC_MOBILE_RETURN_URL ? <a className={`${primary} mt-7 inline-block`} href={process.env.NEXT_PUBLIC_MOBILE_RETURN_URL}>Return to RiskSense</a> : <p className="mt-5 text-paper/60">Switch back to the RiskSense app to continue.</p>}<Link className={`${secondary} mt-4 ml-3 inline-block`} href="/">Website home</Link></div>}
    </div>
  </div></main><Footer /></>;
}
