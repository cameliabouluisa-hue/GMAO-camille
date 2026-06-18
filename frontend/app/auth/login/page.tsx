'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue'
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f3d56] via-[#1a5a7a] to-[#0b2f43] flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-1/4 -bottom-1/4 h-80 w-80 rounded-full bg-cyan-300/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/95 to-[#1f5678] text-2xl font-bold text-white shadow-[0_0_24px_rgba(129,195,215,0.45)] mb-4">
            GM
          </div>
          <h1 className="text-3xl font-black text-white">GMAO BMT</h1>
          <p className="text-cyan-100/70 mt-2">Gestion de Maintenance Assistée par Ordinateur</p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white/95 backdrop-blur shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h2>
            <p className="text-sm text-slate-500 mb-6">
              Accédez à votre espace de travail GMAO
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#163E56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163E56]/20 transition"
                    disabled={isSubmitting || isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
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
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-[#163E56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#163E56]/20 transition"
                    disabled={isSubmitting || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
                    disabled={isSubmitting || isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading || !email || !password}
                className="w-full py-2.5 px-4 bg-[#163E56] hover:bg-[#0f3d56] text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">COMPTES DE TEST</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Test Accounts */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillTestAccount('admin@gmao.local', 'admin123')}
                className="w-full p-3 rounded-xl text-left text-sm font-medium transition bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900"
              >
                <div className="font-bold">Admin</div>
                <div className="text-xs text-slate-500">admin@gmao.local</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  fillTestAccount('responsable@gmao.local', 'resp123')
                }
                className="w-full p-3 rounded-xl text-left text-sm font-medium transition bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900"
              >
                <div className="font-bold">Responsable Maintenance</div>
                <div className="text-xs text-slate-500">responsable@gmao.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('technicien@gmao.local', 'tech123')}
                className="w-full p-3 rounded-xl text-left text-sm font-medium transition bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900"
              >
                <div className="font-bold">Technicien</div>
                <div className="text-xs text-slate-500">technicien@gmao.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('demandeur@gmao.local', 'dem123')}
                className="w-full p-3 rounded-xl text-left text-sm font-medium transition bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900"
              >
                <div className="font-bold">Demandeur</div>
                <div className="text-xs text-slate-500">demandeur@gmao.local</div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('magasinier@gmao.local', 'mag123')}
                className="w-full p-3 rounded-xl text-left text-sm font-medium transition bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900"
              >
                <div className="font-bold">Magasinier</div>
                <div className="text-xs text-slate-500">magasinier@gmao.local</div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-500">
            GMAO BMT v1.0.0 • © 2025 Maintenance
          </div>
        </div>
      </div>
    </div>
  );
}
