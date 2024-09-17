import { Overlock } from "next/font/google";

import "./globals.css";

const overlock = Overlock({
    weight: ["400", "700", "900"],
    subsets: ["latin"],
});

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Tattoo Memorial App",
    description: "Tattoo Memorial App",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={overlock.className}>
            <body className="bg-background text-foreground">{children}</body>
        </html>
    );
}
