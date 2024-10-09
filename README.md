# Tattoo Memorials App

## Table of Contents

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
-   [Stripe Invoicing](#stripe-invoicing)
    -   [Overview](#overview)
    -   [Key Components](#key-components)
    -   [Invoice Creation Flow](#invoice-creation-flow)
    -   [Implementation Details](#implementation-details)
    -   [Usage](#usage)
    -   [Error Handling](#error-handling)
    -   [Customization](#customization)
-   [Email System](#email-system)

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

## Stripe Invoicing

This section explains how Stripe invoices are created and integrated into the memoriam and living order flows.

### Overview

Stripe invoices are generated when an admin sends an email to a customer, typically after an order has been processed and is ready for payment. The invoice creation process is the same for both memoriam and living orders.

### Key Components

1. **Stripe Invoice API** (`/app/api/stripe/invoice/route.ts`): Handles the creation and sending of Stripe invoices.
2. **useStripeInvoice Hook** (`/utils/hooks/stripe-invoice.ts`): A custom hook that provides a function to create Stripe invoices.
3. **Order Pages** (`/app/staff/memoriam-orders/page.tsx` and `/app/staff/living-orders/page.tsx`): Admin interfaces for managing orders and triggering invoice creation.

### Invoice Creation Flow

1. Admin selects an order and chooses to send an email (which triggers invoice creation).
2. The `useStripeInvoice` hook is called with the order details.
3. The hook sends a request to the Stripe Invoice API.
4. The API creates a Stripe customer, invoice, and invoice items.
5. The invoice is sent to the customer via Stripe.

### Implementation Details

#### Stripe Invoice API (`/app/api/stripe/invoice/route.ts`)

This API endpoint handles the creation of Stripe invoices:

1. Creates a Stripe customer with the order details.
2. Creates a Stripe invoice for the customer.
3. Adds invoice items based on the order (including the main item and any additional fees).
4. Sends the invoice to the customer.

Key features:

-   Uses Stripe's `collection_method: "send_invoice"` for flexibility in payment collection.
-   Sets `days_until_due: 7` for prompt payment (one week).
-   Enables automatic tax calculation with `automatic_tax: { enabled: true }`.
-   Adds a storage fee for photograph retention if applicable.

#### useStripeInvoice Hook (`/utils/hooks/stripe-invoice.ts`)

This custom hook provides a `createInvoice` function that:

1. Prepares the invoice data from the order record.
2. Sends a POST request to the Stripe Invoice API.
3. Handles success and error states.

#### Order Pages Integration

Both memoriam and living order pages use the `useStripeInvoice` hook to create invoices when sending emails to customers. The process is triggered in the `onConfirmSendEmail` function, which is called when an admin confirms sending an email.

### Usage

1. Admin navigates to the memoriam or living orders page.
2. Selects an order and chooses to send an email.
3. Confirms sending the email, which triggers invoice creation.
4. The invoice is created and sent to the customer via Stripe.

### Error Handling

-   If an error occurs during invoice creation, it's logged and displayed to the admin.
-   The `useStripeInvoice` hook provides error state that can be used to show error messages in the UI.

### Customization

The invoice creation process can be customized by modifying the Stripe Invoice API endpoint. Common customizations include:

-   Adjusting the payment terms (e.g., changing `days_until_due`).
-   Adding or modifying invoice items.
-   Customizing the invoice metadata.

## Email System

This section explains how the email system is implemented, including Postmark integration, email templates, and the process for sending emails.

### Overview

Our email system uses Postmark as the email service provider and implements a custom solution for managing email templates and sending emails from the admin interface.

### Key Components

1. **Postmark Integration** (`/app/api/send-email/route.ts`): Handles the actual sending of emails using Postmark.
2. **useOrderEmail Hook** (`/utils/hooks/order-email.ts`): Manages email-related operations in the admin interface.
3. **Email Templates**: Implemented directly in the `useOrderEmail` hook.

### Postmark Integration

We use Postmark to send emails. The integration is set up in the `/app/api/send-email/route.ts` file:

-   The Postmark client is initialized using the `POSTMARK_API_TOKEN` environment variable.
-   Emails are sent using the `postmarkClient.sendEmail()` method.
-   Different "From" addresses are used for development and production environments.

### Email Templates

Email templates are currently implemented directly in the `useOrderEmail` hook. There are two main types of email templates:

1. **Memoriam Completion Request**: Sent to customers to request completion of their memoriam order.
2. **Invoice and Payment Link**: Sent to customers with an invoice and payment link for their order.

Templates are constructed using template literals in JavaScript, allowing for dynamic content insertion.

### Sending Emails

The process for sending emails is as follows:

1. Admin selects an order and chooses to send an email.
2. The `handleSendEmail` function is called, which fetches the email history for the order.
3. Admin selects an email type from the available options.
4. The `handleConfirmSendEmail` function is called, which:
    - Checks if the email type has been sent before and asks for confirmation if needed.
    - Constructs the email content based on the selected template.
    - Calls the `sendEmail` function to send the email via the API.
    - Records the sent email in the email history.

### Adding New Email Templates

To add a new email template:

1. Add a new email type to the `emailTypes` array in the `useOrderEmail` hook.
2. Add a new case in the `switch` statement in the `handleConfirmSendEmail` function.
3. Implement the new template logic, including subject and message construction.

### Staff Usage

Staff members can send emails through the admin interface:

1. Navigate to the order details page.
2. Click on the "Send Email" button.
3. Select the desired email type from the dropdown.
4. (Optional) Add a custom note.
5. Confirm and send the email.
