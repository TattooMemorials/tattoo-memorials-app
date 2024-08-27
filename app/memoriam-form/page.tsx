"use client";
import FormUpload from "./FormUpload";

const MemoriamDocumentUpload: React.FC = () => {
    return (
        <div className="flex flex-col w-full gap-6 text-foreground bg-navy-900 text-gold-300 p-8 rounded-lg shadow-lg">
            <FormUpload />
            {/* <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                formData={null}
                orderId={orderId}
                fileUploadStatus={fileUploadStatus}
            /> */}
        </div>
    );
};

export default MemoriamDocumentUpload;
