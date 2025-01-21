'use client';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Types
interface GoogleAuthResponse {
    error?: string;
    access_token: string;
}

interface UserInfo {
    email: string;
    name: string;
    picture: string;
}

interface TokenData {
    access_token: string;
    user: {
        email: string;
        name: string;
        picture: string;
    };
}

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Connecting to Google...</p>
        </div>
    </div>
);

// Main component content
const GoogleAuthContent = () => {
    const searchParams = useSearchParams();
    const fromDesktopApp = searchParams.get('fromDesktopApp') === 'true';

    useEffect(() => {
        if (!fromDesktopApp) return;

        const initGoogleAuth = async () => {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: handleGoogleCallback,
            });

            client.requestAccessToken();
        };

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = initGoogleAuth;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // Cleanup function
        return () => {
            const scriptElement = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (scriptElement) {
                scriptElement.remove();
            }
        };
    }, [fromDesktopApp]);

    const handleGoogleCallback = async (response: GoogleAuthResponse) => {
        if (response.error) {
            console.error('Auth error:', response.error);
            return;
        }

        try {
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${response.access_token}`,
                },
            });

            if (!userInfoResponse.ok) {
                throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
            }

            const userInfo: UserInfo = await userInfoResponse.json();

            const tokenData: TokenData = {
                access_token: response.access_token,
                user: {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture
                }
            };

            showOpenInAppModal(tokenData);
        } catch (error) {
            console.error('Error getting user info:', error);
        }
    };

    const showOpenInAppModal = (tokenData: TokenData) => {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div class="bg-white p-8 rounded-lg max-w-md w-full mx-4">
                    <h2 class="text-2xl font-bold mb-4">Authentication Successful!</h2>
                    <p class="mb-6">Click below to open the app:</p>
                    <button id="openAppBtn" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Open in 10XR Sales Assistant
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const openAppBtn = document.getElementById('openAppBtn');
        if (openAppBtn) {
            openAppBtn.onclick = () => {
                const encodedToken = encodeURIComponent(JSON.stringify(tokenData));
                window.location.href = `10xr://auth/callback?token=${encodedToken}`;
            };
        }
    };

    return <LoadingSpinner />;
};

// Main component with Suspense boundary
export default function AppGoogleAuth() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <GoogleAuthContent />
        </Suspense>
    );
}

// Type declaration for Google OAuth
declare global {
    interface Window {
        google: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: GoogleAuthResponse) => void;
                    }) => {
                        requestAccessToken: () => void;
                    };
                };
            };
        };
    }
}