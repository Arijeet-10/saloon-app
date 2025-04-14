"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function SaloonServicePage() {
    const params = useParams();
    const router = useRouter();
    const saloonId = params.id as string; // Use string type
    const [saloonServices, setSaloonServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            if (saloonId) {
                const db = getFirestore(app);
                const servicesCollection = collection(db, "saloons", saloonId, "services");
                try {
                    const servicesSnapshot = await getDocs(servicesCollection);
                    const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setSaloonServices(servicesList);
                } catch (error) {
                    console.error("Error fetching services:", error);
                }
            }
        };

        fetchServices();
    }, [saloonId]);

    const handleAddService = (service) => {
        setSelectedServices([...selectedServices, service]);
    };

    const handleRemoveService = (serviceToRemove) => {
        setSelectedServices(selectedServices.filter(service => service.id !== serviceToRemove.id));
    };

    const totalCost = selectedServices.reduce((sum, service) => sum + service.price, 0);

    const handleBookAppointment = () => {
        router.push(`/saloon/${saloonId}/book?services=${encodeURIComponent(JSON.stringify(selectedServices))}`);
    };

    return (
        <div className="container mx-auto py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Saloon Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {saloonServices.map((service) => (
                                    <div key={service.id} className="border rounded-md p-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">{service.name}</h3>
                                            <p className="text-sm text-muted-foreground">Price: ${service.price}</p>
                                        </div>
                                        <Button size="sm" onClick={() => handleAddService(service)}>Add Service</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Selected Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedServices.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No services selected.</p>
                            ) : (
                                <div className="grid gap-4">
                                    {selectedServices.map((service) => (
                                        <div key={service.id} className="border rounded-md p-4 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                                <p className="text-sm text-muted-foreground">Price: ${service.price}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => handleRemoveService(service)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-semibold">Total Cost: ${totalCost}</h3>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Button className="w-full mt-4" onClick={handleBookAppointment}>
                        Book Appointment
                    </Button>
                </div>
            </div>
        </div>
    );
}
