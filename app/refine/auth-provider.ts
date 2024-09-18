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
            // Check if MFA is required
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
                    redirectTo: "/refine/mfa", // Redirect to MFA verification page
                };
            }

            // MFA not required, proceed normally
            return {
                success: true,
                redirectTo: "/refine/memoriam-orders",
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
            redirectTo: "/refine/login",
        };
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
    check: async () => {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();

        if (data?.session) {
            const { data: aalData, error: aalError } =
                await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

            if (aalError) {
                return {
                    authenticated: false,
                    error: new Error(aalError.message),
                    logout: true,
                    redirectTo: "/refine/login",
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

            // MFA is required but not completed
            return {
                authenticated: false,
                error: new Error("MFA required"),
                logout: false, // Changed from true to false
                redirectTo: "/refine/mfa",
            };
        }

        return {
            authenticated: false,
            error: new Error("Not authenticated"),
            logout: true,
            redirectTo: "/refine/login",
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
