import { Suspense } from 'react';
import AuthCallbackContent from './AuthCallbackContent';

export default function AuthCallback() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg">Loading...</p>
                    </div>
                </div>
            }
        >
            <AuthCallbackContent />
        </Suspense>
    );
}