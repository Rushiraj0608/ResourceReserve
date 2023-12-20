"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TimeSelect from "../helperAndComponents/TimeSelect";
import Tags from "../helperAndComponents/Tags";
import AddImages from "../helperAndComponents/addImages";
import * as formdata from "../helperAndComponents/helper";
import { s3 } from "../../../../lib/config";
import { getCountFromServer } from "firebase/firestore";
import { getUserData } from "@/app/actions/user";
import Loading from "@/app/components/ui/Loading";
import sendEmail from "@/lib/email";
import { toast } from "react-toastify";
const CreateResource = ({
  submitResource,
  organisationId,
  getFireBaseID,
  getUser,
}) => {
  let resourceTemplate = {
    organisationId,
    name: "",
    type: "",
    description: "",
    schedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    reservationLength: "",
    reservationGap: "",
    images: [],
    tags: [],
    capacity: "",
    managedBy: [],
    permission: false,
    email: "",
    contact: "",
    rules: "",
    address1: "",
    address2: "",
    state: "",
  };

  let allowedUsers = ["admin", "superAdmin"];
  let router = useRouter();
  let [resource, setResource] = useState(resourceTemplate);
  let [errors, setError] = useState({});
  let [message, setMessage] = useState("");
  let [loading, setLoading] = useState(1);
  let [user, setUser] = useState({});
  let states = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  const uploadImages = async (resourceId) => {
    let links = [];
    console.log("creating folder");

    let folderName = `${resource.organisationId}/${resourceId}/`;
    let createFolder = await s3
      .putObject({
        Bucket: "resourcereserves3",
        Key: folderName,
      })
      .promise();
    console.log(createFolder, "created folder successfully");
    let images = [...resource.images];
    await Promise.all(
      images.map(async (img, ind) => {
        console.log("maping through the images");
        let file = img.file;

        let uploadImage = await s3
          .upload({
            Bucket: "resourcereserves3",
            Key: `${resource.organisationId}/${resourceId}/${file.name}`,
            Body: file,
            ContentType: file.name.split(".")[1],
          })
          .promise();
        console.log(uploadImage);
        links = [...links, uploadImage.Key];
      })
    );

    return links;
  };
  const createResource = async (event) => {
    event.preventDefault();

    console.log(resource);
    let result = formdata.createResourceCheck(resource);
    console.log(result);
    setResource({ ...result.resource });
    let newResourceId = await getFireBaseID();
    if (!result.validity) {
      setError({ ...result.errors });
    } else {
      setError({});
      let { resource } = result;
      if (resource.images.length > 0) {
        console.log("has images and uploading", resource.images);
        let links = await uploadImages(newResourceId);
        console.log("links after uploading", links);
        resource.images = links;
        console.log(resource);
      }
      console.log(
        "uploaded images and creating resource with resource ID",
        newResourceId
      );
      resource.createdBy = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || user.name,
        lastName: user.lastName || "no last name",
      };
      await submitResource(resource, newResourceId);
      console.log(resource);
    }
  };
  const setTags = (tags) => {
    resource.tags = [...tags];
    setResource({ ...resource });
  };
  const setSchedule = (schedule) => {
    resource["schedule"] = schedule;
    setResource({ ...resource });
  };
  const disappearing = () => {
    setTimeout(() => {
      setMessage("");
    }, 10000);
  };

  const setImages = (images) => {
    resource.images = [...images];
    setResource({ ...resource });
  };
  const addManager = async () => {
    try {
      if (resource.managedBy.length > 2)
        throw `cant add more that 3 managers at the time of creating resource`;
      let managerEmail = document.getElementById("addResourceManager").value;
      managerEmail = formdata.emailCheck(managerEmail);
      if (!managerEmail.validity) {
        setError({ ...errors, managers: managerEmail.data });
      } else {
        resource.managedBy.map((manager) => {
          if (manager.email == managerEmail.data) {
            throw `this email is already a manager so remove as a manager and add as an admin`;
          }
        });

        let getData = await getUser(managerEmail.data);
        if (getData.validity) {
          console.log(getData.data);
          let managers = [...resource.managedBy];
          console.log("managers", managers);
          managers = [...managers, getData.data];
          console.log("managers", managers);
          setResource({
            ...resource,
            managedBy: managers,
          });
          document.getElementById("addResourceManager").value = "";
        } else {
          if (getData.error == "noUser") {
            let data = await sendEmail({
              email: getData.data,
              role: "manager",
              name: user.firstName || user.name,
              organisationName: "organisation name",
            });
            setMessage(data);
            disappearing();
          } else {
            setMessage(getData.error);
            disappearing();
            document.getElementById("addResourceManager").value = "";
          }
        }
      }
    } catch (e) {
      setMessage(e);
      disappearing();
      document.getElementById("addResourceManager").value = "";
    }
  };

  const removeManager = (email) => {
    let managers = [...resource.managedBy];
    managers = managers.filter((manager) => manager.email == email);
    setResource({ ...resource, managedBy: managers });
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
      toast.warn("User is not allowed to access this route");
      router.push("/");

      return <h1>Not authorized to use this page</h1>;
    } else {
      return (
        <div className="bg-slate-400 h-full w-full text-black m-auto pt-40">
          <form onSubmit={createResource}>
            <p className=" text-8xl col-span-3 text-center mb-20 font-extrabold">
              Create Resource
            </p>
            (
            <div className="grid grid-cols-3 m-auto w-11/12 bg-white  px-10 py-10 gap-x-10 [&>*]:p-4  [&>*:nth-child(odd)]:text-right [&>*:nth-child(even)]:col-span-2">
              <label htmlFor="resourceCreateName">Name of the Resource</label>
              <div>
                <input
                  className=" border-b-4 border-black"
                  type="text"
                  placeholder="Enter Name of the Resource"
                  name="name"
                  id="resourceCreateName"
                  defaultValue={resource.name}
                  onChange={(e) => {
                    setResource({ ...resource, name: e.target.value });
                  }}
                  required
                />
                {errors && errors.name && errors.name.length > 0 && (
                  <p className="text-red-600">{errors.name}</p>
                )}
              </div>

              <label
                htmlFor="resourceCreateDescription"
                className="inline-block align-top"
              >
                Description
              </label>
              <div>
                <textarea
                  name="resourceCreateDescription"
                  id="resourceCreateDescription"
                  className=" p-2 border-2  border-black resize-none"
                  rows={10}
                  cols={70}
                  defaultValue={resource.description}
                  onChange={(e) => {
                    setResource({ ...resource, description: e.target.value });
                  }}
                  placeholder="Description of the resource"
                ></textarea>
                {errors &&
                  errors.description &&
                  errors.description.length > 0 && (
                    <p className="text-red-600">{errors.description}</p>
                  )}
              </div>

              <label htmlFor="resourceCreateType">Type of the Resource</label>
              <div>
                <input
                  className="  border-b-4 border-black"
                  type="text"
                  placeholder="Enter type of the Resource"
                  name="resourceCreateType"
                  id="resourceCreateType"
                  defaultValue={resource.type}
                  onChange={(e) => {
                    setResource({ ...resource, type: e.target.value });
                  }}
                  required
                />
                {errors && errors.type && errors.type.length > 0 && (
                  <p className="text-red-600">{errors.type}</p>
                )}
              </div>
              <label>Tags</label>
              <Tags setTags={setTags} tags={resource.tags} />

              <AddImages images={resource.images} setImages={setImages} />
              <label>Schedule</label>
              <div>
                <TimeSelect setSchedule={setSchedule} />
                {errors && errors.schedule && errors.schedule.length > 0 && (
                  <p className="text-red-600">{errors.schedule}</p>
                )}
              </div>
              <p className="text-bolder text-xl font-extrabold ">
                Resource Settings
              </p>
              <div className="grid grid-cols-2 gap-x-20 gap-y-5 m-5">
                <span>
                  <label
                    htmlFor="resourceCreateReservationLength"
                    className="block"
                  >
                    How long can a reservation last (in min)
                  </label>
                  <span>
                    <input
                      type="number"
                      placeholder="enter a number in minutes"
                      name="resourceCreateReservationLength"
                      id="resourceCreateReservationLength"
                      defaultValue={resource.reservationLength}
                      className=" block  border-b-4 w-full border-black focus:outline-none"
                      onChange={(e) => {
                        setResource({
                          ...resource,
                          reservationLength: e.target.value,
                        });
                      }}
                      min="1"
                      max="300"
                      required
                    />
                    {errors &&
                      errors.reservationLength &&
                      errors.reservationLength.length > 0 && (
                        <p className="text-red-600">
                          {errors.reservationLength}
                        </p>
                      )}
                  </span>
                </span>

                <span>
                  <label
                    htmlFor="resourceCreateReservationGap"
                    className="block"
                  >
                    Is there resting period between reservations
                  </label>
                  <span>
                    <input
                      type="number"
                      placeholder="enter a number in minutes"
                      name="resourceCreateReservationGap"
                      id="resourceCreateReservationGap"
                      defaultValue={resource.reservationGap}
                      className=" block  border-b-4 w-full border-black focus:outline-none"
                      onChange={(e) => {
                        setResource({
                          ...resource,
                          reservationGap: e.target.value,
                        });
                      }}
                      required
                    />
                    {errors &&
                      errors.reservationGap &&
                      errors.reservationGap.length > 0 && (
                        <p className="text-red-600">{errors.reservationGap}</p>
                      )}
                  </span>
                </span>
                <span>
                  <label htmlFor="resourceCreateCapacity" className="mb-3">
                    Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="capacity of the resource"
                    name="resourceCreateCapacity"
                    id="resourceCreateCapacity"
                    className=" block  border-b-4 w-full border-black focus:outline-none"
                    required
                    defaultValue={resource.capacity}
                    onChange={(e) => {
                      setResource({ ...resource, capacity: e.target.value });
                    }}
                  />
                  {errors && errors.capacity && errors.capacity.length > 0 && (
                    <p className="text-red-600">{errors.capacity}</p>
                  )}
                </span>
                <span className="text-center">
                  <label className="block">
                    Is permission required to use this resource
                  </label>
                  <label htmlFor="permission_no" className="ml-5 mr-5">
                    <input
                      type="radio"
                      id="permission_no"
                      name="permission"
                      value="no"
                      className="ml-1 mr-1"
                      required
                      onChange={(e) => {
                        resource.permission = e.target.value;
                        setResource({ ...resource });
                      }}
                    />
                    no
                  </label>
                  <label htmlFor="permission_yes" className="ml-5 mr-5">
                    <input
                      type="radio"
                      id="permission_yes"
                      name="permission"
                      value="yes"
                      className="ml-1 mr-1 p-1"
                      onChange={(e) => {
                        resource.permission = e.target.value;
                        setResource({ ...resource });
                      }}
                    />
                    yes
                  </label>
                </span>
              </div>

              <label
                htmlFor="createResourceRules"
                className="text-bolder text-xl font-extrabold block mb-3"
              >
                Rules
              </label>
              <span>
                <textarea
                  name="createResourceRules"
                  id="createResourceRules"
                  className="block ml-3 p-3 border-2 border-black resize-none"
                  rows={10}
                  cols={70}
                  onChange={(e) => {
                    setResource({ ...resource, rules: e.target.value });
                  }}
                  defaultValue={resource.rules}
                  placeholder="Rules for using the resource"
                ></textarea>
                {errors && errors.rules && errors.rules.length > 0 && (
                  <p className="text-red-600">{errors.rules}</p>
                )}
              </span>

              <label>Contact</label>
              <div className="mt-5 mb-5 grid grid-cols-2 gap-x-5 gap-y-3 justify-items-center ">
                <span>
                  <label htmlFor="createResourceEmail" className="mb-3">
                    Email
                  </label>
                  <span>
                    <input
                      type="email"
                      placeholder="Email contact"
                      name="createResourceEmail"
                      id="createResourceEmail"
                      className="block pl-1 pt-1 focus:outline-0 border-b-4 border-black"
                      required
                      defaultValue={resource.email}
                      onChange={(e) => {
                        setResource({ ...resource, email: e.target.value });
                      }}
                    />
                    {errors && errors.email && errors.email.length > 0 && (
                      <p className="text-red-600">{errors.email}</p>
                    )}
                  </span>
                </span>
                <span>
                  <label htmlFor="createResourceContact" className="mb-3">
                    Contact
                  </label>
                  <span>
                    <input
                      type="number"
                      placeholder="Phone Contact"
                      name="createResourceContact"
                      id="createResourceContact"
                      className="block  border-b-4 border-black"
                      defaultValue={resource.contact}
                      onChange={(e) => {
                        setResource({ ...resource, contact: e.target.value });
                      }}
                    />
                    {errors && errors.contact && errors.contact.length > 0 && (
                      <p className="text-red-600">{errors.contact}</p>
                    )}
                  </span>
                </span>
                <span>
                  <label htmlFor="createResourceAddress1" className="block">
                    Address Lane 1
                  </label>
                  <span>
                    <input
                      defaultValue={resource.address1}
                      type="text"
                      name="createResourceAddress1"
                      id="createResourceAddress1"
                      placeholder="Address Lane 1"
                      className="block border-b-4 border-black"
                      required
                      onChange={(e) => {
                        setResource({ ...resource, address1: e.target.value });
                      }}
                    />
                    {errors &&
                      errors.address1 &&
                      errors.address1.length > 0 && (
                        <p className="text-red-600">{errors.address1}</p>
                      )}
                  </span>
                </span>
                <span>
                  <label htmlFor="createResourceAddress2" className="block">
                    Address Lane 2
                  </label>
                  <span>
                    <input
                      defaultValue={resource.address2}
                      type="text"
                      name="createResourceAddress2"
                      id="createResourceAddress2"
                      placeholder="Address Lane 2"
                      className="block  border-b-4 border-black"
                      onChange={(e) => {
                        setResource({ ...resource, address2: e.target.value });
                      }}
                    />
                    {errors &&
                      errors.address2 &&
                      errors.address2.length > 0 && (
                        <p className="text-red-600">{errors.address2}</p>
                      )}
                  </span>
                </span>
                <span>
                  <label htmlFor="createResourceAddress2" className="block">
                    City Name
                  </label>
                  <span>
                    <input
                      defaultValue={resource.city}
                      type="text"
                      name="createResourceCity"
                      id="createResourceCity"
                      className="block border-b-4 border-black"
                      placeholder="City"
                      required
                      onChange={(e) => {
                        setResource({ ...resource, city: e.target.value });
                      }}
                    />
                    {errors &&
                      errors.address2 &&
                      errors.address2.length > 0 && (
                        <p className="text-red-600">{errors.address2}</p>
                      )}
                  </span>
                </span>
                <span>
                  <label htmlFor="createResourceState" className="block">
                    State
                  </label>
                  <select
                    id="createResourceState"
                    onChange={(e) => {
                      console.log(e.target.value);
                      setResource({ ...resource, state: e.target.value });
                    }}
                    required
                  >
                    <option value="">Select A State</option>
                    {states.map((x, y) => (
                      <option value={x} key={`state_${x}`}>
                        {x}
                      </option>
                    ))}
                  </select>
                  {errors && errors.state && errors.state.length > 0 && (
                    <p className="text-red-600">{errors.state}</p>
                  )}
                </span>
              </div>
              <label htmlFor="addResourceManager">Add Manager</label>
              <div>
                <div>
                  <input
                    id="addResourceManager"
                    placeholder="Enter email of the user to add manager"
                    type="email"
                  />
                  <button type="button" onClick={() => addManager()}>
                    Add Manager
                  </button>
                </div>
                {errors && errors.managedBy && errors.managedBy.length > 0 && (
                  <p>{errors.managedBy}</p>
                )}
                {message && message.length > 0 && <p>{message}</p>}
                {resource.managedBy && resource.managedBy.length > 0 && (
                  <div className="grid grid-cols-2 my-5 ">
                    {console.log(resource.managedBy)}
                    {resource.managedBy.map((manager) => (
                      <div>
                        <span>
                          Name : {`${manager.firstName} ${manager.lastName}`}
                        </span>
                        <span>Email : {manager.email}</span>
                        <button
                          type="button"
                          onClick={() => {
                            removeManager(manager.email);
                          }}
                        >
                          {" "}
                          Remove Manager
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-green-500 col-span-full max-w-fit px-5 py-2 rounded-xl justify-self-center"
              >
                Create Resource
              </button>
            </div>
            )
          </form>
        </div>
      );
    }
  } else {
    return <Loading />;
  }
};
export default CreateResource;
