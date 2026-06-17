import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/auth
 *
 * Inicia el flujo de OAuth con GitHub.
 * Redirige al usuario a GitHub para autorizar la app.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get('redirect') || '/dashboard';

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth no configurado' }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
  const callbackUrl = `${baseUrl}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`;

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  githubAuthUrl.searchParams.set('scope', 'read:user');

  return NextResponse.redirect(githubAuthUrl.toString());
}
