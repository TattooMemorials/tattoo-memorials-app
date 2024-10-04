import { useDelete, BaseKey } from "@refinedev/core";
import { message } from "antd";
import { createClient } from "@/utils/supabase/client";

type OrderType = "living_orders" | "memoriam_orders";

interface DeleteError {
    operation: string;
    error: any;
}

/**
 * Custom hook for deleting orders and associated data.
 *
 * This hook handles the deletion of living_orders or memoriam_orders,
 * including associated files in Supabase storage and related records
 * in other tables (invoices, order_emails).
 *
 * It uses a soft error handling approach, attempting all delete operations
 * and collecting errors rather than stopping at the first error encountered.
 * This allows for partial deletions in case of failures in some operations.
 *
 * Usage:
 * const { handleDelete } = useOrderDelete();
 * await handleDelete(orderId, "living_orders");
 *
 * @returns {Object} An object containing the handleDelete function.
 */
export const useOrderDelete = () => {
    const { mutate: deleteOne } = useDelete();
    const supabase = createClient();

    const deleteAssociatedFiles = async (
        orderId: BaseKey,
        bucketName: string
    ): Promise<DeleteError[]> => {
        const folderPath = `${orderId}`;
        const errors: DeleteError[] = [];

        try {
            const { data, error } = await supabase.storage
                .from(bucketName)
                .list(folderPath);

            if (error) {
                errors.push({ operation: "listing files", error });
                return errors;
            }

            if (data && data.length > 0) {
                const filesToDelete = data.map(
                    (file) => `${folderPath}/${file.name}`
                );
                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove(filesToDelete);

                if (deleteError) {
                    errors.push({
                        operation: "deleting files",
                        error: deleteError,
                    });
                }
            }

            const { error: deleteFolderError } = await supabase.storage
                .from(bucketName)
                .remove([folderPath]);

            if (deleteFolderError) {
                errors.push({
                    operation: "deleting folder",
                    error: deleteFolderError,
                });
            }
        } catch (error) {
            errors.push({ operation: "deleteAssociatedFiles", error });
        }

        return errors;
    };

    const handleDelete = async (id: BaseKey, orderType: OrderType) => {
        const errors: DeleteError[] = [];

        try {
            // Delete associated files
            if (orderType === "living_orders") {
                errors.push(
                    ...(await deleteAssociatedFiles(id, "order-images"))
                );
            } else if (orderType === "memoriam_orders") {
                errors.push(
                    ...(await deleteAssociatedFiles(id, "order-images"))
                );
                errors.push(
                    ...(await deleteAssociatedFiles(id, "order-forms"))
                );
            }

            // Delete the main order record
            try {
                deleteOne({
                    resource: orderType,
                    id,
                });
            } catch (error) {
                errors.push({ operation: "deleting main record", error });
            }

            // Delete associated records
            const { error: deleteInvoiceError } = await supabase
                .from("invoices")
                .delete()
                .eq("order_id", id);

            if (deleteInvoiceError) {
                errors.push({
                    operation: "deleting invoices",
                    error: deleteInvoiceError,
                });
            }

            const { error: deleteOrderEmailRecordsError } = await supabase
                .from("order_emails")
                .delete()
                .eq("order_id", id);

            if (deleteOrderEmailRecordsError) {
                errors.push({
                    operation: "deleting order emails",
                    error: deleteOrderEmailRecordsError,
                });
            }

            // Handle errors
            if (errors.length > 0) {
                console.error("Errors occurred during deletion:", errors);
                message.warning(
                    "Order deleted partially. Some associated data may remain."
                );
            } else {
                message.success(
                    "Order and all associated data deleted successfully"
                );
            }
        } catch (error) {
            console.error("Unexpected error during deletion:", error);
            message.error("An unexpected error occurred during deletion");
        }

        return errors;
    };

    return { handleDelete };
};
