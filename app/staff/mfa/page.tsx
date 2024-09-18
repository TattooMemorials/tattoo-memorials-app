// app/staff/mfa/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Button, Input, Form, Alert, Typography } from "antd";
import { createClient } from "@/utils/supabase/client";
import { Factor } from "@supabase/auth-js";

const { Title } = Typography;

export default function MFA() {
    const [token, setToken] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const [factors, setFactors] = useState<Factor[]>([]);
    const [selectedFactor, setSelectedFactor] = useState<string | null>(null);

    useEffect(() => {
        const fetchFactors = async () => {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) {
                setError(error.message);
                return;
            }
            const totpFactors = data.totp || [];
            setFactors(totpFactors);
            if (totpFactors.length > 0) {
                setSelectedFactor(totpFactors[0].id);
            } else {
                setError("No TOTP factors available.");
            }
        };

        fetchFactors();
    }, [supabase]);

    const onFinish = async () => {
        if (!selectedFactor) {
            setError("No MFA factors selected.");
            return;
        }

        try {
            // Initiate the challenge
            const { data: challengeData, error: challengeError } =
                await supabase.auth.mfa.challenge({
                    factorId: selectedFactor,
                });

            if (challengeError) {
                setError(challengeError.message);
                return;
            }

            const challengeId = challengeData.id;

            // Verify the MFA code
            const { data: verifyData, error: verifyError } =
                await supabase.auth.mfa.verify({
                    factorId: selectedFactor,
                    challengeId,
                    code: token,
                });

            if (verifyError) {
                setError(verifyError.message);
                return;
            }

            if (verifyData) {
                // Refresh the session
                const { data: sessionData, error: sessionError } =
                    await supabase.auth.getSession();
                if (sessionError) {
                    setError(sessionError.message);
                    return;
                }

                // Redirect to the protected route
                window.location.href = "/staff/memoriam-orders";
            }
        } catch (err: any) {
            setError(err.message);
            setSuccess(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
            <Title level={2}>MFA Verification</Title>
            {error && <Alert message={error} type="error" showIcon />}
            {success && (
                <Alert
                    message="MFA Verified Successfully!"
                    type="success"
                    showIcon
                />
            )}
            <Form layout="vertical" onFinish={onFinish}>
                <Form.Item label="Authentication Code" required>
                    <Input
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter your MFA code"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Verify
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
