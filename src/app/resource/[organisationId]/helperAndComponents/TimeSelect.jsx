import { useState } from "react";

const TimeSelect = (props) => {
  // console.log(props.schedule);
  let sampleSchedule = props.schedule
    ? {
        monday: props.schedule.monday,
        tuesday: props.schedule.tuesday,
        wednesday: props.schedule.wednesday,
        thursday: props.schedule.thursday,
        friday: props.schedule.friday,
        saturday: props.schedule.saturday,
        sunday: props.schedule.sunday,
      }
    : {
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
      };
  let template = { openTime: "", closeTime: "" };
  let time = [
    "00:00",
    "00:15",
    "00:30",
    "00:45",
    "01:00",
    "01:15",
    "01:30",
    "01:45",
    "02:00",
    "02:15",
    "02:30",
    "02:45",
    "03:00",
    "03:15",
    "03:30",
    "03:45",
    "04:00",
    "04:15",
    "04:30",
    "04:45",
    "05:00",
    "05:15",
    "05:30",
    "05:45",
    "06:00",
    "06:15",
    "06:30",
    "06:45",
    "07:00",
    "07:15",
    "07:30",
    "07:45",
    "08:00",
    "08:15",
    "08:30",
    "08:45",
    "09:00",
    "09:15",
    "09:30",
    "09:45",
    "10:00",
    "10:15",
    "10:30",
    "10:45",
    "11:00",
    "11:15",
    "11:30",
    "11:45",
    "12:00",
    "12:15",
    "12:30",
    "12:45",
    "13:00",
    "13:15",
    "13:30",
    "13:45",
    "14:00",
    "14:15",
    "14:30",
    "14:45",
    "15:00",
    "15:15",
    "15:30",
    "15:45",
    "16:00",
    "16:15",
    "16:30",
    "16:45",
    "17:00",
    "17:15",
    "17:30",
    "17:45",
    "18:00",
    "18:15",
    "18:30",
    "18:45",
    "19:00",
    "19:15",
    "19:30",
    "19:45",
    "20:00",
    "20:15",
    "20:30",
    "20:45",
    "21:00",
    "21:15",
    "21:30",
    "21:45",
    "22:00",
    "22:15",
    "22:30",
    "22:45",
    "23:00",
    "23:15",
    "23:30",
    "23:45",
  ];

  let [schedule, setSchedule] = useState(sampleSchedule);

  let [error, setError] = useState({});

  const changeTime = (event) => {
    let err = [];
    let [day, action] = event.target.getAttribute("id").split("-");

    let [openHour, openMinute] = document
      .getElementById(`${day}-openTime`)
      .value.split(":");
    let [closeHour, closeMinute] = document
      .getElementById(`${day}-closeTime`)
      .value.split(":");
    if (!openHour || !openMinute) {
      err = [...err, `open time is not selected for ${day}`];
    }
    if (!closeHour || !closeMinute) {
      err = [...err, `close time is not selected for ${day}`];
    }
    if (closeHour && openHour > closeHour) {
      err = [...err, `close time cannot be before open time `];
    }
    if (openHour == closeHour && openMinute > closeMinute) {
      err = [...err, `close time cannot be before open time `];
    }
    if (openHour == closeHour && openMinute == closeMinute) {
      err = [...err, `open time and close time cannot be the same `];
    }
    error[day] = err;
    error["general"] = [];
    setError({ ...error });
    if (action == "openTime") {
      schedule[day].openTime = `${openHour}:${openMinute}`;
      setSchedule({ ...schedule });
    }
    if (action == "closeTime") {
      if (!error[day].length > 0) {
        schedule[day].closeTime = `${closeHour}:${closeMinute}`;
        setSchedule({ ...schedule });
      }
    }
  };
  const setTimeSlots = () => {
    // props.setSchedule(schedule);
    let saveSchedule = {};
    let count = 0;

    for (let day in schedule) {
      if (schedule[day].openTime && schedule[day].closeTime) {
        saveSchedule[day] = [
          `${schedule[day].openTime}`,
          `${schedule[day].closeTime}`,
        ];
      } else if (schedule[day][0] && schedule[day][1]) {
        saveSchedule[day] = [`${schedule[day][0]}`, `${schedule[day][1]}`];
      } else {
        saveSchedule[day] = [];
        count += 1;
      }
    }
    console.log(saveSchedule);
    if (count > 5) {
      let err = [`the resource must be atleast available for two days`];
      error.general = err;
      setError({ ...error });
    }
    props.setSchedule(saveSchedule);
  };

  return (
    <div className="capitalize mt-5 mb-5">
      <div>
        {Object.keys(schedule).map((day) => (
          <div
            key={day}
            className="border-b-2 mb-2 mt-2 grid grid-cols-[1fr_5fr] gap-5 pl-5"
          >
            <span className="mb-2 mt-2 row-span-full w-fit">{day}</span>
            <div className="mb-2 mt-2">
              <select
                name={day}
                className="mb-3"
                onChange={(e) => {
                  let [day, state] = e.target.value.split("-");
                  if (state == "open") {
                    error[day] = ["select open and close time"];
                    schedule[day] = { ...template };
                  } else if (state == "closed") {
                    schedule[day] = "";
                    error[day] = [];
                  }

                  setError({ ...error });
                  setSchedule({ ...schedule });
                }}
                defaultValue={
                  (schedule[day][0] + schedule[day][1]).length > 0
                    ? `${day}-open`
                    : `${day}-closed`
                }
                id={`${day}_availability`}
              >
                <option value={`${day}-closed`}>Closed</option>
                <option value={`${day}-open`}>Open</option>
              </select>
              {schedule[day] && Object.keys(schedule[day]).length > 0 && (
                <>
                  <p className="mb-2">
                    please select open time before selecting the closed time
                  </p>
                  <span key={`${day}_time_slot`}>
                    <span>
                      Open Time
                      <select
                        name="openTime"
                        id={`${day}-openTime`}
                        onChange={changeTime}
                        className="ml-1 mr-3 px-3 py-2 text-center"
                        defaultValue={schedule[day][0] ? schedule[day][0] : ""}
                      >
                        <option value="" disabled>
                          Select Open Time
                        </option>
                        {time.map((x, y) => (
                          <option value={x} key={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </span>
                    <span>
                      Close Time
                      <select
                        name="closeTime"
                        id={`${day}-closeTime`}
                        onChange={changeTime}
                        disabled={schedule[day]?.openTime?.length < 2}
                        className="ml-2 mr-1"
                        defaultValue={schedule[day][1]}
                      >
                        <option value="" disabled>
                          Select Close Time
                        </option>
                        {time.map((x) => (
                          <option value={x} key={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </span>
                  </span>
                </>
              )}
              {error[day] && error[day].length > 0 && (
                <div>
                  {error[day].map((x, y) => (
                    <p
                      className="text-red-500 capitalize"
                      key={`${day}_error_${y}`}
                    >
                      {x}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-red-500 text-center">
        {error?.general &&
          error?.general.length > 0 &&
          error?.general.map((x) => <p key={`error_time_select_${x}`}>{x}</p>)}
      </div>
      <button
        onClick={setTimeSlots}
        type="button"
        className="mt-0 mb-0 ml-auto mr-0 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2  dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        disabled={Boolean(Object.values(error).flat(Infinity).length > 0)}
      >
        Save
      </button>

      {!Boolean(Object.values(error).flat(Infinity).length > 0) && (
        <p>please click save button to save the schedule</p>
      )}
    </div>
  );
};
export default TimeSelect;
