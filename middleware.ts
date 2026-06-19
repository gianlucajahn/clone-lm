import { NextRequest, NextResponse } from "next/server";

// Shared-password gate (HTTP Basic Auth), enforced server-side on the Edge
// runtime. The browser shows a native username/password prompt; the secret
// itself lives in APP_PASSWORD (see .env.local / host env settings), never in
// this file. Any username is accepted — only the password is checked.
//
// Fails closed: if APP_PASSWORD is unset, every request is rejected.
export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      // atob is available in the Edge runtime (Buffer is not).
      const decoded = atob(encoded); // "username:password"
      const password = decoded.slice(decoded.indexOf(":") + 1);
      if (password.length > 0 && password === process.env.APP_PASSWORD) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="clone-lm", charset="UTF-8"' },
  });
}

// Protect everything (pages + API routes) except Next.js static assets.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
