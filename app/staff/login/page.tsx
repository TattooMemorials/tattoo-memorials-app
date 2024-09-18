// app/staff/login/page.tsx
"use client";

import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";

export default function Login() {
    return (
        <AuthPage
            type="login"
            title={
                <ThemedTitleV2
                    collapsed={false}
                    text="Tattoo Memorials Staff"
                />
            }
            forgotPasswordLink={false}
            registerLink={false}
            rememberMe={false}
        />
    );
}
