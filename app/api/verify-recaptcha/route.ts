// app/api/verify-recaptcha/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { token } = await req.json();

    const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        }
    );

    const data = await response.json();

    console.log("recaptcha data: ", data);

    if (data.success) {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({
            success: false,
            error: data["error-codes"],
        });
    }
}
