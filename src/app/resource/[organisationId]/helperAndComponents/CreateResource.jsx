"use client";

import React from "react";
import TimeSelect from "./TimeSelect";
import Tags from "./Tags";
import AddImages from "./addImages";
import * as formdata from "./helper";
const createResource = ({ submitResource }) => {
  let resourceTemplate = {
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
    capacity: 50,
    permission: false,
    email: "",
    contact: "",
    rules: "",
    address1: "",
    address2: "",
  };
  let [resource, setResource] = React.useState(resourceTemplate);
  let [errors, setError] = React.useState({});
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
  const createResource = async (event) => {
    event.preventDefault();
    let schedule = resource.schedule;
    if (Object.values(schedule).flat(Infinity).length < 3) {
      errors.schedule = `the resource must be available for two days`;
      setError({ ...errors });
    } else {
      console.log(await submitResource(resource));
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
  return (
    <div className="bg-slate-400 h-full w-full text-black m-auto pt-40">
      <form
        onSubmit={createResource}
        className="bg-white max-w-fit mx-auto px-8 pt-6 pb-8 mb-4"
      >
        <div>
          <label htmlFor="name">Name of the Resource</label>
          <input
            className="ml-10 border-b-4 border-black"
            type="text"
            placeholder="Enter Name of the Resource"
            name="name"
            onBlur={(e) => {
              let { data, validity } = formdata.nameCheck(
                e.target.value,
                "Name of the Resource"
              );
              console.log(data, validity);
              if (!validity) {
                errors.name = data;
                setError({ ...errors });
              } else {
                errors.name = "";
                setError({ ...errors });
                resource["name"] = data;
                setResource({ ...resource });
              }
            }}
            required
          />
        </div>
        <div className=" ">
          <p htmlFor="description" className="inline-block align-top">
            Description of the resource
          </p>
          <textarea
            name="description"
            className="m-2 p-2 border-2  border-black resize-none"
            rows={10}
            cols={70}
            onBlur={(e) => {
              let { data, validity } = formdata.rulesCheck(
                e.target.value,
                "description"
              );

              if (!validity) {
                errors["description"] = data;
                setError({ ...errors });
              } else {
                errors.description = "";
                setError({ ...errors });
                resource["description"] = data;
                setResource({ ...resource });
              }
            }}
          ></textarea>
        </div>
        <label htmlFor="type" className=" block justify-self-start">
          Type of the Resource
          <input
            className=" ml-10 border-b-4 border-black"
            type="text"
            placeholder="Enter type of the Resource"
            name="type"
            onBlur={(e) => {
              let { data, validity } = formdata.nameCheck(
                e.target.value,
                "type"
              );
              if (!validity) {
                errors.type = data;
                setError({ ...errors });
              } else {
                errors.type = "";
                resource["type"] = data;
                setError({ ...errors });
                setResource({ ...resource });
              }
            }}
            required
          />
        </label>
        <div className="m-10">
          <Tags setTags={setTags} tags={resource.tags} />
        </div>
        <AddImages images={resource.images} setImages={setImages} />

        <TimeSelect setSchedule={setSchedule} />
        <div className="grid grid-cols-2 gap-x-20 gap-y-5 m-5">
          <p className="text-bolder text-xl font-extrabold col-span-full">
            Resource Settings
          </p>
          <span>
            <label htmlFor="slot_time_length" className="block">
              How long can a reservation last (in min)
            </label>
            <input
              type="number"
              placeholder="enter a number in minutes"
              name="reservationLength"
              className=" block  border-b-4 w-full border-black focus:outline-none"
              onBlur={(e) => {
                let data = e.target.value;
                if (data) {
                  data = parseInt(data);

                  if (data < 10 || data > 300) {
                    errors.reservationLength = `a reservation cannot be more than 5hrs length or less that 10min`;
                    setError({ ...errors });
                  }
                  if (!errors?.reservationLength?.length > 0) {
                    console.log("changing");
                    errors.reservationLength = "";
                    setError({ ...errors });
                    resource.reservationLength = data;
                    setResource({ ...resource });
                  }
                }
              }}
              min="1"
              max="300"
            />
          </span>

          <span>
            <label htmlFor="slot_time_gap" className="block">
              Is there resting period between reservations
            </label>
            <input
              type="number"
              placeholder="enter a number in minutes"
              name="reservationGap"
              className=" block  border-b-4 w-full border-black focus:outline-none"
              onBlur={(e) => {
                let data = e.target.value;
                if (data) {
                  data = parseInt(data);

                  if (data < 0 || data > 60) {
                    errors.reservationGap = `gap between reservations cannot be more that 60min or less that 0`;
                    setError({ ...errors });
                  }
                  if (!errors?.reservationGap?.length > 0) {
                    errors.reservationGap = "";
                    setError({ ...errors });
                    resource.reservationGap = data;
                    setResource({ ...resource });
                  }
                }
              }}
            />
          </span>
          <span>
            <label htmlFor="capacity" className="mb-3">
              Capacity
            </label>
            <input
              type="number"
              placeholder="capacity of the resource"
              name="capacity"
              className=" block  border-b-4 w-full border-black focus:outline-none"
              required
              onBlur={(e) => {
                let { data, validity } = formdata.capacityCheck(e.target.value);
                if (!validity) {
                  errors["capacity"] = data;
                  setError({ ...errors });
                } else {
                  errors.capacity = [];
                  setError({ ...errors });
                  resource["capacity"] = data;
                  setResource({ ...resource });
                }
              }}
            />
          </span>
          <span className="text-center">
            <label className="block">
              Is permission required to use this resource
            </label>
            <label htmlFor="no" className="ml-5 mr-5">
              <input
                type="radio"
                id="css"
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
            <label htmlFor="yes" className="ml-5 mr-5">
              <input
                type="radio"
                id="yes"
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
        <span>
          <label
            htmlFor="rules"
            className="text-bolder text-xl font-extrabold block mb-3"
          >
            Rules
          </label>
          <textarea
            name="rules"
            className="block ml-3 p-3 border-2 border-black resize-none"
            rows={10}
            cols={70}
            onBlur={(e) => {
              let { data, validity } = formdata.rulesCheck(
                e.target.value,
                "rules"
              );
              if (!validity) {
                errors["rules"] = data;
                setError({ ...errors });
              } else {
                errors.rules = "";
                setError({ ...errors });
                resource["rules"] = data;
                setResource({ ...resource });
              }
            }}
          ></textarea>
        </span>
        <div className="mt-5 mb-5 grid grid-cols-2 gap-x-5 gap-y-3 justify-items-center">
          <span>
            <label htmlFor="email" className="mb-3">
              Email
            </label>
            <input
              type="email"
              placeholder="Email contact"
              name="email"
              className="block pl-1 pt-1 focus:outline-0 border-b-4 border-black"
              required
              onBlur={(e) => {
                let { data, validity } = formdata.emailCheck(e.target.value);
                if (!validity) {
                  errors["email"] = data;
                  setError({ ...errors });
                } else {
                  resource["email"] = data;
                  setResource({ ...resource });
                }
              }}
            />
          </span>
          <span>
            <label htmlFor="contact" className="mb-3">
              Contact
            </label>
            <input
              type="number"
              placeholder="Phone Contact"
              name="contact"
              className="block  border-b-4 border-black"
              onBlur={(e) => {
                let { data, validity } = formdata.contactCheck(e.target.value);
                console.log(data);
                if (!validity) {
                  errors["contact"] = data;
                  setError({ ...errors });
                } else {
                  errors.email = "";
                  setError({ ...errors });
                  resource["contact"] = data;
                  setResource({ ...resource });
                }
              }}
            />
          </span>
          <span>
            <label htmlFor="address1" className="block">
              Address Lane 1
            </label>
            <input
              type="text"
              name="address1"
              placeholder="Address Lane 1"
              className="block border-b-4 border-black"
              required
              onBlur={(e) => {
                let { data, validity } = formdata.nameCheck(
                  e.target.value,
                  "address 1"
                );
                if (!validity) {
                  errors["address1"] = data;
                  setError({ ...errors });
                } else {
                  errors.address1 = "";
                  setError({ ...errors });
                  resource["address1"] = data;
                  setResource({ ...resource });
                }
              }}
            />
          </span>
          <span>
            <label htmlFor="address2" className="block">
              Address Lane 2
            </label>
            <input
              type="text"
              name="address2"
              placeholder="Address Lane 2"
              className="block  border-b-4 border-black"
              onBlur={(e) => {
                if (e.target.value) {
                  let { data, validity } = formdata.nameCheck(
                    e.target.value,
                    "address 2"
                  );
                  if (!validity) {
                    errors["address2"] = data;
                    setError({ ...errors });
                  } else {
                    errors.address2 = "";
                    setError({ ...errors });
                    resource["address2"] = data;
                    setResource({ ...resource });
                  }
                }
              }}
            />
          </span>
          <span>
            <label htmlFor="city" className="block">
              City Name
            </label>
            <input
              type="text"
              name="city"
              className="block border-b-4 border-black"
              placeholder="City"
              required
              onBlur={(e) => {
                let { data, validity } = formdata.nameCheck(
                  e.target.value,
                  "city"
                );
                if (!validity) {
                  errors["city"] = data;
                  setError({ ...errors });
                } else {
                  errors["city"] = "";

                  resource["city"] = data;
                  setResource({ ...resource });
                }
              }}
            />
          </span>
          <span>
            <label htmlFor="state" className="block">
              Select State
            </label>
            <select id="select_state" placeholder="select a state">
              {states.map((x) => (
                <option value={x} key={`state_${x}`}>
                  {x}
                </option>
              ))}
            </select>
          </span>
        </div>

        <button type="submit">Create Resource</button>

        {errors &&
          Object.values(errors).flat(Infinity).length > 0 &&
          Object.keys(errors).map((x) => {
            if (errors[x].length > 0) {
              return (
                <p key={`error_${x}`} className="text-red-500">
                  {`${x} : ${errors[x]}`}
                </p>
              );
            }
          })}
      </form>
    </div>
  );
};
export default createResource;
