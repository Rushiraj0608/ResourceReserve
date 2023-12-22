'use client'
import React from 'react'
import PropTypes from 'prop-types'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import { initializeApp } from "firebase/app";
import { doc, getDoc, setDoc, arrayUnion, updateDoc, addDoc } from "firebase/firestore";
import { getDocs, getFirestore, collection, query, where } from "firebase/firestore";
import DatePicker from "react-datepicker";
import { setHours, setMinutes, format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
// import { setReservationCollWithNewReservations } from "@/app/actions/organisations"
import { setReservationCollWithNewReservations } from '../actions/organizations'
// import { setReservation } from '@/app/actions/organisations'
import { setReservation } from '../actions/organizations'
import { setFirstReservation } from '@/app/actions/reservation'
// import { getUserCollData } from '@/app/actions/reservation'
import { getUserCollData } from '../actions/organizations'
import { getResourceCollData } from '../actions/organizations'
// import { getResourceCollData } from '@/app/actions/reservation'


function isObjectInArray(array, object) {
    const startTimeToCheck = object.startTime;

    const firestoreTimestamp = {
        seconds: Math.floor(object.startTime.getTime() / 1000),
        nanoseconds: (object.startTime.getTime() % 1000) * 1e6,
    };

    return array.some((item) => {
        return item.startTime.seconds === firestoreTimestamp.seconds
    });
}



const updateBooking = async (props) => {
    const userId = props.userId;
    const startDate = props.startDate;
    const resource = props.resource;
    const organizationId = props.organizationId;

    try {
        const userData = await getUserCollData(userId);
        const resData = await getResourceCollData(resource.id);
        console.log(resData, "resdData")

        const reservation = {
            userId: userId,
            startTime: startDate,
            status: 'confirmed',
            createdAt: new Date(),
            organizationId: organizationId,
        };
        if (!startDate) {
            return alert("please select date and timeslot!!")
        }
        const date = new Date(startDate.toString());
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();
        const timezoneOffset = date.getTimezoneOffset();


        if (hours === 0 && minutes === 0) {
            return alert("please select timeslot!!")
        }
        const resourceReservationArray = resData.reservations;
        const resourceCapacity = resData.capacity;
        if (resourceReservationArray) {
            if (resourceCapacity > resourceReservationArray.length) {
                if (!isObjectInArray(resourceReservationArray, reservation)) {
                    if (!userData.reservations) {
                        await setReservationCollWithNewReservations(reservation, resource, userId, organizationId);
                    } else {
                        let date2 = reservation.startTime;
                        let numOfReservationOfResourcePerDayByUser = 0;

                        userData.reservations.forEach((element) => {
                            if (element.resourceId === resource.id) {
                                const date1 = new Date(
                                    element.startTime.seconds * 1000 + element.startTime.nanoseconds / 1e6
                                );

                                if (
                                    date1.getFullYear() === date2.getFullYear() &&
                                    date1.getMonth() === date2.getMonth() &&
                                    date1.getDate() === date2.getDate()
                                ) {
                                    numOfReservationOfResourcePerDayByUser++;
                                }
                            }
                        });

                        if (numOfReservationOfResourcePerDayByUser < 2) {
                            await setReservation(reservation, resource, userId);
                            alert("Reservation Successful!")
                        } else {
                            alert('One user can only have two reservations per day per resource!');
                        }
                    }
                } else {
                    alert('Object not added: Already exists in the array.');
                }
            } else {
                alert('Max resource Capacity');
            }
        }else{
            if (!userData.reservations) {
                await setReservationCollWithNewReservations(reservation, resource, userId, organizationId);
            } else {
                let date2 = reservation.startTime;
                let numOfReservationOfResourcePerDayByUser = 0;

                userData.reservations.forEach((element) => {
                    if (element.resourceId === resource.id) {
                        const date1 = new Date(
                            element.startTime.seconds * 1000 + element.startTime.nanoseconds / 1e6
                        );

                        if (
                            date1.getFullYear() === date2.getFullYear() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getDate() === date2.getDate()
                        ) {
                            numOfReservationOfResourcePerDayByUser++;
                        }
                    }
                });

                if (numOfReservationOfResourcePerDayByUser < 2) {
                    await setReservation(reservation, resource, userId);
                    alert("Reservation Successful!")
                } else {
                    alert('One user can only have two reservations per day per resource!');
                }
            }
        }
    } catch (error) {
        console.error('Error handling reservation:', error);
    }
};

export default updateBooking;

