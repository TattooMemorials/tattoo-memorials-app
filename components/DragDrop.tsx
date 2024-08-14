import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

interface DragDropProps {
    files: File[];
    setFiles: (files: File[]) => void;
    uploading: boolean;
}

const DragDrop: React.FC<DragDropProps> = ({ files, setFiles, uploading }) => {
    const handleChange = (selectedFiles: FileList) => {
        const fileArray = Array.from(selectedFiles);
        setFiles(fileArray);
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
        </div>
    );
};

export default DragDrop;
