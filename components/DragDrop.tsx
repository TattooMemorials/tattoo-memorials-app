import React from "react";
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
        <div className="w-full">
            <FileUploader
                handleChange={(fileList: FileList) => handleChange(fileList)}
                name="files"
                types={fileTypes}
                multiple={true}
                classes="w-full p-8 border-2 border-none rounded-lg text-center bg-navy-950 hover:border-gold-400 transition-all duration-300"
            >
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gold-400 mb-4"
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
                    <p className="text-gold-300 text-lg">
                        Drag 'n' drop some files here, or click to select files
                    </p>
                    <p className="text-gold-400 text-sm mt-2">
                        Accepted file types: {fileTypes.join(", ")}
                    </p>
                </div>
            </FileUploader>
            {files.length > 0 && (
                <div className="mt-4 p-4 border border-gold-600 rounded-lg bg-navy-900">
                    <h4 className="text-gold-400 font-semibold mb-2">
                        Selected Files:
                    </h4>
                    <ul className="max-h-40 overflow-y-auto">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="text-gold-300 text-sm py-1 border-b border-gold-600/30 last:border-b-0"
                            >
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DragDrop;
