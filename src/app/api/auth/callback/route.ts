import { NextRequest, NextResponse } from "next/server";
import { upsertUser, createSession } from "@/lib/db";


/**
 * GET /api/auth/callback?code=xxx&redirect=xxx
 *
 * Callback de GitHub OAuth.
 * Intercambia el codigo por un token, obtiene datos del usuario,
 * lo registra/actualiza en la base de datos, crea una sesion y
 * redirige al destino original.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", baseUrl));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GitHub OAuth no configurado" },
      { status: 500 },
    );
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/?error=auth_failed", baseUrl));
    }

    // 2. Fetch GitHub user data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser.id) {
      return NextResponse.redirect(
        new URL("/?error=user_fetch_failed", baseUrl),
      );
    }

    // 3. Upsert user in database
    const user = await upsertUser(
      githubUser.id,
      githubUser.login,
      githubUser.avatar_url,
    );

    if (!user) {
      console.error("Error upserting user");
      return NextResponse.redirect(new URL("/?error=db_error", baseUrl));
    }

    // 4. Create session using Web Crypto API (available in Edge Runtime)
    const sessionId = globalThis.crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    try {
      await createSession(sessionId, user.id, expiresAt.toISOString());
    } catch (sessionError) {
      console.error("Error creating session:", sessionError);
      return NextResponse.redirect(new URL("/?error=session_error", baseUrl));
    }

    // 5. Redirect to the original destination with session cookie
    const redirectUrl = new URL(redirect, baseUrl);
    const response = NextResponse.redirect(redirectUrl.toString());

    const isSecure =
      request.nextUrl.protocol === "https:" ||
      process.env.NODE_ENV === "production";

    response.cookies.set("chess_session", sessionId, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    console.error("OAuth callback error details:", JSON.stringify(err, Object.getOwnPropertyNames(err as object)));
    return NextResponse.redirect(new URL("/?error=oauth_error", baseUrl));
  }
}
