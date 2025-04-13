"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Saloon Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {saloonServices.map((service) => (
                            <div key={service.id} className="border rounded-md p-4">
                                <h3 className="text-lg font-semibold">{service.name}</h3>
                                <p className="text-sm text-muted-foreground">Price: ${service.price}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
