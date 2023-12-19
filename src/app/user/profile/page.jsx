"use client";

import { useEffect, useState } from "react";
import { getUserData } from "@/app/actions/user";
import Image from "next/image";
import Loading from "@/app/components/ui/Loading";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userData = await getUserData();
      setUser(userData);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <Image
        src={
          user.image ||
          "https://upload.wikimedia.org/wikipedia/commons/e/e0/Userimage.png"
        }
        alt="user"
        width={128}
        height={128}
        className="bg-white rounded-full mb-4"
      />

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <p className="border rounded w-full py-2 px-3 text-gray-700">
            {user.name}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <p className="border rounded w-full py-2 px-3 text-gray-700">
            {user.email}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Location
          </label>
          <p className="border rounded w-full py-2 px-3 text-gray-700">
            {user.location}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Date of Birth
          </label>
          <p className="border rounded w-full py-2 px-3 text-gray-700">
            {user.dateOfBirth}
          </p>
        </div>
      </div>
    </div>
  );
}