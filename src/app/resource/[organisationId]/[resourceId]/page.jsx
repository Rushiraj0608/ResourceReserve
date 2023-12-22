'use client'
import { redirect } from "next/navigation";
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getUserData } from "@/app/actions/user";
// import { fetchResourceDetails } from "@/app/actions/reservation"
import {fetchResourceDetails} from '@/app/actions/organizations'
import { initializeApp } from "firebase/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDocs, getFirestore, collection, query, where } from "firebase/firestore";
// import updateBooking from '../../helperAndComponents/updateBooking';
import updateBooking from '@/app/components/updateBooking';
import DatePicker from "react-datepicker";
import { setHours, setMinutes, format } from 'date-fns';
import Link from "next/link";
// import "react-datepicker/dist/react-datepicker.css";

const Home = () => {

  const [orgResource, setOrgResource] = useState(undefined)
  const [startDate, setStartDate] = useState(undefined);
  const [user, setUser] = useState(undefined)
  const [userId, setUserId] = useState(undefined)

  const [timeSlots, setTimeSlots] = useState(undefined);
  const [disableTimeSlots, setDisableTimeSlots] = useState(undefined)
  const [reloadResource, setReloadResource] = useState(0)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  useEffect(() => {
    async function fetchData() {
      const userData11 = await getUserData();
      setUser(userData11);
      setUserId(userData11.id)
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log(resourceId,"rid")
        const resource = await fetchResourceDetails(resourceId);
        console.log(resource,"resource")
        setOrgResource(resource);
        let startTimes = undefined
        if (resource.reservations) {
          startTimes = resource.reservations.map((x) => x.startTime);

          const excludeTimes = startTimes.map((timestamp) => {
            const date = new Date(timestamp.seconds * 1000);
            return date;
          })
          setDisableTimeSlots(excludeTimes)
        }
      } catch (error) {
        console.error("Error fetching resource data:", error);
      }
    }

    fetchData();
  }, [reloadResource]);


  const handleUpdateButton = (startDate, userId, timeslot, organizationId) => {

    let props = {
      startDate: startDate,
      userId: userId,
      timeslot: timeslot,
      resource: orgResource,
      organizationId: organizationId
    }

    updateBooking(props)
    setReloadResource(reloadResource + 1)
  }

  // if (user) {
  //   console.log(user, "user")
  // }
  const router = useRouter()


  const { organisationId } = useParams()
  const orgID = organisationId
  const { resourceId } = useParams()

  // console.log(resourceId, "uguguyvvi")

  let newArray = []
  if (disableTimeSlots) {
    disableTimeSlots.forEach(element => {
      const date = new Date(element.toString());

      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      newArray.push(setHours(setMinutes(new Date(element), minutes), hours))
    });

  }

  let excludedTimes = undefined
  if (newArray.length > 0) {
    excludedTimes = newArray.map((date) => {
      const currentDate = new Date(date);
      const currentDateString = currentDate.toDateString();
      const selectedDate = startDate && startDate.toDateString();

      if (selectedDate === currentDateString) {
        return setHours(setMinutes(date, date.getMinutes()), date.getHours());
      }

      return null;
    }).filter(Boolean);
  }


  if (orgResource) {
    console.log(orgResource, "org")
  }
  const CustomInput = ({ value, onClick }) => (
    <button
      className="block w-full p-4 border rounded-md shadow-inner focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 bg-black text-white"
      onClick={onClick}
    >
      {value}
    </button>
  );

  return (
    <div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
        <h3 className="text-3xl font-semibold mb-4">{orgResource && orgResource.name || 'Resource Details'}</h3>
        {orgResource ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700">
                <span className="font-bold">ID:</span> {orgResource.id || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Organization ID:</span> {orgResource.organisationId || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Type:</span> {orgResource.type || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Capacity:</span> {orgResource.capacity || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Contact:</span> {orgResource.contact || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Email:</span> {orgResource.email || 'NA'}
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <span className="font-bold">Address 1:</span> {orgResource.address1 || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Address 2:</span> {orgResource.address2 || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">City:</span> {orgResource.city || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Description:</span> {orgResource.description || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Reservation Gap:</span> {orgResource.reservationGap || 'NA'}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Reservation Length:</span> {orgResource.reservationLength || 'NA'}
              </p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Select Date and Time</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="Pp"
                showTimeSelect
                timeFormat="p"
                isClearable
                minDate={new Date()}
                maxDate={maxDate}
                minTime={setHours(setMinutes(new Date(), 0), 9)}
                maxTime={setHours(setMinutes(new Date(), 30), 18)}
                dateFormatCalendar="MM/dd/yyyy"
                required={true}
                timeIntervals={orgResource.reservationGap + orgResource.reservationLength}
                excludeTimes={excludedTimes} // Define excludedTimes array
                className="block w-full p-4 border rounded-md shadow-inner focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                customInput={<CustomInput />}
              /><br />
              <div className="mt-4 text-center">
                {orgResource && <button onClick={() => handleUpdateButton(startDate, userId, orgResource.reservationGap + orgResource.reservationLength, orgID)}
                  className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-red-600 focus:outline-none focus:ring focus:border-blue-300"
                >Reserve</button>}
              </div>
            </div>
            
          </div>
        ) : (
          <p className="text-gray-700">No resource data available.</p>
        )}
        <div className="bg-red-500 text-white px-4 py-2 roundpwed-full mt-4 hover:bg-red-600 focus:outline-none focus:ring focus:border-blue-300">
                <Link href={`/user/reservations`}>View Reservations</Link>
        </div>
      </div>

    </div>
  )
}



export async function Page({ params }) {
  redirect(`/dashboard/managerResources/${params.resourceId}`);
}

export default Home;