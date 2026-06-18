'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
      });

      router.replace('/');
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f3d56] via-[#1a5a7a] to-[#0b2f43] p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-80 w-80 rounded-full bg-cyan-300/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/95 to-[#1f5678] text-2xl font-bold text-white shadow-[0_0_24px_rgba(129,195,215,0.45)]">
            GM
          </div>

          <h1 className="text-3xl font-black text-white">GMAO BMT</h1>

          <p className="mt-2 text-cyan-100/70">
            Gestion de Maintenance Assistée par Ordinateur
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur">
          <div className="p-8">
            <h2 className="mb-1 text-2xl font-bold text-slate-900">
              Connexion
            </h2>

            <p className="mb-6 text-sm text-slate-500">
              Accédez à votre espace de travail GMAO
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Adresse email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="utilisateur@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 transition focus:border-[#163E56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163E56]/20"
                    disabled={isSubmitting || isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Mot de passe
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-3.5 text-slate-400"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-11 text-slate-900 placeholder-slate-400 transition focus:border-[#163E56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163E56]/20"
                    disabled={isSubmitting || isLoading}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-3.5 text-slate-400 transition hover:text-slate-600"
                    disabled={isSubmitting || isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoading || !email || !password}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#163E56] px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#0f3d56] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                COMPTES DE TEST
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillTestAccount('admin@gmao.local', 'admin123')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <div className="font-bold">Admin</div>
                <div className="text-xs text-slate-500">admin@gmao.local</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillTestAccount('responsable@gmao.local', 'resp123')
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <div className="font-bold">Responsable Maintenance</div>
                <div className="text-xs text-slate-500">
                  responsable@gmao.local
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillTestAccount('technicien@gmao.local', 'tech123')
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <div className="font-bold">Technicien</div>
                <div className="text-xs text-slate-500">
                  technicien@gmao.local
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillTestAccount('demandeur@gmao.local', 'dem123')
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <div className="font-bold">Demandeur</div>
                <div className="text-xs text-slate-500">
                  demandeur@gmao.local
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillTestAccount('magasinier@gmao.local', 'mag123')
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                <div className="font-bold">Magasinier</div>
                <div className="text-xs text-slate-500">
                  magasinier@gmao.local
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-8 py-4 text-center text-xs text-slate-500">
            GMAO BMT v1.0.0 • © 2025 Maintenance
          </div>
        </div>
      </div>
    </div>
  );
}