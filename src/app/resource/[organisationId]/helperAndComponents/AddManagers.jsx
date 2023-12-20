"use client";

function App({ setManager, managers, currentUser }) {
  function handleChange(e) {
    let data = e.target.files[0];
    let manager = [...managers, URL.createObjectURL(data)];
    setImages(manager);
    e.target.value = "";
  }
  function removeImage(e) {
    let manager = managers.filter((x) => x != e.target.getAttribute("manager"));
    setManager(manager);
  }

  return (
    <>
      <label htmlFor="managedBy"> Manager</label>
      <span className=" grid  grid-cols-2 gap-5 h-fit w-3/5 m-auto justify-items-center  p-6 ">
        <label htmlFor="managerName">Manager Name</label>
        <input
          type="text"
          id="managerName"
          name="managerName"
          onChange={handleChange}
          placeholder="name of the manager"
          className=" block border-b-4 w-full border-black focus:outline-none"
        />
        <label htmlFor="managerId">Manager Id</label>
        <input
          type="text"
          id="managerId"
          name="managerId"
          onChange={handleChange}
          placeholder="Id of the manager"
          className=" block  border-b-4 w-full border-black focus:outline-none"
        />
      </span>
      <div className="grid  grid-cols-2 gap-5 h-fit w-fit m-auto justify-items-center  p-6">
        {managers &&
          managers?.length > 0 &&
          managers.map((x) => (
            <div key={`${x}_manager_data`}>
              <p>{`Name : ${x.firstName} ${x.lastName}`}</p>
              <a href="#">Contact : {x.email}</a>
              <p>{`Role:${x.userType}`}</p>
              <button
                type="button"
                className="px-4 py-2 text-white bg-blue-600 rounded focus:outline-none backdrop-blur-sm disabled:opacity-50"
                onClick={removeImage}
                alt="added new image"
                disabled={x.userType != "admin"}
              >
                ❌ Remover user
              </button>
            </div>
          ))}
      </div>

      {managers && managers?.length >= 5 && (
        <p className="text-red-500 text-center">you can add atmost 5 images</p>
      )}
    </>
  );
}

export default App;
