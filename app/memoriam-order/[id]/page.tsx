"use client";

import GoogleCaptchaWrapper from "@/app/google-captcha-wrapper";
import MemoriamOrderFormEdit from "@/components/Orders/MemoriamOrderFormEdit";
import { useParams } from "next/navigation";

export default function MemoriamOrderEditPage() {
    const params = useParams();
    const id = params.id as string;
    return (
        <GoogleCaptchaWrapper>
            <div className="flex-1 w-full flex flex-col min-h-screen bg-tan-500 text-black">
                <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-8">
                    <MemoriamOrderFormEdit orderId={id} />
                </main>
            </div>
        </GoogleCaptchaWrapper>
    );
}
