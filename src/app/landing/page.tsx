"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Search } from "lucide-react";
import Link from 'next/link';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function LandingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [saloons, setSaloons] = useState([]);
    const [allSaloons, setAllSaloons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSaloons = async () => {
            setIsLoading(true);
            try {
                const db = getFirestore(app);
                const saloonsCollection = collection(db, "saloons");
                const saloonSnapshot = await getDocs(saloonsCollection);
                const saloonList = saloonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setAllSaloons(saloonList);
                setSaloons(saloonList);
            } catch (error) {
                console.error("Error fetching saloons:", error);
            } finally {
                setIsLoading(false);
            }
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white">
                <div className="container mx-auto px-4 py-16">
                    <h1 className="text-4xl font-bold mb-4">Find Your Perfect Salon</h1>
                    <p className="text-xl mb-8 max-w-2xl opacity-90">
                        Discover top-rated salons in your area and book your next appointment with ease
                    </p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                            type="text"
                            placeholder="Search for salons by location..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-10 py-3 h-14 bg-white text-gray-800 border-0 rounded-lg shadow-lg w-full focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Results Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {searchQuery ? `Salons in ${searchQuery}` : 'Popular Salons Near You'}
                    </h2>
                    <p className="text-gray-500">
                        {saloons.length} {saloons.length === 1 ? 'salon' : 'salons'} found
                    </p>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {saloons.length > 0 ? (
                            saloons.map((saloon) => (
                                <Link href={`/saloon/${saloon.id}`} key={saloon.id} className="block">
                                    <Card className="hover:shadow-xl transition-all duration-300 ease-in-out border-0 shadow-md overflow-hidden h-full">
                                        <div className="h-48 overflow-hidden relative">
                                            <img 
                                                src={saloon.image || "https://media.istockphoto.com/id/639607852/photo/hairstylist-serving-client-at-barber-shop.jpg?s=612x612&w=0&k=20&c=-kBoMs26KIX1Hl6uh_VLRHCtLxnLYyq9a0n7X8iu5MQ="} 
                                                alt={saloon.shopName} 
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                            <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center shadow-md">
                                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                                <span className="text-sm font-medium">{saloon.rating || '4.0'}</span>
                                            </div>
                                        </div>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{saloon.shopName}</h3>
                                            
                                            <div className="flex items-center text-gray-600 mb-2">
                                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span className="text-sm">{saloon.location}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-600 mb-3">
                                                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span className="text-sm">{saloon.openingHours || "Mon-Sat: 9am - 7pm"}</span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-600 line-clamp-2">{saloon.description || "Trendy salon offering the latest hair styles."}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No salons found in this location. Try another search term.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}