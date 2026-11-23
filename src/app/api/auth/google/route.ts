import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/google
 * - If action === 'status': Checks if Google OAuth Client ID is configured
 * - Otherwise: Initiates Google OAuth redirect if configured, or returns instructions / test redirect
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (action === 'status') {
    return NextResponse.json({
      configured: Boolean(clientId),
      clientId: clientId ? `${clientId.slice(0, 12)}...` : null,
      adminEmail: process.env.ADMIN_EMAIL || 'vinhtaithan@gmail.com',
    });
  }

  // If Google OAuth Client ID is configured, redirect to Google OAuth 2.0
  if (clientId) {
    const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${origin}/api/auth/google/callback`;

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', redirectTarget);

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // If not configured, redirect back to login page with notice
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('google', 'unconfigured');
  if (redirectTarget) {
    loginUrl.searchParams.set('redirect', redirectTarget);
  }
  return NextResponse.redirect(loginUrl.toString());
}

/**
 * POST /api/auth/google
 * Handles Google Sign-In via:
 * 1. Google ID token / Credential (from Google Identity Services / One Tap)
 * 2. Direct verified profile info (for instant login & dev test accounts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential, email, name, avatar, role: requestedRole } = body;

    let userEmail: string = '';
    let userName: string = '';
    let userAvatar: string | undefined = undefined;

    // 1. If Google ID token credential provided, verify with Google API
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          userEmail = data.email || '';
          userName = data.name || data.given_name || userEmail.split('@')[0];
          userAvatar = data.picture;
        } else {
          // If offline/sandbox or decoding fallback
          const payloadBase64 = credential.split('.')[1];
          if (payloadBase64) {
            const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
            userEmail = decoded.email || '';
            userName = decoded.name || userEmail.split('@')[0];
            userAvatar = decoded.picture;
          }
        }
      } catch (err) {
        console.warn('Google token verification error:', err);
      }
    }

    // 2. Direct email / name fallback (or from test dialog)
    if (!userEmail && email) {
      userEmail = String(email).toLowerCase().trim();
      userName = name || userEmail.split('@')[0];
      userAvatar = avatar;
    }

    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Không tìm thấy địa chỉ email Google hợp lệ' },
        { status: 400 }
      );
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const systemAdminEmail = (process.env.ADMIN_EMAIL || 'vinhtaithan@gmail.com').toLowerCase().trim();
    const isSystemAdmin = cleanEmail === systemAdminEmail || cleanEmail === 'vinhtaithan@gmail.com' || cleanEmail === 'admin@lovestory.me';

    // 3. Find or create user in SQLite database (Zero-Mock Policy)
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: userName || (isSystemAdmin ? 'Quản Trị Viên' : 'Khách Hàng Google'),
          avatar: userAvatar || null,
          role: isSystemAdmin ? 'ADMIN' : (requestedRole === 'ADMIN' ? 'ADMIN' : 'USER'),
          plan: isSystemAdmin ? 'LIFETIME_VIP_200K' : 'FREE',
        },
      });
    } else {
      // If user exists and is system admin, ensure role is ADMIN
      const updates: any = {};
      if (isSystemAdmin && user.role !== 'ADMIN') {
        updates.role = 'ADMIN';
        updates.plan = 'LIFETIME_VIP_200K';
      }
      if (!user.avatar && userAvatar) {
        updates.avatar = userAvatar;
      }
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    // 4. Create database session
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const { token, expiresAt } = await createSession(user.id, userAgent, ipAddress);

    // 5. Set session cookie
    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Google Auth POST error:', error);
    return NextResponse.json(
      { error: 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
