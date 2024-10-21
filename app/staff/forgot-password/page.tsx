"use client";

import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { useRouter } from "next/navigation";
import { notification } from "antd";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPassword() {
    const router = useRouter();
    const supabase = createClient();

    return (
        <AuthPage
            type="forgotPassword"
            title={
                <ThemedTitleV2
                    collapsed={false}
                    text="Tattoo Memorials Staff"
                />
            }
            formProps={{
                onFinish: async (formValues: { email: string }) => {
                    const { email } = formValues;
                    console.log(`hey from forgot password: ${email}`);
                    // try {
                    //     const { error } =
                    //         await supabase.auth.resetPasswordForEmail(email, {
                    //             redirectTo: `${window.location.origin}/staff/reset-password`,
                    //         });
                    //     if (error) throw error;
                    //     notification.success({
                    //         message: "Success",
                    //         description:
                    //             "Password reset email sent. Please check your inbox.",
                    //     });
                    //     router.push("/staff/login");
                    // } catch (error) {
                    //     notification.error({
                    //         message: "Error",
                    //         description:
                    //             "An error occurred while sending the password reset email.",
                    //     });
                    // }
                },
            }}
        />
    );
}
