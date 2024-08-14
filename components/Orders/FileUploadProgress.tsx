export interface FileUploadStatus {
    name: string;
    status: "pending" | "success" | "error";
}

const FileUploadProgress: React.FC<{
    fileUploadStatus: FileUploadStatus[];
}> = ({ fileUploadStatus }) => (
    <div className="mt-4">
        <h3 className="font-semibold mb-2">File Upload Progress:</h3>
        <ul>
            {fileUploadStatus.map((file, index) => (
                <li key={index} className="flex items-center mb-1">
                    <span
                        className={`mr-2 ${
                            file.status === "success"
                                ? "text-green-500"
                                : file.status === "error"
                                ? "text-red-500"
                                : "text-yellow-500"
                        }`}
                    >
                        {file.status === "success"
                            ? "✓"
                            : file.status === "error"
                            ? "✗"
                            : "⋯"}
                    </span>
                    <span>{file.name}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default FileUploadProgress;
