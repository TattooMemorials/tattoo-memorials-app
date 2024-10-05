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
} from "antd";
import { useParams } from "next/navigation";
import { Medium, MEDIUMS } from "@/components/Orders/LivingOrderForm";
import { UploadOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import React from "react";

const supabase = createClient();

const { Text, Title } = Typography;

export default function EditPage() {
    const params = useParams();
    const id = params.id as string;
    const { formProps, saveButtonProps, queryResult } = useForm<ILivingOrder>({
        resource: "living_orders",
        id: id,
        action: "edit",
    });
    const livingOrder = queryResult?.data?.data;
    const [orderImages, setOrderImages] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalImage, setModalImage] = useState("");
    const [isAsIs, setIsAsIs] = useState(livingOrder?.as_is || false);

    useEffect(() => {
        if (livingOrder) {
            setIsAsIs(livingOrder.as_is);
        }
    }, [livingOrder]);

    useEffect(() => {
        if (livingOrder?.id) {
            fetchOrderImages(livingOrder.id);
        }
    }, [livingOrder]);

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

    const getImagePublicUrl = async (path: string) => {
        const { data } = supabase.storage
            .from("order-images")
            .getPublicUrl(`${path}`);
        return data?.publicUrl;
    };

    const handleImageUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        try {
            const { data, error } = await supabase.storage
                .from("order-images")
                .upload(`${livingOrder?.id}/${file.name}`, file);

            if (error) throw error;
            onSuccess(data);
            message.success("Image uploaded successfully");
            fetchOrderImages(livingOrder?.id as string);
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
                .remove([`${livingOrder?.id}/${fileName}`]);

            if (error) throw error;
            message.success("Image deleted successfully");
            fetchOrderImages(livingOrder?.id as string);
        } catch (error) {
            console.error("Error deleting image:", error);
            message.error("Failed to delete image");
        }
    };

    const showModal = (imageUrl: string) => {
        setModalImage(imageUrl);
        setModalVisible(true);
    };

    return (
        <Card style={{ margin: "24px" }}>
            <Title
                level={2}
                style={{ textAlign: "center", marginBottom: "24px" }}
            >
                Edit Living Order
            </Title>

            <Card
                title="Order Information"
                type="inner"
                style={{ marginBottom: "24px" }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Text strong>ID:</Text>
                        <div>{livingOrder?.id}</div>
                    </Col>
                    <Col span={12}>
                        <Text strong>Date Loaded:</Text>
                        <div>{livingOrder?.date_loaded?.toString()}</div>
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
                <Title level={4}>Customer</Title>
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

                <Title level={4}>Order Details</Title>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Medium"
                            name="medium"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select a medium",
                                },
                            ]}
                        >
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
                                                            `${livingOrder?.id}/${image}`
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
                                <Image
                                    src={`${
                                        supabase.storage
                                            .from("order-images")
                                            .getPublicUrl(
                                                `${livingOrder?.id}/${image}`
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

export interface ILivingOrder {
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
    intake_form_path?: string;
    consent_form_path?: string;
}
