"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DragDrop from "../DragDrop";
import ConfirmationModal from "./ConfirmationModal";
import { FileUploadStatus } from "./FileUploadProgress";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import ProgressBar from "./ProgressBar";
import { formatPhoneNumber } from "@/utils/common/format";

export interface LivingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
    streetAddress2?: string;
    city: string;
    state: string;
    postalCode: string;
    asIs: boolean;
    altered: boolean;
    alterationNotes?: string | null;
    inspirationNotes?: string;
    acrylic: boolean;
    charcoal: boolean;
    digitalTattooStencil: boolean;
    ink: boolean;
    oilPaint: boolean;
    pastel: boolean;
    pencil: boolean;
    digital: boolean;
    syntheticSkin: boolean;
    watercolor: boolean;
}

const NewOrderForm: React.FC = () => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [token, setToken] = useState<string | null>(null);

    const supabase = createClient();

    const initialFormState: LivingFormData = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        streetAddress: "",
        streetAddress2: "",
        city: "",
        state: "",
        postalCode: "",
        asIs: false,
        altered: false,
        alterationNotes: "",
        inspirationNotes: "",
        acrylic: false,
        charcoal: false,
        digitalTattooStencil: false,
        ink: false,
        oilPaint: false,
        pastel: false,
        pencil: false,
        digital: false,
        syntheticSkin: false,
        watercolor: false,
    };

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

    const totalSteps = 4;
    const [step, setStep] = useState(1);
    const bucket = "order-images";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const [formData, setFormData] = useState<LivingFormData>(initialFormState);
    const [fileUploadStatus, setFileUploadStatus] = useState<
        FileUploadStatus[]
    >([]);

    const resetForm = () => {
        setStep(1);
        setFiles([]);
        setFormData(initialFormState);
        setOrderId(null);
    };

    // Helper function to update form data
    const updateFormData = <K extends keyof LivingFormData>(
        key: K,
        value: LivingFormData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const validateCurrentStep = () => {
        // Step 1: Continue using the existing HTML validation
        if (step === 1) {
            const currentDiv = document.querySelector(
                `div[data-step="${step}"]`
            );
            if (currentDiv) {
                const inputs = Array.from(
                    currentDiv.querySelectorAll<
                        HTMLInputElement | HTMLTextAreaElement
                    >("input, textarea")
                );
                for (let input of inputs) {
                    if (!input.checkValidity()) {
                        input.reportValidity();
                        return false;
                    }
                }
            }
        }

        // Step 2: Validate that at least one medium is selected
        if (step === 2) {
            const mediumsSelected =
                formData.acrylic ||
                formData.syntheticSkin ||
                formData.ink ||
                formData.pencil ||
                formData.pastel ||
                formData.watercolor ||
                formData.oilPaint ||
                formData.charcoal ||
                formData.digitalTattooStencil ||
                formData.digital;
            if (!mediumsSelected) {
                alert("Please select at least one medium.");
                return false;
            }
        }

        // Step 3: Validate that either "As Is" or "Altered" is selected
        if (step === 3) {
            if (!formData.asIs && !formData.altered) {
                alert("Please select either 'As Is' or 'Altered'.");
                return false;
            }

            const currentDiv = document.querySelector(
                `div[data-step="${step}"]`
            );
            if (currentDiv) {
                const inputs = Array.from(
                    currentDiv.querySelectorAll<
                        HTMLInputElement | HTMLTextAreaElement
                    >("input, textarea")
                );
                for (let input of inputs) {
                    if (!input.checkValidity()) {
                        input.reportValidity();
                        return false;
                    }
                }
            }
        }

        // Step 4: Validate that at least one file is uploaded
        if (step === 4) {
            if (files.length === 0) {
                alert("Please upload at least one file.");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setStep((prevStep) => prevStep + 1);
        } else {
            const currentDiv = document.querySelector(
                `div[data-step="${step}"]`
            );
            if (currentDiv) {
                const inputs = Array.from(
                    currentDiv.querySelectorAll<
                        HTMLInputElement | HTMLTextAreaElement
                    >("input, textarea")
                );
                for (let input of inputs) {
                    if (!input.checkValidity()) {
                        input.reportValidity();
                        break; // Stop at the first invalid input to show its error message.
                    }
                }
            }
        }
    };

    const handlePrevious = () => setStep(step - 1);

    const toggleCheckbox = (key: keyof LivingFormData) => {
        setFormData((prev) => {
            if (key === "asIs") {
                // Toggle "As Is" and reset "Altered" if "As Is" is selected
                return {
                    ...prev,
                    asIs: !prev.asIs,
                    altered: !prev.asIs ? false : prev.altered,
                    alterationNotes: !prev.asIs ? "" : prev.alterationNotes,
                    inspirationNotes: !prev.asIs ? "" : prev.inspirationNotes,
                };
            } else if (key === "altered") {
                // Toggle "Altered" and reset "As Is" if "Altered" is selected
                return {
                    ...prev,
                    altered: !prev.altered,
                    asIs: !prev.altered ? false : prev.asIs,
                };
            } else {
                // Generic toggle for other checkboxes
                return {
                    ...prev,
                    [key]: !prev[key] as boolean,
                };
            }
        });
    };

    const handlePhoneNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        // Remove all non-numeric characters
        const rawValue = e.target.value.replace(/\D/g, "");

        // Enforce a maximum length of 10 digits
        if (rawValue.length > 10) {
            return; // Exit early if the length exceeds 10 digits
        }

        // Format the cleaned value
        const formattedValue = formatPhoneNumber(rawValue);

        // Update the form state with the raw value
        updateFormData("phone", rawValue);

        // Update the display value (formatted)
        e.target.value = formattedValue;
    };

    const selectedMediums = Object.entries(formData)
        .filter(([key, value]) => key in mediumMapping && value)
        .map(([key]) => mediumMapping[key as keyof typeof mediumMapping])
        .join(", ");

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

            // 1. POST form data to /api/living-form API route
            const response = await fetch("/api/living-form", {
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

            const emailResponse = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    subject: `Tattoo Memorials Order Received`,
                    message: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order from Tattoo Memorials</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">New Order Received</h1>
    
    <p style="background-color: #edf2f7; padding: 10px; border-radius: 5px; font-weight: bold;">Order ID: ${
        result.orderId
    }</p>

    <h2 style="color: #2c5282; margin-top: 20px;">Personal Information</h2>
    <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Phone:</strong> ${formData.phone}</p>

    <h2 style="color: #2c5282; margin-top: 20px;">Mailing Address</h2>
    <p>${formData.streetAddress}<br>
    ${formData.streetAddress2 ? formData.streetAddress2 + "<br>" : ""}
    ${formData.city}, ${formData.state} ${formData.postalCode}</p>

    <h2 style="color: #2c5282; margin-top: 20px;">Order Details</h2>
    <p><strong>Medium:</strong> ${selectedMediums || "None selected"}</p>
    <p><strong>Type:</strong> ${formData.asIs ? "As Is" : "Altered"}</p>
    ${
        formData.altered
            ? `
        <p><strong>Alteration Notes:</strong> ${formData.alterationNotes}</p>
        <p><strong>Inspiration Notes:</strong> ${formData.inspirationNotes}</p>
    `
            : ""
    }

    <p style="margin-top: 20px;">Thank you,<br>Tattoo Memorials</p>
</body>
</html>
        `,
                    TextBody: `
We have received your Tattoo Memorials order.

Order ID:
${result.orderId}

Personal Information:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

Mailing Address:
${formData.streetAddress}
${formData.streetAddress2 ? formData.streetAddress2 + "\n" : ""}${
                        formData.city
                    }, ${formData.state} ${formData.postalCode}

Order Details:
Medium: ${Object.entries(formData)
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
                        .map(
                            ([key]) =>
                                key.charAt(0).toUpperCase() + key.slice(1)
                        )
                        .join(", ")}
Type: ${formData.asIs ? "As Is" : "Altered"}
${
    formData.altered
        ? `
Alteration Notes: ${formData.alterationNotes}
Inspiration Notes: ${formData.inspirationNotes}
`
        : ""
}

Thank you,
Tattoo Memorials Auto-Notification System
        `,
                }),
            });
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
        <div
            className="flex flex-col w-full gap-6 text-foreground bg-tan-500 p-8"
            data-step={step}
        >
            <ProgressBar step={step} totalSteps={totalSteps} />
            {step === 1 && (
                <div className="flex flex-col">
                    <label className="text-lg mb-2 text-black" htmlFor="name">
                        Name
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 w-full">
                        <input
                            className="rounded-md px-4 py-3 bg-tan-500 border border-black mb-2 sm:mb-0 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                            name="first_name"
                            placeholder="Jane"
                            required
                            autoComplete="off"
                            data-lpignore="true"
                            value={formData.firstName}
                            onChange={(e) =>
                                updateFormData("firstName", e.target.value)
                            }
                        />
                        <input
                            className="rounded-md px-4 py-3 bg-tan-500 border border-black w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                            name="last_name"
                            placeholder="Doe"
                            required
                            autoComplete="off"
                            data-lpignore="true"
                            value={formData.lastName}
                            onChange={(e) =>
                                updateFormData("lastName", e.target.value)
                            }
                        />
                    </div>
                    <label
                        className="text-md mb-2 mt-4 text-black"
                        htmlFor="phone"
                    >
                        Phone
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                        type="tel"
                        name="phone"
                        placeholder="123-456-7890"
                        required
                        autoComplete="off"
                        data-lpignore="true"
                        value={formatPhoneNumber(formData.phone)} // Display formatted value
                        onChange={handlePhoneNumberChange} // Use new handler
                    />
                    <label
                        className="text-md mb-2 mt-4 text-black"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                        type="email"
                        name="email"
                        placeholder="jane.doe@example.com"
                        required
                        autoComplete="off"
                        data-lpignore="true"
                        value={formData.email}
                        onChange={(e) =>
                            updateFormData("email", e.target.value)
                        }
                    />
                    <label
                        className="text-md mb-2 mt-4 text-black"
                        htmlFor="address"
                    >
                        Mailing Address
                    </label>
                    <input
                        className="rounded-md px-4 py-2 mt-2 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                        name="street_address"
                        placeholder="Street Address"
                        required
                        value={formData.streetAddress}
                        onChange={(e) =>
                            updateFormData("streetAddress", e.target.value)
                        }
                        autoComplete="off"
                        data-lpignore="true"
                    />
                    <input
                        className="rounded-md px-4 py-2 mt-4 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                        name="street_address_2"
                        placeholder="Street Address Line 2 (Optional)"
                        value={formData.streetAddress2}
                        onChange={(e) =>
                            updateFormData("streetAddress2", e.target.value)
                        }
                        autoComplete="off"
                        data-lpignore="true"
                    />
                    <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4">
                        <input
                            className="rounded-md px-4 py-2 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 mb-2 sm:mb-0 sm:w-1/2 text-black"
                            name="city"
                            placeholder="City"
                            required
                            value={formData.city}
                            onChange={(e) =>
                                updateFormData("city", e.target.value)
                            }
                            autoComplete="off"
                            data-lpignore="true"
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 mb-2 sm:mb-0 sm:w-1/4 text-black"
                            name="state"
                            placeholder="State (XX)"
                            required
                            value={formData.state}
                            onChange={(e) => {
                                // Restrict input to 2 characters
                                if (e.target.value.length <= 2) {
                                    updateFormData("state", e.target.value);
                                }
                            }}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-tan-500 border border-black focus:outline-none focus:ring-2 focus:ring-navy-500 sm:w-1/4 text-black"
                            name="postal_code"
                            placeholder="ZIP Code (XXXXX)"
                            required
                            value={formData.postalCode}
                            onChange={(e) => {
                                // Restrict input to 2 characters
                                if (e.target.value.length <= 5) {
                                    updateFormData(
                                        "postalCode",
                                        e.target.value
                                    );
                                }
                            }}
                            autoComplete="off"
                            data-lpignore="true"
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <h2 className="text-2xl font-semibold col-span-full mb-4 text-center">
                        Medium Choices
                    </h2>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.acrylic
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("acrylic")}
                    >
                        <span>Acrylic</span>
                        {formData.acrylic && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.syntheticSkin
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("syntheticSkin")}
                    >
                        <span>Synthetic Skin</span>
                        {formData.syntheticSkin && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.ink
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("ink")}
                    >
                        <span>Ink</span>
                        {formData.ink && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.pencil
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("pencil")}
                    >
                        <span>Pencil</span>
                        {formData.pencil && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.pastel
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("pastel")}
                    >
                        <span>Pastel</span>
                        {formData.pastel && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.watercolor
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("watercolor")}
                    >
                        <span>Watercolor</span>
                        {formData.watercolor && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.oilPaint
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("oilPaint")}
                    >
                        <span>Oil Paint</span>
                        {formData.oilPaint && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.charcoal
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("charcoal")}
                    >
                        <span>Charcoal</span>
                        {formData.charcoal && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.digitalTattooStencil
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("digitalTattooStencil")}
                    >
                        <span>Digital Tattoo Stencil</span>
                        {formData.digitalTattooStencil && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border-2 border-black rounded-md h-24 cursor-pointer transition ${
                            formData.digital
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("digital")}
                    >
                        <span>Digital</span>
                        {formData.digital && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        className={`relative flex flex-col justify-between border border-black rounded-md p-4 cursor-pointer transition ${
                            formData.asIs
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("asIs")}
                    >
                        <div>
                            <span className="font-bold text-lg">As Is</span>
                            <p className="text-sm mt-2">
                                The artwork created will be the same size and
                                color as the original with no augmentation.
                            </p>
                        </div>
                        {formData.asIs && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex flex-col justify-between border border-black rounded-md p-4 cursor-pointer transition ${
                            formData.altered
                                ? "bg-navy-500 text-white"
                                : "bg-tan-500 text-black"
                        }`}
                        onClick={() => toggleCheckbox("altered")}
                    >
                        <div>
                            <span className="font-bold text-lg">Altered</span>
                            <p className="text-sm mt-2">
                                The artwork created can be altered in size,
                                color, and with any additional augmentations
                                specified below.
                            </p>
                        </div>
                        {formData.altered && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    {formData.altered && (
                        <div className="col-span-1 sm:col-span-2 mt-6 p-4 border border-black rounded-md bg-tan-500 text-white">
                            <h2 className="text-lg font-semibold mb-4 text-black">
                                Please describe the augmentations below. Be sure
                                to include the dimensions in inches for size
                                alterations.
                            </h2>

                            <h3 className="text-md font-medium mb-2 text-black">
                                What would you like to change?
                            </h3>
                            <textarea
                                className="rounded-md px-4 py-3 bg-tan-500 w-full border border-black mb-4 sm:mb-6 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                                placeholder="Describe the changes you would like..."
                                value={formData.alterationNotes || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "alterationNotes",
                                        e.target.value
                                    )
                                }
                                required
                            />

                            <h2 className="text-lg font-semibold mb-4 text-black">
                                Do you have any examples or inspiration you can
                                share with us that will help us better
                                understand the direction you wish us to take for
                                your artistic representation?
                            </h2>

                            <h3 className="text-md font-medium mb-2 text-black">
                                Pinterest, YouTube, URL, etc.
                            </h3>
                            <textarea
                                className="rounded-md px-4 py-3 bg-tan-500 w-full border border-black mb-4 sm:mb-6 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-navy-500 text-black"
                                placeholder="Provide links or descriptions..."
                                value={formData.inspirationNotes || ""}
                                onChange={(e) =>
                                    updateFormData(
                                        "inspirationNotes",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            )}

            {step === 4 && (
                <div className="w-full">
                    <p className="text-center mb-6 text-black">
                        Share photographs of your tattoo(s) here. You can upload
                        multiple files if needed.
                    </p>
                    <div className="bg-tan-500 p-6 rounded-lg">
                        <DragDrop
                            files={files}
                            setFiles={setFiles}
                            uploading={uploading}
                        />
                    </div>
                </div>
            )}

            <div className="flex justify-between mt-4">
                {step > 1 && (
                    <button
                        type="button"
                        className="bg-gray-600 rounded-md px-4 py-2 text-foreground text-white"
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>
                )}
                {step < 4 ? (
                    <button
                        type="button"
                        className="bg-navy-500 text-white rounded-md px-6 py-2 hover:bg-gold-600 transition"
                        onClick={handleNext}
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        type="button"
                        className="bg-navy-500 text-white rounded-md px-6 py-2 hover:bg-gold-600 transition"
                        onClick={submitForm}
                    >
                        Submit
                    </button>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                formData={formData}
                orderId={orderId}
                fileUploadStatus={fileUploadStatus}
            />
        </div>
    );
};

export default NewOrderForm;
