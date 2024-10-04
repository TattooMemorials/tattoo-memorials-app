import { useDelete, BaseKey } from "@refinedev/core";
import { message } from "antd";
import { createClient } from "@/utils/supabase/client";

type OrderType = "living_orders" | "memoriam_orders";

export const useOrderDelete = () => {
    const { mutate: deleteOne } = useDelete();
    const supabase = createClient();

    const handleDelete = async (id: BaseKey, orderType: OrderType) => {
        try {
            // 1. Delete associated objects from Supabase storage (images and forms if applicable)
            if (orderType === "living_orders") {
                await deleteStorageObjects(id, "order-images");
            } else if (orderType === "memoriam_orders") {
                await deleteStorageObjects(id, "order-images");
                await deleteStorageObjects(id, "order-forms");
            }

            // 2. Delete the record from the *_orders table
            deleteOne({
                resource: orderType,
                id,
            });

            // 3. Delete the records from invoices table
            const { error: deleteInvoiceError } = await supabase
                .from("invoices")
                .delete()
                .eq("order_id", id);

            if (deleteInvoiceError) {
                console.error("Error deleting invoices:", deleteInvoiceError);
                throw deleteInvoiceError;
            }

            // 4. Delete the records from order_emails table
            const { error: deleteOrderEmailRecordsError } = await supabase
                .from("order_emails")
                .delete()
                .eq("order_id", id);

            if (deleteOrderEmailRecordsError) {
                console.error(
                    "Error deleting order emails:",
                    deleteOrderEmailRecordsError
                );
                throw deleteOrderEmailRecordsError;
            }

            message.success("Order and associated files deleted successfully");
        } catch (error) {
            console.error("Error deleting record and files:", error);
            message.error("Failed to delete record and associated files");
        }
    };

    const deleteStorageObjects = async (
        orderId: BaseKey,
        bucketName: string
    ) => {
        const folderPath = `${orderId}`;

        try {
            // 1. List all files in the folder
            const { data, error } = await supabase.storage
                .from(bucketName)
                .list(folderPath);

            if (error) {
                console.error("Error listing files:", error);
                throw error;
            }

            // 2. Delete all files in the folder
            if (data && data.length > 0) {
                const filesToDelete = data.map(
                    (file) => `${folderPath}/${file.name}`
                );
                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove(filesToDelete);

                if (deleteError) {
                    console.error("Error deleting files:", deleteError);
                    throw deleteError;
                }
            }

            // 3. Delete the empty folder
            const { error: deleteFolderError } = await supabase.storage
                .from(bucketName)
                .remove([folderPath]);

            if (deleteFolderError) {
                console.error("Error deleting folder:", deleteFolderError);
                throw deleteFolderError;
            }

            console.log(`Successfully deleted folder: ${folderPath}`);
        } catch (error) {
            console.error("Error in deleteAssociatedImages:", error);
            throw error;
        }
    };

    return { handleDelete };
};
