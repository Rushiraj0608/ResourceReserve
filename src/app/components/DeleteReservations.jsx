'use client'
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { RedirectType } from 'next/navigation';
import { getUserData } from "@/app/actions/user";
// import { getResource } from '@/app/actions/reservation';
import { getResource } from '../actions/organizations';
import { updateAndDeleteColls } from '../actions/organizations';
// import { updateAndDeleteColls } from '@/app/actions/reservation';

import db from "@/lib/firebase";

function DeleteReservations({ currentUserReservations }) {
    //currentuserreservation is the reservation to be deleted
    console.log(currentUserReservations,"currentuserreservation")
    const [resource, setResource] = useState(undefined);

    useEffect(() => {
        async function fetchData() {
            const resourceData = await getResource(currentUserReservations.resourceId);
            setResource(resourceData);
            if (resourceData) {
                await updateReservationsInResource(resourceData);
            }
        }

        fetchData();
    }, [currentUserReservations.resourceId]);

    const updateReservationsInResource = async (querySnapshot) => {
        try {
            //querySnapshot is the resource of the reservation to be deleted
            const isDeleted = await updateAndDeleteColls(querySnapshot, currentUserReservations);
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };

}

DeleteReservations.propTypes = {};

export default DeleteReservations;