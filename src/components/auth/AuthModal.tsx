import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register, error, clearError, isLoading } = useAuth();
  const { notify } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setLocalError('');
    if (error) clearError();
  };

  async function submit() {
    if (!form.email.includes('@')) { setLocalError('Enter a valid email address.'); return; }
    if (form.password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    if (mode === 'register' && form.name.trim().length < 2) { setLocalError('Tell us your name.'); return; }

    const ok = mode === 'login'
      ? await login(form.email, form.password)
      : await register(form.email, form.password, form.name.trim());

    if (ok) {
      notify(mode === 'login' ? 'Welcome back, seeker.' : 'Your cosmic profile is ready.');
      onClose();
      setForm({ name: '', email: '', password: '' });
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'login' ? 'Continue Your Journey' : 'Begin Your Journey'}>
      <div className="space-y-4">
        {mode === 'register' && (
          <Input id="name" label="Name" placeholder="Arjuna"
            value={form.name} onChange={(e) => set('name', e.target.value)} />
        )}
        <Input id="email" type="email" label="Email" placeholder="you@cosmos.com"
          value={form.email} onChange={(e) => set('email', e.target.value)} />
        <Input id="password" type="password" label="Password" placeholder="••••••••"
          value={form.password} onChange={(e) => set('password', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />

        {(localError || error) && <p className="text-sm text-error">{localError || error}</p>}

        <Button variant="cyan" className="w-full" onClick={submit} disabled={isLoading}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-white/50">
          {mode === 'login' ? "New to VediCosmic? " : 'Already a seeker? '}
          <button
            className="font-medium text-brand-cyan hover:underline"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalError(''); clearError(); }}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
        <p className="text-center text-[0.7rem] text-white/30">
          Accounts are stored privately in your browser. No data leaves this device.
        </p>
      </div>
    </Modal>
  );
}
