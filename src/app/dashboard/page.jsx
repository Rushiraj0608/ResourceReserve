"use client";

import {
  getOrganizationsByAdminId,
  getOrganizations,
  deleteOrganizationById,
} from '../actions/organizations';
import { getResourcesByManagedByUserId } from "../actions/resources";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import OrganizationCard from "../components/ui/OrganizationCard";
import ResourceCard from "../components/ui/ResourceCard";
import { getUserData } from "../actions/user";

const DashboardPage = ({}) => {
  // let currentUser = {
  //   id: "GVJ7cgGfuEYDyPQr7erY",
  //   userType: "SuperAdmin",
  // };

  const [organizations, setOrganizations] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const handleDelete = async (organizationId) => {
    try {
      await deleteOrganizationById(organizationId);
      fetchData();
    } catch (error) {
      console.error("Error deleting organization:", error);
    }
  };

  async function fetchData() {
    try {
      if (currentUser.userType === "Admin") {
        const organizations = await getOrganizationsByAdminId(currentUser.id);
        setOrganizations(organizations);
      }

      if (currentUser.userType === "SuperAdmin") {
        const organizations = await getOrganizations();
        setOrganizations(organizations);
      }

      if (currentUser.userType === "Manager") {
        const fetchedResources = await getResourcesByManagedByUserId(
          currentUser.id
        );
        setResources(fetchedResources);
        console.log(fetchedResources);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUserData();
      setCurrentUser(fetchedUser);
    }

    fetchUser();
    fetchData();
  }, [currentUser.id]);

  if (currentUser.userType === "user") {
    redirect("/NoAccess");
  }

  return (
    <div className="container mx-auto p-4">
      {currentUser.userType === "SuperAdmin" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Organizations</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {organizations.map((organization) => (
              <ul key={organization.id}>
                <OrganizationCard
                  organization={organization}
                  onDelete={handleDelete}
                  userType={currentUser.userType}
                />
              </ul>
            ))}
          </div>
        </div>
      )}

      {currentUser.userType === "Admin" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Your Organizations</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {organizations.map((organization) => (
              <ul key={organization.id}>
                <OrganizationCard
                  organization={organization}
                  onDelete={handleDelete}
                  userType={currentUser.userType}
                />
              </ul>
            ))}
          </div>
        </div>
      )}

      {currentUser.userType === "Manager" && (
        <div>
          <h1 className="text-3xl font-bold mb-6">Resources</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map((resource) => (
              <ul key={resource.id}>
                <ResourceCard
                  resource={resource}
                  userType={currentUser.userType}
                />
              </ul>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
