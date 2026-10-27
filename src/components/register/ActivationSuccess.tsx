'use client';

import Link from 'next/link';

export function ActivationSuccess({ existing = false }: { existing?: boolean }) {
  return <div role="status" className="relative isolate overflow-hidden rounded-[2rem] border border-brass/40 bg-gradient-to-br from-graphite via-ink to-graphite-2 px-6 py-14 text-center shadow-[0_25px_90px_rgba(194,163,107,.12)] sm:px-12">
    <div aria-hidden="true" className="activation-aura pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-brass/15 blur-3xl" />
    <p className="micro text-brass">RiskSense AI · {existing ? 'Welcome back' : 'Access confirmed'}</p>
    <div className="activation-seal relative mx-auto mt-9 flex h-36 w-36 items-center justify-center rounded-full border border-brass/55 bg-gradient-to-br from-brass/25 to-ok/15 shadow-[0_0_55px_rgba(194,163,107,.25)]">
      <div className="absolute inset-3 rounded-full border border-brass/30" />
      <svg aria-hidden="true" viewBox="0 0 100 100" className="h-20 w-20 text-paper">
        <path className="activation-check" d="M22 51 L42 70 L79 31" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 className="activation-copy mt-10 font-display text-4xl font-semibold sm:text-5xl">{existing ? 'Signed in successfully' : 'Your account is verified'}</h2>
    <p className="activation-copy mx-auto mt-5 max-w-xl text-lg leading-relaxed text-paper/75">{existing ? 'Your existing RiskSense access is connected. View your subscription or insurance details on your profile.' : 'Your RiskSense access is active and your clinician is linked. Return to the mobile app to begin your six-step onboarding journey.'}</p>
    {!existing && <p className="activation-copy mx-auto mt-3 max-w-xl text-sm text-paper/50">This is a demonstration activation. No real payment or insurer verification occurred.</p>}
    <div className="activation-copy mt-9 flex flex-wrap items-center justify-center gap-3">
      {process.env.NEXT_PUBLIC_MOBILE_RETURN_URL ? <a className="rounded-xl bg-brass px-7 py-3 font-semibold text-ink transition hover:bg-paper" href={process.env.NEXT_PUBLIC_MOBILE_RETURN_URL}>Return to the app</a> : <p className="text-paper/75">Switch back to the RiskSense app to continue.</p>}
      <Link href="/" className="rounded-xl border border-paper/25 px-7 py-3 text-paper transition hover:bg-white/10">Website home</Link>
      {existing && <Link href="/profile" className="rounded-xl bg-brass px-7 py-3 font-semibold text-ink transition hover:bg-paper">View Profile</Link>}
    </div>
  </div>;
}
