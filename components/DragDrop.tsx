import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

interface DragDropProps {
    orderId: string;
}

const DragDrop: React.FC<DragDropProps> = ({ orderId }) => {
    const supabase = createClient();
    const bucket = "order-images";
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleChange = (selectedFiles: FileList) => {
        const fileArray = Array.from(selectedFiles);
        setFiles(fileArray);
    };

    const handleUpload = async () => {
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
                        className="text-sm text-gray-700 border-b border-gray-200 pb-2 last:border-none"
                    >
                        {file.name}
                    </p>
                ))}
            </div>
            <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full py-2 text-white rounded-lg ${
                    uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                }`}
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default DragDrop;
