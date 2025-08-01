// components/auth/google-sign-in-button.tsx
'use client'; // For client-side interactivity in Next.js

import { Button } from "@workspace/ui/components/button";
// Assuming you have an icons component (e.g., for Google icon)
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
 // Shadcn toast

export function GoogleSignInButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    // Handle potential backend redirects for linking an account
    useEffect(() => {
        const message = searchParams.get('message');
        const redirectTo = searchParams.get('redirectTo'); // From backend's linking flow

        if (message && redirectTo) {
            toast.warning('Account Linking is required. Please link your account.');
            // You might want to store linkingToken in localStorage/sessionStorage
            // and then navigate to the specific linking page
            const linkingToken = searchParams.get('linkingToken'); // If backend passes it
            if (linkingToken) {
                // Example: store and redirect to a specific linking page
                localStorage.setItem('linkingToken', linkingToken);
                router.push(redirectTo); // Redirect to your /link-account page
            } else {
                // If no token, just redirect to the suggested page
                router.push(redirectTo);
            }
        }
    }, [searchParams, router]);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            // Initiate the OAuth flow by redirecting to your backend's Google auth endpoint
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/google`;
            // The browser will be redirected to Google, then back to your backend callback,
            // and finally to your frontend's dashboard/success page.
        } catch (error) {
            console.error("Failed to initiate Google sign-in:", error);
            toast.error("Failed to initiate Google sign-in. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
            {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Icons.google className="mr-2 h-4 w-4" /> // Replace with your actual Google icon
            )}
            Sign in with Google
        </Button>
    );
}