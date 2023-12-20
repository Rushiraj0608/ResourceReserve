"use client";
import {
  createOrganisationCheck,
  emailCheck,
} from "../../resource/[organisationId]/helperAndComponents/helper";
import Loading from "@/app/components/ui/Loading";
import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useState, useEffect } from "react";

import { getUserData } from "@/app/actions/user";
import sendEmail from "@/lib/email";
import { toast } from "react-toastify";

const CreateOrganisation = (props) => {
  const router = useRouter();
  let [user, setUser] = useState({});
  let [loading, setLoading] = useState(1);

  useEffect(() => {
    async function fetchData() {
      const userData = await getUserData();
      setUser(userData);
      setLoading(0);
    }
    fetchData();
  }, []);

  let [errors, setErrors] = useState({});
  let [message, setMessage] = useState();
  let [organisation, setOrganisation] = useState({
    name: "",
    email: "",
    contact: "",
    admins: [],
  });
  const createOrgCheck = async (e) => {
    e.preventDefault();
    console.log(organisation, "the new organistatio");
    let { data, validity } = createOrganisationCheck(organisation);
    if (!validity) {
      console.log("hello", data);
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
      let createdBy = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.name,
        lastName: user.lastName || "no last name",
        //add firstname/ lastname/name
      };
      data.createdBy = {
        ...createdBy,
      };

      let create = await props.addOrganisation(data);
      console.log(create);
      if (create.validity) {
        setErrors({ ...errors, general: "" });
        toast.success("Organisation has been created");
        router.push(`/dashboard/adminOrgs/${create.doc}`);
      } else {
        setErrors({
          ...errors,
          general: create.data,
        });
      }
    }
  };
  let disappearing = () => {
    setTimeout(() => {
      setMessage("");
    }, 10000);
  };

  const addAdmin = async () => {
    try {
      let error = "";
      let adminEmail = document.getElementById(
        "createOrganisationAdmins"
      ).value;
      adminEmail = emailCheck(adminEmail);
      adminEmail.validity
        ? (adminEmail = adminEmail.data)
        : (error = adminEmail.data);
      console.log(adminEmail);
      if (error.length < 1) {
        let admin = [...organisation.admins];
        if (adminEmail == organisation.email) {
          setMessage("you cannot add organisation email as an admin email");
          disappearing();
          throw "";
        }
        admin.map((admin) => {
          if (admin.email == adminEmail) {
            error = `admin with email address ${adminEmail} already exists`;
            throw error;
          }
          if (
            admin.email == organisation.email ||
            adminEmail == organisation.email
          ) {
            setMessage("you cannot add organisation email as an admin email");
            disappearing();
            throw "";
          }
        });
        setErrors({ ...errors, admins: error });
        let { data, validity } = await addUser(adminEmail);

        if (validity) {
          console.log(data);
          admin = [...admin, data];
          setOrganisation({ ...organisation, admins: admin });
          document.getElementById("createOrganisationAdmins").value = "";
        } else {
          setMessage(data);
          disappearing();
          document.getElementById("createOrganisationAdmins").value = "";
        }
      }
    } catch (e) {
      setErrors({ ...errors, admin: e });
      document.getElementById("createOrganisationAdmins").value = "";
    }
  };

  const addUser = async (manager) => {
    manager = await props.checkManager(manager);

    if (!manager.validity && manager.error == "noUser") {
      let data = await sendEmail({
        email: manager.data,
        role: "manager",
        name: user.firstName || user.name,
        organisationName: "organisation name",
      });

      return {
        validity: 0,
        data,
      };
    } else if (!manager.validity) {
      setMessage(manager.error);
      disappearing();
    } else {
      return { ...manager, validity: 1 };
    }
  };
  const removeAdmin = (email) => {
    let admin = [...organisation.admins].filter((x) => x.email != email);
    setOrganisation({ ...organisation, admins: admin });
  };
  if (!loading) {
    if (!user) {
      toast.warn("User not logged in");
      router.push("/");

      return <h1>Login Credentials Missing</h1>;
    } else if ((user && !user.userType) || user.userType != "superAdmin") {
      toast.error("User is not authorized to use this page");
      router.push("/");

      return <h1>Not authorized to use this page</h1>;
    } else {
      return (
        <div className="bg-white h-screen w-full text-black grid grid-rows-4 justify-items-center">
          <p className="text-8xl font-extrabold text-center my-10  h-fit">
            CREATE ORGANISATION
          </p>

          <form
            onSubmit={(e) => {
              createOrgCheck(e);
            }}
            className="w-full h-full"
          >
            {errors && errors.general && errors.general.length > 0 && (
              <p>{errors.general}</p>
            )}
            <div className=" row-span-3 grid grid-cols-3 w-9/12 px-10 py-10 gap-x-10 gap-y-5 align-middle [&>*:nth-child(odd)]:text-right [&>*:nth-child(even)]:col-span-2 shadow-[0_20px_40px_rgba(0,0,0,0.3)] m-auto">
              <span class="group relative flex justify-self-end ">
                <label htmlFor="createOrganisationName">
                  Organisation Name
                </label>
                <span class="absolute top-10 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
                  Name of the creating organisation
                </span>
              </span>
              <div>
                <input
                  onChange={(e) => {
                    setOrganisation({ ...organisation, name: e.target.value });
                  }}
                  required
                  type="text"
                  placeholder="Enter Name of the Organisation"
                  name="organisationName"
                  id="createOrganisationName"
                  className=" border-b-4 border-black w-8/12"
                />
                {errors && errors.name && errors.name.length > 0 && (
                  <p>{errors.name}</p>
                )}
              </div>
              <label htmlFor="createOrganisationEmail">
                Organisation Email
              </label>
              <div>
                <input
                  onChange={(e) => {
                    setOrganisation({ ...organisation, email: e.target.value });
                  }}
                  required
                  type="email"
                  placeholder="Enter Email of the Organisation"
                  name="organisationEmail"
                  id="createOrganisationEmail"
                  className=" border-b-4 border-black w-8/12"
                />
                {errors && errors.email && errors.email.length > 0 && (
                  <p>{errors.email}</p>
                )}
              </div>
              <label htmlFor="createOrganisationContact">
                Organisation Contact
              </label>
              <div>
                <input
                  onChange={(e) => {
                    setOrganisation({
                      ...organisation,
                      contact: e.target.value,
                    });
                  }}
                  required
                  type="number"
                  placeholder="Enter Name of the Organisation"
                  name="organisationContact"
                  id="createOrganisationContact"
                  className=" border-b-4 border-black w-8/12"
                />
                {errors && errors.contact && errors.contact.length > 0 && (
                  <p>{errors.contact}</p>
                )}
              </div>
              <label htmlFor="createOrganisationAdmins">Admin</label>
              <div className="h-full">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="email"
                    id="createOrganisationAdmins"
                    name="createOrganisationAdmins"
                    placeholder="Add Admin's Email Address"
                    className=" border-b-4 border-black w-full col-span-2"
                  />
                  <button
                    type="button"
                    onClick={addAdmin}
                    disabled={organisation.admins.length >= 2}
                    className="bg-green-500 px-3 py-1 w-fit h-fit  rounded-lg "
                  >
                    Add Admin
                  </button>
                </div>
                <div>
                  {errors && errors.admins && errors.admins.length > 0 && (
                    <p>{errors.admins}</p>
                  )}
                  {message && message.length > 0 && <p>{message}</p>}
                </div>
                <div className=" py-1 grid grid-cols-2 h-fit my-5 justify-items-center gap-x-2 gap-y-2 ">
                  {organisation.admins && organisation.admins.length > 0 && (
                    <>
                      {organisation.admins.map((admin, index) => (
                        <span
                          className="px-5 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-md grid gap-1 "
                          key={`organisationCreateAdmin_${index}`}
                        >
                          <span>
                            Name : {`${admin.firstName} ${admin.lastName}`}
                          </span>
                          <span>Email : {admin.email}</span>
                          <button
                            type="button"
                            onClick={() => {
                              removeAdmin(admin.email);
                            }}
                            className="bg-red-300 px-3 py-1"
                          >
                            Remove
                          </button>
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <button className="w-fit my-5 px-5 py-3 text-lg bg-green-500 justify-self-center rounded-lg col-span-full">
                Create Organisation
              </button>
            </div>
          </form>
        </div>
      );
    }
  } else {
    return <Loading />;
  }
};

export default CreateOrganisation;
