import Link from 'next/link';

export function CompleteRegistration() {
  return <section className="bg-ink px-5 py-14 text-paper sm:px-8 lg:px-12" aria-labelledby="complete-heading"><div className="mx-auto grid max-w-[1800px] gap-8 rounded-2xl border border-brass/30 bg-brass/10 p-6 shadow-xl sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
    <div><p className="micro text-brass">Complete your registration</p><h2 id="complete-heading" className="mt-3 text-3xl font-semibold sm:text-4xl">Already created your RiskSense account?</h2><p className="mt-3 max-w-2xl text-paper/70">Complete your access setup. Verify your account, choose an access method, confirm your clinician, and submit for backend activation.</p><ol className="mt-6 flex flex-wrap gap-2 text-sm text-paper/80"><li>1. Verify account</li><li aria-hidden="true">→</li><li>2. Choose access</li><li aria-hidden="true">→</li><li>3. Link clinician</li><li aria-hidden="true">→</li><li>4. Backend activation</li></ol></div>
    <Link href="/register/complete" className="rounded-lg bg-brass px-7 py-4 text-center font-semibold text-ink transition hover:bg-paper">Complete Registration</Link>
  </div></section>;
}
