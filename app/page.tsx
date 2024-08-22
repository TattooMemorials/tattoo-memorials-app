import NewOrderForm from "@/components/Orders/NewOrderForm";
import GoogleCaptchaWrapper from "./google-captcha-wrapper";

export default function Index() {
    return (
        <GoogleCaptchaWrapper>
            <IndexInside />
        </GoogleCaptchaWrapper>
    );
}

async function IndexInside() {
    return (
        <div className="flex-1 w-full flex flex-col min-h-screen bg-tan-500 text-black">
            <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-8">
                <NewOrderForm />
            </main>
        </div>
    );
}
