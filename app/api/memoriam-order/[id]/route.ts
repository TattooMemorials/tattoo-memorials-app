import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { id } = params;

    console.log("requested orderID: ", id);

    try {
        const { data, error } = await supabase
            .from("memoriam_orders")
            .select("id")
            .eq("id", id)
            .single();

        if (error) throw error;

        if (!data) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ order: data });
    } catch (error) {
        console.error("Error fetching memoriam order:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
