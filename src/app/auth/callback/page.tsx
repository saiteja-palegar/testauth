'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            // Redirect to desktop app with token
            window.location.href = `10xr://auth/callback?token=${token}`;
        }
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg">Redirecting back to app...</p>
            </div>
        </div>
    );
}