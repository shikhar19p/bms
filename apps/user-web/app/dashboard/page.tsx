// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth'; // A custom hook for auth context/state
import { toast } from "sonner";

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setTokens, setUser, isLoadingUser } = useAuth(); // Assuming you have an auth context

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken'); // If you decided to pass refresh token this way (less secure)
        const userData = searchParams.get('user'); // If you decided to pass user data this way

        if (accessToken) {
            // Store the access token (e.g., in localStorage, Zustand, Redux)
            localStorage.setItem('accessToken', accessToken);

            // You might need to make another API call to get user details
            // or decode the JWT if user data is within payload
            if (userData) {
                try {
                    const parsedUser = JSON.parse(decodeURIComponent(userData));
                    setUser(parsedUser); // Update your auth context
                } catch (e) {
                    console.error("Failed to parse user data from URL:", e);
                }
            }

            // Clear query params to keep URL clean (optional)
            // router.replace('/dashboard'); // Use replace to avoid adding to history

            toast({
                title: "Login Successful",
                description: "Welcome back!",
                variant: "success",
            });

            // Redirect away from this page if you want (e.g., to `/`)
            // router.replace('/');
        } else if (!isLoadingUser) {
            // If no accessToken and not loading user (meaning not already logged in),
            // redirect to login
            // router.replace('/login');
        }
    }, [searchParams, router, setTokens, setUser, isLoadingUser]);


    if (isLoadingUser) {
        return <div className="flex items-center justify-center min-h-screen">Loading user...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-4">Welcome! You are logged in.</p>
            {/* Display user info if available from context */}
            {/* <p>Hello, {user?.name || user?.email}</p> */}
            <Button onClick={() => {
                // Clear tokens and redirect to login
                localStorage.removeItem('accessToken');
                // You'd also call a backend logout endpoint to clear refresh token cookie
                router.push('/login');
            }} className="mt-4">
                Logout
            </Button>
        </div>
    );
}