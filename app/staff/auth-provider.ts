import { AuthProvider } from "@refinedev/core";
import { createClient } from "@/utils/supabase/client";

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return {
                success: false,
                error: new Error(error.message),
            };
        }

        const user = data.user;

        if (user) {
            // Check if user has MFA factors set up
            const { data: factorsData, error: factorsError } =
                await supabase.auth.mfa.listFactors();

            if (factorsError) {
                return {
                    success: false,
                    error: new Error(factorsError.message),
                };
            }

            if (!factorsData.totp || factorsData.totp.length === 0) {
                // No MFA factors set up, redirect to MFA setup
                return {
                    success: true,
                    redirectTo: "/staff/mfa-setup",
                };
            }

            // Check if MFA is required for this session
            const { data: aalData, error: aalError } =
                await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (aalError) {
                return {
                    success: false,
                    error: new Error(aalError.message),
                };
            }

            const { currentLevel, nextLevel } = aalData;

            if (currentLevel === "aal1" && nextLevel === "aal2") {
                // MFA is required
                return {
                    success: true,
                    redirectTo: "/staff/mfa", // Redirect to MFA verification page
                };
            }

            // MFA not required for this session, proceed normally
            return {
                success: true,
                redirectTo: "/staff/memoriam-orders",
            };
        }

        return {
            success: false,
            error: new Error("Login failed"),
        };
    },
    logout: async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: new Error(error.message),
            };
        }

        return {
            success: true,
            redirectTo: "/staff/login",
        };
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
    check: async () => {
        const supabase = createClient();
        const { data: sessionData, error: sessionError } =
            await supabase.auth.getSession();

        if (sessionError) {
            return {
                authenticated: false,
                error: new Error(sessionError.message),
                logout: true,
                redirectTo: "/staff/login",
            };
        }

        if (sessionData?.session) {
            // Check if user has MFA factors set up
            const { data: factorsData, error: factorsError } =
                await supabase.auth.mfa.listFactors();

            if (factorsError) {
                return {
                    authenticated: false,
                    error: new Error(factorsError.message),
                    logout: true,
                    redirectTo: "/staff/login",
                };
            }

            if (!factorsData.totp || factorsData.totp.length === 0) {
                // No MFA factors set up, redirect to MFA setup
                return {
                    authenticated: false,
                    error: new Error("MFA setup required"),
                    logout: false,
                    redirectTo: "/staff/mfa-setup",
                };
            }

            const { data: aalData, error: aalError } =
                await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (aalError) {
                return {
                    authenticated: false,
                    error: new Error(aalError.message),
                    logout: true,
                    redirectTo: "/staff/login",
                };
            }

            const { currentLevel, nextLevel } = aalData;

            if (
                currentLevel === "aal2" ||
                (currentLevel === "aal1" && nextLevel === "aal1")
            ) {
                // User is fully authenticated
                return {
                    authenticated: true,
                };
            }

            // MFA is required but not completed for this session
            return {
                authenticated: false,
                error: new Error("MFA required"),
                logout: false,
                redirectTo: "/staff/mfa",
            };
        }

        return {
            authenticated: false,
            error: new Error("Not authenticated"),
            logout: true,
            redirectTo: "/staff/login",
        };
    },
    getPermissions: async () => {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        return data.user?.role;
    },
    getIdentity: async () => {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();

        if (data?.user) {
            return {
                ...data.user,
                name: data.user.email,
            };
        }

        return null;
    },
};
