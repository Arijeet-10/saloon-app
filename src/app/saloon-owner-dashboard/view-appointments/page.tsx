"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, CalendarDays } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc as firestoreDoc, getDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Define a type for Appointment data (createdAt removed)
type AppointmentService = {
    id: string;
    name: string;
    price: number;
};

type Appointment = {
    id: string;
    userId: string;
    customerName: string;
    saloonId: string;
    date: string; // Store as formatted string after fetching
    time: string;
    selectedServices: AppointmentService[];
    status?: string;
    // createdAt field removed
};

export default function SaloonOwnerAppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const handleDeleteAppointment = useCallback(async (appointmentId: string) => {
        if (!user) {
            setError("You must be logged in to delete appointments.");
            return;
        }

        const db = getFirestore(app);
        try {
            // Delete the appointment document
            await deleteDoc(firestoreDoc(db, "appointments", appointmentId));

            // Update the local state to remove the deleted appointment
            setAppointments(currentAppointments =>
                currentAppointments.filter(appointment => appointment.id !== appointmentId)
            );
            // Optionally, show a success message to the user
            alert("Appointment deleted successfully!");
        } catch (deletionError: any) {
            console.error("Error deleting appointment:", deletionError);
            setError(deletionError.message || "Failed to delete appointment. Please try again.");
        }
    }, [user]);

    const fetchAppointments = useCallback(async (currentUser: User) => {
        setLoading(true);
        setError(null);

        const db = getFirestore(app);

        try {
            const saloonDocRef = firestoreDoc(db, "saloons", currentUser.uid);
            const saloonDocSnapshot = await getDoc(saloonDocRef);

            if (!saloonDocSnapshot.exists()) {
                throw new Error("Saloon profile not found for this user.");
            }
            const currentSaloonId = saloonDocSnapshot.id;

            const appointmentsCollectionRef = collection(db, "appointments");
            const q = query(appointmentsCollectionRef, where("saloonId", "==", currentSaloonId));
            const querySnapshot = await getDocs(q);

            const appointmentsListPromises = querySnapshot.docs.map(async (docSnapshot): Promise<Appointment | null> => {
                const data = docSnapshot.data();

                if (!data.userId || !data.date || !data.time) {
                     console.warn(`Skipping appointment ${docSnapshot.id} due to missing fields.`);
                     return null;
                }

                let customerName = "Unknown Customer";
                try {
                    const customerDocRef = firestoreDoc(db, "users", data.userId);
                    const customerDoc = await getDoc(customerDocRef);
                    if (customerDoc.exists()) {
                        const customerData = customerDoc.data();
                        const firstName = customerData?.firstName || "";
                        const lastName = customerData?.lastName || ""; 
                        let customerName;
                        if(customerData.fullName) {customerName = customerData.fullName} else{ customerName = (firstName + " " + lastName).trim() || "Customer";}
                        customerName = (firstName + " " + lastName).trim() || "Customer";
                    } else {
                        console.warn(`Customer document for user ID ${data.userId} not found.`);
                    }
                } catch (customerError) {
                    console.error(`Error fetching customer ${data.userId} for appointment ${docSnapshot.id}:`, customerError);
                }

                let formattedDate = "Invalid Date";
                if (data.date instanceof Timestamp) {
                    formattedDate = data.date.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                } else if (typeof data.date === 'string') {
                    try {
                        formattedDate = new Date(data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                    } catch { /* Keep "Invalid Date" */ }
                }

                return {
                    id: docSnapshot.id,
                    userId: data.userId,
                    customerName: customerName,
                    saloonId: data.saloonId,
                    date: formattedDate,
                    time: data.time,
                    selectedServices: Array.isArray(data.selectedServices) ? data.selectedServices : [],
                    status: data.status || 'Scheduled',
                    // createdAt assignment removed
                };
            });

            // Resolve promises and filter out nulls (sorting removed)
            const resolvedAppointments = (await Promise.all(appointmentsListPromises))
                                             .filter((app): app is Appointment => app !== null);

            // Optional: Sort by date/time here if needed, as createdAt is gone
            // Example: Sort by date string (might need better date parsing for accurate sorting)
            resolvedAppointments.sort((a, b) => {
                 const dateA = new Date(a.date + " " + a.time); // Combine date and time for sorting
                 const dateB = new Date(b.date + " " + b.time);
                 // Handle potential invalid dates during comparison
                 if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                 if (isNaN(dateA.getTime())) return 1; // Put invalid dates last
                 if (isNaN(dateB.getTime())) return -1;
                 return dateA.getTime() - dateB.getTime(); // Sort oldest to newest
            });


            setAppointments(resolvedAppointments);

        } catch (e: any) {
            console.error("Error fetching appointments:", e);
            setError(e.message || "An unexpected error occurred while fetching appointments.");
        } finally {
            setLoading(false);
        }   
    }, []);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchAppointments(currentUser);
            } else {
                setUser(null);
                setAppointments([]);
                router.push('/saloon-owner-login');
            }
        });
        return () => unsubscribe();
    }, [fetchAppointments, router]);

    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                <p className="text-muted-foreground">View booked appointments for your saloon.</p>
            </header>

            {/* Error Display */}
            {error && !loading && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Appointments</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Appointments Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Customer</TableHead>
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : appointments.length === 0 && !error ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <CalendarDays className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-muted-foreground">No appointments found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                             appointments.map((appointment) => (
                                <TableRow key={appointment.id}>
                                    <TableCell className="font-medium">{appointment.customerName}</TableCell>
                                    <TableCell>{appointment.date}</TableCell>
                                    <TableCell>{appointment.time}</TableCell>
                                    <TableCell>
                                        {appointment.selectedServices.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {appointment.selectedServices.map((service) => (
                                                    <Badge key={service.id || service.name} variant="secondary" className="whitespace-nowrap">
                                                        {service.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No specific services listed</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="ml-2"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the appointment.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={async () => {
                                                            await handleDeleteAppointment(appointment.id);
                                                        }}
                                                    >
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                    {!loading && appointments.length > 0 && (
                        <TableCaption>A list of booked appointments.</TableCaption>
                    )}
                </Table>
            </div>
        </div>
    );
}