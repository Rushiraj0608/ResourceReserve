'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl: '/user/complete-profile',
      });

      router.push('/user/complete-profile');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl text-center text-black font-bold mb-4">Sign In</h1>
        <form className="w-full" onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white rounded-md w-full py-2"
              type="submit"
            >
              Sign in with Email
            </button>
          </div>
        </form>
        <hr className="mb-4 border-t border-gray-300" />
        <div className="flex flex-col space-y-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white rounded-md py-2"
            onClick={() => {
              signIn('google', { callbackUrl: '/user/complete-profile' });
            }}
          >
            Sign in with Google
          </button>

          <button
            className="bg-green-500 hover:bg-green-700 text-white rounded-md py-2"
            onClick={handleSignUp}
          >
            Register as a New User
          </button>
        </div>
      </div>
    </div>
  );
}
