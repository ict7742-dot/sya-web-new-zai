'use client';

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Mail, Phone, MapPin, Clock, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { LazySection } from '@/components/landing/lazy-section';
import {
  captureUtm,
  getStoredUtm,
  saveAbandonment,
  clearAbandonment,
  loadAbandonment,
  type UtmData,
} from '@/lib/landing-data';

interface ContactFormProps {
  /** Set by the parent's handleInterest() — when kind changes, the select is
   *  updated, the focus ring flashes, and the name field is focused. Nonce
   *  ensures repeat clicks on the SAME interest still re-trigger. */
  interest: { kind: string; nonce: number };
  /** Toast notifier (lifted to the parent so success/error toasts render in the
   *  global toast stack alongside CTA toasts). */
  onToast: (msg: string, ok?: boolean) => void;
}

/**
 * Contact & lead form — Phase 9.10 visual rewrite using Cinematic Finance tokens.
 *
 * Owns ALL form state + refs + handlers + abandonment/UTM effects (moved out of
 * page.tsx). The parent only sets `interest` (which interest to pre-select) and
 * receives toasts via `onToast`.
 *
 * Visual treatment (per docs/DESIGN_SYSTEM.md §9.10):
 *   - Bebas Neue section heading + eyebrow with gold hairline
 *   - Left: contact info (email/phone/whatsapp/office/hours) on glassmorphic chips
 *   - Right: glassmorphic form panel (bg-cf-glass backdrop-blur-glass) with
 *     gold-gradient focus rings (focus:border-cf-gold focus:ring-cf-gold/20)
 *   - Pulsing submit CTA (animate-cf-pulse-cta, motion-reduced disables it)
 *   - Success state: glassmorphic confirmation card with eKYC deep-link
 */
