"use client";

import { useState } from "react";
import { SubmitButton } from "@/app/login/submit-button";

interface OrderFormProps {
    onSubmit: (formData: FormData) => Promise<void>;
}

const NewOrderForm: React.FC<OrderFormProps> = ({ onSubmit }) => {
    const [step, setStep] = useState(1);

    // ------ State variables for each input field --------

    // Form Section One
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [streetAddress, setStreetAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [country, setCountry] = useState("");

    // Form Section Two
    const [checkedMediumOptions, setCheckedMediumOptions] = useState<string[]>(
        []
    );

    // Form Section Three
    const [replicationSelection, setReplicationSelection] = useState<string>();

    // -----------------------------------------------------

    const validateCurrentStep = () => {
        const currentForm = document.querySelector(
            `form[data-step="${step}"]`
        ) as HTMLFormElement;
        if (currentForm) {
            return currentForm.checkValidity();
        }
        return false;
    };

    const handleNext = () => {
        setStep(step + 1);
        // TODO: uncomment
        // if (validateCurrentStep()) {
        //     setStep(step + 1);
        // } else {
        //     const currentForm = document.querySelector(
        //         `form[data-step="${step}"]`
        //     ) as HTMLFormElement;
        //     currentForm.reportValidity();
        // }
    };

    const handlePrevious = () => {
        setStep(step - 1);
    };

    const handleMediumsCheckboxChange = (option: string) => {
        setCheckedMediumOptions((prev) =>
            prev.includes(option)
                ? prev.filter((item) => item !== option)
                : [...prev, option]
        );
    };

    const isMediumChecked = (option: string) =>
        checkedMediumOptions.includes(option);

    const handleReplicationSelection = (option: string) => {
        setReplicationSelection(option);
    };

    const isReplicationChecked = (option: string) =>
        replicationSelection && replicationSelection.includes(option);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        onSubmit(formData);
    };

    return (
        <form
            className="flex flex-col w-full gap-4 text-foreground"
            onSubmit={handleSubmit}
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
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border"
                            name="last_name"
                            placeholder="Last Name"
                            required
                            autoComplete="off"
                            data-lpignore="true"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label className="text-md mb-2 mt-4" htmlFor="address">
                        Mailing Address
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mt-2"
                        name="street_address"
                        placeholder="Street Address"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                    />
                    <div className="flex flex-col sm:flex-row sm:space-x-4 mt-4">
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border mb-2 sm:mb-0 sm:w-1/2"
                            name="city"
                            placeholder="City"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border mb-2 sm:mb-0 sm:w-1/4"
                            name="state"
                            placeholder="State"
                            required
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                        <input
                            className="rounded-md px-4 py-2 bg-inherit border sm:w-1/4"
                            name="postal_code"
                            placeholder="Postal Code"
                            required
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mt-4"
                        name="country"
                        placeholder="Country"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
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
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isReplicationChecked("asIs")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleReplicationSelection("asIs")}
                    >
                        <span>As Is</span>
                        {isReplicationChecked("asIs") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>
                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isReplicationChecked("altered")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleReplicationSelection("altered")}
                    >
                        <span>Altered</span>
                        {isReplicationChecked("altered") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between mt-4">
                {step > 1 && (
                    <button
                        type="button"
                        className="bg-gray-600 rounded-md px-4 py-2 text-foreground"
                        onClick={handlePrevious}
                    >
                        Previous
                    </button>
                )}
                {step < 3 ? (
                    <button
                        type="button"
                        className="bg-blue-600 rounded-md px-4 py-2 text-foreground"
                        onClick={handleNext}
                    >
                        Next
                    </button>
                ) : (
                    <SubmitButton
                        formAction={onSubmit}
                        className="bg-green-700 rounded-md px-4 py-2 text-foreground"
                        pendingText="Submitting Request..."
                    >
                        Submit Request
                    </SubmitButton>
                )}
            </div>
        </form>
    );
};

export default NewOrderForm;
