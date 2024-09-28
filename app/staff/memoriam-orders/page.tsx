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
import {
    Table,
    Space,
    Input,
    Button,
    Modal,
    Form,
    Typography,
    Select,
    Dropdown,
    Menu,
} from "antd";
import { MailOutlined, SearchOutlined } from "@ant-design/icons";
import { useUpdate, useNavigation } from "@refinedev/core";
import { useState } from "react";

type EmailHistoryItem = {
    sent_at: string;
    email_type: string;
};

type EmailType = {
    key: string;
    label: string;
};

export default function MemoriamOrders() {
    const { tableProps, sorter, searchFormProps, filters } = useTable({
        syncWithLocation: true,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEmailHistoryModalVisible, setIsEmailHistoryModalVisible] =
        useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
    const [form] = Form.useForm();
    const [selectedEmailType, setSelectedEmailType] = useState(
        "MEMORIAM_COMPLETION_REQUEST"
    );

    const { mutate: updateRecord } = useUpdate();

    const emailTypes: EmailType[] = [
        { key: "MEMORIAM_COMPLETION_REQUEST", label: "Completion Request" },
        { key: "SEND_INVOICE", label: "Invoice & Payment Link" },
    ];

    const getEmailTypeLabel = (key: string): string => {
        return emailTypes.find((type) => type.key === key)?.label || key;
    };

    const handleEmailTypeSelect = (record: any, emailType: string) => {
        setSelectedEmailType(emailType);
        handleSendEmail(record);
    };

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
        // Check if this email type has been sent before
        const hasSentBefore = emailHistory.some(
            (email) => email.email_type === selectedEmailType
        );

        if (hasSentBefore) {
            const confirmSend = window.confirm(
                "This email type has been sent before. Are you sure you want to send it again?"
            );
            if (!confirmSend) {
                return;
            }
        }

        try {
            const orderUrl = `https://app.tattoomemorials.com/memoriam-order/${currentRecord.id}`;
            let emailSubject = "";
            let emailMessage = "";

            switch (selectedEmailType) {
                case "SEND_INVOICE":
                    emailSubject = "Invoice for Your Tattoo Memorial  Order";
                    emailMessage = `
                        <p>Hello,</p>
                        <p>Thank you for your tattoo memorial order. Here are the details:</p>
                        <p>Total Price: $${currentRecord.total_price}</p>
                        <p>You can view your order details here: <a href="${orderUrl}">View Order</a></p>
                        <p>Thank you,</p>
                        <p>Tattoo Memorials Team</p>
                    `;
                    break;
            }

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
                    emailType: selectedEmailType,
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
                            <Dropdown
                                overlay={
                                    <Menu>
                                        {emailTypes.map((type) => (
                                            <Menu.Item
                                                key={type.key}
                                                onClick={() =>
                                                    handleEmailTypeSelect(
                                                        record,
                                                        type.key
                                                    )
                                                }
                                            >
                                                {type.label}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <Button
                                    icon={<MailOutlined />}
                                    size="small"
                                    title="Send Email"
                                >
                                    Send Email
                                </Button>
                            </Dropdown>
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
                    dataSource={emailHistory.sort(
                        (a, b) =>
                            new Date(a.sent_at).getTime() -
                            new Date(b.sent_at).getTime()
                    )}
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
                            render: (value) => getEmailTypeLabel(value),
                        },
                    ]}
                    pagination={false}
                />
                <Form layout="vertical" style={{ marginTop: "20px" }}>
                    <Form.Item label="Select Email Type to Send">
                        <Select
                            value={selectedEmailType}
                            onChange={(value) => setSelectedEmailType(value)}
                        >
                            {emailTypes.map((type) => (
                                <Select.Option key={type.key} value={type.key}>
                                    {type.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
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