export function ContactForm({ interest, onToast }: ContactFormProps) {
  /* ── State ── */
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitterName, setSubmitterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedInterest, setSubmittedInterest] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectFlash, setSelectFlash] = useState(false);

  /* ── Refs ── */
  const formRef = useRef<HTMLFormElement>(null);
  const fNameRef = useRef<HTMLInputElement>(null);
  const fPhoneRef = useRef<HTMLInputElement>(null);
  const fEmailRef = useRef<HTMLInputElement>(null);
  const fInterestRef = useRef<HTMLSelectElement>(null);
  const utmRef = useRef<UtmData>({ utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '', landingPage: '' });
  const reducedMotion = useRef(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  /* ── UTM capture on mount ── */
  useEffect(() => {
    utmRef.current = captureUtm();
  }, []);

  /* ── External interest trigger: when parent sets interest.kind, pre-select
   *     the dropdown, flash the focus ring, and focus the name field. ── */
  useEffect(() => {
    if (!interest.kind || !interest.nonce) return;
    if (fInterestRef.current) {
      fInterestRef.current.value = interest.kind;
      setSelectFlash(true);
      const t = setTimeout(() => setSelectFlash(false), 2200);
      // Focus the name field after the smooth-scroll settles (~700ms).
      const ft = setTimeout(() => fNameRef.current?.focus({ preventScroll: true }), 700);
      return () => { clearTimeout(t); clearTimeout(ft); };
    }
  }, [interest.kind, interest.nonce]);

  /* ── Restore abandoned form data ── */
  useEffect(() => {
    const saved = loadAbandonment();
    if (!saved) return;
    if (fNameRef.current && saved.name) fNameRef.current.value = saved.name;
    if (fPhoneRef.current && saved.phone) fPhoneRef.current.value = saved.phone;
    if (fEmailRef.current && saved.email) fEmailRef.current.value = saved.email;
    if (fInterestRef.current && saved.interest) fInterestRef.current.value = saved.interest;
    if (saved.message) {
      const msgEl = document.getElementById('fMsg') as HTMLTextAreaElement | null;
      if (msgEl) msgEl.value = saved.message;
    }
    onToast('We restored your previous form entries.', true);
  }, [onToast]);

  /* ── Save form data on input (abandonment tracking) ── */
  const trackFormInput = useCallback(() => {
    const data: Record<string, string> = {};
    if (fNameRef.current?.value) data.name = fNameRef.current.value;
    if (fPhoneRef.current?.value) data.phone = fPhoneRef.current.value;
    if (fEmailRef.current?.value) data.email = fEmailRef.current.value;
    if (fInterestRef.current?.value) data.interest = fInterestRef.current.value;
    const msgEl = document.getElementById('fMsg') as HTMLTextAreaElement | null;
    if (msgEl?.value) data.message = msgEl.value;
    if (Object.keys(data).length > 0) saveAbandonment(data);
  }, []);

  /* ── Save on page unload ── */
  useEffect(() => {
    const handler = () => trackFormInput();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [trackFormInput]);

  /* ── Form validation helper ── */
  const setErr = (field: string, msg: string | null) => {
    setFormErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
    const elMap: Record<string, HTMLInputElement | HTMLSelectElement | null> = {
      name: fNameRef.current,
      phone: fPhoneRef.current,
      email: fEmailRef.current,
      interest: fInterestRef.current,
    };
    const el = elMap[field];
    if (el) {
      if (msg) el.classList.add('err');
      else el.classList.remove('err');
    }
  };

  /* ── Submit handler ── */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = fNameRef.current?.value || '';
    const phone = fPhoneRef.current?.value || '';
    const email = fEmailRef.current?.value || '';
    const interestVal = fInterestRef.current?.value || '';

    let ok = true;
    if (name.trim().length < 3) { setErr('name', 'Please enter your full name.'); ok = false; }
    else setErr('name', null);

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || !/^[6-9]\d{9}$/.test(digits.slice(-10))) { setErr('phone', 'Enter a valid 10-digit Indian mobile number.'); ok = false; }
    else setErr('phone', null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErr('email', 'Enter a valid email address.'); ok = false; }
    else setErr('email', null);

    if (!interestVal) { setErr('interest', 'Please choose an option.'); ok = false; }
    else setErr('interest', null);

    if (!ok) { onToast('Please fix the highlighted fields.', false); return; }

    setSubmitting(true);
    try {
      const utm = getStoredUtm();
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          email: email.trim(),
          interest: interestVal,
          message: (document.getElementById('fMsg') as HTMLTextAreaElement | null)?.value || '',
          ...utm,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          Object.entries(data.fields).forEach(([field, msg]) => setErr(field, msg as string));
          onToast('Please fix the highlighted fields.', false);
        } else {
          onToast(data.error || 'Something went wrong. Please try again.', false);
        }
        setSubmitting(false);
        return;
      }

      setSubmitterName(data.firstName);
      setSubmittedInterest(data.interest);
      setFormSubmitted(true);
      clearAbandonment();
      onToast('Inquiry received — we usually respond within a few hours.');

      // Redirect to Angel One eKYC for account/both interests
      if (data.ekycUrl) {
        setTimeout(() => window.open(data.ekycUrl, '_blank', 'noopener,noreferrer'), 1200);
      }
    } catch {
      onToast('Network error — please check your connection and try again.', false);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    formRef.current?.reset();
    setFormSubmitted(false);
    setSubmittedInterest('');
    setFormErrors({});
  };

  const contactItems = [
    { icon: Mail, label: 'Email', value: 'connect@systematicyield.in', href: 'mailto:connect@systematicyield.in', accent: 'gold' },
    { icon: Phone, label: 'Phone', value: '+91 98290 12345', href: 'tel:+919829012345', accent: 'gold', tnum: true },
    { icon: null, label: 'WhatsApp', value: '+91 98290 12345', href: 'https://wa.me/919829012345?text=Hi%20SYA%20team%2C%20I%20visited%20your%20website%20and%20would%20like%20to%20know%20more.', accent: 'emerald' },
    { icon: MapPin, label: 'Office', value: '2nd Floor, Landmark Tower, Tonk Road, Jaipur, Rajasthan 302015', href: null, accent: 'gold' },
    { icon: Clock, label: 'Hours', value: 'Monday – Saturday · 9:30 AM – 6:30 PM IST', href: null, accent: 'gold' },
  ];

  return (
    <LazySection>
      <section id="contact" className="sec border-t border-white/[0.06] relative overflow-hidden">
        {/* Ambient gold glow drift */}
        <div
          className="pointer-events-none absolute -top-32 -right-20 w-[520px] h-[520px] rounded-full blur-3xl opacity-20 animate-cf-glow-drift"
          style={{ background: 'radial-gradient(circle, rgba(226,177,92,0.14), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="wrap relative grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* ── Left: contact info ── */}
          <div className="animate-cf-reveal-up">
            <p className="flex items-center gap-3 text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em] text-cf-mist">
              <span className="block w-6 h-px bg-cf-gold opacity-70" />
              08 · Get in Touch
            </p>
            <h2 className="font-display font-normal text-[48px] md:text-[72px] lg:text-[80px] leading-[0.95] tracking-[-0.01em] mt-5 text-cf-text-strong">
              Talk to a human,<br />
              <span className="bg-cf-gold-gradient bg-clip-text text-transparent">not a helpline.</span>
            </h2>
            <p className="mt-5 text-cf-mist text-[15px] leading-relaxed max-w-md">
              Whether you&apos;re opening your first demat account or joining the next cohort — write, call, or walk in.
              We typically respond within one business day.
            </p>

            <div className="mt-10 space-y-4">
              {contactItems.map((item) => {
                const isWhatsApp = item.label === 'WhatsApp';
                const accentColor = isWhatsApp ? '#25D366' : undefined;
                const Inner = (
                  <>
                    <span
                      className={`w-11 h-11 shrink-0 rounded-lg border flex items-center justify-center transition-all duration-240 ${
                        isWhatsApp
                          ? 'border-[#25D366]/30 bg-[#25D366]/[0.06] text-[#25D366] group-hover:border-[#25D366]/60'
                          : 'border-cf-gold/30 bg-cf-gold/[0.05] text-cf-gold group-hover:border-cf-gold/60'
                      }`}
                    >
                      {item.icon ? <item.icon className="w-[18px] h-[18px]" /> : (
                        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill={accentColor} aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                          <path d="M12.051 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                        </svg>
                      )}
                    </span>
                    <span>
                      <span className="block text-[10.5px] tracking-[0.16em] uppercase text-cf-mist font-semibold">{item.label}</span>
                      <span className={`block text-[14.5px] mt-0.5 ${item.tnum ? 'font-data tabular-nums' : ''} ${isWhatsApp ? 'group-hover:text-[#25D366]' : 'group-hover:text-cf-gold'} transition-colors duration-160`}>
                        {item.value}
                        {item.label === 'Office' && (
                          <span className="block text-[12px] text-cf-mist mt-0.5">
                            <a href="https://maps.google.com/?q=Landmark+Tower+Tonk+Road+Jaipur" target="_blank" rel="noopener noreferrer" className="hover:text-cf-gold transition-colors">Visits by appointment</a>
                          </span>
                        )}
                      </span>
                    </span>
                  </>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex items-center gap-4 group">
                    {Inner}
                  </a>
                ) : (
                  <div key={item.label} className="flex items-center gap-4 group">{Inner}</div>
                );
              })}
            </div>

            <div className="mt-8 border-l-2 border-cf-gold/60 pl-5">
              <p className="text-[13px] text-cf-mist leading-relaxed">
                Opening an account? Keep your <span className="text-cf-text-strong">PAN, Aadhaar and a cancelled cheque</span> handy —
                paperless onboarding takes about 15 minutes over a call.
              </p>
            </div>
          </div>

          {/* ── Right: glassmorphic lead form ── */}
          <div className="animate-cf-reveal-up [animation-delay:80ms]">
            <div className="relative rounded-xl bg-cf-glass backdrop-blur-glass backdrop-saturate-glass border border-cf-glass-border shadow-glass overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cf-gold-gradient opacity-50" />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-cf-glass-glow" />

              <div className="relative p-6 md:p-8">
                {!formSubmitted ? (
                  <div>
                    <h3 className="font-display font-normal text-[32px] leading-none tracking-[-0.01em] text-cf-text-strong">Request a callback</h3>
                    <p className="text-[12px] text-cf-mist mt-2">Tell us a little about yourself — fields marked * are required.</p>

                    <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="fName" className="f-label">Full Name *</label>
                          <input
                            ref={fNameRef}
                            id="fName"
                            type="text"
                            className={`f-input focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 ${formErrors.name ? 'err' : ''}`}
                            placeholder="e.g. Rohan Sharma"
                            autoComplete="name"
                            onInput={() => { setErr('name', null); trackFormInput(); }}
                          />
                          <p className={`${formErrors.name ? '' : 'hidden'} text-[11.5px] text-cf-crimson mt-1.5`}>{formErrors.name || ''}</p>
                        </div>
                        <div>
                          <label htmlFor="fPhone" className="f-label">Phone Number *</label>
                          <input
                            ref={fPhoneRef}
                            id="fPhone"
                            type="tel"
                            inputMode="tel"
                            className={`f-input tnum focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 ${formErrors.phone ? 'err' : ''}`}
                            placeholder="10-digit mobile"
                            autoComplete="tel"
                            onInput={() => { setErr('phone', null); trackFormInput(); }}
                          />
                          <p className={`${formErrors.phone ? '' : 'hidden'} text-[11.5px] text-cf-crimson mt-1.5`}>{formErrors.phone || ''}</p>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="fEmail" className="f-label">Email *</label>
                        <input
                          ref={fEmailRef}
                          id="fEmail"
                          type="email"
                          className={`f-input focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 ${formErrors.email ? 'err' : ''}`}
                          placeholder="you@example.com"
                          autoComplete="email"
                          onInput={() => { setErr('email', null); trackFormInput(); }}
                        />
                        <p className={`${formErrors.email ? '' : 'hidden'} text-[11.5px] text-cf-crimson mt-1.5`}>{formErrors.email || ''}</p>
                      </div>
                      <div>
                        <label htmlFor="fInterest" className="f-label">Interested In: *</label>
                        <div className="relative">
                          <select
                            ref={fInterestRef}
                            id="fInterest"
                            className={`f-input appearance-none pr-10 focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20 ${selectFlash ? 'sel-flash' : ''} ${formErrors.interest ? 'err' : ''}`}
                            onChange={() => { setErr('interest', null); trackFormInput(); }}
                            defaultValue=""
                          >
                            <option value="" disabled>Select an option</option>
                            <option value="account">Opening a Demat &amp; Trading Account</option>
                            <option value="courses">Stock Market Education Programs</option>
                            <option value="both">Both — Account + Courses</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-cf-mist pointer-events-none" />
                        </div>
                        <p className={`${formErrors.interest ? '' : 'hidden'} text-[11.5px] text-cf-crimson mt-1.5`}>{formErrors.interest || ''}</p>
                      </div>
                      <div>
                        <label htmlFor="fMsg" className="f-label">Message <span className="normal-case tracking-normal text-cf-text-muted">(optional)</span></label>
                        <textarea
                          id="fMsg"
                          rows={3}
                          className="f-input resize-none focus:border-cf-gold focus:ring-2 focus:ring-cf-gold/20"
                          placeholder="Anything specific you'd like to ask?"
                          onInput={trackFormInput}
                        />
                      </div>

                      <p className="text-[11px] text-cf-text-muted leading-relaxed">
                        By submitting, you authorize Systematic Yield Analysts to contact you via call, WhatsApp or email
                        regarding our services. We never share your details with third parties.
                      </p>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-cf-gold-gradient text-cf-bg font-semibold text-[14px] transition-all duration-240 ease-cinematic hover:-translate-y-0.5 hover:shadow-glow-gold animate-cf-pulse-cta motion-reduce:[animation:none] disabled:opacity-55 disabled:cursor-not-allowed disabled:translate-y-0"
                      >
                        <span>{submitting ? 'Submitting…' : 'Submit Inquiry'}</span> {!submitting && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="mx-auto w-14 h-14 rounded-full border border-cf-emerald/40 bg-cf-emerald/10 flex items-center justify-center text-cf-emerald">
                      <CheckCircle2 className="w-7 h-7" />
                    </span>
                    <h4 className="font-display font-normal text-[32px] leading-tight mt-5 text-cf-text-strong">Inquiry received.</h4>
                    <p className="text-[13.5px] text-cf-mist mt-2.5 leading-relaxed max-w-sm mx-auto">
                      Thank you, <span className="text-cf-text-strong">{submitterName}</span>. Our team will reach out within one business day.
                      {submittedInterest !== 'courses' && (
                        <>
                          {' '}The Angel One eKYC page should open automatically — if not,{' '}
                          <a href="https://angelone.in/?ref=systematicyield" target="_blank" rel="noopener noreferrer" className="text-cf-gold hover:underline">click here to start onboarding</a>.
                        </>
                      )}
                    </p>
                    <button onClick={resetForm} className="mt-7 inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-cf-gold/30 text-cf-text font-semibold text-[13px] transition-all duration-240 ease-cinematic hover:border-cf-gold/60 hover:text-cf-gold">
                      Submit another inquiry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </LazySection>
  );
}
