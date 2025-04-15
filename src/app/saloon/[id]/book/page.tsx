"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirestore, collection, addDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, AlertCircle, Loader2, CheckCircle, Store } from "lucide-react"; // Added icons

// Define types for better structure
type Service = {
    id: string;
    name: string;
    price: number;
};

type SaloonData = {
    shopName: string;
    location?: string; // Optional location
    image?: string; // Optional image
};

export default function BookAppointmentPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const saloonId = params.id as string;
    const selectedServicesString = searchParams.get('services');

    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [saloonData, setSaloonData] = useState<SaloonData | null>(null);
    const [date, setDate] = useState<Date | undefined>(undefined); // Start undefined for better placeholder experience
    const [time, setTime] = useState<string>("");
    const [user, setUser] = useState<User | null>(null); // Track Firebase user

    const [isLoadingSaloon, setIsLoadingSaloon] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Fetch Saloon Data ---
    useEffect(() => {
        if (!saloonId) return;

        const fetchSaloonData = async () => {
            setIsLoadingSaloon(true);
            const db = getFirestore(app);
            const saloonDocRef = doc(db, "saloons", saloonId);
            try {
                const docSnap = await getDoc(saloonDocRef);
                if (docSnap.exists()) {
                    setSaloonData(docSnap.data() as SaloonData);
                } else {
                    console.error("Saloon not found!");
                    setError("Saloon details could not be loaded."); // Set error for UI
                }
            } catch (err) {
                console.error("Error fetching saloon data:", err);
                setError("Failed to load saloon details.");
            } finally {
                setIsLoadingSaloon(false);
            }
        };

        fetchSaloonData();
    }, [saloonId]);

    // --- Parse Selected Services ---
    useEffect(() => {
        if (selectedServicesString) {
            try {
                const parsedServices = JSON.parse(decodeURIComponent(selectedServicesString));
                 // Basic validation if needed: ensure it's an array of objects with id, name, price
                if (Array.isArray(parsedServices)) {
                    setSelectedServices(parsedServices);
                } else {
                     throw new Error("Parsed services is not an array.");
                }
            } catch (error) {
                console.error("Error parsing selected services:", error);
                 setSelectedServices([]); // Reset or handle error state
                 setError("Could not load selected services properly.");
            }
        } else {
             // Handle case where no services are passed (optional: redirect or show message)
             console.warn("No services passed in URL params.");
             setSelectedServices([]);
        }
    }, [selectedServicesString]);

     // --- Auth State ---
     useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
             // Optional: Redirect if not logged in after a delay or check?
             // if (!currentUser) router.push('/login?redirect=/book/' + saloonId + '...');
        });
        return () => unsubscribe();
     }, [router, saloonId]);


    // --- Handle Booking ---
    const handleConfirmAppointment = async () => {
        setError(null); // Clear previous errors

        if (!user) {
            setError("You must be logged in to book an appointment.");
            toast({ title: "Authentication Required", description: "Please log in to book.", variant: "destructive" });
            // Optional: Trigger login modal or redirect
            // router.push('/login?redirect=...');
            return;
        }

        if (!date) {
            setError("Please select a date for your appointment.");
            toast({ title: "Date Required", description: "Please select a date.", variant: "destructive" });
            return;
        }

        if (!time) {
            setError("Please select a time slot for your appointment.");
            toast({ title: "Time Required", description: "Please select a time.", variant: "destructive" });
            return;
        }

        if (selectedServices.length === 0) {
            setError("Cannot book an appointment without selecting services.");
             toast({ title: "No Services", description: "Please go back and select services.", variant: "destructive" });
             // Optional: router.back() or redirect to saloon page
             return;
        }

        setIsBooking(true);

        try {
            const db = getFirestore(app);
            const appointmentsCollection = collection(db, "appointments");

            const appointmentData = {
                userId: user.uid,
                userEmail: user.email, // Store email for easier display later
                saloonId: saloonId,
                saloonName: saloonData?.shopName || "Unknown Saloon", // Include saloon name
                date: Timestamp.fromDate(date), // Store as Firestore Timestamp
                time: time,
                selectedServices: selectedServices, // Store the full service objects (or just IDs if preferred)
                status: "Scheduled", // Initial status
                // createdAt: Timestamp.now() // Optionally add creation timestamp
            };

            await addDoc(appointmentsCollection, appointmentData);

            toast({
                title: "Appointment Booked!",
                description: `Your appointment at ${saloonData?.shopName || 'the saloon'} on ${date.toLocaleDateString()} at ${time} is confirmed.`,
                // variant: "success" // If you have a success variant
            });
            router.push("/upcoming-appointments"); // Redirect to a confirmation or appointments page

        } catch (e: any) {
            console.error("Error booking appointment:", e);
            setError(e.message || "An unexpected error occurred during booking.");
            toast({
                title: "Booking Failed",
                description: e.message || "Could not book the appointment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsBooking(false);
        }
    };

    // --- Time Slots --- (Assuming these are always available for simplicity)
    const timeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
        "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM"
    ];

    // --- Render Logic ---
    const totalCost = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 max-w-3xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Book Your Appointment</h1>
                <p className="text-muted-foreground">Confirm details and select a date/time.</p>
            </header>

            {/* Saloon Information Card */}
             <Card className="mb-6">
                <CardHeader className="flex flex-row items-center space-x-4 pb-4">
                    {isLoadingSaloon ? (
                        <Skeleton className="h-12 w-12 rounded-full" />
                    ) : saloonData?.image ? (
                         // Assuming you might add Avatar component here later
                         <Store className="h-8 w-8 text-muted-foreground" /> // Placeholder icon
                    ) : (
                        <Store className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                        <CardTitle>
                            {isLoadingSaloon ? <Skeleton className="h-6 w-3/4" /> : saloonData?.shopName || "Saloon"}
                        </CardTitle>
                        {isLoadingSaloon ? <Skeleton className="h-4 w-1/2 mt-1" /> : saloonData?.location && (
                            <CardDescription>{saloonData.location}</CardDescription>
                        )}
                    </div>
                </CardHeader>
             </Card>

            {/* Booking Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Selected Services */}
                    <div className="space-y-2">
                        <Label className="text-base font-medium">Selected Services</Label>
                        {selectedServices.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedServices.map((service) => (
                                    <Badge key={service.id} variant="secondary">
                                        {service.name} (₹{service.price.toFixed(2)})
                                    </Badge>
                                ))}
                            </div>
                        ) : !isLoadingSaloon ? ( // Don't show "No services" while potentially loading saloon which might show error
                            <p className="text-sm text-muted-foreground">No services selected or passed correctly.</p>
                        ) : null }
                         {selectedServices.length > 0 && (
                             <p className="text-sm font-medium pt-2">Total Cost: ₹{totalCost.toFixed(2)}</p>
                         )}
                    </div>

                    {/* Date & Time Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="appointmentDate" className="text-base font-medium">Select Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="appointmentDate"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                        disabled={isBooking}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                             <Label htmlFor="appointmentTime" className="text-base font-medium">Select Time</Label>
                            <Select value={time} onValueChange={setTime} disabled={isBooking}>
                                <SelectTrigger id="appointmentTime" className="w-full">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground"/>
                                    <SelectValue placeholder="Select a time slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((slot) => (
                                        <SelectItem key={slot} value={slot}>
                                            {slot}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                     {/* Error Display Area */}
                     {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Booking Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                     )}

                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button
                        className="w-full sm:w-auto ml-auto"
                        onClick={handleConfirmAppointment}
                        disabled={isBooking || isLoadingSaloon || !date || !time || selectedServices.length === 0} // Disable button appropriately
                    >
                        {isBooking ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...
                            </>
                        ) : (
                             <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Appointment
                             </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}