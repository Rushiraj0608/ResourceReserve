'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import { getUserData } from "@/app/actions/user";
import ReservationCard from '@/app/components/ReservationCard'
import { getReservations } from '@/app/actions/organizations'


function reservation(props) {

    const [reservations, setReservations] = useState(null)
    const [currentUserReservations, setCurrentUserReservations] = useState(undefined)
    const [user, setUser] = useState(undefined)
    const [userId, setUserId] = useState(undefined)

    useEffect(() => {
        async function fetchData() {

            try {
                const reservationsCollection = await getReservations()
                console.log(reservationsCollection, "eavjhvdfakk")
                setReservations(reservationsCollection);
            } catch (error) {
                console.error("Error getting reservations data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        async function fetchData() {
            const userData11 = await getUserData();
            setUser(userData11);
            if (userData11) {
                setUserId(userData11.id)
            }
        }

        fetchData();
    }, []);


    useEffect(() => {
        if (reservations) {
            const userReservations = reservations.filter(element => element.userId === userId);
            setCurrentUserReservations(userReservations);
        }
    }, [reservations, userId]);

    console.log(currentUserReservations, "cur")
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString();
    };
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Reservation List</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentUserReservations && currentUserReservations.map((currentUserReservations) => (
                    <ReservationCard key={currentUserReservations.id} currentUserReservations={currentUserReservations} />
                ))}
            </div>
        </div>
    );
}


export default reservation
