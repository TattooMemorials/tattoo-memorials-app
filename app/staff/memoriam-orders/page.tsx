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
import { Table, Space, Input, Button, Modal, Form, Typography } from "antd";
import { MailOutlined, SearchOutlined } from "@ant-design/icons";
import { useUpdate, useNavigation } from "@refinedev/core";
import { useState } from "react";

export default function MemoriamOrders() {
    const { tableProps, sorter, searchFormProps, filters } = useTable({
        syncWithLocation: true,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEmailHistoryModalVisible, setIsEmailHistoryModalVisible] =
        useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [emailHistory, setEmailHistory] = useState<
        { date: string; success: boolean }[]
    >([]);
    const [form] = Form.useForm();

    const { mutate: updateRecord } = useUpdate();
    const { show } = useNavigation();

    const handleSendEmail = async (record: any) => {
        try {
            const response = await fetch(
                `/api/email-history?orderId=${record.id}&orderType=memoriam`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch email history");
            }
            const emailHistory = await response.json();
            setEmailHistory(emailHistory);

            if (record.email) {
                setCurrentRecord(record);
                setIsEmailHistoryModalVisible(true);
            } else {
                setCurrentRecord(record);
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error("Error fetching email history:", error);
            alert("Failed to fetch email history. Please try again.");
        }
    };

    const handleConfirmSendEmail = async () => {
        try {
            const editUrl = `https://app.tattoomemorials.com/memoriam-order/${currentRecord.id}`;
            const emailSubject = "Complete Your Memoriam Order";
            const emailMessage = `
                <p>Hello,</p>
                <p>A new memoriam order has been created. You can view and edit the order details by clicking the link below:</p>
                <p><a href="${editUrl}">Click here to complete your order</a></p>
                <p>${editUrl}</p>
                <p>Thank you,</p>
                <p>Tattoo Memorials Team</p>
            `;

            const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: currentRecord.email,
                    subject: emailSubject,
                    message: emailMessage,
                    orderId: currentRecord.id,
                    orderType: "memoriam",
                    emailType: "MEMORIAM_COMPLETION_REQUEST",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send email");
            }

            alert(`Email sent successfully to ${currentRecord.email}`);
            setIsEmailHistoryModalVisible(false);

            // Refresh email history
            await handleSendEmail(currentRecord);
        } catch (error) {
            console.error("Failed to send email:", error);
            alert("Failed to send email. Please try again.");
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
                    onSuccess: async () => {
                        setIsModalVisible(false);
                        await handleSendEmail({
                            ...currentRecord,
                            email: values.email,
                        });
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

            {/* Email History Modal */}
            <Modal
                title="Email History"
                visible={isEmailHistoryModalVisible}
                onCancel={() => setIsEmailHistoryModalVisible(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setIsEmailHistoryModalVisible(false)}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="send"
                        type="primary"
                        onClick={handleConfirmSendEmail}
                    >
                        Send Email
                    </Button>,
                ]}
            >
                <Typography.Paragraph>
                    Email has been sent {emailHistory.length} times to{" "}
                    {currentRecord?.email}.
                </Typography.Paragraph>
                <Table
                    dataSource={emailHistory}
                    columns={[
                        {
                            title: "Date Sent",
                            dataIndex: "sent_at",
                            key: "sent_at",
                            render: (value) => new Date(value).toLocaleString(),
                        },
                        {
                            title: "Email Type",
                            dataIndex: "email_type",
                            key: "email_type",
                        },
                    ]}
                    pagination={false}
                />
            </Modal>

            {/* Existing Email Modal */}
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
