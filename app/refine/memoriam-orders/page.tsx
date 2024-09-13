"use client";
import { List, useTable } from "@refinedev/antd";

import { Table } from "antd";

export default function MemoriamOrders() {
    const { tableProps } = useTable();

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title="Id" />
                <Table.Column dataIndex="name" title="Name" />
                <Table.Column dataIndex="price" title="Price" />
            </Table>
        </List>
    );
}
