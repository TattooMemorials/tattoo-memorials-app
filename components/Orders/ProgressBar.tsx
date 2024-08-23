// ProgressBar.tsx
import React from "react";

interface ProgressBarProps {
    step: number;
    totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ step, totalSteps }) => {
    return (
        <div className="flex justify-between mb-6">
            {Array.from({ length: totalSteps }, (_, index) => (
                <div
                    key={index}
                    className={`flex-1 h-2 rounded-full mx-1 ${
                        index < step ? "bg-navy-500" : "bg-tan-500 border"
                    }`}
                ></div>
            ))}
        </div>
    );
};

export default ProgressBar;
