import Stripe from "stripe";

// if (!process.env.STRIPE_SECRET_KEY) {
//     throw new Error(
//         "STRIPE_SECRET_KEY is not set in the environment variables"
//     );
// }

const stripe = new Stripe("sk_test_*");

export default stripe;
