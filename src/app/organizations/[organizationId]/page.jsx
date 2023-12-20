"use client";

import { getOrganizationById } from "../../actions/organizations";
import { useState, useEffect } from "react";
import { getResourceById } from "../../actions/resources";
import Image from "next/image";
import Link from "next/link";

const OrganizationPage = ({ params }) => {
  const [organization, setOrganization] = useState({});
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [organizationId, setOrganizationId] = useState(params.organizationId);

  console.log(typeof params.organizationId);

  useEffect(() => {
    async function fetchData() {
      const fetchedOrganization = await getOrganizationById(
        params.organizationId
      );

      const fetchedResources = await Promise.all(
        fetchedOrganization.resources.map((resource) =>
          getResourceById(resource)
        )
      );

      setLoading(false);
      setOrganization(fetchedOrganization);
      setResources(fetchedResources);
      console.log(fetchedOrganization.managers);
    }
    fetchData();
  }, [organizationId]);
  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="container mx-auto p-8 border border-gray-300 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <p className="text-lg">Contact: {organization.contact}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold my-4">Resources:</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {resources.map((resource) => (
              <li key={resource.id} className="border p-4 rounded-md">
                <div className="flex flex-col items-center">
                  {resource.images && resource.images.length > 0 ? (
                    <Image
                      src={resource.images[0]}
                      alt={`${resource.name} Image`}
                      width={96}
                      height={96}
                      className="rounded-full mb-4"
                    />
                  ) : (
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg"
                      alt="Default Image"
                      width={96}
                      height={96}
                      className="rounded-full mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">
                    {resource.name}
                  </h3>
                  <p className="text-sm">{resource.description}</p>
                  <Link href={`/resource/${organizationId}/${resource.id}`}>View Resource</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
};

export default OrganizationPage;
