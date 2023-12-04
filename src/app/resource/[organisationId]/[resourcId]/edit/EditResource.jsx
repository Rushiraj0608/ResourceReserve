"use client";

import React, { useEffect } from "react";
import TimeSelect from "../../helperAndComponents/TimeSelect";
import Tags from "../../helperAndComponents/Tags";
import AddImages from "../../helperAndComponents/addImages";
import { formDataCheck } from "../../helperAndComponents/helper";
import AddManager from "../../helperAndComponents/AddManagers";

const EditResource = ({ existingResource, setData }) => {
  console.log(existingResource);
  let currentUser = {
    userType: "admin",
    organisation: "someRandomOrganisation",
  };
  let [resource, setResource] = React.useState(existingResource);
  let [errors, setErrors] = React.useState({});
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

  const editResource = async (event) => {
    let err = [];
    event.preventDefault();
    resource.name = document.getElementById("name_edit").value;
    resource.description = document.getElementById("description_edit").value;
    resource.type = document.getElementById("type_edit").value;
    resource.rules = document.getElementById("rules_edit").value;
    resource.capacity = document.getElementById("capacity_edit").value;
    resource.reservationLength = document.getElementById(
      "reservationLength_edit"
    ).value;
    resource.reservationGap = document.getElementById(
      "reservationGap_edit"
    ).value;
    resource.email = document.getElementById("email_edit").value;
    resource.contact = document.getElementById("contact_edit").value;
    resource.address1 = document.getElementById("address1_edit").value;
    resource.address2 = document.getElementById("address2_edit").value;
    resource.city = document.getElementById("city_edit").value;
    resource = formDataCheck(resource);

    for (let key in resource) {
      if (resource[key].validity) {
        resource[key] = resource[key].data;
      } else if (resource[key].data && !resource[key].validity) {
        err[key] = resource[key].data;
      }
    }
    console.log(resource);
    if (Object.values(errors).flat(Infinity).length > 0) {
      setErrors({ ...err });
    } else {
      setErrors({});
      setResource({ ...resource });
      console.log(await setData(existingResource, resource));
    }
    console.log("all done");
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
  const editManager = (managedBy) => {
    resource.managedBy = [...managedBy];
    setResource({ ...resource });
  };
  useEffect(() => {
    document.getElementById("name_edit").value = resource.name;
    document.getElementById("description_edit").value = resource.description;
    document.getElementById("type_edit").value = resource.type;
    document.getElementById("rules_edit").value = resource.rules;
    document.getElementById("capacity_edit").value = resource.capacity;
    document.getElementById("reservationLength_edit").value =
      resource.reservationLength;
    document.getElementById("reservationGap_edit").value =
      resource.reservationGap;
    document.getElementById("email_edit").value = resource.email;
    document.getElementById("contact_edit").value = resource.contact;
    document.getElementById("address1_edit").value = resource.address1;
    document.getElementById("address2_edit").value = resource.address2;
    document.getElementById("city_edit").value = resource.city;
  }, []);
  return (
    <div className="bg-slate-400 h-full w-full text-black m-auto pt-40">
      <form
        onSubmit={editResource}
        className="bg-white max-w-fit mx-auto px-8 pt-6 pb-8 mb-4"
      >
        <div>
          <label htmlFor="name">Name of the Resource</label>
          <input
            className="ml-10 border-b-4 border-black"
            type="text"
            placeholder="Enter Name of the Resource"
            name="name"
            id="name_edit"
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
            id="description_edit"
          ></textarea>
        </div>
        <label htmlFor="type" className=" block justify-self-start">
          Type of the Resource
          <input
            className=" ml-10 border-b-4 border-black"
            type="text"
            placeholder="Enter type of the Resource"
            name="type"
            id="type_edit"
            required
          />
        </label>
        <div className="m-10">
          <Tags setTags={setTags} tags={resource.tags} />
        </div>
        <AddImages images={resource.images} setImages={setImages} />
        <TimeSelect setSchedule={setSchedule} schedule={resource.schedule} />
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
              id="reservationLength_edit"
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
              id="reservationGap_edit"
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
              id="capacity_edit"
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
                checked={resource.permission == "no" ? true : false}
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
                checked={resource.permission == "yes" ? true : false}
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
            id="rules_edit"
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
              id="email_edit"
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
              id="contact_edit"
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
              id="address1_edit"
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
              id="address2_edit"
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
              id="city_edit"
            />
          </span>
          <span>
            <label htmlFor="state" className="block">
              Select State
            </label>
            <select
              id="select_state"
              placeholder="select a state"
              defaultValue={resource.state}
            >
              {states.map((x) => (
                <option value={x} key={`state_${x}`}>
                  {x}
                </option>
              ))}
            </select>
          </span>
        </div>

        <AddManager
          setManager={editManager}
          managers={resource.managedBy}
          currentUser={currentUser[0]}
        />

        <button type="submit">Edit Resource</button>
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
      </form>
    </div>
  );
};
export default EditResource;
