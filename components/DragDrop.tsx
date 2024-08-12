import { createClient } from "@/utils/supabase/client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

interface DragDropProps {
    orderId: string;
}

const DragDrop = forwardRef(({ orderId }: DragDropProps, ref) => {
    const supabase = createClient();
    const bucket = "order-images";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<Record<string, string>>(
        {}
    );

    const handleChange = (selectedFiles: FileList) => {
        const fileArray = Array.from(selectedFiles);
        setFiles(fileArray);
        setUploadStatus({});
    };

    const uploadFile = async (file: File): Promise<void> => {
        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(`${orderId}/${file.name}`, file);

            if (error) {
                throw error;
            }

            setUploadStatus((prev) => ({ ...prev, [file.name]: "success" }));
            console.log("Upload successful:", data);
        } catch (error: any) {
            console.error("Error uploading file:", error);
            setUploadStatus((prev) => ({ ...prev, [file.name]: "error" }));
            throw error;
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            alert("Please select at least one file.");
            return;
        }

        setUploading(true);

        const uploadPromises = files.map((file) => uploadFile(file));

        try {
            await Promise.all(uploadPromises);
            alert("All files uploaded successfully!");
        } catch (error) {
            console.error("Error during upload:", error);
            alert(
                "Some files failed to upload. Please check the status and try again."
            );
        } finally {
            setUploading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        triggerUpload: handleUpload,
    }));

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg w-full max-w-md mx-auto">
            <div className="w-full mb-4">
                <FileUploader
                    handleChange={(fileList: FileList) =>
                        handleChange(fileList)
                    }
                    name="files"
                    types={fileTypes}
                    multiple={true}
                    classes="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center"
                />
            </div>
            <div className="w-full max-h-40 overflow-y-auto mb-4 p-3 border border-gray-300 rounded-lg bg-white">
                {files.map((file) => (
                    <p
                        key={file.name}
                        className={`text-sm ${
                            uploadStatus[file.name] === "success"
                                ? "text-green-600"
                                : uploadStatus[file.name] === "error"
                                ? "text-red-600"
                                : "text-gray-700"
                        } border-b border-gray-200 pb-2 last:border-none`}
                    >
                        {file.name}{" "}
                        {uploadStatus[file.name] &&
                            `(${uploadStatus[file.name]})`}
                    </p>
                ))}
            </div>
            {uploading && <p>Uploading...</p>}
        </div>
    );
});

export default DragDrop;
