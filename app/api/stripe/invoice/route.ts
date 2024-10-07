import { NextRequest, NextResponse } from "next/server";
import stripe from "@/utils/stripe/server";

export async function POST(request: NextRequest) {
    try {
        const {
            orderId,
            customerName,
            customerEmail,
            amount, // cents
            medium,
            customerAddress,
            photographDisposition,
        } = await request.json();

        const customer = await stripe.customers.create({
            name: customerName,
            email: customerEmail,
            address: customerAddress,
            tax: {
                validate_location: "immediately",
            },
        });

        const invoice = await stripe.invoices.create({
            customer: customer.id,
            collection_method: "send_invoice",
            days_until_due: 1,
            metadata: {
                order_id: orderId,
            },
            automatic_tax: {
                enabled: true,
            },
        });

        const invoiceItem = await stripe.invoiceItems.create({
            customer: customer.id,
            amount: amount, // cents
            description: medium,
            invoice: invoice.id,
        });

        if (photographDisposition === "RETAIN_1_YEAR") {
            const storageFeeInvoiceItem = await stripe.invoiceItems.create({
                customer: customer.id,
                amount: 2500, // cents
                description: "1 Year Photograph Retention",
                invoice: invoice.id,
            });
        }

        const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

        return NextResponse.json({
            success: true,
            invoiceId: sentInvoice.id,
            invoiceUrl: sentInvoice.hosted_invoice_url,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
