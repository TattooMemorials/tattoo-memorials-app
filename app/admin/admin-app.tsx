"use client";

import { supabaseDataProvider } from "@/lib/supabaseDataProvider";
import { Admin, Resource, ListGuesser, EditGuesser } from "react-admin";

const AdminApp = () => (
    <Admin dataProvider={supabaseDataProvider}>
        <Resource
            name="living_orders"
            list={ListGuesser}
            edit={EditGuesser}
            recordRepresentation="id"
        />
        <Resource
            name="memoriam_orders"
            list={ListGuesser}
            edit={EditGuesser}
            recordRepresentation="id"
        />
    </Admin>
);

export default AdminApp;
