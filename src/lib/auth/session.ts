import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export const SESSION_COOKIE_NAME = 'lovestory_session_token';
export const SESSION_EXPIRY_DAYS = 30;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'ANNUAL_50K' | 'LIFETIME_VIP_200K';
  planExpiresAt?: Date | null;
  createdAt: Date;
}

/**
 * Generate a cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new database session for a user and return the token
 */
export async function createSession(
  userId: string,
  userAgent?: string | null,
  ipAddress?: string | null
) {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent: userAgent || undefined,
      ipAddress: ipAddress || undefined,
    },
  });

  return { session, token, expiresAt };
}

/**
 * Validate session token and return the associated user
 */
export async function validateSessionToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          plan: true,
          planExpiresAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return {
    session,
    user: session.user as SessionUser,
  };
}

/**
 * Delete a session by token (logout)
 */
export async function invalidateSession(token: string) {
  try {
    await prisma.session.delete({
      where: { token },
    });
  } catch {
    // Session might already be deleted
  }
}

/**
 * Get current logged in user from request cookies (Server Components & API Routes)
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const result = await validateSessionToken(token);
  return result?.user ?? null;
}

/**
 * Set the session cookie on response
 */
export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Delete the session cookie on response
 */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
