// app/api/send-email/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Client } from "postmark";

export async function POST(request: Request) {
    const { email, subject, message, orderId, orderType, emailType } =
        await request.json();

    if (
        !email ||
        !subject ||
        !message ||
        !orderId ||
        !orderType ||
        !emailType
    ) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const supabase = createClient();
    const postmarkClient = new Client(process.env.POSTMARK_API_TOKEN as string);

    try {
        // Validate that the order exists in the correct table
        const { data: orderExists, error: orderCheckError } = await supabase
            .from(
                orderType === "memoriam" ? "memoriam_orders" : "living_orders"
            )
            .select("id")
            .eq("id", orderId)
            .single();

        if (orderCheckError || !orderExists) {
            return NextResponse.json(
                { error: `Order not found in ${orderType} orders` },
                { status: 404 }
            );
        }

        // Send email
        await postmarkClient.sendEmail({
            From: "dan@tinner.tech",
            To: email,
            Subject: subject,
            HtmlBody: message,
        });

        // Record the email in the order_emails table
        const { error } = await supabase.from("order_emails").insert({
            order_id: orderId,
            order_type: orderType,
            email_type: emailType,
            recipient_email: email,
        });

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json(
                { error: "Failed to record email in database" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send or record email:", error);
        return NextResponse.json(
            { error: "Failed to send or record email" },
            { status: 500 }
        );
    }
}
