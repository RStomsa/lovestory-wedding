import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession, setSessionCookie } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/dashboard';
  const errorParam = searchParams.get('error');

  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (errorParam || !code) {
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', errorParam || 'google_auth_failed');
    return NextResponse.redirect(errorUrl.toString());
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const errorUrl = new URL('/login', origin);
    errorUrl.searchParams.set('error', 'google_config_missing');
    return NextResponse.redirect(errorUrl.toString());
  }

  try {
    const callbackUrl = `${origin}/api/auth/google/callback`;

    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text());
      const failUrl = new URL('/login', origin);
      failUrl.searchParams.set('error', 'google_token_exchange_failed');
      return NextResponse.redirect(failUrl.toString());
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      const failUrl = new URL('/login', origin);
      failUrl.searchParams.set('error', 'google_userinfo_failed');
      return NextResponse.redirect(failUrl.toString());
    }

    const profile = await userInfoResponse.json();
    const email = profile.email?.toLowerCase().trim();
    const name = profile.name || profile.given_name || email.split('@')[0];
    const avatar = profile.picture;

    if (!email) {
      const failUrl = new URL('/login', origin);
      failUrl.searchParams.set('error', 'google_email_missing');
      return NextResponse.redirect(failUrl.toString());
    }

    const systemAdminEmail = (process.env.ADMIN_EMAIL || 'vinhtaithan@gmail.com').toLowerCase().trim();
    const isSystemAdmin = email === systemAdminEmail || email === 'vinhtaithan@gmail.com' || email === 'admin@lovestory.me';

    // 3. Upsert user in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || (isSystemAdmin ? 'Quản Trị Viên' : 'Khách Hàng Google'),
          avatar: avatar || null,
          role: isSystemAdmin ? 'ADMIN' : 'USER',
          plan: isSystemAdmin ? 'LIFETIME_VIP_200K' : 'FREE',
        },
      });
    } else {
      const updates: any = {};
      if (isSystemAdmin && user.role !== 'ADMIN') {
        updates.role = 'ADMIN';
        updates.plan = 'LIFETIME_VIP_200K';
      }
      if (!user.avatar && avatar) {
        updates.avatar = avatar;
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

    // 6. Redirect to target
    const targetUrl = new URL(state.startsWith('/') ? state : `/${state}`, origin);
    return NextResponse.redirect(targetUrl.toString());
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const failUrl = new URL('/login', origin);
    failUrl.searchParams.set('error', 'google_callback_exception');
    return NextResponse.redirect(failUrl.toString());
  }
}
