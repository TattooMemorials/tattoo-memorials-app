import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import stripe from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";

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

    const supabase = createClient();

    switch (event.type) {
        case "invoice.created":
            handleInvoiceCreatedOrFinalized(event.data.object);
            break;
        case "invoice.deleted":
            // todo
            break;
        case "invoice.finalization_failed":
            // todo
            break;
        case "invoice.finalized":
            handleInvoiceCreatedOrFinalized(event.data.object);
            break;
        case "invoice.marked_uncollectible":
            // todo
            break;
        case "invoice.overdue":
            // todo
            break;
        case "invoice.paid":
            handleInvoicePaid(event.data.object);
            break;
        case "invoice.payment_action_required":
            // todo
            break;
        case "invoice.payment_failed":
            handleInvoicePaymentFailed(event.data.object);
            break;
        case "invoice.payment_succeeded":
            // todo
            break;
        case "invoice.sent":
            // todo
            break;
        case "invoice.upcoming":
            // todo
            break;
        case "invoice.updated":
            // todo
            break;
        case "invoice.voided":
            // todo
            break;
        case "invoice.will_be_due":
            // todo
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    return new Response("RESPONSE EXECUTE", {
        status: 200,
    });
}
async function handleInvoiceCreatedOrFinalized(invoice: Stripe.Invoice) {
    const supabase = createClient();
    const orderId = invoice.metadata?.order_id;

    if (!orderId) {
        console.error("No order_id found in invoice metadata");
        return;
    }
    const { data, error } = await supabase.from("invoices").upsert(
        {
            stripe_invoice_id: invoice.id,
            order_id: orderId,
            amount: invoice.total,
            status: invoice.status,
            created_at: new Date(invoice.created * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            onConflict: "stripe_invoice_id",
        }
    );

    if (error) console.error("Error updating invoice:", error);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const supabase = createClient();
    const { data, error } = await supabase
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

    if (error) console.error("Error updating invoice:", error);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("invoices")
        .update({
            status: "payment_failed",
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_invoice_id", invoice.id);

    if (error) console.error("Error updating invoice:", error);
}
