"use client";

import {
  getOrganizationById,
  removeRequestFromOrganization,
  addMemberToOrganization,
  removeMemberFromOrganization,
} from "../../../actions/organizations";
import { getResourceById } from "../../../actions/resources";
import { getUserById } from "../../../actions/users";
import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { getUserData } from "@/app/actions/user";
import { Router } from "next/router";
import Link from "next/link";

const organizationPage = ({ params }) => {
  const router = useRouter();
  const [organization, setOrganization] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  // const currentUser = {
  //   id: "GVJ7cgGfuEYDyPQr7erY",
  //   userType: "Admin",
  // };

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUserData();
      setCurrentUser(fetchedUser);
    }
    fetchUser();
    fetchData();
  }, [params.organizationId]);

  async function fetchData() {
    const fetchedOrganization = await getOrganizationById(
      params.organizationId
    );
    setLoading(false);

    const users = await Promise.all(
      fetchedOrganization.requests.map((user) => getUserById(user))
    );

    const members = await Promise.all(
      fetchedOrganization.members.map((user) => getUserById(user))
    );

    const fetchedResources = await Promise.all(
      fetchedOrganization.resources.map((resource) => getResourceById(resource))
    );

    const fetchedManagers = await Promise.all(
      fetchedOrganization.managers.map((manager) => getUserById(manager))
    );
    const fetchedAdmins = await Promise.all(
      fetchedOrganization.admins.map((admin) => getUserById(admin))
    );

    setManagers(fetchedManagers);
    setAdmins(fetchedAdmins);
    setUsers(users);
    setMembers(members);
    setOrganization(fetchedOrganization);
    setResources(fetchedResources);
    console.log(fetchedOrganization);
  }

  const handleApproveRequest = async (userId) => {
    try {
      // Remove the user from the requests list
      await removeRequestFromOrganization(params.organizationId, userId);

      // Add the user to the organization's members
      await addMemberToOrganization(params.organizationId, userId);

      await fetchData();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleDenyRequest = async (userId) => {
    try {
      // Remove the user from the requests list without approving
      await removeRequestFromOrganization(params.organizationId, userId);

      await fetchData();
    } catch (error) {
      console.error("Error denying request:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      // Remove the user from the organization's members
      await removeMemberFromOrganization(params.organizationId, userId);

      await fetchData();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  if (
    currentUser.userType === "user" ||
    currentUser.userType === "Manager" ||
    currentUser.userType === "SuperAdmin"
  ) {
    redirect("/NoAccess");
  }

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="container mx-auto p-8 border border-gray-300 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <h3 className="text-xl font-bold">Email: {organization.email}</h3>
          <h3 className="text-xl font-bold">Contact: {organization.contact}</h3>
          <button
            type="button"
            onClick={() => {
              router.push(`/organisation/${params.organizationId}/edit`);
            }}
          >
            Edit organization
          </button>
        </div>
        {/*
        <div className="mb-8 flex justify-center">
          {organization.image ? (
            <Image
              src={organization.image}
              alt={`${organization.name} Image`}
              width={200} // Adjust the size as needed
              height={200} // Adjust the size as needed
              className="rounded-full mb-4"
            />
          ) : (
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
              alt="Default Image"
              width={200} // Adjust the size as needed
              height={200} // Adjust the size as needed
              className="rounded-full mb-4"
            />
          )}
        </div>
          */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Managers</h2>
          <ul className="space-y-4">
            {organization.managers?.map((manager) => (
              <li key={manager} className="flex items-center justify-between">
                <p>
                  {manager.firstName} {manager.lastName}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Admins</h2>
          <ul className="space-y-4">
            {organization.admins?.map((admin) => (
              <li key={admin} className="flex items-center justify-between">
                <p>
                  {admin.firstName} {admin.lastName}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Resources</h2>
          <ul className="space-y-4">
            {resources?.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between"
              >
                <p>
                  <Link href={`/dashboard/managerResources/${resource.id}`}>
                    {resource.name}
                  </Link>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/resource/${organization.id}/${resource.id}/edit`
                    )
                  }
                >
                  Edit Resource
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Requests from users to join the organization
          </h2>
          {users.length !== 0 ? (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                  <p>
                    {user.firstName} {user.lastName}
                  </p>
                  <div>
                    <button
                      onClick={() => handleApproveRequest(user.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDenyRequest(user.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No join requests</p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">
            All members of this organization
          </h2>
          {members.length !== 0 ? (
            <ul className="space-y-4">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <p>
                    {member.firstName} {member.lastName}
                  </p>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No members</p>
          )}
        </div>
      </div>
    );
  }
};

export default organizationPage;
