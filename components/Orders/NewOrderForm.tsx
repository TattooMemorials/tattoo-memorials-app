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

    const isChecked = (option: string) => checkedMediumOptions.includes(option);

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
                            isChecked("syntheticSkin")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() =>
                            handleMediumsCheckboxChange("syntheticSkin")
                        }
                    >
                        <span>Synthetic Skin</span>
                        {isChecked("syntheticSkin") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isChecked("ink")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("ink")}
                    >
                        <span>Ink</span>
                        {isChecked("ink") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isChecked("pencil")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("pencil")}
                    >
                        <span>Pencil</span>
                        {isChecked("pencil") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isChecked("pastel")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("pastel")}
                    >
                        <span>Pastel</span>
                        {isChecked("pastel") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    {/* Repeat for the rest of the options... */}

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isChecked("watercolor")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() =>
                            handleMediumsCheckboxChange("watercolor")
                        }
                    >
                        <span>Watercolor</span>
                        {isChecked("watercolor") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    <div
                        className={`relative flex items-center justify-center border border-gray-300 rounded-md h-24 cursor-pointer transition ${
                            isChecked("oilPaint")
                                ? "bg-blue-500 text-white"
                                : "bg-white text-black"
                        }`}
                        onClick={() => handleMediumsCheckboxChange("oilPaint")}
                    >
                        <span>Oil Paint</span>
                        {isChecked("oilPaint") && (
                            <span className="absolute top-2 right-2 text-xl">
                                ✓
                            </span>
                        )}
                    </div>

                    {/* Add more as needed */}
                </div>

                // <div className="flex flex-col">
                //     <label className="text-md mb-2">
                //         What mediums are you interested in?
                //     </label>
                //     <div className="flex flex-col">
                //         <label className="inline-flex items-center">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="syntheticSkin"
                //                 checked={checkedMediumOptions.includes(
                //                     "syntheticSkin"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("syntheticSkin")
                //                 }
                //             />
                //             <span className="ml-2">Synthetic Skin</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="ink"
                //                 checked={checkedMediumOptions.includes("ink")}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("ink")
                //                 }
                //             />
                //             <span className="ml-2">Ink</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="pencil"
                //                 checked={checkedMediumOptions.includes(
                //                     "pencil"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("pencil")
                //                 }
                //             />
                //             <span className="ml-2">Pencil</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="pastel"
                //                 checked={checkedMediumOptions.includes(
                //                     "pastel"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("pastel")
                //                 }
                //             />
                //             <span className="ml-2">Pastel</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="watercolor"
                //                 checked={checkedMediumOptions.includes(
                //                     "watercolor"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("watercolor")
                //                 }
                //             />
                //             <span className="ml-2">Watercolor</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="oilPaint"
                //                 checked={checkedMediumOptions.includes(
                //                     "oilPaint"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("oilPaint")
                //                 }
                //             />
                //             <span className="ml-2">Oil Paint</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="acrylic"
                //                 checked={checkedMediumOptions.includes(
                //                     "acrylic"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("acrylic")
                //                 }
                //             />
                //             <span className="ml-2">Acrylic</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="charcoal"
                //                 checked={checkedMediumOptions.includes(
                //                     "charcoal"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("charcoal")
                //                 }
                //             />
                //             <span className="ml-2">Charcoal</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="digital"
                //                 checked={checkedMediumOptions.includes(
                //                     "digital"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange("digital")
                //                 }
                //             />
                //             <span className="ml-2">Digital</span>
                //         </label>
                //         <label className="inline-flex items-center mt-2">
                //             <input
                //                 type="checkbox"
                //                 className="form-checkbox"
                //                 name="digitalTattooStencil"
                //                 checked={checkedMediumOptions.includes(
                //                     "digitalTattooStencil"
                //                 )}
                //                 onChange={() =>
                //                     handleMediumsCheckboxChange(
                //                         "digitalTattooStencil"
                //                     )
                //                 }
                //             />
                //             <span className="ml-2">Digital Tattoo Stencil</span>
                //         </label>
                //     </div>
                // </div>
            )}

            {step === 3 && (
                <div className="flex flex-col">
                    <label className="text-md mb-2">
                        Would you like the tattoo artwork replicated "as is" or
                        altered?
                    </label>
                    <div className="flex flex-col"></div>
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
