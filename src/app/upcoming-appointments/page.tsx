"use client";

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpcomingAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                const db = getFirestore(app);
                const appointmentsCollection = collection(db, "appointments");
                const q = query(appointmentsCollection, where("userId", "==", user.uid)); // Only get appointments for the logged-in user
                const querySnapshot = await getDocs(q);

                const appointmentsList = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: data.date, // keep the original date string
                    };
                });
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
            <h1 className="text-2xl font-semibold mb-4">Upcoming Appointments</h1>
            {appointments.length === 0 ? (
                <p>No upcoming appointments.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appointment) => (
                        <Card key={appointment.id}>
                            <CardHeader>
                                <CardTitle>Appointment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Saloon ID: {appointment.saloonId}</p>
                                <p>Date: {new Date(appointment.date).toLocaleDateString()}</p>
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
