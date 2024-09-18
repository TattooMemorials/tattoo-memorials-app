"use client";

import { createClient } from "@/utils/supabase/client";
import { Factor } from "@supabase/auth-js";
import { useEffect, useState } from "react";

export default function MFASetup() {
    const [factors, setFactors] = useState<Factor[]>([]);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [needsReauth, setNeedsReauth] = useState(false);
    const [factorId, setFactorId] = useState("");
    const [qr, setQR] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [reauthCode, setReauthCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchFactors();
    }, []);

    const fetchFactors = async () => {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) {
            setError(error.message);
        } else {
            setFactors(data.totp || []);
        }
    };

    const startSetup = async () => {
        setIsSettingUp(true);
        setError("");
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: "totp",
            });
            if (error) {
                if (error.message.includes("AAL2 required")) {
                    setNeedsReauth(true);
                } else {
                    throw error;
                }
            } else {
                setFactorId(data.id);
                setQR(data.totp.qr_code);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleReauth = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.challenge({
                factorId: factors[0].id,
            });
            if (error) throw error;

            const { data: verifyData, error: verifyError } =
                await supabase.auth.mfa.verify({
                    factorId: factors[0].id,
                    challengeId: data.id,
                    code: reauthCode,
                });
            if (verifyError) throw verifyError;

            // If re-authentication is successful, try to enroll again
            const { data: enrollData, error: enrollError } =
                await supabase.auth.mfa.enroll({
                    factorType: "totp",
                });
            if (enrollError) throw enrollError;

            setFactorId(enrollData.id);
            setQR(enrollData.totp.qr_code);
            setNeedsReauth(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
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

            await fetchFactors();
            setIsSettingUp(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onCancelled = () => {
        setIsSettingUp(false);
        setNeedsReauth(false);
        setQR("");
        setVerifyCode("");
        setReauthCode("");
        setError("");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Multi-Factor Authentication
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

                    {!isSettingUp && (
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                Existing MFA Factors
                            </h3>
                            {factors.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {factors.map((factor) => (
                                        <li key={factor.id} className="py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {factor.friendly_name}
                                                    </span>
                                                    <span
                                                        className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            factor.status ===
                                                            "verified"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {factor.status}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {factor.factor_type}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No MFA factors set up yet.
                                </p>
                            )}
                            <button
                                onClick={startSetup}
                                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Set Up New MFA Factor
                            </button>
                        </div>
                    )}

                    {isSettingUp && needsReauth && (
                        <div>
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                Re-authentication Required
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                For security reasons, please enter your current
                                MFA code to set up an additional factor.
                            </p>
                            <input
                                type="text"
                                value={reauthCode}
                                onChange={(e) =>
                                    setReauthCode(e.target.value.trim())
                                }
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-4"
                                placeholder="Enter MFA Code"
                            />
                            <button
                                onClick={handleReauth}
                                disabled={isLoading || reauthCode.length !== 6}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    isLoading || reauthCode.length !== 6
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {isLoading ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    )}

                    {isSettingUp && !needsReauth && (
                        <div>
                            {qr && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Scan this QR code with your
                                        authenticator app
                                    </label>
                                    <img
                                        src={qr}
                                        alt="QR Code"
                                        className="mx-auto"
                                    />
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
                                    disabled={
                                        isLoading || verifyCode.length !== 6
                                    }
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
                    )}
                </div>
            </div>
        </div>
    );
}
