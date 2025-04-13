"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import Link from 'next/link';

const saloons = [
    {
        id: 1,
        name: "The Barber Shop",
        location: "123 Main St, Anytown",
        rating: 4.5,
        image: "https://picsum.photos/id/237/300/200",
    },
    {
        id: 2,
        name: "Hair Today, Gone Tomorrow",
        location: "456 Elm St, Anytown",
        rating: 3.8,
        image: "https://picsum.photos/id/238/300/200",
    },
    {
        id: 3,
        name: "Shear Perfection",
        location: "789 Oak St, Anytown",
        rating: 4.2,
        image: "https://picsum.photos/id/239/300/200",
    },
];

export default function LandingPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Input type="text" placeholder="Search for saloons..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saloons.map((saloon) => (
                    <Link href={`/saloon/${saloon.id}`} key={saloon.id}>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center">
                                    <Avatar className="h-32 w-32 mb-4">
                                        <AvatarImage src={saloon.image} alt={saloon.name} className="object-cover" />
                                        <AvatarFallback>{saloon.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-lg font-semibold">{saloon.name}</h2>
                                    <p className="text-sm text-muted-foreground">{saloon.location}</p>
                                    <div className="flex items-center mt-2">
                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                        <span>{saloon.rating}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}


