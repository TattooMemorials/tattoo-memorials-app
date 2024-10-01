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
} from "antd";
import { useParams } from "next/navigation";
import { Medium, MEDIUMS } from "@/components/Orders/LivingOrderForm";

const { Text, Title } = Typography;

const supabase = createClient();

export default function EditPage() {
    const params = useParams();
    const id = params.id as string;
    const { formProps, saveButtonProps, queryResult } = useForm<ILivingOrder>({
        resource: "living_orders",
        id: id,
        action: "edit",
    });
    const livingOrder = queryResult?.data?.data;

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

            <Form {...formProps} layout="vertical">
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
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Altered"
                            name="altered"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Alteration Notes" name="alteration_notes">
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item label="Inspiration Notes" name="inspiration_notes">
                    <Input.TextArea rows={4} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" {...saveButtonProps} size="large">
                        Save Changes
                    </Button>
                </Form.Item>
            </Form>
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
