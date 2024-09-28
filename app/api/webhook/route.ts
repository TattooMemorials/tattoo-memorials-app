import Stripe from "stripe";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import stripe from "@/utils/stripe/server";

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

    switch (event.type) {
        case "invoice.created":
            // todo
            console.log(
                "invoice created for account: ",
                event.data.object.account_name
            );
            break;
        case "invoice.deleted":
            // todo
            break;
        case "invoice.finalization_failed":
            // todo
            break;
        case "invoice.finalized":
            // todo
            break;
        case "invoice.marked_uncollectible":
            // todo
            break;
        case "invoice.overdue":
            // todo
            break;
        case "invoice.paid":
            // todo
            console.log("invoice paid: ", event.data.object.amount_paid);
            break;
        case "invoice.payment_action_required":
            // todo
            break;
        case "invoice.payment_failed":
            // todo
            console.log(
                "invoice payment failed: ",
                event.data.object.amount_paid
            );
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
