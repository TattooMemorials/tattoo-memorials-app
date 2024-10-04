import { useState } from "react";
import { BaseKey } from "@refinedev/core";

interface EmailHistoryItem {
    sent_at: string;
    email_type: string;
}

interface EmailType {
    key: string;
    label: string;
}

interface OrderRecord {
    id: BaseKey;
    email?: string;
    total_price?: number;
    // Add other necessary fields
}

interface EmailData {
    email: string;
    subject: string;
    message: string;
    orderId: BaseKey;
    orderType: "living" | "memoriam";
    emailType: string;
}

export const useOrderEmail = (orderType: "living" | "memoriam") => {
    const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
    const [isEmailHistoryModalVisible, setIsEmailHistoryModalVisible] =
        useState(false);
    const [selectedEmailType, setSelectedEmailType] = useState<string>("");

    const emailTypes: EmailType[] =
        orderType === "living"
            ? [{ key: "SEND_INVOICE", label: "Invoice and Payment Link" }]
            : [
                  {
                      key: "MEMORIAM_COMPLETION_REQUEST",
                      label: "Completion Request",
                  },
                  { key: "SEND_INVOICE", label: "Invoice and Payment Link" },
              ];

    const getEmailTypeLabel = (key: string): string => {
        return emailTypes.find((type) => type.key === key)?.label || key;
    };

    const fetchEmailHistory = async (
        orderId: BaseKey
    ): Promise<EmailHistoryItem[]> => {
        try {
            const response = await fetch(
                `/api/email-history?orderId=${orderId}&orderType=${orderType}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch email history");
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching email history:", error);
            throw error;
        }
    };

    const sendEmail = async (emailData: EmailData): Promise<void> => {
        const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            throw new Error("Failed to send email");
        }
    };

    const handleSendEmail = async (record: OrderRecord) => {
        try {
            const history = await fetchEmailHistory(record.id);
            setEmailHistory(history);
            setIsEmailHistoryModalVisible(true);
        } catch (error) {
            console.error("Error in handleSendEmail:", error);
            alert("Failed to fetch email history. Please try again.");
        }
    };

    const handleConfirmSendEmail = async (
        record: OrderRecord,
        createInvoice: (record: OrderRecord) => Promise<any>,
        getOrderUrl: (orderId: BaseKey) => string
    ) => {
        const hasSentBefore = emailHistory.some(
            (email) => email.email_type === selectedEmailType
        );

        if (hasSentBefore) {
            const confirmSend = window.confirm(
                "This email type has been sent before. Are you sure you want to send it again?"
            );
            if (!confirmSend) {
                return;
            }
        }

        try {
            const orderUrl = getOrderUrl(record.id);
            let emailSubject = "";
            let emailMessage = "";

            switch (selectedEmailType) {
                case "MEMORIAM_COMPLETION_REQUEST":
                    emailSubject = "Complete Your Memoriam Order";
                    emailMessage = `
                        <p>Hello,</p>
                        <p>A new memoriam order has been created. You can view and edit the order details by clicking the link below:</p>
                        <p><a href="${orderUrl}">Click here to complete your order</a></p>
                        <p>Thank you,</p>
                        <p>Tattoo Memorials Team</p>
                    `;
                    break;
                case "SEND_INVOICE":
                    if (!record.total_price || record.total_price === 0) {
                        alert("You must enter a price for the order.");
                        return;
                    }

                    const invoiceResult = await createInvoice(record);

                    if (!invoiceResult.success) {
                        alert(
                            `Failed to create invoice: ${invoiceResult.error}`
                        );
                        return;
                    }

                    emailSubject = `Invoice for Your Tattoo ${
                        orderType === "memoriam" ? "Memorial" : ""
                    } Order`;
                    emailMessage = `
                        <p>Hello,</p>
                        <p>Thank you for your tattoo ${
                            orderType === "memoriam" ? "memorial" : ""
                        } order.</p>
                        <p>To proceed with your order, please pay using the link below:</p>
                        <p><a href="${
                            invoiceResult.invoiceUrl
                        }">View Invoice & Pay</a></p>
                        <p>You can view your original order details here: <a href="${orderUrl}">View Order</a></p>
                        <p>Thank you,</p>
                        <p>Tattoo Memorials Team</p>
                    `;
                    break;
            }

            await sendEmail({
                email: record.email || "",
                subject: emailSubject,
                message: emailMessage,
                orderId: record.id,
                orderType,
                emailType: selectedEmailType,
            });

            alert(`Email sent successfully to ${record.email}`);
            setIsEmailHistoryModalVisible(false);

            // Refresh email history
            const updatedHistory = await fetchEmailHistory(record.id);
            setEmailHistory(updatedHistory);
        } catch (error) {
            console.error("Failed to send email:", error);
            alert("Failed to send email. Please try again.");
        }
    };

    return {
        emailHistory,
        isEmailHistoryModalVisible,
        selectedEmailType,
        emailTypes,
        setIsEmailHistoryModalVisible,
        setSelectedEmailType,
        getEmailTypeLabel,
        handleSendEmail,
        handleConfirmSendEmail,
    };
};
