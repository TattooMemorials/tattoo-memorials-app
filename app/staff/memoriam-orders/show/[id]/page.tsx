"use client";

import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import {
    Typography,
    Card,
    Descriptions,
    Row,
    Col,
    Image,
    Button,
    Modal,
    Divider,
} from "antd";
import { FileTextOutlined, FileZipOutlined } from "@ant-design/icons";
import { createClient } from "@/utils/supabase/client";
import { IMemoriamOrder } from "../../edit/[id]/page";
import { useState, useEffect } from "react";
import { message } from "antd";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;

const supabase = createClient();

interface FilePreview {
    url: string;
    isImage: boolean;
}

export default function OrderShow() {
    const { queryResult } = useShow<IMemoriamOrder>();
    const { data, isLoading } = queryResult;
    const record = data?.data;

    const [filePreviews, setFilePreviews] = useState<{
        [key: string]: FilePreview;
    }>({});

    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState("");

    const getImagePublicUrl = async (path: string) => {
        const { data } = supabase.storage
            .from("order-images")
            .getPublicUrl(path);
        return data?.publicUrl;
    };

    const getFormPublicUrl = async (path: string) => {
        const { data } = supabase.storage
            .from("order-forms")
            .getPublicUrl(path);
        return data?.publicUrl;
    };

    const isImageFile = (url: string) => {
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
        const extension = url.split(".").pop()?.toLowerCase();
        return extension ? imageExtensions.includes(extension) : false;
    };

    const showModal = (imageUrl: string) => {
        setModalImage(imageUrl);
        setModalVisible(true);
    };

    const loadOrderImages = async (orderId: string) => {
        try {
            const { data, error } = await supabase.storage
                .from("order-images")
                .list(`${orderId}`);

            console.log("data: ", data);
            console.log("error: ", error);

            if (error) throw error;

            const imagePromises = data.map(async (file) => {
                const url = await getImagePublicUrl(`${orderId}/${file.name}`);
                return {
                    key: file.name,
                    url,
                    isImage: true,
                };
            });

            const images = await Promise.all(imagePromises);
            return images;
        } catch (error) {
            console.error("Error loading order images:", error);
            message.error("Failed to load some order images");
            return [];
        }
    };

    useEffect(() => {
        const loadAllPreviews = async () => {
            if (record) {
                const previews: { [key: string]: FilePreview } = {};

                // Load form previews
                if (record.intake_form_path) {
                    try {
                        const url = await getFormPublicUrl(
                            record.intake_form_path
                        );
                        if (url) {
                            previews.intake_form = {
                                url,
                                isImage: isImageFile(url),
                            };
                        }
                    } catch (error) {
                        console.error("Error loading intake form:", error);
                        message.error("Failed to load intake form");
                    }
                }

                if (record.consent_form_path) {
                    try {
                        const url = await getFormPublicUrl(
                            record.consent_form_path
                        );
                        if (url) {
                            previews.consent_form = {
                                url,
                                isImage: isImageFile(url),
                            };
                        }
                    } catch (error) {
                        console.error("Error loading consent form:", error);
                        message.error("Failed to load consent form");
                    }
                }

                // Load order images
                try {
                    const orderImages = await loadOrderImages(record.id);
                    orderImages.forEach((image) => {
                        previews[`order_image_${image.key}`] = image;
                    });
                } catch (error) {
                    console.error("Error loading order images:", error);
                    message.error("Failed to load some order images");
                }

                setFilePreviews(previews);
            }
        };

        loadAllPreviews();
    }, [record]);

    const downloadAllFiles = async () => {
        if (!record) return;

        const zip = new JSZip();
        const promises = [];

        // Add forms to zip
        for (const [key, preview] of Object.entries(filePreviews)) {
            const response = await fetch(preview.url);
            const blob = await response.blob();
            const fileName = `${key}.${preview.isImage ? "jpg" : "pdf"}`;
            zip.file(fileName, blob);
        }

        try {
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `order_${record.id}_documents.zip`);
            message.success("All files downloaded successfully");
        } catch (error) {
            console.error("Error creating zip file:", error);
            message.error("Failed to download files");
        }
    };

    return (
        <Show isLoading={isLoading}>
            <Card>
                <Title
                    level={2}
                    style={{ textAlign: "center", marginBottom: "24px" }}
                >
                    Memoriam Order Details
                </Title>

                <Descriptions bordered column={2}>
                    <Descriptions.Item label="ID">
                        {record?.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date Loaded">
                        {record?.date_loaded?.toString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Price">
                        ${record?.total_price}
                    </Descriptions.Item>
                    <Descriptions.Item label="First Name">
                        {record?.first_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Name">
                        {record?.last_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {record?.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                        {record?.phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Street Address" span={2}>
                        {record?.street_address}
                    </Descriptions.Item>
                    <Descriptions.Item label="Street Address 2" span={2}>
                        {record?.street_address2}
                    </Descriptions.Item>
                    <Descriptions.Item label="City">
                        {record?.city}
                    </Descriptions.Item>
                    <Descriptions.Item label="State">
                        {record?.state}
                    </Descriptions.Item>
                    <Descriptions.Item label="Postal Code">
                        {record?.postal_code}
                    </Descriptions.Item>
                    <Divider />
                    <Descriptions.Item label="Medium">
                        {record?.medium}
                    </Descriptions.Item>
                    <Descriptions.Item label="Altered">
                        {record?.altered ? "Yes" : "No"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Alteration Notes" span={2}>
                        {record?.alteration_notes}
                    </Descriptions.Item>
                    <Descriptions.Item label="Inspiration Notes" span={2}>
                        {record?.inspiration_notes}
                    </Descriptions.Item>
                </Descriptions>

                <Title
                    level={4}
                    style={{ marginTop: "24px", marginBottom: "16px" }}
                >
                    Order Documents
                </Title>
                <Button
                    icon={<FileZipOutlined />}
                    onClick={downloadAllFiles}
                    style={{ marginBottom: "16px" }}
                >
                    Download All Documents
                </Button>
                <Row gutter={[16, 16]}>
                    {Object.entries(filePreviews).map(([key, preview]) => (
                        <Col key={key} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                size="small"
                                title={key.replace("_", " ").toUpperCase()}
                                style={{ height: "100%" }}
                            >
                                {preview.isImage ? (
                                    <div style={{ textAlign: "center" }}>
                                        <Image
                                            src={preview.url}
                                            alt={key}
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "150px",
                                                objectFit: "contain",
                                            }}
                                            onClick={() =>
                                                showModal(preview.url)
                                            }
                                            preview={false}
                                        />
                                    </div>
                                ) : (
                                    <Button
                                        icon={<FileTextOutlined />}
                                        onClick={() =>
                                            window.open(preview.url, "_blank")
                                        }
                                        style={{ width: "100%" }}
                                    >
                                        View {key.replace("_", " ")}
                                    </Button>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
            <Modal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width="80%"
            >
                <img
                    alt="Full size preview"
                    style={{ width: "100%" }}
                    src={modalImage}
                />
            </Modal>
        </Show>
    );
}
