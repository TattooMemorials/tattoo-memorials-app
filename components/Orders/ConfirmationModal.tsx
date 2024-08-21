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
    const [copied, setCopied] = useState(false);

    const mediumMapping = {
        acrylic: "Acrylic",
        syntheticSkin: "Synthetic Skin",
        ink: "Ink",
        pencil: "Pencil",
        pastel: "Pastel",
        watercolor: "Watercolor",
        oilPaint: "Oil Paint",
        charcoal: "Charcoal",
        digitalTattooStencil: "Digital Tattoo Stencil",
        digital: "Digital",
    };

    useEffect(() => {
        if (
            fileUploadStatus.length > 0 &&
            fileUploadStatus.every((file) => file.status === "success")
        ) {
            setUploadsComplete(true);
            setTimeout(() => setShowOrderDetails(true), 1000);
        }
    }, [fileUploadStatus]);

    const selectedMediums = Object.entries(formData)
        .filter(([key, value]) => key in mediumMapping && value)
        .map(([key]) => mediumMapping[key as keyof typeof mediumMapping])
        .join(", ");

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-navy-900 bg-opacity-80 flex justify-center items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-navy-800 p-8 rounded-lg max-w-md w-full border border-gold-600 shadow-lg"
            >
                <h2 className="text-2xl font-bold mb-6 text-gold-400">
                    Order Confirmation
                </h2>

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
                            className="text-gold-300"
                        >
                            {orderId && (
                                <div className="mb-6">
                                    <p className="text-green-400 font-semibold mb-2">
                                        Order ID:
                                    </p>
                                    <div className="flex items-center bg-navy-700 p-2 rounded">
                                        <span className="mr-2 text-gold-300 truncate flex-grow">
                                            {orderId}
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(orderId)
                                            }
                                            className="bg-navy-600 hover:bg-navy-500 text-gold-300 p-1 rounded transition-colors duration-300 flex-shrink-0"
                                            title="Copy to clipboard"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    {copied && (
                                        <p className="text-green-400 mt-1 text-sm">
                                            Copied to clipboard!
                                        </p>
                                    )}
                                </div>
                            )}
                            <p className="mb-6">
                                Your order has been successfully submitted. Here
                                are the details:
                            </p>

                            <div className="mb-6">
                                <h3 className="font-semibold text-gold-400 mb-2">
                                    Personal Information:
                                </h3>
                                <p>
                                    Name: {formData.firstName}{" "}
                                    {formData.lastName}
                                </p>
                                <p>Email: {formData.email}</p>
                                <p>Phone: {formData.phone}</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold text-gold-400 mb-2">
                                    Order Details:
                                </h3>
                                <p>Mediums: {selectedMediums}</p>
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
                                className="bg-gold-600 text-navy-900 px-6 py-2 rounded-md font-semibold hover:bg-gold-500 transition-colors duration-300"
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
