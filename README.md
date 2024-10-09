# Tattoo Memorials App

## Table of Contents

-   [Documentation](#documentation)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Running the Application](#running-the-application)
-   [Tech Stack](#tech-stack)
    -   [Next.js (App Router)](#nextjs-app-router)
    -   [TypeScript](#typescript)
    -   [Supabase](#supabase)
    -   [Refine](#refine)
    -   [Tailwind CSS](#tailwind-css)
-   [Authentication (Supabase + Refine.dev)](#authentication-supabase--refinedev)
    -   [Overview](#overview)
    -   [Key Components](#key-components)
    -   [Authentication Flow](#authentication-flow)
    -   [Implementation Details](#implementation-details)
    -   [Troubleshooting](#troubleshooting)

## Documentation

### TODO:

-   [ ] .env.local
-   [ ] node, npm, nvm install

> **Note:** Supabase storage upload limit size: [Standard Uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
>
> -   6MB for standard upload
> -   50MB for single image (set in Bucket settings)

## Getting Started

This guide will help you set up and run the Tattoo Memorials App on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (version 20 or later)
-   npm (usually comes with Node.js)
-   Git

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/dan-tinsman/tattoo-memorials-app.git
    cd tattoo-memorials-app
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:
    - Copy the `.env.example` file to `.env.local`
    - Fill in the necessary environment variables, including Supabase credentials

### Running the Application

1. Start the development server:

    ```bash
    npm run dev
    ```

2. Open your browser and navigate to `http://localhost:3000`

You should now see the Tattoo Memorials App running locally on your machine.

> **Additional Notes:**
>
> -   For API development, check the `app/api` directory
> -   To work on the admin panel, look in the `app/staff` directory
> -   Refer to the Tech Stack section for more details on the technologies used

Happy coding!

## Tech Stack

The Tattoo Memorials App is built using a modern web development stack, combining powerful and flexible technologies. Here's an overview of the main components:

### Next.js (App Router)

[Next.js](https://nextjs.org/) is the core framework used for building the application. We specifically use the new App Router feature, which provides an intuitive and efficient way to handle routing in our app.

-   **Integration**: Next.js serves as the foundation for both the frontend and backend of our application. It handles server-side rendering, routing, and API routes.
-   **Usage**: You'll find Next.js concepts throughout the `app/` directory, which contains our routes and page components.

[Next.js Documentation](https://nextjs.org/docs)

### TypeScript

[TypeScript](https://www.typescriptlang.org/) is used throughout the project to add static typing to our JavaScript code.

-   **Integration**: TypeScript is integrated directly into our Next.js setup and is used for all our `.ts` and `.tsx` files.
-   **Usage**: You'll see TypeScript being used across all our components, utilities, and API routes.

[TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Supabase

[Supabase](https://supabase.com/) serves as our backend-as-a-service (BaaS) solution, providing database, authentication, and real-time subscription features.

-   **Integration**: Supabase is integrated via the Supabase JavaScript client library. You can find the setup in `utils/supabase/client.ts` and `utils/supabase/server.ts`.
-   **Usage**: We use Supabase for user authentication, data storage, and real-time updates.

[Supabase Documentation](https://supabase.com/docs)

### Refine

[Refine](https://refine.dev/) is used to build our admin panel, providing a powerful set of tools for creating data-driven applications.

-   **Integration**: Refine is integrated into our Next.js application, primarily used in the admin-related pages and components.
-   **Usage**: You'll find Refine concepts in use within the `app/staff/` directory, where it's used to create admin interfaces for managing users, orders, and other data.

[Refine Documentation](https://refine.dev/docs/)

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is our utility-first CSS framework, used for styling the application.

-   **Integration**: Tailwind is integrated into our Next.js setup and configured in the `tailwind.config.js` file.
-   **Usage**: You'll see Tailwind classes used throughout our React components for styling.

[Tailwind CSS Documentation](https://tailwindcss.com/docs)

These technologies work together to create a robust, type-safe, and efficient web application. Next.js provides the overall structure and routing, TypeScript ensures type safety, Supabase handles our backend needs, Refine powers our admin interfaces, and Tailwind CSS allows for rapid and consistent styling.

## Authentication (Supabase + Refine.dev)

This section explains how authentication is implemented in our Refine-based application using Supabase Auth, including Multi-Factor Authentication (MFA) and middleware protection.

### Overview

Our authentication system combines Supabase Auth for user management and authentication, Refine for UI components and routing, and custom middleware for protecting routes. The system includes MFA as a required step for all users.

### Key Components

1. **Supabase Auth**: Handles user registration, login, and MFA.
2. **Auth Provider** (`/app/staff/auth-provider.ts`): Manages authentication state and methods.
3. **Middleware** (`/middleware.ts`): Protects routes and enforces MFA.
4. **MFA Setup Page** (`/app/staff/mfa-setup/page.tsx`): Allows users to set up MFA.
5. **MFA Verification Page** (`/app/staff/mfa/page.tsx`): Handles MFA code verification.
6. **Refine**: Provides the UI components and routing system ([documentation](https://refine.dev/docs/))

### Authentication Flow

1. User logs in with email/password via Supabase Auth.
2. If MFA is not set up, user is redirected to MFA setup page.
3. User sets up MFA by scanning QR code with an authenticator app.
4. On subsequent logins, user enters MFA code after password.
5. Upon successful verification, user gains access to protected routes.

### Implementation Details

#### Auth Provider (`/app/staff/auth-provider.ts`)

The Auth Provider interfaces between Refine and Supabase Auth, handling:

-   Login and logout processes
-   Checking authentication status
-   Managing MFA requirements
-   Redirecting users based on their authentication/MFA status

Key methods:

-   `login()`: Handles login and initial MFA checks
-   `check()`: Verifies authentication status and MFA requirements
-   `logout()`: Manages the logout process

#### Middleware (`/middleware.ts`)

The middleware runs on every request to protected routes and ensures:

-   Users are authenticated
-   MFA is set up and verified for the current session
-   Unauthenticated users are redirected to the login page
-   Users without MFA setup are redirected to the MFA setup page
-   Users who haven't completed MFA for the current session are redirected to the MFA verification page

#### MFA Setup Page (`/app/staff/mfa-setup/page.tsx`)

This page allows users to:

-   View their existing MFA factors
-   Set up new MFA factors
-   Handle the MFA enrollment process

#### MFA Verification Page (`/app/staff/mfa/page.tsx`)

This page is used for:

-   Verifying MFA codes during login
-   Re-authenticating users when required (e.g., for setting up additional MFA factors)

#### Refine Configuration

In the main Refine configuration, we set up:

-   The Auth Provider
-   Routing configuration
-   Protected resources

### Troubleshooting

If you encounter authentication issues:

1. Check browser console for errors.
2. Verify Supabase configuration and API keys in `.env.local`.
3. Ensure all required routes (`/staff/login`, `/staff/mfa-setup`, `/staff/mfa`) are properly set up.
4. Review Auth Provider and middleware for any logic errors.

For more details on Supabase Auth, refer to the [Supabase documentation](https://supabase.com/docs/guides/auth).
