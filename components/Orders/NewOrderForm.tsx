"use client";

import { useRef, useState } from "react";
import DragDrop from "../DragDrop";

const NewOrderForm: React.FC = () => {
    const dragDropRef = useRef<any>(null);

    const [step, setStep] = useState(1);
    const [orderId, setOrderId] = useState("dan");

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
    const [isAlteredSelected, setIsAlteredSelected] = useState<boolean>(false);
    const [alterationDetails, setAlterationDetails] = useState<string>("");
    const [alterationExamples, setAlterationExamples] = useState<string>("");

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
        setIsAlteredSelected(option === "altered");
    };

    const isReplicationChecked = (option: string) =>
        replicationSelection === option;

    const handleAlterationDetailsChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setAlterationDetails(e.target.value);
    };

    const handleAlterationExamplesChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        setAlterationExamples(e.target.value);
    };

    const handleSubmit = () => {
        // TODO: refactor this so we're not using a ref to trigger the upload
        // lets just handle the upload in this component.
        if (dragDropRef.current) {
            dragDropRef.current.triggerUpload(); // Trigger the upload in DragDrop component
        }
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

                    {isAlteredSelected && (
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
                                value={alterationDetails}
                                onChange={handleAlterationDetailsChange}
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
                                value={alterationExamples}
                                onChange={handleAlterationExamplesChange}
                            />
                        </div>
                    )}
                </div>
            )}

            {step === 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DragDrop ref={dragDropRef} orderId={orderId} />
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
                    // <SubmitButton
                    //     formAction={onSubmit}
                    //     className="bg-green-700 rounded-md px-4 py-2 text-foreground text-white"
                    //     pendingText="Submitting Request..."
                    // >
                    //     Submit Request
                    // </SubmitButton>
                    <button onClick={handleSubmit}>Submit</button>
                )}
            </div>
        </div>
    );
};

export default NewOrderForm;
