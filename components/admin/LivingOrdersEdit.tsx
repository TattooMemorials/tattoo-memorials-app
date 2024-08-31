import {
    Edit,
    SimpleForm,
    TextInput,
    DateInput,
    BooleanInput,
} from "react-admin";

export const LivingOrdersEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="first_name" />
            <TextInput source="last_name" />
            <TextInput source="email" />
            <TextInput source="phone" />
            <TextInput source="street_address" />
            <TextInput source="street_address2" />
            <TextInput source="city" />
            <TextInput source="state" />
            <TextInput source="postal_code" />
            <DateInput source="date_loaded" />
            <BooleanInput source="as_is" />
            <TextInput source="alteration_notes" multiline />
            <TextInput source="inspiration_notes" multiline />
            <BooleanInput source="altered" />
        </SimpleForm>
    </Edit>
);
