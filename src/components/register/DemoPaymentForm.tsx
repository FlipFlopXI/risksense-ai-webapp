'use client';

import { useState } from 'react';

type Props = { plan: 'standard' | 'premium'; onBack: () => void; onComplete: () => void };
const field = 'mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-paper outline-none focus:border-brass';
const testCard = '4242424242424242';

export function DemoPaymentForm({ plan, onBack, onComplete }: Props) {
  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = card.replace(/\s/g, '');
    const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry.trim());
    const now = new Date();
    const expiryDate = match ? new Date(2000 + Number(match[2]), Number(match[1]), 0, 23, 59, 59) : null;
    if (!/^[\p{L}][\p{L} .'-]{1,79}$/u.test(name.trim())) {
      setError('Enter a name using letters, spaces, apostrophes or hyphens.'); return;
    }
    if (digits !== testCard) {
      setError('Use only the demonstration card number shown below. Do not enter a real card.'); return;
    }
    if (!expiryDate || expiryDate < now || expiryDate.getFullYear() > now.getFullYear() + 10) {
      setError('Enter a valid future demo expiry in MM/YY format.'); return;
    }
    if (cvc !== '123') {
      setError('Use the demonstration security code 123.'); return;
    }
    if (!agreed) {
      setError('Confirm that you understand this is a simulated payment.'); return;
    }
    setName(''); setCard(''); setCvc(''); setExpiry(''); setError('');
    onComplete();
  }

  return <form onSubmit={submit} noValidate>
    <span className="micro-sm text-brass">Subscription checkout · simulation</span>
    <h2 className="mt-3 text-2xl font-semibold">Review your demo payment</h2>
    <p className="mt-2 text-paper/65">You selected the {plan === 'standard' ? 'Standard' : 'Premium'} subscription. This step imitates checkout; no payment provider is connected and no charge will be made.</p>
    <div className="mt-6 rounded-xl border border-brass/35 bg-brass/10 p-4 text-sm text-paper/85">
      <p className="font-semibold text-brass">Use demo details only</p>
      <p className="mt-2">Card number: <strong>4242 4242 4242 4242</strong> · Expiry: <strong>12/30</strong> · Security code: <strong>123</strong></p>
      <p className="mt-2 text-amber-200">Do not enter real payment information. The entries below stay in this browser form and are cleared when you continue.</p>
    </div>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="sm:col-span-2">Name on demo card<input className={field} autoComplete="off" maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></label>
      <label className="sm:col-span-2">Demo card number<input className={field} inputMode="numeric" autoComplete="off" maxLength={23} value={card} onChange={e => setCard(e.target.value.replace(/[^0-9 ]/g, ''))} placeholder="4242 4242 4242 4242" required /></label>
      <label>Demo expiry (MM/YY)<input className={field} inputMode="numeric" autoComplete="off" maxLength={5} value={expiry} onChange={e => setExpiry(e.target.value.replace(/[^0-9/]/g, ''))} placeholder="12/30" required /></label>
      <label>Demo security code<input className={field} inputMode="numeric" autoComplete="off" maxLength={3} value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, ''))} placeholder="123" required /></label>
    </div>
    <label className="mt-6 flex items-start gap-3 text-sm text-paper/75"><input className="mt-1 accent-brass" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} /><span>I understand this is a simulated payment, with no real charge or insurer verification.</span></label>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-red-100">{error}</p>}
    <div className="mt-7 flex flex-wrap gap-3"><button type="button" className="rounded-lg border border-white/30 px-6 py-3 text-paper hover:bg-white/10" onClick={onBack}>Back</button><button type="submit" className="rounded-lg bg-brass px-6 py-3 font-semibold text-ink transition hover:bg-paper">Complete Demo Payment</button></div>
  </form>;
}
