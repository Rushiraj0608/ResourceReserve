"use client";

import { useState, useEffect } from "react";
import TimeSelect from "../../helperAndComponents/TimeSelect";
import Tags from "../../helperAndComponents/Tags";
import AddImages from "../../helperAndComponents/addImages";
import { formDataCheck } from "../../helperAndComponents/helper";
import AddManager from "../../helperAndComponents/AddManagers";

import { s3 } from "@/lib/config";
import { getUserData } from "@/app/actions/user";
import Loading from "@/app/components/ui/Loading";
import sendEmail from "@/lib/email";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EditResource = ({
  existingResource,
  params,
  setData,
  checkManager,
  organisation,
}) => {
  // console.log(existingResource);
  let allowedUsers = ["manager", "admin", "superAdmin"];

  let router = useRouter();
  let [resource, setResource] = useState(existingResource);
  let [errors, setErrors] = useState({});
  let [user, setUser] = useState({});
  let [loading, setLoading] = useState(1);

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
  const updateImages = async (x) => {
    let resourceCopy = { ...x };

    let folder = `${params.organisationId}/${params.resourceId}`;
    let images = await s3
      .listObjectsV2({
        Bucket: `resourcereserves3`,
        Prefix: folder,
      })
      .promise();

    let links = [];
    await Promise.all(
      resourceCopy.images.map(async (image) => {
        if (typeof image == "object") {
          let file = image.file;
          let uploadImage = await s3
            .upload({
              Bucket: "resourcereserves3",
              Key: `${folder}/${file.name}`,
              Body: file,
              ContentType: file.name.split(".")[1],
            })
            .promise();
          links = [...links, uploadImage.Key];
          return uploadImage.Key;
        } else if (typeof image == "string") {
          let str = image.split(/\.com\/(.*?)\?/)[1];
          str = decodeURIComponent(str);
          links = [...links, str];

          return str;
        }
      })
    );
    resourceCopy.images = [...links];
    const filteredData = images.Contents.map((eachItem) => {
      if (eachItem.Key.endsWith("/")) {
        return;
      } else {
        return eachItem.Key;
      }
    }).filter(Boolean);
    filteredData.map(async (key) => {
      if (!resourceCopy.images.includes(key)) {
        console.log("need to delete this", key);
        await s3
          .deleteObject({ Bucket: "resourcereserves3", Key: key })
          .promise();
      }
    });
    return links;
  };

  const editResource = async (event) => {
    event.preventDefault();
    setLoading(1);
    //i guess i dont need this cuz im using onChange
    console.log(resource);
    let result = formDataCheck(resource);

    setResource({ ...result.resource });
    if (!result.validity) {
      setErrors({ ...result.errors });
    } else {
      setErrors({});
      console.log("trying");
      let updateResource = { ...result.resource };

      let images = await updateImages(updateResource);
      console.log(images);
      updateResource.images = [...images];

      console.log("cant find");
      let edit = await setData(updateResource, params);

      if (edit.validity) {
        setLoading(0);
        toast.success("Resource has been edited");

        router.push(`/dashboard/managerResources/${params.resourceId}`);
      } else {
        toast.error("Error while editing resource");
      }
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

  const setImages = (images) => {
    resource.images = [...images];
    setResource({ ...resource });
  };
  const addManager = async (manager) => {
    let check = 0; //checks if the existing resource has the new manager
    resource.managedBy.map((recManager) => {
      if (recManager.email == manager) check = 1;
    });
    if (check) {
      return { validity: 0, error: "manager is already in the list" };
    }
    manager = await checkManager(manager);
    console.log(manager);
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
      return manager;
    } else {
      let temp = [...resource.managedBy, manager.data];
      resource.managedBy = [...temp];
      setResource({ ...resource });
      return { validity: 1 };
    }
  };
  const editManager = (managedBy) => {
    resource.managedBy = [...managedBy];
    setResource({ ...resource });
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
      // router.push("/");

      return <h1>Login Credentials Missing</h1>;
    } else if (
      user &&
      (!user.userType || !allowedUsers.includes(user.userType))
    ) {
      toast.error("User is not allowed to access this route");
      // router.push("/");
    } else {
      if (user.userType == "manager") {
        if (!organisation.managers.includes(user.id)) {
          toast.error("User is not allowed to access this route");
          // router.push("/");
        }
      } else if (user.userType == "admin") {
        if (!organisation.admins.includes(user.id)) {
          toast.error("User is not allowed to1 access this route");
          // router.push("/");
        }
      }
      return (
        <div className="bg-white h-full w-full text-black m-auto pt-40">
          <p className="text-center mb-2 text-8xl font-bold">EDIT RESOURCE</p>
          <button onClick={() => console.log(resource)}>print</button>
          <form onSubmit={editResource}>
            <div className=" shadow-[0_20px_40px_rgba(0,0,0,0.3)] my-10  bg-white w-10/12 m-auto gap-y-5 p-10 grid grid-cols-3 [&>*]:p-4  [&>*:nth-child(odd)]:text-right [&>*:nth-child(even)]:col-span-2">
              <label htmlFor="editResourceName">Name of the Resource</label>
              <div>
                <input
                  className="ml-10 border-b-4 border-black"
                  type="text"
                  placeholder="Enter Name of the Resource"
                  name="editResourceName"
                  id="editResourceName"
                  required
                  defaultValue={resource.name}
                  onChange={(e) =>
                    setResource({ ...resource, name: e.target.value })
                  }
                />
              </div>
              <label
                htmlFor="editResourceDescription"
                className="inline-block align-top"
              >
                Description of the resource
              </label>
              <div className=" ">
                <textarea
                  placeholder="Description of the resource"
                  name="editResourceDescription"
                  className="m-2 p-2 border-2  border-black resize-none"
                  rows={10}
                  cols={70}
                  id="editResourceDescription"
                  onChange={(e) =>
                    setResource({ ...resource, description: e.target.value })
                  }
                  defaultValue={resource.description}
                ></textarea>
              </div>
              <label htmlFor="editResourceType">Type of the Resource</label>
              <div>
                <input
                  className=" ml-10 border-b-4 border-black"
                  type="text"
                  placeholder="Enter type of the Resource"
                  name="editResourceType"
                  id="editResourceType"
                  defaultValue={resource.type}
                  onChange={(e) =>
                    setResource({ ...resource, type: e.target.value })
                  }
                  required
                />
              </div>

              <label>Tags</label>
              <Tags setTags={setTags} tags={resource.tags} />

              <AddImages images={resource.images} setImages={setImages} />
              <label>Schedule</label>
              <TimeSelect
                setSchedule={setSchedule}
                schedule={resource.schedule}
              />
              <label className="text-bolder text-xl font-extrabold">
                Resource Settings
              </label>
              <div className="grid grid-cols-2 gap-x-20 gap-y-5 m-5">
                <span>
                  <label
                    htmlFor="editResourceReservationLength"
                    className="block"
                  >
                    How long can a reservation last (in min)
                  </label>
                  <input
                    type="number"
                    placeholder="enter a number in minutes"
                    name="editResourceReservationLength"
                    className=" block  border-b-4 w-full border-black focus:outline-none"
                    id="editResourceReservationLength"
                    min="1"
                    max="300"
                    onChange={(e) =>
                      setResource({
                        ...resource,
                        reservationLength: e.target.value,
                      })
                    }
                    defaultValue={resource.reservationLength}
                  />
                </span>

                <span>
                  <label htmlFor="editResourceReservationGap" className="block">
                    Is there resting period between reservations
                  </label>
                  <input
                    type="number"
                    placeholder="enter a number in minutes"
                    name="editResourceReservationGap"
                    className=" block  border-b-4 w-full border-black focus:outline-none"
                    id="editResourceReservationGap"
                    onChange={(e) =>
                      setResource({
                        ...resource,
                        reservationGap: e.target.value,
                      })
                    }
                    defaultValue={resource.reservationGap}
                  />
                </span>
                <span>
                  <label htmlFor="editResourceCapacity" className="mb-3">
                    Capacity
                  </label>
                  <input
                    type="number"
                    placeholder="capacity of the resource"
                    name="editResourceCapacity"
                    className=" block  border-b-4 w-full border-black focus:outline-none"
                    required
                    id="editResourceCapacity"
                    onChange={(e) =>
                      setResource({ ...resource, capacity: e.target.value })
                    }
                    defaultValue={resource.capacity}
                  />
                </span>
                <span className="text-center">
                  <label className="block">
                    Is permission required to use this resource
                  </label>

                  <input
                    type="radio"
                    id="editResourcePermissionNo"
                    name="editResourcePermission"
                    value="no"
                    className="ml-1 mr-1"
                    required
                    onChange={(e) => {
                      setResource({ ...resource, permission: e.target.value });
                    }}
                    checked={resource.permission == "no" ? true : false}
                  />
                  <label
                    htmlFor="editResourcePermissionNo"
                    className="ml-5 mr-5"
                  >
                    no
                  </label>

                  <input
                    type="radio"
                    id="editResourcePermissionYes"
                    name="editResourcePermission"
                    value="yes"
                    required
                    className="ml-1 mr-1 p-1"
                    onChange={(e) => {
                      setResource({ ...resource, permission: e.target.value });
                    }}
                    checked={resource.permission == "yes" ? true : false}
                  />
                  <label
                    htmlFor="editResourcePermissionYes"
                    className="ml-5 mr-5"
                  >
                    yes
                  </label>
                </span>
              </div>

              <label
                htmlFor="editResourceRules"
                className="text-bolder text-xl font-extrabold block mb-3"
              >
                Rules
              </label>
              <span>
                <textarea
                  name="editResourceRules"
                  className="block ml-3 p-3 border-2 border-black resize-none"
                  rows={10}
                  cols={70}
                  id="editResourceRules"
                  defaultValue={resource.rules}
                  onChange={(e) =>
                    setResource({ ...resource, rules: e.target.value })
                  }
                ></textarea>
              </span>
              <label>Contact</label>
              <div className="mt-5 mb-5 grid grid-cols-2 gap-x-5 gap-y-3 justify-items-center">
                <span>
                  <label htmlFor="editResourceEmail" className="mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email contact"
                    name="editResourceEmail"
                    className="block pl-1 pt-1 focus:outline-0 border-b-4 border-black"
                    required
                    id="editResourceEmail"
                    defaultValue={resource.email}
                    onChange={(e) =>
                      setResource({ ...resource, email: e.target.value })
                    }
                  />
                </span>
                <span>
                  <label htmlFor="editResourceContact" className="mb-3">
                    Contact
                  </label>
                  <input
                    type="number"
                    placeholder="Phone Contact"
                    name="editResourceContact"
                    className="block  border-b-4 border-black"
                    id="editResourceContact"
                    defaultValue={resource.contact}
                    onChange={(e) =>
                      setResource({ ...resource, contact: e.target.value })
                    }
                  />
                </span>
                <span>
                  <label htmlFor="editResourceAddress1" className="block">
                    Address Lane 1
                  </label>
                  <input
                    type="text"
                    name="editResourceAddress1"
                    placeholder="Address Lane 1"
                    className="block border-b-4 border-black"
                    required
                    id="editResourceAddress1"
                    defaultValue={resource.address1}
                    onChange={(e) =>
                      setResource({ ...resource, address1: e.target.value })
                    }
                  />
                </span>
                <span>
                  <label htmlFor="editResourceAddress2" className="block">
                    Address Lane 2
                  </label>
                  <input
                    type="text"
                    name="editResourceAddress2"
                    placeholder="Address Lane 2"
                    className="block  border-b-4 border-black"
                    id="editResourceAddress2"
                    defaultValue={resource.address2}
                    onChange={(e) =>
                      setResource({ ...resource, address2: e.target.value })
                    }
                  />
                </span>
                <span>
                  <label htmlFor="editResourceCity" className="block">
                    City Name
                  </label>
                  <input
                    type="text"
                    name="editResourceCity"
                    className="block border-b-4 border-black"
                    placeholder="City"
                    required
                    id="editResourceCity"
                    defaultValue={resource.city}
                    onChange={(e) =>
                      setResource({ ...resource, city: e.target.value })
                    }
                  />
                </span>
                <span>
                  <label htmlFor="editResourceState" className="block">
                    Select State
                  </label>
                  <select
                    id="editResourceState"
                    defaultValue={resource.state}
                    onChange={(e) => {
                      setResource({ ...resource, state: e.target.value });
                    }}
                  >
                    {states.map((x) => (
                      <option value={x} key={`state_${x}`}>
                        {x}
                      </option>
                    ))}
                  </select>
                </span>
              </div>
              <label> Manager</label>

              <AddManager
                setManager={editManager}
                managers={resource.managedBy}
                currentUser={user}
                addManager={addManager}
              />

              <button
                type="submit"
                className="bg-green-500 px-5 py-10 max-w-fit rounded-lg col-span-full justify-self-center"
              >
                Edit Resource
              </button>
              {errors &&
                Object.values(errors).flat(Infinity).length > 0 &&
                Object.keys(errors).map((x) => {
                  if (errors[x]?.length > 0) {
                    return (
                      <p key={`error_${x}`} className="text-red-500">
                        {`${x} : ${errors[x]}`}
                      </p>
                    );
                  }
                })}
            </div>
          </form>
        </div>
      );
    }
  } else {
    return <Loading />;
  }
};
export default EditResource;
