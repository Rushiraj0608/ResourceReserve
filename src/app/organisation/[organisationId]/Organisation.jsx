"use client";
import { useState } from "react";
import Link from "next/link";
export const Organisation = (props) => {
  console.log(props.organisation);
  const [organisation, setOrganisation] = useState(props.organisation);
  return (
    <>
      <div className="bg-white text-black w-100 h-screen ">
        <div>
          <h1>Organisation Name:{organisation.name} </h1>
          <p>
            <Link href={`/organisation/${organisation.id}/edit`}>
              Edit Organisation
            </Link>
          </p>
          <p>Email : {organisation.email}</p>
          <p>Contact : {organisation.contact}</p>
          <div className="bg-slate-400 w-3/5 p-5 ">
            Created By :
            <p>
              Name :
              {`${organisation.createdBy.firstName} ${organisation.createdBy.lastName}`}
            </p>
            <p>Email : {organisation.createdBy.email}</p>
          </div>
          <div className="w-70 bg-slate-500 p-10">
            Resources :
            <div>
              {organisation.resources.map((resource, index) => (
                <span key={`resources_${organisation.id}_${index}`}>
                  <p>
                    Resource Name :{" "}
                    <Link
                      href={`/resource/${organisation.id}/${resource.resourceId}`}
                    >
                      {resource.resourceName}
                    </Link>
                  </p>
                  <p>Managed By : {resource.managedBy}</p>
                  <p>
                    <Link
                      href={`/resource/${organisation.id}/${resource.resourceId}/edit`}
                    >
                      Edit Resource
                    </Link>
                  </p>
                </span>
              ))}
              <Link href={`/resource/${organisation.id}/create`}>
                Create Resource
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
