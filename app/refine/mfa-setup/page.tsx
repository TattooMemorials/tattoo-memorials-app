"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function EnableMFA() {
    const [factorId, setFactorId] = useState("");
    const [qr, setQR] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClient();

    const onEnrolled = () => {
        window.location.href = "/refine/memoriam-orders";
    };

    const onCancelled = () => {
        window.location.href = "/refine/memoriam-orders";
    };

    const onEnableClicked = async () => {
        setError("");
        setIsLoading(true);
        try {
            const challenge = await supabase.auth.mfa.challenge({ factorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challenge.data.id,
                code: verifyCode,
            });
            if (verify.error) throw verify.error;

            onEnrolled();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const { data, error } = await supabase.auth.mfa.enroll({
                    factorType: "totp",
                });
                if (error) throw error;

                setFactorId(data.id);
                setQR(data.totp.qr_code);
            } catch (err: any) {
                setError(err.message);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Enable Multi-Factor Authentication
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div
                            className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                            role="alert"
                        >
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {qr && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Scan this QR code with your authenticator app
                            </label>
                            <img src={qr} alt="QR Code" className="mx-auto" />
                        </div>
                    )}

                    <div className="mb-6">
                        <label
                            htmlFor="verifyCode"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Enter the code from your authenticator app
                        </label>
                        <input
                            type="text"
                            id="verifyCode"
                            value={verifyCode}
                            onChange={(e) =>
                                setVerifyCode(e.target.value.trim())
                            }
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="000000"
                        />
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onCancelled}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onEnableClicked}
                            disabled={isLoading || verifyCode.length !== 6}
                            className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ml-2 ${
                                isLoading || verifyCode.length !== 6
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            {isLoading ? "Enabling..." : "Enable MFA"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
