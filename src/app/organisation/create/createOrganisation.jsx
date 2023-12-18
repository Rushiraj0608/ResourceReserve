"use client";
import {
  createOrganisationCheck,
  emailCheck,
} from "../../resource/[organisationId]/helperAndComponents/helper";
import { useRouter } from "next/navigation";
import { useState } from "react";
import emailjs from "@emailjs/browser";

const CreateOrganisation = (props) => {
  const router = useRouter();
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

      let create = await props.addOrganisation(organisation);
      console.log(create);
      if (create.validity) {
        setErrors({ ...errors, general: "" });
        setMessage("Organisation has been created");
        setTimeout(() => {
          router.push(`/organisation/${create.doc}`);
        }, 5000);
      } else {
        setErrors({
          ...errors,
          general: "organisation with this email exists",
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

    if (!manager.validity) {
      console.log("trying sending mails");
      try {
        let response = await emailjs.send(
          process.env.EMAILJS_SERVICEID,
          process.env.EMAILJS_TEMPLATEID,
          {
            reply_to: manager.data,
            organisation_name: "neworganisation",
            signup: "http://localhost:3000/auth/signup",
            role: "admin",
          },
          process.env.EMAILJS_PUBLICKEY
        );

        if (response.status == 200) {
          return {
            data: `the user with email id ${manager.data} doesnt have an account we sent an email to create an account`,
            validity: 0,
          };
        } else {
          return {
            data: `the user with email id ${manager.data} doesnt have an account we tried to send an email to create an account`,
            validity: 0,
          };
        }
      } catch (e) {
        setMessage(
          `the user with email id ${manager.data} doesnt have an account we tried to send an email to create an account`
        );
        disappearing();
        document.getElementById("createOrganisationAdmins").value = "";
      }
    } else {
      return { ...manager, validity: 1 };
    }
  };
  const removeAdmin = (email) => {
    let admin = [...organisation.admins].filter((x) => x.email != email);
    setOrganisation({ ...organisation, admins: admin });
  };
  return (
    <div className="bg-slate-400 h-full w-full text-black m-auto">
      <form
        onSubmit={(e) => {
          createOrgCheck(e);
        }}
      >
        {errors && errors.general && errors.general.length > 0 && (
          <p>{errors.general}</p>
        )}
        <div className="grid grid-cols-2">
          <label htmlFor="createOrganisationName" className="text-end">
            Organisation Name
          </label>
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
            />
            {errors && errors.name && errors.name.length > 0 && (
              <p>{errors.name}</p>
            )}
          </div>
          <label htmlFor="createOrganisationEmail">Organisation Email</label>
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
                setOrganisation({ ...organisation, contact: e.target.value });
              }}
              required
              type="number"
              placeholder="Enter Name of the Organisation"
              name="organisationContact"
              id="createOrganisationContacct"
            />
            {errors && errors.contact && errors.contact.length > 0 && (
              <p>{errors.contact}</p>
            )}
          </div>
          <label htmlFor="createOrganisationAdmins">Admin</label>
          <div>
            <div>
              <input
                type="email"
                id="createOrganisationAdmins"
                name="createOrganisationAdmins"
                placeholder="Add Admin's Email Address"
              />
              <button
                type="button"
                onClick={addAdmin}
                disabled={organisation.admins.length >= 2}
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
            {organisation.admins && organisation.admins.length > 0 && (
              <>
                {organisation.admins.map((admin, index) => (
                  <div key={`organisationCreateAdmin_${index}`}>
                    <p>Name : {`${admin.firstName} ${admin.lastName}`}</p>
                    <p>Email : {admin.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        removeAdmin(admin.email);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
          <button>Create Organisation</button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrganisation;
