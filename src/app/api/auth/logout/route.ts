import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    
    // Create a redirect response back to the login page
    const response = NextResponse.redirect(new URL("/login", req.url));
    
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Expire immediately
    };

    if (cookieDomain) {
      cookieOptions.domain = cookieDomain;
    }

    response.cookies.set("idevent-token", "", cookieOptions);
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
