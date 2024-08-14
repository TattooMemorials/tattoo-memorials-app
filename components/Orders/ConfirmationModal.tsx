import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploadProgress, { FileUploadStatus } from "./FileUploadProgress";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: any;
    orderId: string | null;
    fileUploadStatus: FileUploadStatus[];
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    formData,
    orderId,
    fileUploadStatus,
}) => {
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [uploadsComplete, setUploadsComplete] = useState(false);

    useEffect(() => {
        if (
            fileUploadStatus.length > 0 &&
            fileUploadStatus.every((file) => file.status === "success")
        ) {
            setUploadsComplete(true);
            setTimeout(() => setShowOrderDetails(true), 1000); // Delay to allow for a smooth transition
        }
    }, [fileUploadStatus]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white p-6 rounded-lg max-w-md w-full"
            >
                <h2 className="text-xl font-bold mb-4">Order Confirmation</h2>

                <AnimatePresence>
                    {fileUploadStatus.length > 0 && !showOrderDetails && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <FileUploadProgress
                                fileUploadStatus={fileUploadStatus}
                            />
                            {uploadsComplete && (
                                <p className="mt-4 text-green-600">
                                    All files uploaded successfully!
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showOrderDetails && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {orderId && (
                                <p className="mb-4 text-green-600 font-semibold">
                                    Order ID: {orderId}
                                </p>
                            )}
                            <p className="mb-4">
                                Your order has been successfully submitted. Here
                                are the details:
                            </p>

                            <div className="mb-4">
                                <h3 className="font-semibold">
                                    Personal Information:
                                </h3>
                                <p>
                                    Name: {formData.firstName}{" "}
                                    {formData.lastName}
                                </p>
                                <p>Email: {formData.email}</p>
                                <p>Phone: {formData.phone}</p>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold">
                                    Order Details:
                                </h3>
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
                                <p>
                                    Type: {formData.asIs ? "As Is" : "Altered"}
                                </p>
                                {formData.altered && (
                                    <>
                                        <p>
                                            Alteration Notes:{" "}
                                            {formData.alterationNotes}
                                        </p>
                                        <p>
                                            Inspiration Notes:{" "}
                                            {formData.inspirationNotes}
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ConfirmationModal;
