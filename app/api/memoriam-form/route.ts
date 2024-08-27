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

async function submitMemoriamForm(
    formData: any,
    supabase: any
): Promise<SubmissionResult> {
    let orderData: { id: string } | null = null;

    try {
        // 1. Insert into memoriam_orders table
        const { data, error: orderError } = await supabase
            .from("memoriam_orders")
            .insert([{}]) // empty row
            .select()
            .single();

        if (orderError) throw orderError;
        if (!data)
            throw new Error("No data returned from memoriam_orders insert");

        orderData = data;

        return { success: true, orderId: orderData?.id };
    } catch (error) {
        console.error("Error submitting memoriam form:", error);
        // If an error occurred after creating the order, we should delete it
        if (orderData && orderData.id) {
            await supabase
                .from("memoriam_orders")
                .delete()
                .eq("id", orderData.id);
        }
        return { success: false, error: (error as Error).message };
    }
}

const deleteOrder = async (orderId: string, supabase: any) => {
    const { data, error: deleteError } = await supabase
        .from("memoriam_orders")
        .delete()
        .eq("id", orderId); // Replace "id" with the correct field if necessary

    if (deleteError) {
        console.error("Error deleting order:", deleteError);
        return { success: false, error: (deleteError as Error).message };
    } else {
        console.log("Order deleted successfully:", data);
        return { success: true };
    }
};

export async function POST(request: Request) {
    try {
        // Initialize Supabase client inside the request handler
        const supabase = createClient();

        const { formData } = await request.json();

        // TODO: Validate formData here

        const result = await submitMemoriamForm(formData, supabase);

        if (result.success) {
            return NextResponse.json(result, { status: 201 });
        } else {
            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        console.error("Error processing memoriam form submission:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    const supabase = createClient();

    try {
        const { orderId, ...updateFields } = await request.json();

        // Ensure at least one field is provided to update
        if (!orderId || Object.keys(updateFields).length === 0) {
            return NextResponse.json(
                { success: false, error: "No fields provided for update" },
                { status: 400 }
            );
        }

        // Perform the update operation
        const { error } = await supabase
            .from("memoriam_orders")
            .update(updateFields)
            .eq("id", orderId);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error updating memoriam order:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        // Initialize Supabase client inside the request handler
        const supabase = createClient();

        const { orderId } = await request.json();

        // TODO: Validate formData here

        const result = await deleteOrder(orderId, supabase);

        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(result, { status: 400 });
        }
    } catch (error) {
        console.error("Error deleting memoriam order:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
