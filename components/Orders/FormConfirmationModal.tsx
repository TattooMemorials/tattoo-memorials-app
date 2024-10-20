import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploadProgress, { FileUploadStatus } from "./FileUploadProgress";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: any;
    orderId: string | null;
    fileUploadStatus?: FileUploadStatus[];
}

//
const FormConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    formData,
    orderId,
    fileUploadStatus,
}) => {
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [uploadsComplete, setUploadsComplete] = useState(false);

    useEffect(() => {
        if (fileUploadStatus) {
            if (
                fileUploadStatus.length > 0 &&
                fileUploadStatus.every((file) => file.status === "success")
            ) {
                setUploadsComplete(true);
                setTimeout(() => setShowOrderDetails(true), 1000);
            }
        } else {
            // If fileUploadStatus is not provided, show order details immediately
            setShowOrderDetails(true);
        }
    }, [fileUploadStatus]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-tan-500 bg-opacity-80 flex justify-center items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-tan-500 p-8 rounded-lg max-w-md w-full border border-navy-500 shadow-lg"
            >
                <h2 className="text-2xl font-bold mb-6 text-black">
                    Order Confirmation
                </h2>

                <AnimatePresence>
                    {fileUploadStatus &&
                        fileUploadStatus.length > 0 &&
                        !showOrderDetails && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <FileUploadProgress
                                    fileUploadStatus={fileUploadStatus}
                                />
                                {uploadsComplete && (
                                    <p className="mt-4 text-green-400 font-semibold">
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
                            className="text-black"
                        >
                            {orderId && (
                                <div className="mb-6">
                                    <p className="text-black font-semibold mb-2">
                                        Order ID:
                                    </p>
                                    <div className="flex items-center bg-tan-500 p-2 rounded">
                                        <span className="mr-2 text-black truncate flex-grow">
                                            {orderId}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <p className="mb-6">
                                We have sent an email to confirm your order.
                            </p>

                            <div className="mb-6">
                                <h3 className="font-semibold text-black mb-2">
                                    Customer:
                                </h3>
                                <p>
                                    Name: {formData.firstName}{" "}
                                    {formData.lastName}
                                </p>
                                <p>Email: {formData.email}</p>
                                <p>Phone: {formData.phone}</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-black mb-2">
                                    Order Details:
                                </h3>
                                <p>Medium: {formData.medium}</p>
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
                                className="bg-navy-500 text-white rounded-md px-6 py-2 hover:bg-gold-600 transition"
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

export default FormConfirmationModal;
