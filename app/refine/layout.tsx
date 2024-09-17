"use client";
import { createClient } from "@/utils/supabase/client";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@refinedev/supabase";
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
    return (
        <Suspense>
            <ConfigProvider theme={RefineThemes.Orange}>
                <AntdApp>
                    <Refine
                        routerProvider={routerProvider}
                        dataProvider={dataProvider(supabaseClient)}
                        authProvider={authProvider}
                        resources={[
                            {
                                name: "memoriam_orders",
                                list: "/refine/memoriam-orders",
                                show: "/refine/memoriam-orders/show/:id",
                                create: "/refine/memoriam-orders/create",
                                edit: "/refine/memoriam-orders/edit/:id",
                                meta: {
                                    canDelete: true,
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
