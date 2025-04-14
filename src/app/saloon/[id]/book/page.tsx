"use client";

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export default function BookAppointmentPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const saloonId = params.id as string;
    const selectedServicesString = searchParams.get('services');
    const [selectedServices, setSelectedServices] = useState<any[]>([]);

    useEffect(() => {
        if (selectedServicesString) {
            try {
                const parsedServices = JSON.parse(decodeURIComponent(selectedServicesString));
                setSelectedServices(parsedServices);
            } catch (error) {
                console.error("Error parsing selected services:", error);
            }
        }
    }, [selectedServicesString]);

    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [time, setTime] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleConfirmAppointment = async () => {
        setLoading(true);
        setError(null);

        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                setError("You must be logged in to book an appointment.");
                return;
            }

            if (!date) {
                setError("Please select a date.");
                return;
            }

            if (!time) {
                setError("Please select a time.");
                return;
            }


            const db = getFirestore(app);
            const appointmentsCollection = collection(db, "appointments");

            await addDoc(appointmentsCollection, {
                userId: user.uid,
                saloonId: saloonId,
                date: date.toISOString(), // Store date as ISO string
                time: time,
                selectedServices: selectedServices, // Store selected service IDs here as well
            });

            alert("Appointment booked successfully!"); // Replace with a better UI notification
            router.push("/upcoming-appointments");


        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-semibold mb-4">Book Appointment</h1>
            <p className="mb-4">Saloon ID: {saloonId}</p>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Selected Services:</h2>
                {selectedServices.length > 0 ? (
                    <ul>
                        {selectedServices.map((service) => (
                            <li key={service.id}>{service.name} - ${service.price}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No services selected.</p>
                )}
            </div>


            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Select Date:</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            {date ? (
                                date?.toLocaleDateString()
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center" side="bottom">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            disabled={(date) =>
                                date < new Date()
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Select Time:</h2>
                <Input
                    type="time"
                    className="w-64"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button onClick={handleConfirmAppointment} disabled={loading}>
                {loading ? "Booking..." : "Confirm Appointment"}
            </Button>
        </div>
    );
}
