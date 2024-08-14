"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DragDrop from "../DragDrop";

interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    checkedMediumOptions: string[];
    replicationSelection?: string;
    isAlteredSelected: boolean;
    alterationDetails: string;
    alterationExamples: string;
}

const NewOrderForm: React.FC = () => {
    const supabase = createClient();

    const [step, setStep] = useState(1);
    const [orderId, setOrderId] = useState(
        Math.floor(Math.random() * (10000 - 1 + 1)) + 1
    );
    const bucket = "order-images";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        checkedMediumOptions: [],
        replicationSelection: undefined,
        isAlteredSelected: false,
        alterationDetails: "",
        alterationExamples: "",
    });

    // Helper function to update form data
    const updateFormData = <K extends keyof FormData>(
        key: K,
        value: FormData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const validateCurrentStep = () => {
        const currentDiv = document.querySelector(`div[data-step="${step}"]`);
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

    const handleMediumsCheckboxChange = (option: string) => {
        updateFormData(
            "checkedMediumOptions",
            formData.checkedMediumOptions.includes(option)
                ? formData.checkedMediumOptions.filter(
                      (item) => item !== option
                  )
                : [...formData.checkedMediumOptions, option]
        );
    };

    const isMediumChecked = (option: string) =>
        formData.checkedMediumOptions.includes(option);

    const handleReplicationSelection = (option: string) => {
        updateFormData("replicationSelection", option);
        updateFormData("isAlteredSelected", option === "altered");
    };

    const isReplicationChecked = (option: string) =>
        formData.replicationSelection === option;

    const uploadFiles = async () => {
        console.log("formData on Submit: ", formData);

        if (files.length === 0) {
            alert("Please select at least one file.");
            return;
        }

        setUploading(true);

        for (const file of files) {
            try {
                const { error } = await supabase.storage
                    .from(bucket)
                    .upload(`${orderId}/${file.name}`, file);

                if (error) {
                    alert(`Error uploading file ${file.name}.`);
                } else {
                    alert(`File ${file.name} uploaded successfully!`);
                }
            } catch (error) {
                alert(
                    `An unexpected error occurred while uploading ${file.name}.`
                );
            }
        }

        setUploading(false);
    };

    return (
        <div
            className="flex flex-col w-full gap-4 text-foreground"
            data-step={step}
        >
            {step === 1 && (
                <div className="flex flex-col">
                    <label className="text-md mb-2" htmlFor="name">
                        Name
                    </label>
                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border mb-2 sm:mb-0"
                            name="first_name"
                            placeholder="First Name"
                            required
                            autoComplete="off"
                            data-lpignore="true"
                            value={formData.firstName}
                            onChange={(e) =>
                                updateFormData("firstName", e.target.value)
                            }
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border"
                            name="last_name"
                            placeholder="Last Name"
                            required
                            autoComplete="off"
                            data-lpignore="true"
                            value={formData.lastName}
                            onChange={(e) =>
                                updateFormData("lastName", e.target.value)
                            }
                        />
                    </div>
                    <label className="text-md mb-2 mt-4" htmlFor="phone">
                        Phone
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border"
                        type="phone"
                        name="phone"
                        placeholder="### ### ####"
                        required
                        autoComplete="off"
                        data-lpignore="true"
                        value={formData.phone}
                        onChange={(e) =>
                            updateFormData("phone", e.target.value)
                        }
                    />
                    <label className="text-md mb-2 mt-4" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border"
                        type="email"
                        name="email"
                        placeholder=""
                        required
                        autoComplete="off"
                        data-lpignore="true"
                        value={formData.email}
                        onChange={(e) =>
                            updateFormData("email", e.target.value)
                        }
                    />
                    <label className="text-md mb-2 mt-4" htmlFor="address">
                        Mailing Address
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mt-2"
                        name="street_address"
                        placeholder="Street Address"
                        required
                        value={formData.streetAddress}
                        onChange={(e) =>
                            updateFormData("streetAddress", e.target.value)
                        }
                    />
                    <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4">
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border mb-2 sm:mb-0 sm:w-1/2"
                            name="city"
                            placeholder="City"
                            required
                            value={formData.city}
                            onChange={(e) =>
                                updateFormData("city", e.target.value)
                            }
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border mb-2 sm:mb-0 sm:w-1/4"
                            name="state"
                            placeholder="State"
                            required
                            value={formData.state}
                            onChange={(e) =>
                                updateFormData("state", e.target.value)
                            }
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border sm:w-1/4"
                            name="postal_code"
                            placeholder="Postal Code"
                            required
                            value={formData.postalCode}
                            onChange={(e) =>
                                updateFormData("postalCode", e.target.value)
                            }
                        />
                    </div>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mt-4"
                        name="country"
                        placeholder="Country"
                        required
                        value={formData.country}
                        onChange={(e) =>
                            updateFormData("country", e.target.value)
                        }
                    />
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isMediumChecked("syntheticSkin")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() =>
                            handleMediumsCheckboxChange("syntheticSkin")
                        }
                    >
                        <span>Synthetic Skin</span>
                        {isMediumChecked("syntheticSkin") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isMediumChecked("ink")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("ink")}
                    >
                        <span>Ink</span>
                        {isMediumChecked("ink") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isMediumChecked("pencil")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("pencil")}
                    >
                        <span>Pencil</span>
                        {isMediumChecked("pencil") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isMediumChecked("pastel")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("pastel")}
                    >
                        <span>Pastel</span>
                        {isMediumChecked("pastel") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    {/* Repeat for the rest of the options... */}

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isMediumChecked("watercolor")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() =>
                            handleMediumsCheckboxChange("watercolor")
                        }
                    >
                        <span>Watercolor</span>
                        {isMediumChecked("watercolor") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isMediumChecked("oilPaint")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("oilPaint")}
                    >
                        <span>Oil Paint</span>
                        {isMediumChecked("oilPaint") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    {/* Add more as needed */}
                </div>
            )}

            {step === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        className={`relative flex flex-col justify-between border border-gray-300 rounded-md p-4 h-32 cursor-pointer transition ${
                            isReplicationChecked("asIs")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleReplicationSelection("asIs")}
                    >
                        <div>
                            <span className="font-bold text-lg">As Is</span>
                            <p className="text-sm mt-2">
                                The artwork created will be the same size and
                                color as the original with no augmentation.
                            </p>
                        </div>
                        {isReplicationChecked("asIs") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex flex-col justify-between border border-gray-300 rounded-md p-4 h-32 cursor-pointer transition ${
                            isReplicationChecked("altered")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleReplicationSelection("altered")}
                    >
                        <div>
                            <span className="font-bold text-lg">Altered</span>
                            <p className="text-sm mt-2">
                                The artwork created can be altered in size,
                                color, and with any additional augmentations
                                specified below.
                            </p>
                        </div>
                        {isReplicationChecked("altered") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    {formData.isAlteredSelected && (
                        <div className="col-span-1 sm:col-span-2 mt-6 p-4 border border-gray-300 rounded-md bg-gray-900 text-white">
                            <h2 className="text-lg font-semibold mb-4 text-white">
                                Please describe the augmentations below. Be sure
                                to include the dimensions in inches for size
                                alterations.
                            </h2>

                            <h3 className="text-md font-medium mb-2 text-white">
                                What would you like to change?
                            </h3>
                            <textarea
                                className="rounded-md px-4 py-3 bg-gray-800 w-full border border-gray-600 mb-4 sm:mb-6 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                                placeholder="Describe the changes you would like..."
                                value={formData.alterationDetails}
                                onChange={(e) =>
                                    updateFormData(
                                        "alterationDetails",
                                        e.target.value
                                    )
                                }
                            />

                            <h2 className="text-lg font-semibold mb-4 text-white">
                                Do you have any examples or inspiration you can
                                share with us that will help us better
                                understand the direction you wish us to take for
                                your artistic representation?
                            </h2>

                            <h3 className="text-md font-medium mb-2 text-white">
                                Pinterest, YouTube, URL, etc.
                            </h3>
                            <textarea
                                className="rounded-md px-4 py-3 bg-gray-800 w-full border border-gray-600 mb-4 sm:mb-6 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                                placeholder="Provide links or descriptions..."
                                value={formData.alterationExamples}
                                onChange={(e) =>
                                    updateFormData(
                                        "alterationExamples",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    )}
                </div>
            )}

            {step === 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DragDrop
                        files={files}
                        setFiles={setFiles}
                        uploading={uploading}
                    />
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
                        className="bg-blue-600 rounded-md px-4 py-2 text-foreground text-white"
                        onClick={handleNext}
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        type="button"
                        className="bg-green-600 rounded-md px-4 py-2 text-foreground text-white"
                        onClick={uploadFiles}
                    >
                        Submit
                    </button>
                )}
            </div>
        </div>
    );
};

export default NewOrderForm;
