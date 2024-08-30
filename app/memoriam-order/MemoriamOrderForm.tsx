"use client";

import { FileUploadStatus } from "@/components/Orders/FileUploadProgress";
import MemoriamFormConfirmationModal from "@/components/Orders/MemoriamFormConfirmationModal";
import { createClient } from "@/utils/supabase/client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const MemoriamOrderForm: React.FC = () => {
    const supabase = createClient();

    const { executeRecaptcha } = useGoogleReCaptcha();
    const [token, setToken] = useState<string | null>(null);
    const imagesBucket = "order-images";
    const formsBucket = "order-forms";
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [fileUploadStatus, setFileUploadStatus] = useState<
        FileUploadStatus[]
    >([]);

    const [intakeForm, setIntakeForm] = useState<File | null>(null);
    const [consentForm, setConsentForm] = useState<File | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [email, setEmail] = useState<string>("");

    // Add this useEffect hook to check form validity
    useEffect(() => {
        setIsFormValid(!!intakeForm && !!consentForm && images.length > 0);
    }, [intakeForm, consentForm, images]);

    const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);
        setImages((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const resetForm = () => {
        setIntakeForm(null);
        setConsentForm(null);
        setImages([]);
        setFileUploadStatus([]);
        setOrderId(null);
        setIsModalOpen(false);
        setUploading(false);
        setEmail("");
    };

    const removeFile = (
        fileType: "intake" | "consent" | "images",
        index?: number
    ) => {
        switch (fileType) {
            case "intake":
                setIntakeForm(null);
                break;
            case "consent":
                setConsentForm(null);
                break;
            case "images":
                if (index !== undefined) {
                    setImages((prevFiles) =>
                        prevFiles.filter((_, i) => i !== index)
                    );
                }
                break;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Handle Google reCAPTCHA v3
        if (!executeRecaptcha) {
            console.log("Execute recaptcha not yet available");
            return;
        }

        const token = await executeRecaptcha("submitMemoriamOrderForm");
        setToken(token);

        const recaptchaResponse = await fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const recaptchaResult = await recaptchaResponse.json();

        if (!recaptchaResult.success) {
            const tattooEnv = process.env.NEXT_PUBLIC_TATTOO_ENV;
            console.error("Recaptcha Error: ", recaptchaResult.error);
            if (tattooEnv !== "dev") {
                return; // Exit early on error
            }
        }

        // Initialize file upload status before starting uploads
        setFileUploadStatus([
            ...(intakeForm
                ? [{ name: intakeForm.name, status: "pending" as const }]
                : []),
            ...(consentForm
                ? [{ name: consentForm.name, status: "pending" as const }]
                : []),
            ...images.map((file) => ({
                name: file.name,
                status: "pending" as const,
            })),
        ]);

        setIsModalOpen(true);

        // 1. Create empty memoriam_orders record
        let result;
        try {
            const response = await fetch("/api/memoriam-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    formData: {
                        email: email || null, // Include email if provided, otherwise null
                    },
                }),
            });

            result = await response.json();
            setOrderId(result.orderId);

            console.log("memoriam-form response: ", response);
        } catch (error) {
            console.error("Error creating memoriam_orders record:", error);
            return; // Exit early on error
        }

        // 2. Upload the intake form and update the path.
        let intakeFilePath = "";
        try {
            if (intakeForm) {
                intakeFilePath = `${result.orderId}/${intakeForm.name}`;
                const { error } = await supabase.storage
                    .from(formsBucket)
                    .upload(intakeFilePath, intakeForm);

                if (error) {
                    console.error("Error uploading intake form: ", error);
                    // Rollback by deleting the created memoriam_orders record
                    await fetch("/api/memoriam-order", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId: result.orderId,
                        }),
                    });
                    return; // Exit early on error
                }

                setFileUploadStatus((prev) =>
                    prev.map((item) =>
                        item.name === intakeForm.name
                            ? { ...item, status: "success" }
                            : item
                    )
                );

                // Update record with intake form path via API call
                await fetch("/api/memoriam-order", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: result.orderId,
                        intake_form_path: intakeFilePath,
                    }),
                });
            }
        } catch (error) {
            console.error(
                "Error uploading or updating intake form path:",
                error
            );
            // Rollback by deleting the created memoriam_orders record
            await fetch("/api/memoriam-order", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: result.orderId,
                }),
            });
            return; // Exit early on error
        }

        // 3. Upload the consent form and update the path.
        let consentFilePath = "";
        try {
            if (consentForm) {
                consentFilePath = `${result.orderId}/${consentForm.name}`;
                const { error } = await supabase.storage
                    .from(formsBucket)
                    .upload(consentFilePath, consentForm);

                if (error) {
                    console.error("Error uploading consent form: ", error);
                    // Rollback by deleting the created memoriam_orders record
                    await fetch("/api/memoriam-order", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId: result.orderId,
                        }),
                    });
                    return; // Exit early on error
                }

                setFileUploadStatus((prev) =>
                    prev.map((item) =>
                        item.name === consentForm.name
                            ? { ...item, status: "success" }
                            : item
                    )
                );

                // Update record with consent form path via API call
                await fetch("/api/memoriam-order", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: result.orderId,
                        consent_form_path: consentFilePath,
                    }),
                });
            }
        } catch (error) {
            console.error(
                "Error uploading or updating consent form path:",
                error
            );
            // Rollback by deleting the created memoriam_orders record
            await fetch("/api/memoriam-order", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: result.orderId,
                }),
            });
            return; // Exit early on error
        }

        // 4. Upload the images (as previously implemented)
        try {
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const { error } = await supabase.storage
                    .from(imagesBucket)
                    .upload(`${result.orderId}/${image.name}`, image);

                if (error) {
                    setFileUploadStatus((prev) =>
                        prev.map((item) =>
                            item.name === image.name
                                ? { ...item, status: "error" }
                                : item
                        )
                    );
                    throw new Error(`Error uploading image: ${image.name}`);
                } else {
                    setFileUploadStatus((prev) =>
                        prev.map((item) =>
                            item.name === image.name
                                ? { ...item, status: "success" }
                                : item
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Error uploading images:", error);

            // Rollback by deleting the created memoriam_orders record
            await fetch("/api/memoriam-order", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: result.orderId,
                }),
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full gap-6 text-foreground bg-tan-500 p-8 rounded-lg"
        >
            {/* Intake Form Upload */}
            <div className="flex flex-col mb-4">
                <label className="text-lg text-black mb-2">
                    Upload Intake Form:
                </label>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() =>
                            document.getElementById("intakeForm")?.click()
                        }
                        className="bg-navy-500 hover:bg-gold-600 text-white px-4 py-2 rounded transition"
                    >
                        Select File
                    </button>
                    <input
                        id="intakeForm"
                        type="file"
                        onChange={(event) => {
                            if (event.target && event.target.files) {
                                setIntakeForm(event.target.files[0]);
                            }
                        }}
                        className="hidden"
                    />
                </div>
                {intakeForm && (
                    <div className="mt-2 flex justify-between items-center text-black">
                        <span>{intakeForm.name}</span>
                        <button
                            type="button"
                            onClick={() => removeFile("intake")}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            disabled={uploading}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Consent Form Upload */}
            <div className="flex flex-col mb-4">
                <label className="text-lg text-black mb-2">
                    Upload Photography Consent Form:
                </label>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() =>
                            document.getElementById("consentForm")?.click()
                        }
                        className="bg-navy-500 hover:bg-gold-600 text-white px-4 py-2 rounded transition"
                    >
                        Select File
                    </button>
                    <input
                        id="consentForm"
                        type="file"
                        onChange={(event) => {
                            if (event.target && event.target.files) {
                                setConsentForm(event.target.files[0]);
                            }
                        }}
                        className="hidden"
                    />
                </div>
                {consentForm && (
                    <div className="mt-2 flex justify-between items-center text-black">
                        <span>{consentForm.name}</span>
                        <button
                            type="button"
                            onClick={() => removeFile("consent")}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            disabled={uploading}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Images Upload */}
            <div className="flex flex-col mb-4">
                <label className="text-lg text-black mb-2">
                    Select Images (jpg/png/pdf/gif):
                </label>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() =>
                            document.getElementById("images")?.click()
                        }
                        className="bg-navy-500 hover:bg-gold-600 text-white px-4 py-2 rounded transition"
                    >
                        Select Images
                    </button>
                    <input
                        id="images"
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.pdf,.gif"
                        onChange={handleImagesChange}
                        className="hidden"
                    />
                    {/* <span className="ml-4 text-black">
                        {images.length > 0
                            ? `${images.length} file(s) selected`
                            : "(No files selected)"}
                    </span> */}
                </div>
                {images.length > 0 && (
                    <ul className="mt-2">
                        {images.map((image, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center text-black text-sm py-2"
                            >
                                <span>{image.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile("images", index)}
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                    disabled={uploading}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Form Submission Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
                <button
                    type="button"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`${
                        isFormValid
                            ? "bg-navy-500 hover:bg-gold-600"
                            : "bg-gray-400 cursor-not-allowed"
                    } text-white px-6 py-2 rounded transition`}
                    disabled={!isFormValid}
                >
                    Submit
                </button>
            </div>
            {/* Email Input */}
            {/* <div className="flex flex-col mb-4">
                <label htmlFor="email" className="text-lg text-black mb-2">
                    Email Address:
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="Authorized Representative Email Address"
                />
            </div> */}
            <MemoriamFormConfirmationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                intakeFormName={intakeForm?.name ?? null}
                consentFormName={consentForm?.name ?? null}
                images={images}
                fileUploadStatus={fileUploadStatus}
            />
        </form>
    );
};

export default MemoriamOrderForm;
