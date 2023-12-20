// AllOrganizationsPage.jsx

"use client";

import Link from "next/link";

import {
  getOrganizationsWhereUserIsMember,
  getOrganizationsWhereUserIsNotMember,
  addRequestToOrganization,
  removeMemberFromOrganization,
} from "../actions/organizations";
import { useState, useEffect } from "react";
import OrganizationCard from "../components/ui/OrganizationCard";
import { redirect } from "next/navigation";
import { getUserData } from "../actions/user";

const AllOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [notInOrganizations, setNotInOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);

  // useEffect(() => {
  //   async function fetchUser() {
  //     const fetchedUser = await getUserData();
  //     setCurrentUser(fetchedUser);
  //   }

  //   async function fetchData() {
  //     const fetchedOrganizations = await getOrganizationsWhereUserIsMember(
  //       currentUser.id
  //     );

  //     const fetchedNotInOrganizations =
  //       await getOrganizationsWhereUserIsNotMember(currentUser.id);

  //     setOrganizations(fetchedOrganizations);
  //     setNotInOrganizations(fetchedNotInOrganizations);
  //   }

  //   fetchUser();
  //   fetchData();
  //   setLoading(false);
  // }, [currentUser.id]);
  async function fetchUserAndData() {
    try {
      const fetchedUser = await getUserData();
      setCurrentUser(fetchedUser);
      console.log(fetchedUser.id);

      console.log("Insie");
      // Only fetch data if the user ID is defined
      const fetchedOrganizations = await getOrganizationsWhereUserIsMember(
        fetchedUser.id
      );

      console.log(fetchedOrganizations);

      const fetchedNotInOrganizations =
        await getOrganizationsWhereUserIsNotMember(fetchedUser.id);

      setOrganizations(fetchedOrganizations);
      setNotInOrganizations(fetchedNotInOrganizations);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  }
  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     console.log(currentUser.id);

    //     const fetchedOrganizations = await getOrganizationsWhereUserIsMember(
    //       currentUser.id
    //     );

    //     const fetchedNotInOrganizations =
    //       await getOrganizationsWhereUserIsNotMember(currentUser.id);

    //     setOrganizations(fetchedOrganizations);
    //     setNotInOrganizations(fetchedNotInOrganizations);
    //   } catch (error) {
    //     console.error("Error fetching organizations:", error);
    //   }
    // };

    fetchUserAndData();
  }, []);

  const handleLeaveOrganization = async (organizationId) => {
    try {
      await removeMemberFromOrganization(organizationId, currentUser.id);
      await fetchUserAndData();
    } catch (error) {
      console.error("Error leaving organization:", error);
    }
  };

  const handleJoinOrganization = async (organizationId) => {
    try {
      await addRequestToOrganization(organizationId, currentUser.id);
      await fetchUserAndData();
    } catch (error) {
      console.error("Error joining organization:", error);
    }
  };

  // console.log(currentUser)

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Organizations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {organizations.map((organization) => (
            <div key={organization.id} className="relative">
              <OrganizationCard
                organization={organization}
                userType={currentUser.userType}
              />
              <div className="flex items-center justify-center mt-2">
                <button
                  onClick={() => handleLeaveOrganization(organization.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Leave Organization
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Other Organizations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notInOrganizations.map((organization) => (
            <div key={organization.id} className="relative">
              <OrganizationCard
                organization={organization}
                userType={currentUser.userType}
              />
              <div className="flex items-center justify-center mt-2">
                <button
                  onClick={() => handleJoinOrganization(organization.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Request to Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllOrganizationsPage;
