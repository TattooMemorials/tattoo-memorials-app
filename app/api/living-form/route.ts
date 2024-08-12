import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    asIs: boolean;
    asIsNotes?: string | null;
    inspireNotes?: string;
    acrylic: boolean;
    charcoal: boolean;
    digital: boolean;
    ink: boolean;
    oil: boolean;
    pastel: boolean;
    pencil: boolean;
    stencil: boolean;
    synthetic: boolean;
    water: boolean;
}

interface SubmissionResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

// Move Supabase client initialization inside the request handler
async function submitLivingForm(
    formData: FormData,
    filePaths: string[],
    supabase: any
): Promise<SubmissionResult> {
    let orderData: { id: string } | null = null;

    try {
        // 1. Insert into base_orders table
        const { data, error: orderError } = await supabase
            .from("base_orders")
            .insert([
                {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    mailing_address_1: formData.address1,
                    mailing_address_2: formData.address2,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zipCode,
                    as_is: formData.asIs,
                    as_is_notes: formData.asIsNotes,
                    inspire_notes: formData.inspireNotes,
                    order_type: "Living",
                },
            ])
            .select()
            .single();

        if (orderError) throw orderError;
        if (!data) throw new Error("No data returned from base_orders insert");

        orderData = data;

        // 2. Insert into living_orders table
        const { error: livingOrderError } = await supabase
            .from("living_orders")
            .insert([{ id: orderData?.id }]);
        if (livingOrderError) throw livingOrderError;

        // 3. Insert into order_mediums table
        const { error: mediumsError } = await supabase
            .from("order_mediums")
            .insert([
                {
                    id: orderData?.id,
                    acrylic: formData.acrylic,
                    charcoal: formData.charcoal,
                    digital: formData.digital,
                    ink: formData.ink,
                    oil: formData.oil,
                    pastel: formData.pastel,
                    pencil: formData.pencil,
                    stencil: formData.stencil,
                    synthetic: formData.synthetic,
                    water: formData.water,
                },
            ]);
        if (mediumsError) throw mediumsError;

        // 4. Insert into order_images table
        const { error: imagesError } = await supabase
            .from("order_images")
            .insert(
                filePaths.map((path) => ({
                    order_id: orderData!.id,
                    image_path: path,
                }))
            );
        if (imagesError) throw imagesError;

        return { success: true, orderId: orderData?.id };
    } catch (error) {
        console.error("Error submitting living form:", error);
        // If an error occurred after creating the order, we should delete it
        if (orderData && orderData.id) {
            await supabase.from("base_orders").delete().eq("id", orderData.id);
        }
        return { success: false, error: (error as Error).message };
    }
}

export async function POST(request: Request) {
    try {
        // Initialize Supabase client inside the request handler
        const supabase = createClient();

        const { formData, filePaths } = await request.json();

        // Validate formData and filePaths here

        const result = await submitLivingForm(formData, filePaths, supabase);

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
