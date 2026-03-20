import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/cities/") && pathname.includes("%20")) {
    const newPath = pathname.replace(/%20/g, "-");
    return NextResponse.redirect(new URL(newPath, request.url), 301);
  }
}

export const config = { matcher: "/cities/:path*" };
