// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { Client } from "postmark";

export async function POST(request: Request) {
    const { email, subject, message } = await request.json();

    if (!email || !subject || !message) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const postmarkClient = new Client(process.env.POSTMARK_API_TOKEN as string);

    try {
        await postmarkClient.sendEmail({
            // From: "new-order@tattoomemorials.com",
            From: "dan@tinner.tech",
            To: email,
            Subject: subject,
            HtmlBody: message,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send email:", error);
        return NextResponse.json(
            { error: "Failed to send email" },
            { status: 500 }
        );
    }
}
