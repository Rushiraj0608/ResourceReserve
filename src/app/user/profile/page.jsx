"use client";

import { useEffect, useState } from "react";
import { getUserData, checkIfUserProfileIsComplete } from "@/app/actions/user";
import Image from "next/image";
import Loading from "@/app/components/ui/Loading";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getUserData();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function checkProfile() {
      const isUserProfileComplete = await checkIfUserProfileIsComplete();
      if (!isUserProfileComplete) {
        router.push("/user/complete-profile");
      }
    }
    checkProfile();
  }, [router]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl text-center text-black font-bold mb-4">
          User Profile
        </h1>
        <div className="relative w-40 h-40 rounded-full overflow-hidden">
          <Image
            src={
              user && user.image
                ? user.image
                : "https://upload.wikimedia.org/wikipedia/commons/e/e0/Userimage.png"
            }
            alt="user"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              First Name
            </label>
            <p className="border rounded w-full py-2 px-3 text-gray-700">
              {user ? user.firstName : ""}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Last Name
            </label>
            <p className="border rounded w-full py-2 px-3 text-gray-700">
              {user ? user.lastName : ""}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <p className="border rounded w-full py-2 px-3 text-gray-700">
              {user ? user.email : ""}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <p className="border rounded w-full py-2 px-3 text-gray-700">
              {user ? user.username : ""}
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Location
            </label>
            <p className="border rounded w-full py-2 px-3 text-gray-700">
              {user ? user.location : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
