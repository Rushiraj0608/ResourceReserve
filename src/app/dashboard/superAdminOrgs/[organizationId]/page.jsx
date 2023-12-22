"use client";

import { useEffect, useState } from "react";
import {
  getOrganizationById,
  deleteOrganizationById,
} from "../../../actions/organizations";
import { redirect } from "next/navigation";
import { getUserData } from "@/app/actions/user";
import Link from "next/link";

const SuperAdminOrgPage = ({ params }) => {
  // const currentUser = {
  //   id: "GVJ7cgGfuEYDyPQr7erY",
  //   userType: "SuperAdmin",
  // };

  const [currentUser, setCurrentUser] = useState({});

  if (
    currentUser.userType === "admin" ||
    currentUser.userType === "user" ||
    currentUser.userType === "manager"
  ) {
    redirect("/NoAcess"); // Redirect to the custom 403 Forbidden page
  }
  const [organization, setOrganization] = useState({});

  async function fetchData() {
    const fetchedOrganization = await getOrganizationById(
      params.organizationId
    );
    setOrganization(fetchedOrganization);
    console.log(fetchedOrganization);
  }

  useEffect(() => {
    async function fetchUser() {
      const fetchedUser = await getUserData();
      setCurrentUser(fetchedUser);
    }
    fetchUser();
    fetchData();
  }, [params.organizationId]);

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <div className="text-2xl text-black font-bold mb-4">
        {organization.name}
      </div>
      <Link className='text-black' href={`/organisation/${params.organizationId}/edit`}>
              Edit Organization
      </Link>
    </div>
  );
};

export default SuperAdminOrgPage;
