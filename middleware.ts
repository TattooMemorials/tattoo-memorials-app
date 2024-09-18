import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "./utils/supabase/server";

export async function middleware(request: NextRequest) {
    const supabase = createClient();

    // Check if the user is authenticated
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
        "/refine/mfa-setup",
        "/refine/mfa",
        "/_next",
        "/favicon.ico",
        "/memoriam-order",
        "/living-order",
    ];

    // Allow requests to public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Allow access to API routes
    if (pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // If user is not authenticated, redirect to login
    if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = "/refine/login";
        return NextResponse.redirect(url);
    }

    // Check if the user has MFA factors set up
    const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();

    if (factorsError) {
        console.error("Error fetching MFA factors:", factorsError);
        // In case of error, redirect to login for safety
        return NextResponse.redirect(new URL("/refine/login", request.url));
    }

    // If no MFA factors are set up, redirect to MFA setup
    if (!factorsData.totp || factorsData.totp.length === 0) {
        return NextResponse.redirect(new URL("/refine/mfa-setup", request.url));
    }

    // Check MFA status for the current session
    const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalError) {
        console.error("Error checking MFA status:", aalError);
        return NextResponse.redirect(new URL("/refine/login", request.url));
    }

    const { currentLevel, nextLevel } = aalData;

    // If MFA is required but not completed for this session, redirect to MFA verification
    if (currentLevel === "aal1" && nextLevel === "aal2") {
        return NextResponse.redirect(new URL("/refine/mfa", request.url));
    }

    // If authenticated and MFA is completed (or not required), allow access
    return NextResponse.next();
}

export const config = {
    matcher: ["/refine/:path*"],
};
