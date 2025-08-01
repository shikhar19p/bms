// app/link-account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { toast } from "sonner";
import axios from 'axios'; // Or fetch API

export default function LinkAccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [linkingToken, setLinkingToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('linkingToken') || localStorage.getItem('linkingToken');
        if (tokenFromUrl) {
            setLinkingToken(tokenFromUrl);
            localStorage.removeItem('linkingToken'); // Clear it once read
        } else {
            toast.error("Linking token is missing, please try Google Signin Again");
            router.replace('/login'); // Redirect if no token
        }
    }, [searchParams, router]);

    const handleLinkAccount = async () => {
        if (!linkingToken) {
            toast.error("Linking token is missing.");
            return;
        }

        setIsLoading(true);
        try {
            // You need to send the current user's *active access token*
            // along with the linkingToken to the backend.
            // This assumes the user is already logged in with email/password.
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error("You must be logged in to link accounts.");
            }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/link-google-account`,
                { linkingToken },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true, // Crucial for sending refresh token cookie
                }
            );

            // Backend should return new tokens and user data
            const { accessToken: newAccessToken, user } = response.data;
            localStorage.setItem('accessToken', newAccessToken);
            // Update auth context with new user data and tokens

            toast.success("Google account has been successfully linked.");
            router.replace('/dashboard'); // Or wherever you want to go after linking
        } catch (error: any) {
            console.error("Error linking account:", error);
            const errorMessage = error.response?.data?.message || "Failed to link Google account.";
            toast.error('Linking Failed')
        } finally {
            setIsLoading(false);
        }
    };

    if (!linkingToken) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Link Google Account</CardTitle>
                    <CardDescription>
                        An account with this email already exists. Do you want to link your Google account to it?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        By linking, you will be able to sign in with both your email/password and your Google account.
                    </p>
                    <Button onClick={handleLinkAccount} disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Yes, Link My Account"
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => router.replace('/login')} className="w-full mt-2">
                        No, Go Back to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}