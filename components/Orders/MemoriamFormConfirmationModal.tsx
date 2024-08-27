import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FileUploadProgress, { FileUploadStatus } from "./FileUploadProgress";

interface MemoriamFormConfirmationModalModalProps {
    isOpen: boolean;
    onClose: () => void;
    intakeFormName: string | null;
    consentFormName: string | null;
    images: File[];
    fileUploadStatus: FileUploadStatus[];
}

const MemoriamFormConfirmationModal: React.FC<
    MemoriamFormConfirmationModalModalProps
> = ({
    isOpen,
    onClose,
    intakeFormName,
    consentFormName,
    images,
    fileUploadStatus,
}) => {
    const [uploadsComplete, setUploadsComplete] = useState(false);

    useEffect(() => {
        if (
            fileUploadStatus.length > 0 &&
            fileUploadStatus.every((file) => file.status === "success")
        ) {
            setUploadsComplete(true);
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
                    Upload Confirmation
                </h2>

                <div className="text-black">
                    <ul>
                        {intakeFormName && (
                            <li className="mb-4">
                                <FileUploadProgress
                                    fileUploadStatus={fileUploadStatus.filter(
                                        (file) => file.name === intakeFormName
                                    )}
                                />
                            </li>
                        )}

                        {consentFormName && (
                            <li className="mb-4">
                                <FileUploadProgress
                                    fileUploadStatus={fileUploadStatus.filter(
                                        (file) => file.name === consentFormName
                                    )}
                                />
                            </li>
                        )}

                        {images.length > 0 &&
                            images.map((image, index) => (
                                <li key={index} className="mb-4">
                                    <FileUploadProgress
                                        fileUploadStatus={fileUploadStatus.filter(
                                            (file) => file.name === image.name
                                        )}
                                    />
                                </li>
                            ))}
                    </ul>

                    {uploadsComplete && (
                        <p className="mt-4 text-green-400 font-semibold">
                            All files uploaded successfully!
                        </p>
                    )}

                    {!uploadsComplete && (
                        <p className="mt-4 text-gray-500 font-semibold">
                            Please wait while we upload your files...
                        </p>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-6 bg-navy-500 text-white rounded-md px-6 py-2 hover:bg-gold-600 transition"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MemoriamFormConfirmationModal;
