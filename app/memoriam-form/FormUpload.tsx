import React, { useState, ChangeEvent } from "react";

interface FileState {
    file: File | null;
    name: string;
}

const FormUpload: React.FC = () => {
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Handle form submission
        console.log("Submitting:", { intakeForm, consentForm, images });
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
