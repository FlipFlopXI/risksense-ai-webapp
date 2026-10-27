'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { exchangeActivation, getActivationProfile, renewSubscription, signOutActivation, type ActivationContext, type ActivationProfile } from '@/api/activationApi';
import { clearActivationSession, readActivationSession, saveActivationSession } from '@/api/activationSession';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';

export function WebsiteProfile() {
  const [profile, setProfile] = useState<ActivationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [confirmRenewal, setConfirmRenewal] = useState(false);
  const [message, setMessage] = useState('');
  const handoff = useRef<Promise<ActivationContext | null> | null>(null);

  useEffect(() => {
    let alive = true;
    if (!handoff.current) {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
      if (token) window.history.replaceState(null, '', '/profile');
      handoff.current = token ? exchangeActivation(token).then(value => {
        saveActivationSession(value);
        return value;
      }) : Promise.resolve(readActivationSession());
    }
    const sessionPromise = handoff.current;
    void sessionPromise.then(session => {
      if (!session) return;
      return getActivationProfile(session.activation_credential).then(value => {
        if (alive) setProfile(value);
      });
    }).catch((cause: unknown) => {
      clearActivationSession();
      if (alive) setMessage(cause instanceof Error ? cause.message : 'Your website session could not be checked. Open a new link from the app or sign in again.');
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function confirmSubscriptionRenewal() {
    const session = readActivationSession();
    if (!session || !profile?.can_renew) return;
    setRenewing(true);
    setMessage('');
    try {
      const result = await renewSubscription(session.activation_credential);
      setProfile({ ...profile, active: true, subscription_expires_at: result.expires_at, can_renew: false });
      setConfirmRenewal(false);
      setMessage(`Your demonstration subscription was renewed through ${new Date(result.expires_at).toLocaleDateString()}. No payment was charged.`);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Renewal could not be completed.');
    } finally { setRenewing(false); }
  }

  async function signOut() {
    const session = readActivationSession();
    setSigningOut(true);
    setMessage('');
    try {
      if (session) await signOutActivation(session.activation_credential);
    } catch {
      setMessage('This browser has signed out. The server session may remain valid until its short expiry.');
    } finally {
      clearActivationSession();
      setProfile(null);
      setSignedOut(true);
      setSigningOut(false);
    }
  }

  return <><Nav /><main id="main" className="min-h-screen bg-ink px-5 pb-24 pt-28 text-paper sm:px-8">
    <div className="mx-auto max-w-4xl">
      <p className="micro text-brass">Your website session</p>
      <h1 className="mt-4 font-display text-5xl font-normal sm:text-6xl">Profile<span className="text-brass">.</span></h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-paper/60">View your RiskSense AI account and access details. Your health records and risk analyses remain in the mobile app.</p>

      {loading ? <div role="status" className="mt-12 border border-paper/15 bg-white/[0.03] p-8 text-paper/70">Checking your website session…</div> : profile ? <div className="mt-12 overflow-hidden border border-paper/15 bg-gradient-to-br from-graphite to-ink shadow-[0_30px_90px_rgba(0,0,0,.3)]">
        <div className="flex items-center gap-5 border-b border-paper/12 p-7 sm:p-10">
          <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-brass/45 bg-brass/10 font-display text-2xl text-brass">{profile.first_name.slice(0, 1).toUpperCase()}{profile.last_name.slice(0, 1).toUpperCase()}</span>
          <div><p className="micro-sm text-brass">Patient account</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{profile.first_name} {profile.last_name}</h2></div>
        </div>
        <dl className="grid gap-px bg-paper/10 sm:grid-cols-2">
          <div className="bg-ink p-7"><dt className="micro-sm text-paper/40">Email address</dt><dd className="mt-2 break-all text-lg">{profile.email}</dd></div>
          <div className="bg-ink p-7"><dt className="micro-sm text-paper/40">Access status</dt><dd className={`mt-2 text-lg ${profile.active ? 'text-ok' : 'text-warn'}`}>{profile.active ? 'Activated' : 'Activation in progress'}</dd></div>
          <div className="bg-ink p-7"><dt className="micro-sm text-paper/40">Access method</dt><dd className="mt-2 text-lg capitalize">{profile.access_method ?? 'Not activated yet'}{profile.access_method && <span className="ml-2 text-sm normal-case text-paper/45">(demonstration)</span>}</dd></div>
          <div className="bg-ink p-7"><dt className="micro-sm text-paper/40">Website session expires</dt><dd className="mt-2 text-lg">{new Date(profile.expires_at).toLocaleString()}</dd></div>
        </dl>
        {profile.access_method === 'subscription' && <section className="m-7 rounded-2xl border border-brass/35 bg-brass/[0.07] p-6 sm:m-10" aria-label="Subscription renewal">
          <p className="micro-sm text-brass">Subscription</p>
          <h3 className="mt-2 font-display text-3xl">Renew your access</h3>
          <p className="mt-3 text-paper/70">Your {profile.subscription_plan ?? 'current'} demonstration plan {profile.subscription_expires_at ? `expires on ${new Date(profile.subscription_expires_at).toLocaleDateString()}` : 'has no recorded expiry'}.</p>
          <p className="mt-3 text-sm text-amber-200">This project uses staged verification. Renewal extends access by 30 days; no real payment is taken.</p>
          {profile.can_renew ? <>
            {!confirmRenewal ? <button type="button" onClick={() => setConfirmRenewal(true)} className="mt-6 rounded-lg bg-brass px-6 py-3 font-semibold text-ink hover:bg-paper">Renew Subscription</button> : <div className="mt-6 rounded-xl border border-brass/30 bg-ink p-5"><p>Confirm a 30-day demonstration renewal for this account?</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => setConfirmRenewal(false)} className="rounded-lg border border-paper/30 px-5 py-2">Cancel</button><button type="button" disabled={renewing} onClick={() => void confirmSubscriptionRenewal()} className="rounded-lg bg-brass px-5 py-2 font-semibold text-ink disabled:opacity-50">{renewing ? 'Renewing…' : 'Confirm Renewal'}</button></div></div>}
          </> : <p className="mt-5 text-paper/65">Open a fresh renewal link from your mobile profile to renew again.</p>}
        </section>}
        <div className="flex flex-wrap items-center gap-4 p-7 sm:p-10">
          <button type="button" disabled={signingOut} onClick={() => void signOut()} className="border border-ember bg-ember px-7 py-3 micro text-paper transition-colors hover:bg-transparent hover:text-ember disabled:opacity-50">{signingOut ? 'Signing out…' : 'Sign out'}</button>
          <Link href="/" className="border border-paper/25 px-7 py-3 micro text-paper transition-colors hover:border-brass hover:text-brass">Website Home</Link>
        </div>
      </div> : <div className="mt-12 border border-paper/15 bg-white/[0.03] p-8 sm:p-10">
        <h2 className="font-display text-3xl">{signedOut ? 'Signed out' : 'No active website session'}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-paper/65">Sign in to your existing RiskSense AI account or complete your registration. We will check your current access after sign-in.</p>
        <Link href="/register/complete" className="mt-7 inline-block rounded-lg bg-brass px-6 py-3 text-center font-semibold text-ink transition-colors hover:bg-paper">Sign In or Complete Registration</Link>
      </div>}
      {message && <p role="alert" className="mt-5 border border-warn/35 bg-warn/10 p-4 text-warn">{message}</p>}
    </div>
  </main><Footer /></>;
}
