"use client";
import { createClient } from "@/utils/supabase/client";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { RefineThemes, ThemedLayoutV2, ThemedTitleV2 } from "@refinedev/antd";
import { App as AntdApp, ConfigProvider } from "antd";
import { Suspense } from "react";
import { authProvider } from "./auth-provider";

export default function RefineLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabaseClient = createClient();

    const customTheme = {
        ...RefineThemes.Orange,
        token: {
            ...RefineThemes.Orange.token,
        },
        components: {
            Button: {
                primaryColor: "#ff6b35",
            },
        },
    };

    return (
        <Suspense>
            <ConfigProvider theme={customTheme}>
                <AntdApp>
                    <Refine
                        routerProvider={routerProvider}
                        dataProvider={dataProvider(supabaseClient)}
                        liveProvider={liveProvider(supabaseClient)}
                        authProvider={authProvider}
                        resources={[
                            {
                                name: "memoriam_orders",
                                list: "/staff/memoriam-orders",
                                show: "/staff/memoriam-orders/show/:id",
                                edit: "/staff/memoriam-orders/edit/:id",
                                meta: {
                                    canDelete: false,
                                },
                            },
                            {
                                name: "living_orders",
                                list: "/staff/living-orders",
                                show: "/staff/living-orders/show/:id",
                                edit: "/staff/living-orders/edit/:id",
                                meta: {
                                    canDelete: false,
                                },
                            },
                        ]}
                        options={{ syncWithLocation: true }}
                    >
                        <ThemedLayoutV2
                            Title={({ collapsed }) => (
                                <ThemedTitleV2
                                    collapsed={collapsed}
                                    text="Tattoo Memorials"
                                />
                            )}
                        >
                            {children}
                        </ThemedLayoutV2>
                    </Refine>
                </AntdApp>
            </ConfigProvider>
        </Suspense>
    );
}
