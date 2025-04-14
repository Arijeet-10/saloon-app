"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import Link from 'next/link';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [saloons, setSaloons] = useState([]);
    const [allSaloons, setAllSaloons] = useState([]);

    useEffect(() => {
        const fetchSaloons = async () => {
            const db = getFirestore(app);
            const saloonsCollection = collection(db, "saloons");
            const saloonSnapshot = await getDocs(saloonsCollection);
            const saloonList = saloonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setAllSaloons(saloonList);
            setSaloons(saloonList); // Initialize with all saloons
        };

        fetchSaloons();
    }, []);

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query) {
            const filteredSaloons = allSaloons.filter(saloon =>
                saloon.location.toLowerCase().includes(query.toLowerCase())
            );
            setSaloons(filteredSaloons);
        } else {
            setSaloons(allSaloons);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <Input
                    type="text"
                    placeholder="Search for saloons by location..."
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saloons.map((saloon) => (
                    <Link href={`/saloon/${saloon.id}`} key={saloon.id}>
                        <Card className="hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center">
                                    <Avatar className="h-32 w-32 mb-4">
                                        <AvatarImage src={saloon.image || "https://picsum.photos/id/237/300/200"} alt={saloon.name} className="object-cover" />
                                        <AvatarFallback>{saloon.name ? saloon.name.substring(0, 2) : 'SS'}</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-lg font-semibold">{saloon.shopName}</h2>
                                    <p className="text-sm text-muted-foreground">{saloon.location}</p>
                                    <div className="flex items-center mt-2">
                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                        <span>{saloon.rating || '4.0'}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{saloon.description || "Trendy salon offering the latest hair styles."}</p>
                                    <p className="text-xs text-gray-500">{saloon.openingHours || "Mon-Sat: 9am - 7pm"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
