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
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <Input
                        type="text"
                        placeholder="Search for saloons by location..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {saloons.map((saloon) => (
                        <Link href={`/saloon/${saloon.id}`} key={saloon.id}>
                            <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-center text-center">
                                        <Avatar className="h-32 w-32 mb-4">
                                            <AvatarImage src={saloon.image || "https://images.unsplash.com/photo-1616226384899-f9890b13d852?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"} alt={saloon.shopName} className="object-cover" />
                                            <AvatarFallback>{saloon.shopName ? saloon.shopName.substring(0, 2) : 'SS'}</AvatarFallback>
                                        </Avatar>
                                        <h2 className="text-xl font-semibold text-gray-800">{saloon.shopName}</h2>
                                        <p className="text-sm text-gray-500">{saloon.location}</p>
                                        <div className="flex items-center mt-2">
                                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                            <span className="text-gray-600">{saloon.rating || '4.0'}</span>
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
        </div>
    );
}
