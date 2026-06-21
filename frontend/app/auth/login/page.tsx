'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Anchor } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { AppLogo } from '@/components/app-logo';
import { getHomePathByRole } from '@/utils/get-home-path-by-role';
const testAccounts = [
  {
    role: 'Admin',
    email: 'admin@gmao.local',
    password: 'admin123',
    badge: 'ADMIN',
  },
  {
    role: 'Responsable',
    email: 'responsable@gmao.local',
    password: 'resp123',
    badge: 'RESP',
  },
  {
    role: 'Technicien',
    email: 'technicien@gmao.local',
    password: 'tech123',
    badge: 'TECH',
  },
  {
    role: 'Demandeur',
    email: 'demandeur@gmao.local',
    password: 'dem123',
    badge: 'DI',
  },
  {
    role: 'Magasinier',
    email: 'magasinier@gmao.local',
    password: 'mag123',
    badge: 'STOCK',
  },
];

export default function LoginPage() {
  const router = useRouter();
const { login, isLoading, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
  if (!isLoading && isAuthenticated && user) {
    router.replace(getHomePathByRole(user.role));
  }
}, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
  await login({
    email,
    password,
  });

  // Ne mets pas router.replace ici.
  // Le useEffect va rediriger automatiquement quand user sera chargé.
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : 'Une erreur est survenue lors de la connexion.',
  );
} finally {
  setIsSubmitting(false);
}
  };

  const fillTestAccount = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#dff7ff]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.95),transparent_24%),radial-gradient(circle_at_85%_15%,rgba(144,224,239,0.8),transparent_28%),radial-gradient(circle_at_35%_95%,rgba(67,97,238,0.72),transparent_38%),radial-gradient(circle_at_75%_85%,rgba(114,9,183,0.42),transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/80 via-blue-200/70 to-indigo-500/60" />

      <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-[420px] w-[420px] rounded-full bg-blue-700/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-200/70 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />

      {/* Card container => remonté plus haut */}
      <section className="relative z-10 flex min-h-dvh items-start justify-center px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
        <div className="w-full max-w-[430px]">
<div className="rounded-[2rem] border border-white/70 bg-white/88 px-7 pb-7 pt-4 shadow-[0_35px_100px_rgba(2,62,125,0.28)] backdrop-blur-2xl sm:px-8 sm:pb-8 sm:pt-5">            {/* Header */}
           <div className="mb-6 -translate-y-3 text-center">
  <div className="mb-2 flex justify-center">
    <AppLogo
      theme="light"
      className="h-[120px] w-[340px]"
      imageClassName="scale-[1.35] -translate-y-3"
    />
  </div>

  <h1 className="-mt-3 text-3xl font-black tracking-tight text-slate-950">
    Bienvenue
  </h1>

  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
    Connectez-vous à votre espace GMAO BMT.
  </p>
</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-700"
                >
                  Email
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#0466c8]"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrer votre email"
                    autoComplete="email"
                    className="h-[50px] w-full rounded-2xl border border-slate-200 bg-white/85 py-3 pl-12 pr-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0466c8] focus:bg-white focus:ring-4 focus:ring-[#0466c8]/10"
                    disabled={isSubmitting || isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-700"
                >
                  Mot de passe
                </label>

                <div className="group relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#0466c8]"
                  />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrer votre mot de passe"
                    autoComplete="current-password"
                    className="h-[50px] w-full rounded-2xl border border-slate-200 bg-white/85 py-3 pl-12 pr-12 text-sm font-bold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0466c8] focus:bg-white focus:ring-4 focus:ring-[#0466c8]/10"
                    disabled={isSubmitting || isLoading}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg text-slate-400 transition hover:text-[#023e7d] focus:outline-none focus:ring-4 focus:ring-[#0466c8]/10"
                    disabled={isSubmitting || isLoading}
                    aria-label={
                      showPassword
                        ? 'Masquer le mot de passe'
                        : 'Afficher le mot de passe'
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#0466c8] focus:ring-[#0466c8]"
                  />
                  Se souvenir de moi
                </label>

                <button
                  type="button"
                  className="text-xs font-black text-[#0466c8] transition hover:text-[#023e7d]"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoading || !email || !password}
                className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#023e7d] via-[#0466c8] to-[#4cc9f0] px-5 text-sm font-black text-white shadow-xl shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-900/25 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Comptes test
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() =>
                    fillTestAccount(account.email, account.password)
                  }
                  disabled={isSubmitting || isLoading}
                  className="group rounded-2xl border border-slate-200 bg-white/75 px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#0466c8]/40 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-black text-slate-900">
                      {account.role}
                    </span>

                    <span className="rounded-full bg-[#e8f7ff] px-2 py-0.5 text-[9px] font-black text-[#0466c8] transition group-hover:bg-[#0466c8] group-hover:text-white">
                      {account.badge}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-[11px] font-semibold text-slate-400">
                    {account.email}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-white/85 drop-shadow">
            <Anchor size={15} />
            <span>Terminal à conteneurs · Maintenance portuaire assistée</span>
          </div>

          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/25 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-xl">
              <ShieldCheck size={14} />
              Interface sécurisée
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}