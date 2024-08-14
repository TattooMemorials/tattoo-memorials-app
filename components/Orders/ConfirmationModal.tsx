import React from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: any;
    orderId: string | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    formData,
    orderId,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Order Confirmation</h2>
                {orderId && (
                    <p className="mb-4 text-green-600 font-semibold">
                        Order ID: {orderId}
                    </p>
                )}
                <p className="mb-4">
                    Your order has been successfully submitted. Here are the
                    details:
                </p>

                <div className="mb-4">
                    <h3 className="font-semibold">Personal Information:</h3>
                    <p>
                        Name: {formData.firstName} {formData.lastName}
                    </p>
                    <p>Email: {formData.email}</p>
                    <p>Phone: {formData.phone}</p>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold">Order Details:</h3>
                    <p>
                        Medium:{" "}
                        {Object.entries(formData)
                            .filter(
                                ([key, value]) =>
                                    [
                                        "syntheticSkin",
                                        "ink",
                                        "pencil",
                                        "pastel",
                                        "watercolor",
                                        "oilPaint",
                                    ].includes(key) && value
                            )
                            .map(([key]) => key)
                            .join(", ")}
                    </p>
                    <p>Type: {formData.asIs ? "As Is" : "Altered"}</p>
                    {formData.altered && (
                        <>
                            <p>Alteration Notes: {formData.alterationNotes}</p>
                            <p>
                                Inspiration Notes: {formData.inspirationNotes}
                            </p>
                        </>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
