"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/app/actions/user";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await registerUser(formData);
      setSuccessMessage("Registration successful! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl text-center text-black font-bold mb-4">
          Register
        </h1>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
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
              required
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
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white rounded-md w-full py-2"
              type="submit"
            >
              Register
            </button>
          </div>
        </form>
        <hr className="mb-4 border-t border-gray-300" />
        <div className="flex flex-col space-y-4">
          <button
            className="bg-green-500 hover:bg-green-700 text-white rounded-md py-2"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
