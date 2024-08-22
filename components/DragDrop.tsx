import React, { useEffect, useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes: string[] = [
    "jpg",
    "jpeg",
    "jpe",
    "jfif",
    "jif",
    "png",
    "gif",
    "webp",
    "bmp",
    "tif",
    "tiff",
    "svg",
    "ico",
    "heif",
    "heic",
];

interface DragDropProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    uploading: boolean;
}

const DragDrop: React.FC<DragDropProps> = ({ files, setFiles, uploading }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const maxFileSizeInMb = 50;

    useEffect(() => {
        if (errorMessage) {
            const timeoutId = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);

            return () => clearTimeout(timeoutId); // Cleanup on unmount or if errorMessage changes
        }
    }, [errorMessage]);

    const handleChange = (selectedFiles: FileList | File[]) => {
        const newFiles = Array.isArray(selectedFiles)
            ? selectedFiles
            : Array.from(selectedFiles);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setFiles((prevFiles) =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleTypeError = (error: string) => {
        setErrorMessage(
            `File type not supported. Please upload one of the following types: ${fileTypes.join(
                ", "
            )}.`
        );
    };

    const handleSizeError = (error: string) => {
        setErrorMessage(
            `File is too large. Please select files smaller than ${maxFileSizeInMb}MB.`
        );
    };

    return (
        <div className="w-full">
            <div className="p-8 border-2 border-dashed rounded-lg text-center bg-tan-500 hover:border-navy-500 transition-all duration-300 cursor-pointer">
                <FileUploader
                    handleChange={handleChange}
                    name="files"
                    types={fileTypes}
                    maxSize={maxFileSizeInMb}
                    multiple={true}
                    onTypeError={handleTypeError}
                    onSizeError={handleSizeError}
                >
                    <div className="flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-navy-500 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="text-navy-500 text-lg">
                            Drag 'n' drop some files here, or click to select
                            files
                        </p>
                        <p className="text-navy-500 text-sm mt-2">
                            Accepted file types: {fileTypes.join(", ")}
                        </p>
                    </div>
                </FileUploader>
            </div>
            {errorMessage && (
                <div className="mt-4 p-4 border border-red-600 rounded-lg bg-tan-500">
                    <p className="text-black">{errorMessage}</p>
                </div>
            )}
            {files.length > 0 && (
                <div className="mt-4 p-4 border border-navy-500 rounded-lg bg-tan-500">
                    <h4 className="text-black font-semibold mb-2">
                        Files to Upload:
                    </h4>
                    <ul className="max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center text-black text-sm py-2 border-b border-navy-500/30 last:border-b-0"
                            >
                                <span>{file.name}</span>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                    disabled={uploading}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DragDrop;
