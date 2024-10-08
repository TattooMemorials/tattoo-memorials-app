import React from "react";
import { MemoriamFormData } from "./MemoriamOrderFormEdit";
import { LivingFormData } from "./LivingOrderForm";
import {
    CheckCircle,
    Truck,
    Mail,
    ClipboardCheck,
    HandCoins,
} from "lucide-react";

interface OrderDetailsProps {
    formData: MemoriamFormData | LivingFormData;
    orderId: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ formData, orderId }) => {
    let storageChoice = "";
    if ("photograph_disposition" in formData) {
        storageChoice =
            formData.photograph_disposition === "RETAIN_1_YEAR"
                ? "accepted"
                : "declined";
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Thank You for Your Order!
                </h1>
                <p className="text-xl text-gray-600">
                    Your Tattoo Memorial is on its way to becoming a reality.
                </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Order Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-2 sm:mb-0">
                        <p className="text-gray-600">Order ID:</p>
                        <p className="font-semibold break-all">{orderId}</p>
                    </div>
                    <div className="mb-2 sm:mb-0">
                        <p className="text-gray-600">Order Date:</p>
                        <p className="font-semibold">
                            {new Date().toLocaleDateString()}
                        </p>
                    </div>
                    <div className="mb-2 sm:mb-0">
                        <p className="text-gray-600">Name:</p>
                        <p className="font-semibold">
                            {formData.firstName} {formData.lastName}
                        </p>
                    </div>
                    <div className="mb-2 sm:mb-0">
                        <p className="text-gray-600">Email:</p>
                        <p className="font-semibold break-all">
                            {formData.email}
                        </p>
                    </div>
                    <div className="mb-2 sm:mb-0">
                        <p className="text-gray-600">Phone:</p>
                        <p className="font-semibold">{formData.phone}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Medium:</p>
                        <p className="font-semibold">{formData.medium}</p>
                    </div>
                    {"photograph_disposition" in formData && (
                        <div>
                            <p className="font-semibold">
                                You have <b>{storageChoice}</b> the optional $25
                                storage fee to retian your photos for 1 year.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    What's Next?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center text-center">
                        <ClipboardCheck className="w-12 h-12 text-blue-500 mb-2" />
                        <h3 className="text-lg font-semibold mb-2">
                            Order Processing
                        </h3>
                        <p className="text-gray-600">
                            We've received your order and are reviewing the
                            details.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Mail className="w-12 h-12 text-blue-500 mb-2" />
                        <h3 className="text-lg font-semibold mb-2">
                            Confirmation Email
                        </h3>
                        <p className="text-gray-600">
                            You'll receive a detailed confirmation email
                            shortly.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <HandCoins className="w-12 h-12 text-blue-500 mb-2" />
                        <h3 className="text-lg font-semibold mb-2">
                            Invoicing & Payment
                        </h3>
                        <p className="text-gray-600">
                            You'll receive a detailed invoice and payment
                            instructions in a few business days.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Truck className="w-12 h-12 text-blue-500 mb-2" />
                        <h3 className="text-lg font-semibold mb-2">
                            Creation & Shipping
                        </h3>
                        <p className="text-gray-600">
                            We'll create your memorial and ship it to the
                            provided address.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Shipping Address
                </h2>
                <p>{formData.streetAddress}</p>
                {formData.streetAddress2 && <p>{formData.streetAddress2}</p>}
                <p>
                    {formData.city}, {formData.state} {formData.postalCode}
                </p>
            </div>

            {formData.altered && (
                <div className="mt-8 bg-gray-100 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Alteration Details
                    </h2>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">
                            Alteration Notes:
                        </h3>
                        <p className="text-gray-600">
                            {formData.alterationNotes}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            Inspiration Notes:
                        </h3>
                        <p className="text-gray-600">
                            {formData.inspirationNotes}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                    If you have any questions about your order, please contact
                    us at:
                </p>
                <a
                    href="mailto:support@tattoomemorials.com"
                    className="text-blue-500 hover:underline"
                >
                    support@tattoomemorials.com
                </a>
            </div>
        </div>
    );
};

export default OrderDetails;
