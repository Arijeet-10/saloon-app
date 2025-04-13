"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Dummy data for saloon services
const services = {
    1: [
        { id: 1, name: "Haircut", price: 25 },
        { id: 2, name: "Beard Trim", price: 15 },
        { id: 3, name: "Shave", price: 20 },
    ],
    2: [
        { id: 4, name: "Hair Coloring", price: 60 },
        { id: 5, name: "Manicure", price: 30 },
    ],
    3: [
        { id: 6, name: "Facial", price: 40 },
        { id: 7, name: "Massage", price: 50 },
    ],
};

export default function SaloonServicePage() {
    const params = useParams();
    const saloonId = parseInt(params.id as string);
    const saloonServices = services[saloonId] || [];

    const [selectedServices, setSelectedServices] = useState([]);

    const handleAddService = (service) => {
        setSelectedServices([...selectedServices, service]);
    };

    const handleRemoveService = (serviceToRemove) => {
        setSelectedServices(selectedServices.filter(service => service.id !== serviceToRemove.id));
    };

    const totalCost = selectedServices.reduce((sum, service) => sum + service.price, 0);

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
                </div>
            </div>
        </div>
    );
}
