import { useState, useEffect } from "react";
import { useSubscription, useList } from "@refinedev/core";
import { BaseKey } from "@refinedev/core";
import { InvoiceStatus } from "@/utils/stripe/common";

type InvoiceStatusMap = Record<BaseKey, InvoiceStatus>;

/**
 * Custom hook for managing realtime invoice updates.
 *
 * This hook handles fetching initial invoice data and subscribing to real-time
 * updates for invoice statuses. It's designed to be used in components that
 * need to display up-to-date invoice statuses for orders. It uses Supabase Real-time and refine.dev live-mode.
 *
 * @returns {Object} An object containing:
 *   - invoiceStatusMap: A record mapping order IDs to their current invoice status.
 *
 * Usage:
 * const { invoiceStatusMap } = useInvoiceSubscription();
 *
 * Then use invoiceStatusMap[orderId] to get the current status for an order.
 */
export const useLiveInvoiceUpdates = () => {
    const [invoiceStatusMap, setInvoiceStatusMap] = useState<InvoiceStatusMap>(
        {}
    );

    // Fetch all invoices with live mode enabled
    const { data: invoicesData } = useList({
        resource: "invoices",
        queryOptions: {
            enabled: true,
        },
        liveMode: "auto",
    });

    // Update invoiceStatusMap when invoices data changes
    useEffect(() => {
        if (invoicesData?.data) {
            const newMap = invoicesData.data.reduce((acc, invoice) => {
                if (invoice.order_id) {
                    acc[invoice.order_id] = invoice.status;
                }
                return acc;
            }, {} as InvoiceStatusMap);
            setInvoiceStatusMap((prevMap) => ({ ...prevMap, ...newMap }));
        }
    }, [invoicesData]);

    // Subscribe to invoice changes
    useSubscription({
        channel: "invoices",
        types: ["INSERT", "UPDATE"],
        onLiveEvent: (event) => {
            console.log("invoices live event: ", event);
            const { type, payload } = event;
            if ((type === "INSERT" || type === "UPDATE") && payload.order_id) {
                setInvoiceStatusMap((prevMap) => ({
                    ...prevMap,
                    [payload.order_id]: payload.status,
                }));
            }
        },
    });

    return { invoiceStatusMap };
};
