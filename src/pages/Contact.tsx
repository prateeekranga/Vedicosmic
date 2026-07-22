import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2, Instagram, Youtube, Twitter } from 'lucide-react';
import { Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Accordion } from '@/components/ui/Accordion';
import { FloatingGlyphs } from '@/components/effects/FloatingGlyphs';
import { useToast } from '@/contexts/ToastContext';
import { mergedContactContent } from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useSEO } from '@/hooks/useSEO';
import { faqPageSchema } from '@/lib/schema';

const SUBJECTS = ['General enquiry', 'Course support', 'Tool feedback', 'Partnership', 'Something else'];

export default function Contact() {
  useOverridesVersion();
  const content = mergedContactContent();
  useSEO({
    key: '/contact', path: '/contact', title: 'Contact · VediCosmic',
    description: 'Questions, feedback, or partnership enquiries — reach the VediCosmic team.',
    jsonLd: faqPageSchema(content.faqs),
  });
  const { notify } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Please tell us your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) e.message = 'A little more detail helps us help you.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setSent(true);
    notify('Your message has been received.', 'success');
  };

  return (
    <div className="container-vc py-20">
      <div className="relative">
        <FloatingGlyphs />
        <SectionHeading
          eyebrow="Reach Out"
          title={content.heroTitle}
          subtitle={content.heroSubtitle}
        />
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-7">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  className="text-gold-400"
                >
                  <CheckCircle2 className="h-16 w-16" />
                </motion.div>
                <h3 className="mt-5 font-heading text-h4 text-white">Message received</h3>
                <p className="mt-2 max-w-sm text-body text-white/60">
                  Thank you, {form.name.split(' ')[0]}. We will reply to {form.email} within two earthly days.
                </p>
                <Button
                  variant="ghost"
                  className="mt-6"
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}
                >
                  Send another
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="Your name" value={form.name} error={errors.name}
                    onChange={(e) => set('name', e.target.value)} placeholder="Arjuna" />
                  <Input label="Email" type="email" value={form.email} error={errors.email}
                    onChange={(e) => set('email', e.target.value)} placeholder="you@cosmos.com" />
                </div>
                <Select label="Subject" value={form.subject} onChange={(e) => set('subject', e.target.value)}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-white/70">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    rows={5}
                    placeholder="Share what's on your mind…"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-body text-white placeholder:text-white/30 outline-none transition focus-visible:border-gold-400/60 focus-visible:ring-2 focus-visible:ring-gold-400/20"
                  />
                  {errors.message && <p className="mt-1.5 text-sm text-error">{errors.message}</p>}
                </div>
                <Button onClick={submit} className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" /> Send message
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="space-y-5">
          <Card className="p-6">
            <h3 className="font-heading text-h5 text-white">Other ways to connect</h3>
            <ul className="mt-4 space-y-4 text-body text-white/70">
              <li className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-400/10 text-gold-400"><Mail className="h-5 w-5" /></span>
                {content.email}
              </li>
              <li className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-cyan-400/10 text-brand-cyan-300"><MapPin className="h-5 w-5" /></span>
                {content.addressLine}
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              {([
                [Instagram, content.socials.instagram],
                [Youtube, content.socials.youtube],
                [Twitter, content.socials.twitter],
              ] as const).map(([Icon, href], i) => (
                <motion.a
                  key={i}
                  href={href || '#'}
                  whileHover={{ y: -3, scale: 1.06 }}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:text-gold-400"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <p className="font-sacred text-h5 text-gradient-gold">ॐ शान्तिः</p>
            <p className="mt-2 text-sm text-white/55">May your questions lead you inward. We typically reply within 48 hours.</p>
          </Card>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-3xl">
        <SectionHeading eyebrow="Good to Know" title="Frequently Asked" />
        <div className="mt-8">
          <Accordion items={content.faqs} defaultOpen="f1" />
        </div>
      </div>
    </div>
  );
}
