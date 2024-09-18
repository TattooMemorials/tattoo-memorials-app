"use client";
import {
    List,
    useTable,
    EditButton,
    ShowButton,
    DeleteButton,
    getDefaultSortOrder,
    FilterDropdown,
    CreateButton,
} from "@refinedev/antd";
import { Table, Space, Input, Button, Modal, Form } from "antd";
import { MailOutlined, SearchOutlined } from "@ant-design/icons";
import { useUpdate } from "@refinedev/core";
import { useState } from "react";

export default function MemoriamOrders() {
    const { tableProps, sorter, searchFormProps, filters } = useTable({
        syncWithLocation: true,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [form] = Form.useForm();

    const { mutate: updateRecord } = useUpdate();

    const handleSendEmail = (record: any) => {
        if (record.email) {
            alert(`Email sent to ${record.email}`);
        } else {
            setCurrentRecord(record);
            setIsModalVisible(true);
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            updateRecord(
                {
                    resource: "memoriam_orders",
                    id: currentRecord.id,
                    values: { email: values.email },
                },
                {
                    onSuccess: () => {
                        setIsModalVisible(false);
                        alert(
                            `Email address saved and email sent to ${values.email}`
                        );
                        form.resetFields();
                    },
                    onError: (error: any) => {
                        alert(`Error updating email: ${error.message}`);
                    },
                }
            );
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <List headerButtons={<CreateButton />}>
            <Table {...tableProps} rowKey="id">
                <Table.Column
                    dataIndex="id"
                    title="ID"
                    sorter
                    defaultSortOrder={getDefaultSortOrder("id", sorter)}
                />
                <Table.Column
                    dataIndex="first_name"
                    title="First Name"
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Input />
                        </FilterDropdown>
                    )}
                    filterIcon={<SearchOutlined />}
                />
                <Table.Column
                    dataIndex="last_name"
                    title="Last Name"
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Input />
                        </FilterDropdown>
                    )}
                    filterIcon={<SearchOutlined />}
                />
                <Table.Column dataIndex="email" title="Email" />
                <Table.Column dataIndex="phone" title="Phone" />
                <Table.Column
                    dataIndex="funeral_home_name"
                    title="Funeral Home"
                    filterDropdown={(props) => (
                        <FilterDropdown {...props}>
                            <Input />
                        </FilterDropdown>
                    )}
                    filterIcon={<SearchOutlined />}
                />
                <Table.Column
                    dataIndex="date_loaded"
                    title="Date Loaded"
                    render={(value) => new Date(value).toLocaleDateString()}
                    sorter
                />
                <Table.Column
                    dataIndex="as_is"
                    title="As Is"
                    render={(value) => (value ? "Yes" : "No")}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => (
                        <Space>
                            <EditButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                            <DeleteButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                                type="primary"
                            />
                            <Button
                                icon={<MailOutlined />}
                                size="small"
                                onClick={() => handleSendEmail(record)}
                                title="Send Email"
                            />
                        </Space>
                    )}
                />
            </Table>
            <Modal
                title="Enter Email Address"
                visible={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Form form={form}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                required: true,
                                message: "Please input an email address!",
                            },
                            {
                                type: "email",
                                message: "Please enter a valid email address!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </List>
    );
}
