"use client";
import { useState } from "react";
import * as helpers from "./helper";
function App({ setManager, managers, currentUser, addManager }) {
  let [errors, setErrors] = useState([]);
  let [message, setMessage] = useState([]);
  function removeManagedBy(e) {
    let manager = managers.filter(
      (x) => x._id != e.target.getAttribute("manager")
    );
    console.log(manager);
    setManager(manager);
  }
  async function addNewManager() {
    let email = document.getElementById("editResourceManager").value;
    email = helpers.emailCheck(email);
    if (email.validity) {
      email = email.data;
      email = await addManager(email);
      if (email.validity) {
        document.getElementById("editResourceManager").value = "";
        if (email.data.length > 0) {
          message = [...message, email.data];
          setMessage([...message]);
          setTimeout(() => {
            setMessage([]);
          }, "10000");
        }
      } else {
        errors = [...errors, email.data];
        setErrors([...errors]);
      }
    } else {
      errors = [...errors, email.data];
      setErrors([...errors]);
    }
  }
  return (
    <>
      <div>
        <span className="flex flex-row justify-around justify-items-center al h-fit w-full m-auto  p-6 ">
          <label htmlFor="editResourceManager">Manager Email</label>
          <input
            type="text"
            id="editResourceManager"
            name="editResourceManager"
            placeholder="Email of the manager"
            className=" border-b-4 border-black focus:outline-none"
          />
          <button
            type="button"
            className="bg-green-500 p-5 rounded-lg"
            onClick={addNewManager}
          >
            Add Manager
          </button>
        </span>
        <div className="text-center">
          {message &&
            message.length > 0 &&
            message.map((x, y) => (
              <p className="w-3/5" key={`messages_${y}_addmanager`}>
                {x}
              </p>
            ))}
          {errors &&
            errors.length > 0 &&
            errors.map((x, y) => <p key={`errors_${x}_addManager`}>{x}</p>)}
        </div>
        <div className="grid  grid-cols-2 gap-5 h-max w-4/5 m-auto  bg-slate-400 p-6">
          {(managers &&
            managers?.length > 0 &&
            managers.map((x) => (
              <div key={`${x._id}_manager_data`}>
                <p>{`Name : ${x.firstName} ${x.lastName}`}</p>
                <a href="#">Contact : {x.email}</a>
                <p>{`Role:${x.userType}`}</p>
                <button
                  type="button"
                  className="px-4 py-2 text-white bg-blue-600 rounded focus:outline-none backdrop-blur-sm disabled:opacity-50"
                  onClick={() => {
                    removeManagedBy(x._id);
                  }}
                  alt="added new image"
                  disabled={
                    currentUser.userType == "admin"
                      ? false
                      : null ||
                        (currentUser.userType == "manager" &&
                        x.userType == "manager"
                          ? false
                          : true)
                  }
                >
                  ❌ Remover User
                </button>
              </div>
            ))) || (
            <p className="text-center col-span-full">
              no manging users to display
            </p>
          )}
        </div>

        {managers && managers?.length >= 5 && (
          <p className="text-red-500 text-center">
            you can add atmost 5 images
          </p>
        )}
      </div>
    </>
  );
}

export default App;
