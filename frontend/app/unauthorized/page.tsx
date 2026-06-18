'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f3d56] via-[#1a5a7a] to-[#0b2f43] flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-1/4 -top-1/4 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-1/4 -bottom-1/4 h-80 w-80 rounded-full bg-red-300/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-white/95 backdrop-blur shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-700 mb-6">
              <Shield size={40} />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Accès refusé
            </h1>

            {/* Description */}
            <p className="text-slate-600 mb-6">
              {user
                ? `Vous n'avez pas les permissions nécessaires pour accéder à cette section. Veuillez contacter un administrateur.`
                : 'Veuillez vous connecter pour continuer.'}
            </p>

            {/* User Info */}
            {user && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Utilisateur connecté
                </p>
                <p className="font-bold text-slate-900">{user.fullName}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-sm text-slate-500 mt-2">
                  Rôle: <span className="font-medium">{user.role}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full py-2.5 px-4 bg-[#163E56] hover:bg-[#0f3d56] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowLeft size={18} />
                Retour
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold rounded-xl transition"
              >
                Aller au tableau de bord
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-500">
            GMAO BMT v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
