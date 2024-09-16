"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import LivingFormConfirmationModal from "./LivingFormConfirmationModal";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import ProgressBar from "./ProgressBar";
import { formatPhoneNumber } from "@/utils/common/format";
import OrderDetails from "./OrderDetails";
import SomethingWentWrong from "../Common/SomethingWentWrong";

export type Medium =
    | "Acrylic"
    | "Charcoal"
    | "Digital Tattoo Stencil"
    | "Ink"
    | "Oil Paint"
    | "Pastel"
    | "Pencil"
    | "Digital"
    | "Synthetic Skin"
    | "Watercolor";

export const MEDIUMS: Record<Medium, Medium> = {
    Acrylic: "Acrylic",
    Charcoal: "Charcoal",
    "Digital Tattoo Stencil": "Digital Tattoo Stencil",
    Ink: "Ink",
    "Oil Paint": "Oil Paint",
    Pastel: "Pastel",
    Pencil: "Pencil",
    Digital: "Digital",
    "Synthetic Skin": "Synthetic Skin",
    Watercolor: "Watercolor",
};

export interface MemoriamFormData {
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
    medium: Medium | null;
}

interface MemoriamOrderFormEditProps {
    orderId: string;
}

const MemoriamOrderFormEdit: React.FC<MemoriamOrderFormEditProps> = ({
    orderId,
}) => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [token, setToken] = useState<string | null>(null);
    const [isOrderComplete, setIsOrderComplete] = useState<boolean>(false);

    const supabase = createClient();

    const initialFormState: MemoriamFormData = {
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
        medium: null,
    };

    const totalSteps = 3;
    const [step, setStep] = useState(1);

    const [formData, setFormData] =
        useState<MemoriamFormData>(initialFormState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch order data from Supabase
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const { data, error } = await supabase
                    .from("memoriam_orders")
                    .select("*")
                    .eq("id", orderId)
                    .single();

                if (error) throw error;

                if (data) {
                    setFormData({
                        firstName: data.first_name || "",
                        lastName: data.last_name || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        streetAddress: data.street_address || "",
                        streetAddress2: data.street_address2 || "",
                        city: data.city || "",
                        state: data.state || "",
                        postalCode: data.postal_code || "",
                        asIs: data.as_is || false,
                        altered: data.altered || false,
                        alterationNotes: data.alteration_notes || "",
                        inspirationNotes: data.inspiration_notes || "",
                        medium: (data.medium as Medium) || null,
                    });
                    setIsOrderComplete(data.is_complete); // TODO: remove hardcoded status. need to add `status` to the order tables in Supabase
                }
            } catch (error) {
                setError("Failed to fetch order data");
                console.error("Error fetching order data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [orderId]);

    // Helper function to update form data
    const updateFormData = <K extends keyof MemoriamFormData>(
        key: K,
        value: MemoriamFormData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const setMedium = (medium: Medium) => {
        setFormData((prev) => ({ ...prev, medium }));
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
            if (!formData.medium) {
                alert("Please select a medium.");
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
        return true;
    };

    if (loading) return <div>Loading...</div>;
    if (error)
        return (
            <SomethingWentWrong message="It looks like we can't find the details of that Order ID." />
        );

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

    const toggleCheckbox = (key: keyof MemoriamFormData) => {
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

    const submitForm = async () => {
        // Handle Google reCAPTCHA v3
        if (!executeRecaptcha) {
            console.log("Execute recaptcha not yet available");
            return;
        }

        const token = await executeRecaptcha("submitLivingOrderForm");
        setToken(token);

        const recaptchaResponse = await fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        });

        const recaptchaResult = await recaptchaResponse.json();

        const tattooEnv = process.env.NEXT_PUBLIC_TATTOO_ENV;
        if (!recaptchaResult.success) {
            setErrorMessage(
                "Failed to verify reCAPTCHA. Please reload the page and try again."
            );
            console.error("Recaptcha Error: ", recaptchaResult.error);
            if (tattooEnv === "production") {
                return; // Exit early on error
            }
        }

        // Handle Form Submission
        try {
            setIsModalOpen(true);

            // Handle form submission logic here
            // This should update the existing order in Supabase instead of creating a new one
            try {
                const { data, error } = await supabase
                    .from("memoriam_orders")
                    .update({
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        phone: formData.phone,
                        street_address: formData.streetAddress,
                        street_address2: formData.streetAddress2,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.postalCode,
                        as_is: formData.asIs,
                        altered: formData.altered,
                        alteration_notes: formData.alterationNotes,
                        inspiration_notes: formData.inspirationNotes,
                        medium: formData.medium,
                        is_complete: true,
                    })
                    .eq("id", orderId);

                if (error) throw error;

                // Handle successful update (e.g., show a success message, redirect, etc.)
            } catch (error) {
                setErrorMessage(
                    "Error updating order. Please reload the page and try again."
                );

                console.error("Error updating order:", error);
                // Handle error (e.g., show error message to user)
            }

            if (tattooEnv === "production") {
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
        
        <p style="background-color: #edf2f7; padding: 10px; border-radius: 5px; font-weight: bold;">Order ID: ${orderId}</p>
    
        <h2 style="color: #2c5282; margin-top: 20px;">Personal Information</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone}</p>
    
        <h2 style="color: #2c5282; margin-top: 20px;">Mailing Address</h2>
        <p>${formData.streetAddress}<br>
        ${formData.streetAddress2 ? formData.streetAddress2 + "<br>" : ""}
        ${formData.city}, ${formData.state} ${formData.postalCode}</p>
    
        <h2 style="color: #2c5282; margin-top: 20px;">Order Details</h2>
        <p><strong>Medium:</strong> ${formData.medium || "None selected"}</p>
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
    ${orderId}
    
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
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
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
            }
        } catch (error) {
            setErrorMessage(
                "Error submitting form. Please reload the page and try again."
            );
            console.error("Error submitting form:", error);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setIsOrderComplete(true);
    };

    // Render order details if the form has been completed
    if (isOrderComplete) {
        return <OrderDetails formData={formData} orderId={orderId} />;
    }

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
                        name="street_address2"
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
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        Choose Your Medium
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.values(MEDIUMS).map((medium) => (
                            <div
                                key={medium}
                                className={`
            relative p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300
            border-2
            ${
                formData.medium === medium
                    ? "bg-navy-500 text-white"
                    : "bg-tan-500 text-black border-gray-400 hover:bg-tan-600 hover:border-gray-600"
            }
          `}
                                onClick={() => setMedium(medium)}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* You can add icons here if you have them */}
                                    {/* <IconComponent medium={medium} className="w-12 h-12 mb-2" /> */}
                                    <span className="text-center font-medium">
                                        {medium}
                                    </span>
                                </div>
                                {formData.medium === medium && (
                                    <span className="absolute top-2 right-2 text-xl">
                                        ✓
                                    </span>
                                )}
                            </div>
                        ))}
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
            <LivingFormConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                formData={formData}
                orderId={orderId}
            />
            {errorMessage && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{errorMessage}</span>
                </div>
            )}
        </div>
    );
};

export default MemoriamOrderFormEdit;
