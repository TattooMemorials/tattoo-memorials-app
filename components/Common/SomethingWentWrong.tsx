import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Oops! Something went wrong
            </h2>
            <p className="text-xl text-gray-600 mb-6">{message}</p>
            <div className="bg-gray-100 rounded-lg p-6">
                <p className="text-gray-600 mb-4">
                    If you believe this is an error, please contact our support
                    team at:
                </p>
                <a
                    href="mailto:support@tattoomemorials.com"
                    className="text-blue-500 hover:underline font-semibold"
                >
                    support@tattoomemorials.com
                </a>
            </div>
        </div>
    );
};

export default ErrorMessage;
