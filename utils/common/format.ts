export const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, "");

    // Format the cleaned value
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
        const [, areaCode, firstPart, secondPart] = match;
        if (secondPart) {
            return `${areaCode}-${firstPart}-${secondPart}`;
        } else if (firstPart) {
            return `${areaCode}-${firstPart}`;
        } else if (areaCode) {
            return `${areaCode}`;
        }
    }
    return value;
};
