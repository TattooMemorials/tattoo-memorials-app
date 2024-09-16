import React from "react";
import { MemoriamFormData } from "./MemoriamOrderFormEdit";
import { LivingFormData } from "./LivingOrderForm";

interface OrderDetailsProps {
    formData: MemoriamFormData | LivingFormData;
    orderId: string;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ formData, orderId }) => {
    return (
        <div className="bg-tan-500 p-8 rounded-lg max-w-md w-full border border-navy-500 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-black">
                Order Details
            </h2>

            <div className="mb-6">
                <p className="text-black font-semibold mb-2">Order ID:</p>
                <div className="flex items-center bg-tan-500 p-2 rounded border border-navy-500">
                    <span className="mr-2 text-black truncate flex-grow">
                        {orderId}
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-black mb-2">
                    Personal Information:
                </h3>
                <p>
                    Name: {formData.firstName} {formData.lastName}
                </p>
                <p>Email: {formData.email}</p>
                <p>Phone: {formData.phone}</p>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-black mb-2">
                    Mailing Address:
                </h3>
                <p>{formData.streetAddress}</p>
                {formData.streetAddress2 && <p>{formData.streetAddress2}</p>}
                <p>
                    {formData.city}, {formData.state} {formData.postalCode}
                </p>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold text-black mb-2">
                    Order Details:
                </h3>
                <p>Medium: {formData.medium}</p>
                <p>Type: {formData.asIs ? "As Is" : "Altered"}</p>
                {formData.altered && (
                    <>
                        <p>Alteration Notes: {formData.alterationNotes}</p>
                        <p>Inspiration Notes: {formData.inspirationNotes}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
