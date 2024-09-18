# Documentation TODO:

-   .env.local
-   node, npm, nvm install

-   Supabase storage upload limit size: https://supabase.com/docs/guides/storage/uploads/standard-uploads
    -   6mb for standard upload
    -   50mb for single image (set in Bucket settigns)

# Authentication in Our Refine App with Supabase

This section explains how authentication is implemented in our Refine-based application using Supabase Auth, including Multi-Factor Authentication (MFA) and middleware protection.

## Overview

Our authentication system combines Supabase Auth for user management and authentication, Refine for UI components and routing, and custom middleware for protecting routes. The system includes MFA (Multi-Factor Authentication) as a required step for all users.

## Key Components

1. **Supabase Auth**: Handles user registration, login, and MFA.
2. **Refine**: Provides the UI components and routing system.
3. **Custom Middleware**: Ensures protected routes are properly secured.
4. **Auth Provider**: Manages the authentication state and methods.
5. **MFA Setup and Verification Pages**: Custom pages for MFA management.

## Authentication Flow

1. **User Registration**: Users sign up through Supabase Auth.
2. **Login**: Users log in with their credentials via Supabase Auth.
3. **MFA Check**:
    - New users are redirected to set up MFA.
    - Existing users without MFA are required to set it up.
    - Users with MFA proceed to verification.
4. **MFA Verification**: Users enter their MFA code.
5. **Access Granted**: Upon successful MFA verification, users can access protected routes.

## Implementation Details

### Auth Provider (`auth-provider.tsx`)

The Auth Provider is a crucial component that interfaces between Refine and Supabase Auth. It handles:

-   Login and logout processes
-   Checking authentication status
-   Managing MFA requirements
-   Redirecting users based on their authentication/MFA status

Key methods:

-   `login`: Handles user login and initial MFA checks
-   `check`: Verifies authentication status and MFA requirements
-   `logout`: Manages the logout process

### Middleware (`middleware.ts`)

The middleware runs on every request to protected routes and ensures:

-   Users are authenticated
-   MFA is set up and verified for the current session
-   Unauthenticated users are redirected to the login page
-   Users without MFA setup are redirected to the MFA setup page
-   Users who haven't completed MFA for the current session are redirected to the MFA verification page

### MFA Setup Page (`/refine/mfa-setup`)

This page allows users to:

-   View their existing MFA factors
-   Set up new MFA factors
-   Handle the MFA enrollment process

### MFA Verification Page (`/refine/mfa`)

This page is used for:

-   Verifying MFA codes during login
-   Re-authenticating users when required (e.g., for setting up additional MFA factors)

### Refine Configuration

In the main Refine configuration (`RefineLayout`), we set up:

-   The Auth Provider
-   Routing configuration
-   Protected resources

## Security Considerations

-   All protected routes are guarded by both the Auth Provider and the middleware.
-   MFA is enforced for all users, enhancing security.
-   Session management is handled securely by Supabase.
-   The middleware provides an additional layer of security, checking auth status on every request.

## User Experience

-   New users are guided through the MFA setup process upon first login.
-   Existing users are prompted for MFA verification when required.
-   The UI provides clear feedback and instructions throughout the authentication process.

## Customization

The authentication system can be customized by modifying:

-   The Auth Provider methods
-   Middleware checks
-   MFA setup and verification pages
-   Refine configuration and theming

## Troubleshooting

If authentication issues occur:

1. Check the browser console for errors.
2. Verify Supabase configuration and API keys.
3. Ensure all required routes (`/refine/login`, `/refine/mfa-setup`, `/refine/mfa`) are properly set up.
4. Review the Auth Provider and middleware for any logic errors.

For any persistent issues, refer to the Supabase and Refine documentation or seek support from the respective communities.
