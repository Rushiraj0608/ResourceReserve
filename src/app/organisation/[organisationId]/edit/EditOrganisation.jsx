"use client";
import "./EditOrganisation.css";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { editOrganisationCheck } from "../../../resource/[organisationId]/helperAndComponents/helper";

const EditOrganisation = (props) => {
  // console.log(props.organisation);
  const router = useRouter();
  let [organisation, setOrganisation] = useState(props.organisation);
  let [errors, setErrors] = useState({});
  let [message, setMessage] = useState();

  const disappearing = () => {
    setTimeout(() => {
      setMessage("");
    }, 10000);
  };
  const addAdmin = async () => {
    try {
      let adminEmail = document.getElementById("editOrganisationAdmins").value;

      // adminEmail = emailCheck(adminEmail)

      organisation.admins.map((admin, ind) => {
        if (admin.email == adminEmail) {
          throw { type: "message", data: `this email already an admin` };
        }
      });
      organisation.managers.map((manager) => {
        if (manager.email == adminEmail) {
          throw {
            type: "message",
            data: `this email is already a manager so remove as a manager and add as an admin`,
          };
        }
      });
      setErrors({
        ...errors,
        general:
          "there has been changes in the admins or managers please click save to save the changes",
      });
      let user = await props.getUser(adminEmail);
      let admins = organisation.admins;
      admins = [...admins, user.data];
      setOrganisation({ ...organisation, admins });
      document.getElementById("editOrganisationAdmins").value = "";
    } catch (e) {
      if ((e.type = "message")) {
        setMessage(e.data);
        disappearing();
      } else {
        console.log("error with admin");
      }
    }
  };

  const removeAdmin = async (email) => {
    let admins = [...organisation.admins];
    admins = admins.filter((admin) => admin.email != email);
    setOrganisation({ ...organisation, admins });
  };
  const editOrganisation = async (e) => {
    e.preventDefault();
    console.log("editing client side");
    let { data, validity } = editOrganisationCheck(organisation);
    console.log(data, validity);
    if (!validity) {
      setErrors({
        ...errors,
        name: data.name,
        email: data.email,
        contact: data.contact,
        admins: data.admins,
      });
    } else {
      let error = { ...errors };
      delete error.name;
      delete error.email;
      delete error.contact;
      delete error.admins;
      setErrors(error);

      let create = await props.editOrganisation(data, organisation.id);
      // if (create.validity) {
      //   setMessage("Organisation has been edited");
      // } else {
      //   setErrors({ ...errors, general: create.data });
      // }
    }
  };
  return (
    <div className="EditOrganisation">
      <form onSubmit={editOrganisation}>
        {errors && errors.general && errors.general.length > 0 && (
          <p>{errors.general}</p>
        )}
        <div className="grid grid-cols-2 bg-amber-500 text-black">
          <label htmlFor="editOrganisationName">Organisation Name</label>
          <div>
            <input
              type="text"
              id="editOrganisationName"
              name="editOrganisationName"
              placeholder="Enter the organisation"
              defaultValue={organisation.name}
              onChange={(e) => {
                setOrganisation({
                  ...organisation,
                  name: e.target.value,
                });
              }}
            />
          </div>
          <label htmlFor="editOrganisationEmail">Organisation Email</label>
          <div>
            <input
              type="text"
              id="editOrganisationEmail"
              name="editOrganisationEmail"
              placeholder="Enter the organisation email"
              defaultValue={organisation.email}
              onChange={(e) => {
                setOrganisation({
                  ...organisation,
                  email: e.target.value,
                });
              }}
            />
          </div>
          <label htmlFor="editOrganisationContact">Organisation Contact</label>
          <div>
            <input
              type="text"
              id="editOrganisationContact"
              name="editOrganisationContact"
              placeholder="Enter the organisation contact"
              defaultValue={organisation.contact}
              onChange={(e) => {
                setOrganisation({
                  ...organisation,
                  contact: e.target.value,
                });
              }}
            />
          </div>
          <label htmlFor="resources">Resources</label>
          <div>
            <p>
              <Link href={`/resource/${organisation.id}/create`}>
                Create Resource
              </Link>
            </p>
            <div className="bg-red-400 grid grid-cols-2 p-5">
              {organisation.resources && organisation.resources.length > 0 ? (
                <>
                  {organisation.resources.map((resource, ind) => (
                    <div key={`organisation_resource_${ind}`}>
                      <p>
                        <Link
                          href={`/resource/${organisation.id}/${resource.resourceId}`}
                        >
                          {resource.resourceName}
                        </Link>
                      </p>
                      <p>Managed by : {resource.managedBy}</p>
                      <button
                        type="button"
                        onClick={() => {
                          let path = `/resource/${organisation.id}/${resource.resourceId}/edit`;
                          router.push(path);
                        }}
                      >
                        Edit Resource
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <p>
                  Organisation does not have any resources to display{" "}
                  <Link href={`/resource/${organisation._Id}/create`}>
                    Create Resource ?
                  </Link>
                </p>
              )}
            </div>
          </div>

          <label htmlFor="editOrganisation">Admin</label>
          <div className="bg-red-400">
            <div>
              <input
                type="email"
                id="editOrganisationAdmins"
                name="editOrganisationAdmins"
                placeholder="Add Admin's Email Address"
              />
              <button type="button" onClick={addAdmin}>
                Add Admin
              </button>
            </div>
            {message && message.length > 0 && <p>{message}</p>}
            {errors && errors.admins && errors.admins.length > 0 && (
              <p>{errors.admins}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {organisation.admins && organisation.admins.length > 0 && (
                <>
                  {organisation.admins.map((admin, index) => (
                    <div key={`organisationEditAdmin_${index}`} className="p-5">
                      <p>Name : {`${admin.firstName} ${admin.lastName}`}</p>
                      <p>Email : {admin.email}</p>
                      <button
                        type="button"
                        disabled={admin.email == organisation.createdBy.email}
                        onClick={() => {
                          removeAdmin(admin.email);
                        }}
                      >
                        Remove Admin
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          <label htmlFor="editOrganisation">Created By </label>
          <div>
            <p>
              {`${organisation?.createdBy?.firstName} ${organisation?.createdBy?.lastName}`}
            </p>
          </div>
          <label>Managers</label>
          <div className="bg-red-400">
            {organisation.managers && organisation.managers.length > 0 ? (
              <>
                {organisation.managers.map((manager, index) => (
                  <div key={`organisationEditAdmin_${index}`} className="p-5">
                    <p>Name : {`${manager.firstName} ${manager.lastName}`}</p>
                    <p>Email : {manager.email}</p>
                    <p>
                      Resource Name :
                      <Link
                        href={`/resource/${organisation._id}/${manager.resourceId}`}
                      >
                        {manager.resourceName}
                      </Link>
                    </p>
                  </div>
                ))}
              </>
            ) : (
              <p>organisation does not have any manaagers to display</p>
            )}
          </div>
        </div>
        <button>Edit Organisation</button>
      </form>
    </div>
  );
};

export default EditOrganisation;
