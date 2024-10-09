# Documentation

TODO:

-   .env.local
-   node, npm, nvm install

-   Supabase storage upload limit size: https://supabase.com/docs/guides/storage/uploads/standard-uploads
    -   6mb for standard upload
    -   50mb for single image (set in Bucket settigns)

# Authentication (Supabase + Refine.dev)

This section explains how authentication is implemented in our Refine-based application using Supabase Auth, including Multi-Factor Authentication (MFA) and middleware protection.

## Overview

Our authentication system combines Supabase Auth for user management and authentication, Refine for UI components and routing, and custom middleware for protecting routes. The system includes MFA as a required step for all users.

## Key Components

1. **Supabase Auth**: Handles user registration, login, and MFA.
2. **Auth Provider** (`/app/staff/auth-provider.ts`): Manages authentication state and methods.
3. **Middleware** (`/middleware.ts`): Protects routes and enforces MFA.
4. **MFA Setup Page** (`/app/staff/mfa-setup/page.tsx`): Allows users to set up MFA.
5. **MFA Verification Page** (`/app/staff/mfa/page.tsx`): Handles MFA code verification.
6. **Refine**: Provides the UI components and routing system ([documentation](https://refine.dev/docs/))

## Authentication Flow

1. User logs in with email/password via Supabase Auth.
2. If MFA is not set up, user is redirected to MFA setup page.
3. User sets up MFA by scanning QR code with an authenticator app.
4. On subsequent logins, user enters MFA code after password.
5. Upon successful verification, user gains access to protected routes.

## Implementation Details

### Auth Provider (`/app/staff/auth-provider.ts`)

The Auth Provider interfaces between Refine and Supabase Auth, handling:

-   Login and logout processes
-   Checking authentication status
-   Managing MFA requirements
-   Redirecting users based on their authentication/MFA status

Key methods:

-   `login()`: Handles login and initial MFA checks
-   `check()`: Verifies authentication status and MFA requirements
-   `logout()`: Manages the logout process

### Middleware (`/middleware.ts`)

The middleware runs on every request to protected routes and ensures:

-   Users are authenticated
-   MFA is set up and verified for the current session
-   Unauthenticated users are redirected to the login page
-   Users without MFA setup are redirected to the MFA setup page
-   Users who haven't completed MFA for the current session are redirected to the MFA verification page

### MFA Setup Page (`/app/staff/mfa-setup/page.tsx`)

This page allows users to:

-   View their existing MFA factors
-   Set up new MFA factors
-   Handle the MFA enrollment process

### MFA Verification Page (`/app/staff/mfa/page.tsx`)

This page is used for:

-   Verifying MFA codes during login
-   Re-authenticating users when required (e.g., for setting up additional MFA factors)

### Refine Configuration

In the main Refine configuration, we set up:

-   The Auth Provider
-   Routing configuration
-   Protected resources

## Troubleshooting

If you encounter authentication issues:

1. Check browser console for errors.
2. Verify Supabase configuration and API keys in `.env.local`.
3. Ensure all required routes (`/staff/login`, `/staff/mfa-setup`, `/staff/mfa`) are properly set up.
4. Review Auth Provider and middleware for any logic errors.

For more details on Supabase Auth, refer to the [Supabase documentation](https://supabase.com/docs/guides/auth).
