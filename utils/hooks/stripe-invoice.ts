import { useState } from "react";
import { BaseKey } from "@refinedev/core";

interface OrderRecord {
    id: BaseKey;
    first_name?: string;
    last_name?: string;
    email?: string;
    total_price?: number;
    medium?: string;
    city?: string;
    street_address?: string;
    street_address2?: string;
    postal_code?: string;
    state?: string;
}

interface InvoiceResult {
    success: boolean;
    invoiceId?: string;
    invoiceUrl?: string;
    error?: string;
}

/**
 * Custom hook for creating Stripe invoices.
 *
 * This hook provides a function to create a Stripe invoice for an order.
 * It handles the API call to create the invoice, manages any errors
 * that occur during the process, and maps the order record to the required invoice data.
 *
 * @returns {Object} An object containing:
 *   - createInvoice: A function to create a Stripe invoice
 *   - isLoading: A boolean indicating whether an invoice creation is in progress
 *   - error: Any error that occurred during the last invoice creation attempt
 *
 * Usage:
 * const { createInvoice, isLoading, error } = useStripeInvoice();
 * const result = await createInvoice(currentRecord);
 */
export const useStripeInvoice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createInvoice = async (
        orderRecord: OrderRecord
    ): Promise<InvoiceResult> => {
        setIsLoading(true);
        setError(null);

        const invoiceData = {
            orderId: orderRecord.id,
            customerName: `${orderRecord.first_name || ""} ${
                orderRecord.last_name || ""
            }`.trim(),
            customerEmail: orderRecord.email || "",
            amount: (orderRecord.total_price || 0) * 100, // Convert to cents
            medium: orderRecord.medium || "",
            customerAddress: {
                city: orderRecord.city || "",
                country: "US",
                line1: orderRecord.street_address || "",
                line2: orderRecord.street_address2,
                postal_code: orderRecord.postal_code || "",
                state: orderRecord.state || "",
            },
        };

        try {
            const response = await fetch("/api/stripe/invoice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoiceData),
            });

            const data = await response.json();

            if (data.success) {
                console.log("Invoice created successfully:", data.invoiceId);
                return data;
            } else {
                console.error("Failed to create invoice:", data.error);
                setError(data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error("Error calling Stripe API:", error);
            setError(
                "An unexpected error occurred while creating the invoice."
            );
            return { success: false, error: "An unexpected error occurred." };
        } finally {
            setIsLoading(false);
        }
    };

    return { createInvoice, isLoading, error };
};
