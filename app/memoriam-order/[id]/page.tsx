"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

interface Order {
    id: string;
    // Add other order properties here
}

export default function MemoriamOrderForm() {
    const params = useParams();
    const id = params.id as string;
    const [orderData, setOrderData] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrder() {
            try {
                const response = await fetch(`/api/memoriam-order/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch order");
                }
                const data = await response.json();
                setOrderData(data.order);
            } catch (err) {
                setError("Failed to load order");
                console.error("Error fetching order:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchOrder();
    }, [id]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error || !orderData) {
        return notFound();
    }

    return (
        <div className="flex-1 w-full flex flex-col min-h-screen bg-tan-500 text-black">
            <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-8">
                <h1 className="text-2xl font-bold mb-4">
                    Memoriam Order Details
                </h1>
                <p>Order ID: {orderData.id}</p>
                {/* Add more order details here as needed */}
            </main>
        </div>
    );
}
