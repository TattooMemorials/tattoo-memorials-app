import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";
import { SubmitButton } from "./login/submit-button";
import { redirect } from "next/navigation";
import NewOrderForm from "@/components/Orders/NewOrderForm";

export default async function Index() {
    const canInitSupabaseClient = () => {
        // This function is just for the interactive tutorial.
        // Feel free to remove it once you have Supabase connected.
        try {
            createClient();
            return true;
        } catch (e) {
            return false;
        }
    };

    const isSupabaseConnected = canInitSupabaseClient();

    const submitRequestForm = async (formData: FormData) => {
        "use server";

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return redirect("/login?message=Could not authenticate user");
        }

        return redirect("/protected");
    };

    return (
        <div className="flex-1 w-full flex flex-col gap-10 items-center p-4">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                    Order Form
                </div>
            </nav>

            <div className="flex-1 flex flex-col gap-10 w-full max-w-4xl">
                <main className="flex-1 flex flex-col gap-6 w-full">
                    <h2 className="font-bold text-4xl mb-4">Order Form</h2>
                    <NewOrderForm onSubmit={submitRequestForm} />
                </main>
            </div>

            <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
                <p>
                    <a
                        href=""
                        target="_blank"
                        className="font-bold hover:underline"
                        rel="noreferrer"
                    >
                        tinner.tech
                    </a>
                </p>
            </footer>
        </div>
    );
}
