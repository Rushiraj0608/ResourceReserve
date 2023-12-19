'use client'

import { signIn } from 'next-auth/react'

export default function SignInPage() {
    const handleSignIn = () => {
        signIn('google', { callbackUrl: '/user/complete-profile' });
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-4">Sign In</h1>
            <button
                className="flex items-center bg-blue-500 text-white rounded-md px-4 py-2"
                onClick={handleSignIn}
            >
                Sign in with Google
            </button>
        </div>
    )
}
