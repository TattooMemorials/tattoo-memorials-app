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
    const imagesBucket = "order-images";
    const formsBucket = "order-forms";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // const [formData, setFormData] = useState<LivingFormData>(initialFormState);
    const [fileUploadStatus, setFileUploadStatus] = useState<
        FileUploadStatus[]
    >([]);

    const [intakeForm, setIntakeForm] = useState<File>();
    const [consentForm, setConsentForm] = useState<File>();
    const [images, setImages] = useState<File[]>([]);

    // const handleFileChange =
    //     (setter: React.Dispatch<React.SetStateAction<File>>) =>
    //     (event: ChangeEvent<HTMLInputElement>) => {
    //         const file = event.target.files?.[0] || null;
    //         setter({ file, name: file?.name || "" });
    //     };

    const handleImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setImages(files);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

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

        // TODO: figure out chicken and egg probelm with uploading files to orderId and uploading an empty order record first.
        // May need to make all fields nullable, create an empty memoriam-orders row, grab the orderid, upload the files, and then update
        // the form path columns on that row. If the uploads fail, just delete the emptry orderId record in the catch block?
        // something like that.

        // 1. Create empty memoriam_orders record
        // 1. Create empty memoriam_orders record
        let result;
        try {
            const response = await fetch("/api/memoriam-form", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    test: "formData",
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
            intakeFilePath = `${result.orderId}/${intakeForm?.name}`;
            const { error } = await supabase.storage
                .from(formsBucket)
                .upload(intakeFilePath, intakeForm!);

            if (error) {
                console.error("Error uploading intake form: ", error);

                // Rollback by deleting the created memoriam_orders record
                await fetch("/api/memoriam-form", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: result.orderId,
                    }),
                });
                return; // Exit early on error
            }

            // Update record with intake form path via API call
            await fetch("/api/memoriam-form", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: result.orderId,
                    intake_form_path: intakeFilePath,
                }),
            });
        } catch (error) {
            console.error(
                "Error uploading or updating intake form path:",
                error
            );

            // Rollback by deleting the created memoriam_orders record
            await fetch("/api/memoriam-form", {
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
            consentFilePath = `${result.orderId}/${consentForm?.name}`;
            const { error } = await supabase.storage
                .from(formsBucket)
                .upload(consentFilePath, consentForm!);

            if (error) {
                console.error("Error uploading consent form: ", error);

                // Rollback by deleting the created memoriam_orders record
                await fetch("/api/memoriam-form", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: result.orderId,
                    }),
                });
                return; // Exit early on error
            }

            // Update record with consent form path via API call
            await fetch("/api/memoriam-form", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: result.orderId,
                    consent_form_path: consentFilePath,
                }),
            });
        } catch (error) {
            console.error(
                "Error uploading or updating consent form path:",
                error
            );

            // Rollback by deleting the created memoriam_orders record
            await fetch("/api/memoriam-form", {
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
            setIsModalOpen(true);

            // Initialize file upload status
            setFileUploadStatus(
                images.map((file) => ({ name: file.name, status: "pending" }))
            );

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const { error } = await supabase.storage
                    .from(imagesBucket)
                    .upload(`${result.orderId}/${image.name}`, image);

                if (error) {
                    setFileUploadStatus((prev) =>
                        prev.map((item, index) =>
                            index === i ? { ...item, status: "error" } : item
                        )
                    );
                    throw new Error(`Error uploading image: ${image.name}`);
                } else {
                    setFileUploadStatus((prev) =>
                        prev.map((item, index) =>
                            index === i ? { ...item, status: "success" } : item
                        )
                    );
                }
            }
        } catch (error) {
            console.error("Error uploading images:", error);

            // Rollback by deleting the created memoriam_orders record
            await fetch("/api/memoriam-form", {
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
                    onChange={(event) => {
                        if (event.target && event.target.files) {
                            setIntakeForm(event.target.files[0]);
                        }
                    }}
                    className="hidden"
                />
                <span className="ml-4">
                    {intakeForm?.name || "(list file here)"}
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
                    onChange={(event) => {
                        if (event.target && event.target.files) {
                            setConsentForm(event.target.files[0]);
                        }
                    }}
                    className="hidden"
                />
                <span className="ml-4">
                    {consentForm?.name || "(list file here)"}
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
