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

        if (data?.user) {
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
            return {
                authenticated: true,
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
