"use client";

/**need to add email js part */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { editOrganisationCheck } from "../../../resource/[organisationId]/helperAndComponents/helper";
import { getUserData } from "@/app/actions/user";
import Loading from "@/app/components/ui/Loading";
import sendEmail from "@/lib/email";
import { toast } from "react-toastify";

const EditOrganisation = (props) => {
  // console.log(props.organisation);
  const router = useRouter();
  let allowedUsers = ["superAdmin", "admin"];
  let [organisation, setOrganisation] = useState(props.organisation);
  let [errors, setErrors] = useState({});
  let [message, setMessage] = useState();
  let [loading, setLoading] = useState(1);
  let [user, setUser] = useState({});

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
      let admin = await props.getUser(adminEmail);
      console.log;
      if (!admin.validity) {
        if (admin.error == "noUser") {
          let data = await sendEmail({
            email: admin.data,
            role: "admin",
            name: user.firstName || user.name,
            organisationName: "organisation name",
          });

          throw {
            data,
          };
        } else {
          throw { data: admin.error };
        }
      } else {
        let admins = organisation.admins;
        admins = [...admins, admin.data];
        setOrganisation({ ...organisation, admins });
        document.getElementById("editOrganisationAdmins").value = "";
      }
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
    setLoading(1);
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

      let edit = await props.editOrganisation(data, organisation.id);
      if (edit.validity) {
        setLoading(0);
        toast.success("Organisation has been edited");
        router.push(`/organisation/${organisation.id}`);
      } else {
        toast.error("Error while editing the organisation");
        setErrors({ ...errors, general: create.data });
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      const userData = await getUserData();
      setUser(userData);
      setLoading(0);
    }

    fetchData();
  }, []);
  if (!loading) {
    if (!user) {
      toast.warn("User is not logged in");
      router.push("/");
      return <h1>Login Credentials Missing</h1>;
    } else if (
      user &&
      (!user.userType || !allowedUsers.includes(user.userType))
    ) {
      toast.error("User is not authorized to access this page");
      router.push("/");

      return <h1>Not authorized to use this page</h1>;
    } else {
      if (user.userType == "admin") {
        let flag = 0;
        organisation.admins.map((admin) => {
          if (admin.id == user.id) {
            flag = 1;
          }
        });
        if (!flag) {
          toast.error("User is not allowed to access this route");
          router.push("/");
        }
      }
      return (
        <div className="bg-white h-screen w-full text-black grid grid-rows-4 justify-items-center">
          <p className="text-8xl font-extrabold text-center my-10  h-fit">
            EDIT ORGANISATION
          </p>
          <form onSubmit={editOrganisation} className="w-full">
            {errors && errors.general && errors.general.length > 0 && (
              <p>{errors.general}</p>
            )}
            <div className="px-5 py-10 grid grid-cols-3 gap-10 m-auto bg-white w-11/12 [&>*:nth-child(odd)]:text-right [&>*:nth-child(even)]:col-span-2 shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-black">
              <label htmlFor="editOrganisationName">Organisation Name</label>
              <div>
                <input
                  className=" border-b-4 border-black w-8/12"
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
                  className=" border-b-4 border-black w-8/12"
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
              <label htmlFor="editOrganisationContact">
                Organisation Contact
              </label>
              <div>
                <input
                  className=" border-b-4 border-black w-8/12"
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
              <label>Resources</label>
              <div>
                <p className="px-4 py-2  bg-green-500 w-fit rounded-xl">
                  <Link href={`/resource/${organisation.id}/create`}>
                    Create Resource
                  </Link>
                </p>
                <div className=" grid grid-cols-2 p-5 gap-x-2 gap-y-1 my-5">
                  {organisation.resources &&
                  organisation.resources.length > 0 ? (
                    <>
                      {organisation.resources.map((resource, ind) => (
                        <div
                          key={`organisation_resource_${ind}`}
                          className="shadow-[0_20px_20px_rgba(0,0,0,0.09)] p-2"
                        >
                          <p>
                            Resource Name :
                            <Link
                              href={`/resource/${organisation.id}/${resource.id}`}
                            >
                              {resource.name}
                            </Link>
                          </p>
                          <p>
                            Managed by :{" "}
                            {organisation.managers.map((manager) => {
                              if (resource.managedBy.includes(manager.id)) {
                                return (
                                  <p>{manager.name || manager.firstName}</p>
                                );
                              }
                            })}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              let path = `/resource/${organisation.id}/${resource.id}/edit`;
                              router.push(path);
                            }}
                            className="px-4 py-2 bg-green-500 w-fit rounded-xl"
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

              <label htmlFor="editOrganisationAdmins">Admin</label>
              <div>
                <div>
                  <input
                    className=" border-b-4 border-black w-8/12"
                    type="email"
                    id="editOrganisationAdmins"
                    name="editOrganisationAdmins"
                    placeholder="Add Admin's Email Address"
                  />
                  <button
                    type="button"
                    onClick={addAdmin}
                    className="px-4 py-2  bg-green-500 w-fit rounded-xl"
                  >
                    Add Admin
                  </button>
                </div>
                {message && message.length > 0 && <p>{message}</p>}
                {errors && errors.admins && errors.admins.length > 0 && (
                  <p>{errors.admins}</p>
                )}
                <div className="grid grid-cols-2 gap-2 my-5">
                  {organisation.admins && organisation.admins.length > 0 && (
                    <>
                      {organisation.admins.map((admin, index) => (
                        <div
                          key={`organisationEditAdmin_${index}`}
                          className="shadow-[0_20px_20px_rgba(0,0,0,0.09)] p-1"
                        >
                          <p>Name : {`${admin.firstName} ${admin.lastName}`}</p>
                          <p>Email : {admin.email}</p>
                          <button
                            type="button"
                            disabled={
                              admin.email == organisation.createdBy.email ||
                              organisation.admins.length < 2
                            }
                            onClick={() => {
                              console.log("removing admins");
                              removeAdmin(admin.email);
                            }}
                            className="px-4 py-2  bg-red-500 w-fit rounded-xl"
                          >
                            Remove Admin
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <label>Created By </label>
              <div>
                <p>
                  {`${organisation?.createdBy?.firstName} ${organisation?.createdBy?.lastName}`}
                </p>
              </div>
              <label>Managers</label>
              <div>
                {organisation.managers && organisation.managers.length > 0 ? (
                  <>
                    {organisation.managers.map((manager, index) => (
                      <div
                        key={`organisationEditAdmin_${index}`}
                        className="p-5"
                      >
                        <p>
                          Name : {`${manager.firstName} ${manager.lastName}`}
                        </p>
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
                  <p>Organisation does not have any manaagers to display</p>
                )}
              </div>
              <button className="w-fit col-span-full px-5 py-3 justify-self-center bg-green-500 rounded-lg text-center">
                Edit Organisation
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={() => {
              props.deleteOrganisation(organisation);
            }}
          >
            Delete Organisation
          </button>
        </div>
      );
    }
  } else {
    return <Loading />;
  }
};

export default EditOrganisation;
