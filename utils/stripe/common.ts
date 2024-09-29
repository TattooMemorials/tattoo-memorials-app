// Define a type for invoice status
export type InvoiceStatus =
    | "open"
    | "paid"
    | "unpaid"
    | "draft"
    | "void"
    | "uncollectible"
    | "No Invoice";

// Define a function to get badge color based on status
export const getBadgeColor = (status: InvoiceStatus): string => {
    switch (status) {
        case "open":
            return "blue";
        case "paid":
            return "green";
        case "unpaid":
            return "red";
        case "draft":
            return "blue";
        case "void":
            return "red";
        case "uncollectible":
            return "orange";
        default:
            return "gray";
    }
};
