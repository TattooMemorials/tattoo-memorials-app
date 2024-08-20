/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                btn: {
                    background: "hsl(var(--btn-background))",
                    "background-hover": "hsl(var(--btn-background-hover))",
                },
                navy: {
                    800: "#1a2a4a",
                    900: "#0f172a",
                },
                gold: {
                    300: "#fcd34d",
                    400: "#fbbf24",
                    500: "#f59e0b",
                    600: "#d97706",
                },
            },
        },
    },
    plugins: [],
};
