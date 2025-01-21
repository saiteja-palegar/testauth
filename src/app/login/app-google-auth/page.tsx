'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserInfo {
    email: string;
    name: string;
    picture: string;
}

interface TokenData {
    access_token: string;
    user: UserInfo;
}

interface GoogleTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    error?: string;
}

declare global {
    interface Window {
        google: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        redirect_uri: string;
                        scope: string;
                        callback: (response: GoogleTokenResponse) => void;
                        prompt?: string;
                        response_type?: string;
                        access_type?: string;
                    }) => {
                        requestAccessToken: () => void;
                    };
                };
            };
        };
    }
}

export default function AppGoogleAuth() {
    const searchParams = useSearchParams();
    const fromDesktopApp = searchParams.get('fromDesktopApp') === 'true';

    useEffect(() => {
        if (!fromDesktopApp) return;

        const initGoogleAuth = async () => {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                redirect_uri: 'https://testauth-opal.vercel.app/auth/callback',
                scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: handleGoogleCallback,
                prompt: 'consent',
                response_type: 'token',
                access_type: 'offline'
            });

            client.requestAccessToken();
        };

        // Add Google's OAuth script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = initGoogleAuth;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // Cleanup
        return () => {
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [fromDesktopApp]);

    const handleGoogleCallback = async (response: GoogleTokenResponse) => {
        if (response.error) {
            console.error('Auth error:', response.error);
            return;
        }

        try {
            // Get user info using the access token
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${response.access_token}`,
                },
            });
            const userInfo: UserInfo = await userInfoResponse.json();

            // Create a token object with all necessary information
            const tokenData: TokenData = {
                access_token: response.access_token,
                user: {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture
                }
            };

            // Show "Open in App" button
            showOpenInAppModal(tokenData);
        } catch (error) {
            console.error('Error getting user info:', error);
        }
    };

    const showOpenInAppModal = (tokenData: TokenData) => {
        // Remove any existing modal
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create and show modal
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg max-w-md w-full mx-4">
          <h2 class="text-2xl font-bold mb-4">Authentication Successful!</h2>
          <p class="mb-2">Welcome, ${tokenData.user.name}</p>
          <p class="mb-6">Click below to open the app:</p>
          <button id="openAppBtn" class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Open in 10XR Sales Assistant
          </button>
        </div>
      </div>
    `;
        document.body.appendChild(modal);

        // Add click handler to button
        const openAppBtn = document.getElementById('openAppBtn');
        if (openAppBtn) {
            openAppBtn.onclick = () => {
                const encodedToken = encodeURIComponent(JSON.stringify(tokenData));
                window.location.href = `10xr://auth/callback?token=${encodedToken}`;
            };
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg">Connecting to Google...</p>
            </div>
        </div>
    );
}