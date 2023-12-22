'use static'

import React from 'react';
import { useState, useEffect } from 'react';
import DeleteReservations from './DeleteReservations';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
// import { getCurrentReservations } from '../actions/reservation';
import { getCurrentReservations } from '../actions/organizations';


const ReservationCard = ({ currentUserReservations }) => {

    const [CancelReservationComponent, setCancelReservationComponent] = useState(false);
    const [reservation, setReservation] = useState(undefined);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getCurrentReservations(currentUserReservations)
                return res
            } catch (e) {
                console.error(e);
                throw e;
            }
        };

        const fetchDataAndSetState = async () => {
            try {
                const querySnapshot = await fetchData();
                const reservationData = querySnapshot.toJSON ? querySnapshot.toJSON() : querySnapshot;
                setReservation(reservationData);
                currentUserReservations = reservationData
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDataAndSetState();
    }, []);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString();
    };


    const navigateToResource = () => {
        setCancelReservationComponent(true);
    };

    if (CancelReservationComponent) {
        return <DeleteReservations currentUserReservations={reservation} />;
    }


    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold mb-4">Reservation Details</h3>
            {currentUserReservations ? (
                <>
                    <p className="text-gray-700">ID: {currentUserReservations.id || 'NA'}</p>
                    <p className="text-gray-700">Organization ID: {currentUserReservations.organizationId || 'NA'}</p>
                    <p className="text-gray-700">Resource ID: {currentUserReservations.resourceId || 'NA'}</p>
                    <p className="text-gray-700">Status: {currentUserReservations.status || 'NA'}</p>
                    <p className="text-gray-700">User ID: {currentUserReservations.userId || 'NA'}</p>
                    <p className="text-gray-700">Start Time: {currentUserReservations.startTime && formatTimestamp(currentUserReservations.startTime) || 'NA'}</p>
                    <p className="text-gray-700">Created At: {currentUserReservations.createdAt && formatTimestamp(currentUserReservations.createdAt) || 'NA'}</p>
                    <button
                        onClick={() => navigateToResource()}
                        className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 hover:bg-red-600 focus:outline-none focus:ring focus:border-blue-300"
                    >
                        Cancel Reservation
                    </button>
                </>
            ) : (
                <p className="text-gray-700">No reservation data available.</p>
            )}
        </div>
    );
};

export default ReservationCard;
