// import { type NextRequest } from "next/server";
// import { updateSession } from "@/utils/supabase/middleware";

// export async function middleware(request: NextRequest) {
//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
//      * Feel free to modify this pattern to include more paths.
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./utils/supabase/server";

export async function middleware(request: NextRequest) {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = request.nextUrl;

    // Define paths that should be accessible without authentication
    const publicPaths = [
        "/refine/login",
        "/refine/signup",
        "/refine/forgot-password",
        "/refine/reset-password",
        "/_next", // Next.js internal paths
        "/favicon.ico", // Favicon
        "/memoriam-order",
        "/living-order",
        // Add other public paths or static assets as needed
    ];

    // Allow requests to public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Allow access to API routes
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // If user is authenticated, allow access
    if (session) {
        return NextResponse.next();
    }

    // If not authenticated, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/refine/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/refine/:path*"], // Apply middleware to all /refine/* routes
};
