'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { getHomePathByRole } from '@/utils/get-home-path-by-role';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/auth/login');
      return;
    }

    router.replace(getHomePathByRole(user.role));
  }, [isLoading, isAuthenticated, user, router]);

  return null;
}