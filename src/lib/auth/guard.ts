import { redirect } from 'next/navigation';
import { getCurrentUser, SessionUser } from '@/lib/auth/session';

/**
 * Server Component / Server Action Guard requiring the user to be logged in.
 * If not logged in, redirects to /login.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }
  return user;
}

/**
 * Server Component / Server Action Guard requiring the user to have ADMIN role.
 * If not logged in, redirects to /login. If not admin, redirects smoothly to /dashboard.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/admin');
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return user;
}
