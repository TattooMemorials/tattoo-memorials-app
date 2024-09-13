"use client";

import { useForm } from "@refinedev/antd";
import { Form, Input, Button, Row, Col, Switch, DatePicker } from "antd";
import { useParams } from "next/navigation";

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

    return (
        <>
            <Row justify="center" style={{ paddingTop: 24, paddingBottom: 24 }}>
                <Col style={{ textAlign: "center" }}>
                    <h2>{`Edit Memoriam Order ${memoriamOrder?.id}`}</h2>
                </Col>
            </Row>
            <Row justify="center">
                <Col span={16}>
                    <Form {...formProps} layout="vertical">
                        <Form.Item
                            label="First Name"
                            name="first_name"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Last Name"
                            name="last_name"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: "email" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item label="Phone" name="phone">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Street Address" name="street_address">
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Street Address 2"
                            name="street_address2"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item label="City" name="city">
                            <Input />
                        </Form.Item>
                        <Form.Item label="State" name="state">
                            <Input maxLength={2} />
                        </Form.Item>
                        <Form.Item label="Postal Code" name="postal_code">
                            <Input />
                        </Form.Item>
                        {/* <Form.Item label="Date Loaded" name="date_loaded">
                            <DatePicker showTime />
                        </Form.Item> */}
                        <Form.Item
                            label="As Is"
                            name="as_is"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="Alteration Notes"
                            name="alteration_notes"
                        >
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                            label="Inspiration Notes"
                            name="inspiration_notes"
                        >
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                            label="Altered"
                            name="altered"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="Funeral Home Name"
                            name="funeral_home_name"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Funeral Home Rep"
                            name="funeral_home_rep"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Intake Form Path"
                            name="intake_form_path"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Consent Form Path"
                            name="consent_form_path"
                        >
                            <Input />
                        </Form.Item>
                        <Button type="primary" {...saveButtonProps}>
                            Save
                        </Button>
                    </Form>
                </Col>
            </Row>
        </>
    );
}

interface IMemoriamOrder {
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
    alteration_notes?: string;
    inspiration_notes?: string;
    altered: boolean;
    funeral_home_name?: string;
    funeral_home_rep?: string;
    intake_form_path?: string;
    consent_form_path?: string;
}
