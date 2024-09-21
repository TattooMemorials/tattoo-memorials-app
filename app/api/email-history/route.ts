import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const orderType = searchParams.get("orderType");

    if (!orderId || !orderType) {
        return NextResponse.json(
            { error: "Missing orderId or orderType" },
            { status: 400 }
        );
    }

    try {
        const { data, error } = await supabase
            .from("order_emails")
            .select("*")
            .eq("order_id", orderId)
            .eq("order_type", orderType)
            .order("sent_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch email history:", error);
        return NextResponse.json(
            { error: "Failed to fetch email history" },
            { status: 500 }
        );
    }
}
