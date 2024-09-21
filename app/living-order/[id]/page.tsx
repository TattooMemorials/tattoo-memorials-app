"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GoogleCaptchaWrapper from "@/app/google-captcha-wrapper";
import OrderDetails from "@/components/Orders/OrderDetails";
import { createClient } from "@/utils/supabase/client";
import SomethingWentWrong from "@/components/Common/SomethingWentWrong";
import { LivingFormData, Medium } from "@/components/Orders/LivingOrderForm";

export default function LivingOrderViewPage() {
    const params = useParams();
    const id = params.id as string;
    const [formData, setFormData] = useState<LivingFormData>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const { data, error } = await supabase
                    .from("living_orders")
                    .select("*")
                    .eq("id", id)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        streetAddress: data.street_address || "",
                        streetAddress2: data.street_address2 || "",
                        city: data.city || "",
                        state: data.state || "",
                        postalCode: data.postal_code || "",
                        asIs: data.as_is || false,
                        altered: data.altered || false,
                        alterationNotes: data.alteration_notes || "",
                        inspirationNotes: data.inspiration_notes || "",
                        medium: (data.medium as Medium) || null,
                    });
                }
            } catch (error) {
                setError("Failed to fetch order data");
                console.error("Error fetching order data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error)
        return (
            <SomethingWentWrong message="It looks like we can't find the details of that Order ID." />
        );

    return (
        <GoogleCaptchaWrapper>
            <div className="flex-1 w-full flex flex-col min-h-screen bg-tan-500 text-black">
                <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-8">
                    {formData && (
                        <OrderDetails orderId={id} formData={formData} />
                    )}
                </main>
            </div>
        </GoogleCaptchaWrapper>
    );
}
