// DashboardResourcePage.jsx
"use client";

import { useEffect, useState } from "react";
import { getResourceById } from "../../../actions/resources";
import Image from "next/image";
import { getUserData } from "@/app/actions/user";
import { redirect, useRouter } from "next/navigation";

const DashboardResourcePage = ({ params }) => {
  let router = useRouter();
  const [resource, setResource] = useState({});

  const [currentUser, setCurrentUser] = useState({});

  if (
    currentUser.userType === "user" ||
    currentUser.userType === "Admin" ||
    currentUser.userType === "SuperAdmin"
  ) {
    redirect("/NoAccess");
  }

  async function fetchData() {
    const fetchedResource = await getResourceById(params.resourceId);
    setResource(fetchedResource);
  }

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUserData();
      setCurrentUser(fetchedUser);
    }
    fetchUser();
    fetchData();
  }, [params.resourceId]);

  return (
    <div className="container mx-auto p-8 border border-gray-300 rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{resource.name}</h1>
      </div>

      <div className="mb-8">
        {resource.images && resource.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {resource.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.blob || image}
                  alt={`${resource.name} Image`}
                  width={200} // Adjust the size as needed
                  height={200} // Adjust the size as needed
                  className="rounded-full mb-4 mx-auto"
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
            alt="Default Image"
            width={200} // Adjust the size as needed
            height={200} // Adjust the size as needed
            className="rounded-full mb-4 mx-auto"
          />
        )}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p>{resource.description}</p>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/resource/${resource.organisationId}/${resource.id}/edit`
            )
          }
          className=" m-2 px-5 py-2 bg-blue-500"
        >
          Edit Resource
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>{resource.contact}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(resource.schedule || {}).map(([day, timeSlots]) => (
            <div key={day} className="p-4 bg-blue-500 text-white rounded-md">
              <h3 className="text-lg font-semibold mb-2">{day}</h3>
              {timeSlots.length > 0 ? (
                <ul>
                  {timeSlots.map((timeSlot, index) => (
                    <li key={index}>{timeSlot}</li>
                  ))}
                </ul>
              ) : (
                <p>No Schedule</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold mb-2">Reservations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resource.reservations && resource.reservations.length > 0 ? (
            resource.reservations.map((reservation) => (
              <div
                key={reservation.reservationId}
                className="p-4 bg-green-500 text-white rounded-md"
              >
                <h3 className="text-lg font-semibold mb-2">Reservation</h3>
                <p>
                  Start Time:{" "}
                  {new Date(
                    reservation.startTime.seconds * 1000
                  ).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p>No Reservations</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardResourcePage;
