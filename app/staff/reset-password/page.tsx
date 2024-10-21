"use client";

import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { useRouter } from "next/navigation";
import { notification } from "antd";
import { createClient } from "@/utils/supabase/client";

export default function ResetPassword() {
    const router = useRouter();
    const supabase = createClient();

    return (
        <AuthPage
            type="updatePassword"
            title={
                <ThemedTitleV2
                    collapsed={false}
                    text="Tattoo Memorials Staff"
                />
            }
            formProps={{
                onFinish: async (formValues: { password: string }) => {
                    const { password } = formValues;
                    try {
                        const { error } = await supabase.auth.updateUser({
                            password,
                        });
                        if (error) throw error;
                        notification.success({
                            message: "Success",
                            description:
                                "Password has been reset successfully.",
                        });
                        router.push("/staff/login");
                    } catch (error) {
                        notification.error({
                            message: "Error",
                            description:
                                "An error occurred while resetting the password.",
                        });
                    }
                },
            }}
        />
    );
}
