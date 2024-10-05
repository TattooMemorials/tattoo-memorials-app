"use client";

import { createClient } from "@/utils/supabase/client";
import { useForm } from "@refinedev/antd";
import {
    Form,
    Input,
    Button,
    Row,
    Col,
    Switch,
    Card,
    Typography,
    Divider,
    Select,
    Upload,
    message,
    Image,
    Modal,
    Space,
} from "antd";
import { useParams } from "next/navigation";
import { Medium, MEDIUMS } from "@/components/Orders/LivingOrderForm";
import {
    UploadOutlined,
    DeleteOutlined,
    EyeOutlined,
    FileTextOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import React from "react";

const supabase = createClient();

const { Text, Title } = Typography;

export default function EditPage() {
    const params = useParams();
    const id = params.id as string;
    const { formProps, saveButtonProps, queryResult } = useForm<IMemoriamOrder>(
        {
            resource: "memoriam_orders",
            id: id,
            action: "edit",
        }
    );
    const memoriamOrder = queryResult?.data?.data;
    const [orderImages, setOrderImages] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [isAsIs, setIsAsIs] = useState(memoriamOrder?.as_is || false);
    const [intakeFormUrl, setIntakeFormUrl] = useState<string | null>(null);
    const [consentFormUrl, setConsentFormUrl] = useState<string | null>(null);

    useEffect(() => {
        if (memoriamOrder) {
            setIsAsIs(memoriamOrder.as_is);
        }
    }, [memoriamOrder]);

    useEffect(() => {
        if (memoriamOrder?.id) {
            fetchOrderImages(memoriamOrder.id);
        }
        if (memoriamOrder?.intake_form_path) {
            getPublicUrl(memoriamOrder.intake_form_path, setIntakeFormUrl);
        }
        if (memoriamOrder?.consent_form_path) {
            getPublicUrl(memoriamOrder.consent_form_path, setConsentFormUrl);
        }
    }, [memoriamOrder]);

    const fetchOrderImages = async (orderId: string) => {
        const { data, error } = await supabase.storage
            .from("order-images")
            .list(`${orderId}`);

        if (error) {
            console.error("Error fetching order images:", error);
            return;
        }

        setOrderImages(data.map((file) => file.name));
    };

    const getPublicUrl = async (
        path: string,
        setUrl: (url: string) => void
    ) => {
        const { data } = supabase.storage
            .from("order-forms")
            .getPublicUrl(path);
        if (data?.publicUrl) {
            setUrl(data.publicUrl);
        }
    };

    const handleImageUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const { data, error } = await supabase.storage
                .from("order-images")
                .upload(`${memoriamOrder?.id}/${file.name}`, file);

            if (error) throw error;
            onSuccess(data);
            message.success("Image uploaded successfully");
            fetchOrderImages(memoriamOrder?.id as string);
        } catch (error) {
            console.error("Error uploading image:", error);
            onError(error);
            message.error("Failed to upload image");
        }
    };

    const handleImageDelete = async (fileName: string) => {
        try {
            const { error } = await supabase.storage
                .from("order-images")
                .remove([`${memoriamOrder?.id}/${fileName}`]);

            if (error) throw error;
            message.success("Image deleted successfully");
            fetchOrderImages(memoriamOrder?.id as string);
        } catch (error) {
            console.error("Error deleting image:", error);
            message.error("Failed to delete image");
        }
    };

    const showModal = (imageUrl: string) => {
        setModalImage(imageUrl);
        setModalVisible(true);
    };

    const handlePreview = (url: string | null) => {
        if (url) {
            window.open(url, "_blank");
        }
    };

    const handleDownload = async (url: string | null, fileName: string) => {
        if (url) {
            try {
                const response = await fetch(url);
                const contentType = response.headers.get("content-type");
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = getFileNameWithExtension(fileName, contentType);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Error downloading file:", error);
            }
        }
    };

    const getFileNameWithExtension = (
        fileName: string,
        contentType: string | null
    ): string => {
        if (!contentType) return fileName;
        const extension = contentType.split("/").pop();
        if (fileName.endsWith(`.${extension}`)) return fileName;
        return `${fileName}.${extension}`;
    };

    return (
        <Card style={{ margin: "24px" }}>
            <Title
                level={2}
                style={{ textAlign: "center", marginBottom: "24px" }}
            >
                Edit Memoriam Order
            </Title>

            <Card
                title="Order Information"
                type="inner"
                style={{ marginBottom: "24px" }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text strong>ID:</Text>
                        <div>{memoriamOrder?.id}</div>
                    </Col>
                    <Col span={12}>
                        <Text strong>Date Loaded:</Text>
                        <div>{memoriamOrder?.date_loaded?.toString()}</div>
                    </Col>
                    <Col span={12}>
                        <Text strong>Intake Form:</Text>
                        <div style={{ wordBreak: "break-all" }}>
                            <Space style={{ marginLeft: "8px" }}>
                                <Button
                                    icon={<FileTextOutlined />}
                                    onClick={() => handlePreview(intakeFormUrl)}
                                    size="small"
                                >
                                    Preview
                                </Button>
                                <Button
                                    icon={<DownloadOutlined />}
                                    onClick={() =>
                                        handleDownload(
                                            intakeFormUrl,
                                            "intake_form.pdf"
                                        )
                                    }
                                    size="small"
                                >
                                    Download
                                </Button>
                            </Space>
                        </div>
                    </Col>
                    <Col span={12}>
                        <Text strong>Consent Form:</Text>
                        <div style={{ wordBreak: "break-all" }}>
                            <Space style={{ marginLeft: "8px" }}>
                                <Button
                                    icon={<FileTextOutlined />}
                                    onClick={() =>
                                        handlePreview(consentFormUrl)
                                    }
                                    size="small"
                                >
                                    Preview
                                </Button>
                                <Button
                                    icon={<DownloadOutlined />}
                                    onClick={() =>
                                        handleDownload(
                                            consentFormUrl,
                                            "consent_form.pdf"
                                        )
                                    }
                                    size="small"
                                >
                                    Download
                                </Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Form
                {...formProps}
                layout="vertical"
                onValuesChange={(changedValues) => {
                    if ("as_is" in changedValues) {
                        setIsAsIs(changedValues.as_is);
                    } else if ("altered" in changedValues) {
                        setIsAsIs(!changedValues.altered);
                    }
                }}
            >
                <Title level={4}>Authorized Representative</Title>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="First Name"
                            name="first_name"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Last Name"
                            name="last_name"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: "email" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Phone" name="phone">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item label="Street Address" name="street_address">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Street Address 2"
                            name="street_address2"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="City" name="city">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="State" name="state">
                            <Input maxLength={2} />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item label="Postal Code" name="postal_code">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={4}>Funeral Home Details</Title>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Funeral Home Name"
                            name="funeral_home_name"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Funeral Home Rep"
                            name="funeral_home_rep"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Title level={4}>Order Details</Title>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Medium" name="medium">
                            <Select>
                                {Object.values(MEDIUMS).map((medium) => (
                                    <Select.Option key={medium} value={medium}>
                                        {medium}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Total Price" name="total_price">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="As Is"
                            name="as_is"
                            valuePropName="checked"
                        >
                            <Switch
                                onChange={(checked) => {
                                    if (checked) {
                                        formProps.form?.setFieldsValue({
                                            altered: false,
                                        });
                                    }
                                    setIsAsIs(checked);
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Altered"
                            name="altered"
                            valuePropName="checked"
                        >
                            <Switch
                                onChange={(checked) => {
                                    if (checked) {
                                        formProps.form?.setFieldsValue({
                                            as_is: false,
                                        });
                                    }
                                    setIsAsIs(!checked);
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {!isAsIs && (
                    <React.Fragment>
                        <Form.Item
                            label="Alteration Notes"
                            name="alteration_notes"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Please provide alteration notes for altered orders",
                                },
                            ]}
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>

                        <Form.Item
                            label="Inspiration Notes"
                            name="inspiration_notes"
                        >
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </React.Fragment>
                )}

                <Divider />

                <Title level={4}>Order Images</Title>
                <Upload
                    customRequest={handleImageUpload}
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
                <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                    {orderImages.map((image) => (
                        <Col key={image} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                size="small"
                                title={image}
                                actions={[
                                    <EyeOutlined
                                        key="view"
                                        onClick={() =>
                                            showModal(
                                                `${
                                                    supabase.storage
                                                        .from("order-images")
                                                        .getPublicUrl(
                                                            `${memoriamOrder?.id}/${image}`
                                                        ).data.publicUrl
                                                }`
                                            )
                                        }
                                    />,
                                    <DeleteOutlined
                                        key="delete"
                                        onClick={() => handleImageDelete(image)}
                                    />,
                                ]}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "150px",
                                    }}
                                >
                                    <Image
                                        src={`${
                                            supabase.storage
                                                .from("order-images")
                                                .getPublicUrl(
                                                    `${memoriamOrder?.id}/${image}`
                                                ).data.publicUrl
                                        }`}
                                        alt={image}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "150px",
                                            objectFit: "contain",
                                        }}
                                        preview={false}
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Form.Item>
                    <Button type="primary" {...saveButtonProps} size="large">
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>

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
        </Card>
    );
}

export interface IMemoriamOrder {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    street_address?: string;
    street_address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    date_loaded?: Date;
    as_is: boolean;
    medium: Medium;
    alteration_notes?: string;
    inspiration_notes?: string;
    altered: boolean;
    total_price?: number;
    funeral_home_name?: string;
    funeral_home_rep?: string;
    intake_form_path?: string;
    consent_form_path?: string;
}
