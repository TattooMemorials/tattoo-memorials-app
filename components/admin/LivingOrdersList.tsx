import {
    List,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
} from "react-admin";

export const LivingOrdersList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="first_name" />
            <TextField source="last_name" />
            <TextField source="email" />
            <TextField source="phone" />
            <TextField source="city" />
            <TextField source="state" />
            <DateField source="date_loaded" />
            <BooleanField source="as_is" />
            <BooleanField source="altered" />
        </Datagrid>
    </List>
);
