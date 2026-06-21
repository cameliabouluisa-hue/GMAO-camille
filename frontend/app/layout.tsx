import './globals.css';

import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'GMAO BMT',
  description: 'Application de gestion de maintenance assistée par ordinateur',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f4f7fb] text-slate-900">
        <AuthProvider>
          <ProtectedRoute>
            <LayoutWrapper>{children}</LayoutWrapper>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}