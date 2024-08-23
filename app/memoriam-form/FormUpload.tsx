import { FileUploadStatus } from "@/components/Orders/FileUploadProgress";
import { createClient } from "@/utils/supabase/client";
import React, { useState, ChangeEvent } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface FileState {
    file: File | null;
    name: string;
}

const FormUpload: React.FC = () => {
    const supabase = createClient();

    const { executeRecaptcha } = useGoogleReCaptcha();
    const [token, setToken] = useState<string | null>(null);
    const bucket = "order-images";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // const [formData, setFormData] = useState<LivingFormData>(initialFormState);
    const [fileUploadStatus, setFileUploadStatus] = useState<
        FileUploadStatus[]
    >([]);

    const [intakeForm, setIntakeForm] = useState<FileState>({
        file: null,
        name: "",
    });
    const [consentForm, setConsentForm] = useState<FileState>({
        file: null,
        name: "",
    });
    const [images, setImages] = useState<File[]>([]);

    const handleFileChange =
        (setter: React.Dispatch<React.SetStateAction<FileState>>) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0] || null;
            setter({ file, name: file?.name || "" });
        };

    const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setImages(files);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const response = await fetch("/api/memoriam-form", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                test: "todo",
            }),
        });

        console.log("memoriam-form response: ", response);

        // // Handle Google reCAPTCHA v3
        // if (!executeRecaptcha) {
        //     console.log("Execute recaptcha not yet available");
        //     return;
        // }

        // const token = await executeRecaptcha("submitLivingOrderForm");
        // setToken(token);

        // await fetch("/api/verify-recaptcha", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ token }),
        // });

        // Handle Form Submission
        try {
            setIsModalOpen(true);

            // 1. POST form data to /api/living-form API route
            const response = await fetch("/api/memoriam-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formData,
                }),
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

    return (
        <form
            onSubmit={handleSubmit}
            className="p-6 bg-navy-950 rounded-lg text-gold-300"
        >
            <div className="mb-4 flex items-center">
                <label className="w-1/2">Upload Intake Form:</label>
                <button
                    type="button"
                    onClick={() =>
                        document.getElementById("intakeForm")?.click()
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Upload
                </button>
                <input
                    id="intakeForm"
                    type="file"
                    onChange={handleFileChange(setIntakeForm)}
                    className="hidden"
                />
                <span className="ml-4">
                    {intakeForm.name || "(list file here)"}
                </span>
            </div>

            <div className="mb-4 flex items-center">
                <label className="w-1/2">
                    Upload Photography Consent Form:
                </label>
                <button
                    type="button"
                    onClick={() =>
                        document.getElementById("consentForm")?.click()
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Upload
                </button>
                <input
                    id="consentForm"
                    type="file"
                    onChange={handleFileChange(setConsentForm)}
                    className="hidden"
                />
                <span className="ml-4">
                    {consentForm.name || "(list file here)"}
                </span>
            </div>

            <div className="mb-4 flex items-center">
                <label className="w-1/2">
                    Upload Images (jpg/png/pdf/gif):
                </label>
                <button
                    type="button"
                    onClick={() => document.getElementById("images")?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Upload
                </button>
                <input
                    id="images"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.gif"
                    onChange={handleImagesChange}
                    className="hidden"
                />
                <span className="ml-4">
                    {images.length > 0
                        ? `${images.length} file(s) selected`
                        : "(list files here...)"}
                </span>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
                <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default FormUpload;
