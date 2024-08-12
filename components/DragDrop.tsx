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
    const [files, setFiles] = useState<File[]>([]); // Ensure files is always an array
    const [uploading, setUploading] = useState(false);

    const handleChange = (selectedFiles: FileList) => {
        // Convert FileList to an array and update state
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
        <div>
            <FileUploader
                handleChange={(fileList: FileList) => handleChange(fileList)}
                name="files"
                types={fileTypes}
                multiple={true} // Enable multiple file selection
            />
            <div>
                {files.map((file) => (
                    <p key={file.name}>{file.name}</p>
                ))}
            </div>
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
};

export default DragDrop;
