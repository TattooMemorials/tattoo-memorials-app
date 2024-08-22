"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { formatPhoneNumber } from "@/utils/common/format";
import { FileUploadStatus } from "@/components/Orders/FileUploadProgress";
import DragDrop from "@/components/DragDrop";
import ConfirmationModal from "@/components/Orders/ConfirmationModal";
import FormUpload from "./FormUpload";

const NewOrderForm: React.FC = () => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [token, setToken] = useState<string | null>(null);

    const supabase = createClient();

    const bucket = "order-images";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const [fileUploadStatus, setFileUploadStatus] = useState<
        FileUploadStatus[]
    >([]);

    const resetForm = () => {
        setFiles([]);
        setOrderId(null);
    };

    const validateCurrentStep = () => {
        // TODO: validation logic for uploads
        return true;
    };

    const submitForm = async () => {
        // Handle Google reCAPTCHA v3

        if (!executeRecaptcha) {
            console.log("Execute recaptcha not yet available");
            return;
        }

        const token = await executeRecaptcha("submitLivingOrderForm");
        setToken(token);

        await fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        // Handle Form Submission
        try {
            setIsModalOpen(true);

            // 1. POST form data to /api/memoriam-form API route (with mostly missing data)
            const response = await fetch("/api/memoriam-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: null,
            });

            if (!response.ok) throw new Error("Failed to submit form");

            const result = await response.json();
            setOrderId(result.orderId);

            // Initialize file upload status
            setFileUploadStatus(
                files.map((file) => ({ name: file.name, status: "pending" }))
            );

            // 2. Uppload files to Storage with result.orderId as the folder
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    const { error } = await supabase.storage
                        .from(bucket)
                        .upload(`${result.orderId}/${file.name}`, file);

                    if (error) {
                        setFileUploadStatus((prev) =>
                            prev.map((item, index) =>
                                index === i
                                    ? { ...item, status: "error" }
                                    : item
                            )
                        );
                    } else {
                        setFileUploadStatus((prev) =>
                            prev.map((item, index) =>
                                index === i
                                    ? { ...item, status: "success" }
                                    : item
                            )
                        );
                    }
                } catch (error) {
                    setFileUploadStatus((prev) =>
                        prev.map((item, index) =>
                            index === i ? { ...item, status: "error" } : item
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
        setUploading(false);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <div className="flex flex-col w-full gap-6 text-foreground bg-navy-900 text-gold-300 p-8 rounded-lg shadow-lg">
            <FormUpload />
            {/* <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                formData={null}
                orderId={orderId}
                fileUploadStatus={fileUploadStatus}
            /> */}
        </div>
    );
};

export default NewOrderForm;
