"use client";

import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc as firestoreDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SaloonOwnerAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saloonId, setSaloonId] = useState<string | null>(null); // To store the saloon ID

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            setError(null);

            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    setError("You must be logged in to view appointments.");
                    return;
                }

                // Get saloon ID for the current user
                const db = getFirestore(app);
                const userDocRef = firestoreDoc(db, "saloons", user.uid);
                const userDocSnapshot = await getDoc(userDocRef);

                if (!userDocSnapshot.exists()) {
                    setError("Saloon not found for this user.");
                    return;
                }

                const saloonId = userDocSnapshot.id;
                setSaloonId(saloonId);

                // Fetch appointments for the saloon
                const appointmentsCollection = collection(db, "appointments");
                const q = query(appointmentsCollection, where("saloonId", "==", saloonId));
                const querySnapshot = await getDocs(q);

                const appointmentsList = await Promise.all(
                  querySnapshot.docs.map(async (doc) => {
                    const data = doc.data();
                    const customerDocRef = firestoreDoc(db, "users", data.userId);
                    const customerDoc = await getDoc(customerDocRef);
                    const customerName = customerDoc.exists() ? customerDoc.data().email : "Unknown Customer";

                    return {
                      id: doc.id,
                      ...data,
                      customerName: customerName,
                      date: new Date(data.date).toLocaleDateString(),
                      selectedServices: data.selectedServices || [], // Ensure selectedServices is always an array
                    };
                  })
                );
                setAppointments(appointmentsList);

            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    if (loading) {
        return <div>Loading appointments...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-semibold mb-4">Saloon Appointments</h1>
            {appointments.length === 0 ? (
                <p>No appointments booked for this saloon.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appointment) => (
                        <Card key={appointment.id}>
                            <CardHeader>
                                <CardTitle>Appointment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Customer: {appointment.customerName}</p>
                                <p>Date: {appointment.date}</p>
                                <p>Time: {appointment.time}</p>
                                {appointment.selectedServices && appointment.selectedServices.length > 0 ? (
                                    <div>
                                        <strong>Services:</strong>
                                        <ul>
                                            {appointment.selectedServices.map((service, index) => (
                                                <li key={index}>{service.name} - ${service.price}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p>No services selected.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

    