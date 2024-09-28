import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import stripe from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";

// Create a single Supabase client for the entire file
const supabase = createClient();

export async function POST(request: NextRequest) {
    const body = await request.text();
    const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
    const sig = headers().get("stripe-signature") as string;
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        return new Response(`Webhook Error: ${err}`, {
            status: 400,
        });
    }

    try {
        switch (event.type) {
            case "invoice.created":
            case "invoice.finalized":
                await handleInvoiceCreatedOrFinalized(
                    event.data.object as Stripe.Invoice
                );
                break;
            case "invoice.paid":
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;
            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(
                    event.data.object as Stripe.Invoice
                );
                break;
            // ... other cases ...
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Error processing webhook", { status: 500 });
    }

    return new Response("Webhook processed successfully", {
        status: 200,
    });
}

async function handleInvoiceCreatedOrFinalized(invoice: Stripe.Invoice) {
    const orderId = invoice.metadata?.order_id;

    if (!orderId) {
        console.error("No order_id found in invoice metadata");
        return;
    }

    const { error } = await supabase.from("invoices").upsert(
        {
            stripe_invoice_id: invoice.id,
            order_id: orderId,
            amount: invoice.amount_due,
            status: invoice.status,
            created_at: new Date(invoice.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            onConflict: "stripe_invoice_id",
        }
    );

    if (error) throw error;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const { error } = await supabase
        .from("invoices")
        .update({
            status: "paid",
            paid_at: invoice.status_transitions.paid_at
                ? new Date(
                      invoice.status_transitions.paid_at * 1000
                  ).toISOString()
                : null,
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_invoice_id", invoice.id);

    if (error) throw error;
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const { error } = await supabase
        .from("invoices")
        .update({
            status: "payment_failed",
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_invoice_id", invoice.id);

    if (error) throw error;
}
