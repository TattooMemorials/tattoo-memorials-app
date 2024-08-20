import NewOrderForm from "@/components/Orders/NewOrderForm";

export default async function Index() {
    return (
        <div className="flex-1 w-full flex flex-col min-h-screen bg-navy-900 text-gold-300">
            <nav className="w-full border-b border-gold-600/30 h-16 bg-navy-800">
                <div className="w-full max-w-4xl mx-auto flex justify-between items-center h-full px-4">
                    <span className="text-xl font-bold text-gold-400">
                        Tattoo Memorials
                    </span>
                </div>
            </nav>

            <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-8">
                <h1 className="text-4xl font-bold text-center mb-8 text-gold-300">
                    Living Artwork
                </h1>
                <p className="text-center mb-12 text-gold-200 max-w-2xl mx-auto">
                    Celebrate and preserve your unique body art. Share your
                    tattoos, choose your medium, and let our artists create a
                    lasting memorial of your personal expression.
                </p>
                <div className="w-full bg-navy-800 rounded-lg shadow-lg p-6 sm:p-8">
                    <NewOrderForm />
                </div>
            </main>

            <footer className="w-full border-t border-gold-600/30 py-4 bg-navy-800">
                <div className="w-full max-w-4xl mx-auto text-center text-gold-400">
                    © 2024 Tattoo Memorials. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
