import { LivingFormData } from "@/components/Orders/NewOrderForm";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

interface SubmissionResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

function formatPhoneNumber(phone: string): string {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

async function submitLivingForm(
    formData: LivingFormData,
    supabase: any
): Promise<SubmissionResult> {
    let orderData: { id: string } | null = null;

    try {
        // 1. Insert into living_orders table
        const { data, error: orderError } = await supabase
            .from("living_orders")
            .insert([
                {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formatPhoneNumber(formData.phone),
                    street_address: formData.streetAddress,
                    street_address2: formData.streetAddress2,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.postalCode,
                    as_is: formData.asIs,
                    altered: formData.altered,
                    alteration_notes: formData.alterationNotes,
                    inspiration_notes: formData.inspirationNotes,
                    medium: formData.medium,
                },
            ])
            .select()
            .single();

        if (orderError) throw orderError;
        if (!data)
            throw new Error("No data returned from living_orders insert");

        orderData = data;

        return { success: true, orderId: orderData?.id };
    } catch (error) {
        console.error("Error submitting living form:", error);
        // If an error occurred after creating the order, we should delete it
        if (orderData && orderData.id) {
            await supabase
                .from("living_orders")
                .delete()
                .eq("id", orderData.id);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function POST(request: Request) {
    try {
        // Initialize Supabase client inside the request handler
        const supabase = createClient();

        const { formData } = await request.json();

        // TODO: Validate formData here

        const result = await submitLivingForm(formData, supabase);

        if (result.success) {
            return NextResponse.json(result, { status: 201 });
        } else {
            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        console.error("Error processing living form submission:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
