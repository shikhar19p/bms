// app/settings/page.tsx (Example)
'use client';

import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
// Assuming you have an auth context to update user state after unlinking
// import { useAuth } from '@/hooks/use-auth';


export default function SettingsPage() {
    const [isUnlinking, setIsUnlinking] = useState(false);
    // const { user, setUser } = useAuth(); // If you have auth context

    // Check if Google is linked (you'd get this from your user object, e.g., user.googleId)
    const isGoogleLinked = true; // Replace with actual check from your user data

    const handleUnlinkGoogle = async () => {
        setIsUnlinking(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error("Not authenticated.");
            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/unlink-google-account`,
                {}, // No body needed for unlink
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true,
                }
            );

            toast.success("Google account unlinked successfully.");
            // Update user state in your auth context to reflect googleId: null
            // setUser(prevUser => ({ ...prevUser, googleId: null }));

        } catch (error: any) {
            console.error("Error unlinking Google account:", error);
            const errorMessage = error.response?.data?.message || "Failed to unlink Google account.";
           toast.error(errorMessage);
        } finally {
            setIsUnlinking(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Connected Accounts</h2>
                {isGoogleLinked ? (
                    <div className="flex items-center justify-between p-4 border rounded-md">
                        <span>Google Account Connected</span>
                        <Button
                            variant="outline"
                            onClick={handleUnlinkGoogle}
                            disabled={isUnlinking}
                        >
                            {isUnlinking ? (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Unlink Google"
                            )}
                        </Button>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No Google account linked.</p>
                )}
                {/* You'd also have a "Set Password" section if `user.password` is null */}
                {/* <Button>Set Password</Button> */}
            </section>
        </div>
    );
}