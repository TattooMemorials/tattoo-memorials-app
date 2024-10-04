"use client";
import {
    List,
    useTable,
    EditButton,
    ShowButton,
    getDefaultSortOrder,
    FilterDropdown,
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
    Badge,
    Popconfirm,
} from "antd";
import {
    DeleteOutlined,
    MailOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useUpdate } from "@refinedev/core";
import { useState } from "react";
import { getBadgeColor, InvoiceStatus } from "@/utils/stripe/common";
import { BaseKey } from "@refinedev/core";
import { useOrderDelete } from "@/utils/hooks/order-delete";
import { useLiveInvoiceUpdates } from "@/utils/hooks/live-invoice-updates";
import { useStripeInvoice } from "@/utils/hooks/stripe-invoice";

type Order = {
    id: BaseKey;
};

type EmailHistoryItem = {
    sent_at: string;
    email_type: string;
};

type EmailType = {
    key: string;
    label: string;
};

export default function LivingOrders() {
    const { tableProps, sorter, searchFormProps, filters } = useTable<Order>({
        syncWithLocation: true,
        liveMode: "auto",
        sorters: {
            initial: [
                {
                    field: "date_loaded",
                    order: "desc",
                },
            ],
        },
    });

    const { invoiceStatusMap } = useLiveInvoiceUpdates();
    const { handleDelete } = useOrderDelete();
    const {
        createInvoice,
        isLoading: isCreatingInvoice,
        error: invoiceError,
    } = useStripeInvoice();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEmailHistoryModalVisible, setIsEmailHistoryModalVisible] =
        useState(false);
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
    const [form] = Form.useForm();
    const [selectedEmailType, setSelectedEmailType] = useState("SEND_INVOICE");

    const { mutate: updateRecord } = useUpdate();

    const emailTypes: EmailType[] = [
        { key: "SEND_INVOICE", label: "Invoice and Payment Link" },
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
                `/api/email-history?orderId=${record.id}&orderType=living`
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
            const orderUrl = `https://app.tattoomemorials.com/living-order/${currentRecord.id}`;
            let emailSubject = "";
            let emailMessage = "";

            switch (selectedEmailType) {
                case "SEND_INVOICE":
                    if (
                        !currentRecord.total_price ||
                        currentRecord.total_price === 0
                    ) {
                        alert("You must enter a price for the order.");
                        return;
                    }

                    const invoiceResult = await createInvoice(currentRecord);

                    if (!invoiceResult.success) {
                        alert(
                            `Failed to create invoice: ${invoiceResult.error}`
                        );
                        return;
                    }

                    emailSubject = "Tattoo Memorial Order Invoice & Payment";
                    emailMessage = `
                        <p>Hello,</p>
                        <p>Thank you for your tattoo memorial order.</p>
                        <p>To proceed with your order, please pay using the link below:</p>
                        <p><a href="${invoiceResult.invoiceUrl}">View Invoice & Pay</a></p>
                        <p>You can view your original order details here: <a href="${orderUrl}">View Order</a></p>
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
                    orderType: "living",
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
                    resource: "living_orders",
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
        <List canCreate={false}>
            <Table
                {...tableProps}
                rowKey="id"
                dataSource={tableProps.dataSource?.map((order) => ({
                    ...order,
                    invoice_status: invoiceStatusMap[order.id] || "No Invoice",
                }))}
            >
                <Table.Column
                    dataIndex="invoice_status"
                    title="Invoice Status"
                    render={(value: InvoiceStatus) => (
                        <Badge color={getBadgeColor(value)} text={value} />
                    )}
                    sorter
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
                <Table.Column
                    dataIndex="date_loaded"
                    title="Order Date"
                    render={(value) => new Date(value).toLocaleDateString()}
                    sorter={{ multiple: 1 }}
                    defaultSortOrder={getDefaultSortOrder(
                        "date_loaded",
                        sorter
                    )}
                />
                <Table.Column
                    dataIndex="as_is"
                    title="As Is"
                    render={(value) => (value ? "Yes" : "No")}
                />
                <Table.Column dataIndex="medium" title="Medium" />
                <Table.Column
                    dataIndex="total_price"
                    title="Price"
                    render={(value) => (value ? `$${value}` : "")}
                />
                <Table.Column
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record: any) => {
                        const isPaid = record.invoice_status === "paid";
                        return (
                            <Space>
                                <EditButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                    disabled={isPaid}
                                />
                                <ShowButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                                <Popconfirm
                                    title="Are you sure?"
                                    onConfirm={() =>
                                        handleDelete(record.id, "living_orders")
                                    }
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                    />
                                </Popconfirm>
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
                                                    disabled={isPaid}
                                                >
                                                    {type.label}
                                                </Menu.Item>
                                            ))}
                                        </Menu>
                                    }
                                    disabled={isPaid}
                                >
                                    <Button
                                        icon={<MailOutlined />}
                                        size="small"
                                        title="Send Email"
                                        disabled={isPaid}
                                    >
                                        Send Email
                                    </Button>
                                </Dropdown>
                            </Space>
                        );
                    }}
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
