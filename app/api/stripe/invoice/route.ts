import { NextRequest, NextResponse } from "next/server";
import stripe from "@/utils/stripe/server";

export async function POST(request: NextRequest) {
    try {
        const {
            customerName,
            customerEmail,
            amount, // cents
            description,
            customerAddress,
        } = await request.json();

        console.log("Starting invoice process for:", customerName);

        const customer = await stripe.customers.create({
            name: customerName,
            email: customerEmail,
            address: customerAddress,
        });

        console.log("Customer created:", customer.id);

        const invoice = await stripe.invoices.create({
            customer: customer.id,
            collection_method: "send_invoice",
            days_until_due: 1,
        });

        console.log("Invoice created:", invoice.id);

        const invoiceItem = await stripe.invoiceItems.create({
            customer: customer.id,
            amount: amount, // cents
            description: description,
            invoice: invoice.id,
        });

        console.log("Invoice item created:", invoiceItem.id);

        const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

        console.log("Invoice sent:", sentInvoice.id);

        return NextResponse.json({
            success: true,
            invoiceId: sentInvoice.id,
            invoiceUrl: sentInvoice.hosted_invoice_url,
        });
    } catch (error) {
        console.error("Error in Stripe invoice process:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
