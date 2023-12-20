"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateUserData,
  checkIfUserProfileIsComplete,
  checkUsername,
} from "@/app/actions/user";

export default function CompleteProfile() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    location: "",
    username: "",
  });

  const [error, setError] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    location: "",
    username: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function checkProfile() {    
      const isUserProfileComplete = await checkIfUserProfileIsComplete();
      if (isUserProfileComplete) {
        router.push("/user/profile");
      }
    }
    checkProfile();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let formIsValid = true;

    const usernameExists = await checkUsername(formData.username);
    if (usernameExists) {
      setError({ ...error, username: "Username already exists" });
      formIsValid = false;
    }

    const currentDate = new Date();
    const dob = new Date(formData.dateOfBirth);
    const age = currentDate.getFullYear() - dob.getFullYear();
    if (age < 13) {
      setError({ ...error, dateOfBirth: "Must be at least 13 years old" });
      formIsValid = false;
    }

    for (const key in formData) {
      if (formData[key].trim() === "") {
        setError({ ...error, [key]: "This field is required" });
        formIsValid = false;
      }
    }

    if (formIsValid) {
      await updateUserData({
        ...formData,
        isProfileComplete: true,
        userType: "user",
      });
      router.push("/user/profile");
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl text-center text-black font-bold mb-4">
          Complete Profile
        </h1>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                error.firstName ? "border-red-500" : ""
              }`}
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            {error.firstName && (
              <p className="text-red-500 text-sm mt-2">{error.firstName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                error.lastName ? "border-red-500" : ""
              }`}
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            {error.lastName && (
              <p className="text-red-500 text-sm mt-2">{error.lastName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="dateOfBirth"
            >
              Date of Birth
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                error.dateOfBirth ? "border-red-500" : ""
              }`}
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            {error.dateOfBirth && (
              <p className="text-red-500 text-sm mt-2">{error.dateOfBirth}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="location"
            >
              Location
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                error.location ? "border-red-500" : ""
              }`}
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            {error.location && (
              <p className="text-red-500 text-sm mt-2">{error.location}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                error.username ? "border-red-500" : ""
              }`}
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {error.username && (
              <p className="text-red-500 text-sm mt-2">{error.username}</p>
            )}
          </div>
          <div className="mb-4">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white rounded-md w-full py-2 ${
                isSubmitting ||
                Object.values(formData).some((value) => value.trim() === "")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              type="submit"
              disabled={
                isSubmitting ||
                Object.values(formData).some((value) => value.trim() === "")
              }
            >
              Complete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
