"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, X, Clock, Plus, ShoppingBag, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function SaloonServicePage() {
    const params = useParams();
    const router = useRouter();
    const saloonId = params.id;
    const [saloonServices, setSaloonServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [saloonInfo, setSaloonInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchSaloonData = async () => {
            if (saloonId) {
                setIsLoading(true);

                try {
                    // Fetch saloon info
                    const saloonDocRef = doc(db, "saloons", saloonId);
                    const saloonDocSnap = await getDoc(saloonDocRef);

                    if (saloonDocSnap.exists()) {
                        const saloonData = saloonDocSnap.data();
                        console.log('Saloon Data:', saloonData);

                        const availableHours = saloonData.availableHours;
                        if (availableHours === undefined) {
                            console.log('available hours undefined');
                        }
                        console.log('Available Hours:', availableHours);

                        setSaloonInfo({ id: saloonDocSnap.id, ...saloonData });
                    }

                    // Fetch services
                    const servicesCollection = collection(db, "saloons", saloonId, "services");
                    const servicesSnapshot = await getDocs(servicesCollection);
                    const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setSaloonServices(servicesList);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchSaloonData();
    }, [saloonId]);

    const handleAddService = (service) => {
        if (!selectedServices.some(s => s.id === service.id)) {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const handleRemoveService = (serviceToRemove) => {
        setSelectedServices(selectedServices.filter(service => service.id !== serviceToRemove.id));
    };

    const totalCost = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);

    const handleBookAppointment = () => {
        router.push(`/saloon/${saloonId}/book?services=${encodeURIComponent(JSON.stringify(selectedServices))}`);
    };

    // Get unique categories
    const categories = ['All', ...new Set(saloonServices.map(service => service.category || 'Other'))];

    // Filter services by category
    const filteredServices = activeCategory === 'All'
        ? saloonServices
        : saloonServices.filter(service => service.category === activeCategory);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-16">
            {/* Hero section */}
            <div className="bg-blue-600 text-white py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">{saloonInfo?.shopName || 'Salon Services'}</h1>
                    <p className="text-blue-100 mb-2">{saloonInfo?.location || 'Location unavailable'}</p>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                            {saloonInfo?.availableHours ? (
                                Object.entries(saloonInfo.availableHours).map(([day, hours]) => (
                                    hours ? (
                                        <React.Fragment key={day}>
                                            {day}: {hours.open} - {hours.close} &nbsp;
                                        </React.Fragment>
                                    ) : null
                                ))
                            ) : 'Hours unavailable'}
                        </span>
                    </div>
                </div>
            </div>





            <div className="container mx-auto px-4">
                {/* Category tabs */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex space-x-2 pb-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                                    activeCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Services list - wider on bigger screens */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-md">
                            <CardHeader className="border-b bg-gray-50">
                                <CardTitle className="flex items-center">
                                    <Scissors className="h-5 w-5 mr-2" />
                                    Available Services
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {filteredServices.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No services found in this category.</p>
                                ) : (
                                    <div className="grid gap-4">
                                        {filteredServices.map((service) => (
                                            <div
                                                key={service.id}
                                                className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex-grow">
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                                                        {service.category && (
                                                            <Badge variant="outline" className="ml-2 text-xs">
                                                                {service.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-sm text-gray-500">
                                                            {service.description || "Professional service"}
                                                        </p>
                                                        <p className="text-lg font-semibold text-blue-600 ml-4">
                                                            ₹{service.price}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center mt-2">
                                                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                                        <span className="text-xs text-gray-500">
                                                            {service.duration || "30-60 min"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="ml-4 flex-shrink-0"
                                                    onClick={() => handleAddService(service)}
                                                    disabled={selectedServices.some(s => s.id === service.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cart - sticky on desktop */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-8">
                            <Card className="border-0 shadow-md">
                                <CardHeader className="border-b bg-gray-50">
                                    <CardTitle className="flex items-center">
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        Your Selection
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {selectedServices.length === 0 ? (
                                        <div className="text-center py-8">
                                            <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No services selected yet.</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Add services from the list to book your appointment.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedServices.map((service) => (
                                                <div key={service.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <div className="flex-grow">
                                                        <h3 className="font-medium text-gray-800">{service.name}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            ₹{service.price}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-gray-500 hover:text-red-500"
                                                        onClick={() => handleRemoveService(service)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}

                                            <div className="border-t border-dashed pt-4 mt-4">
                                                <div className="flex justify-between text-lg font-semibold mb-6">
                                                    <span>Total</span>
                                                    <span className="text-blue-600">₹{totalCost.toFixed(2)}</span>
                                                </div>

                                                <Button
                                                    className="w-full h-12 text-base"
                                                    onClick={handleBookAppointment}
                                                    disabled={selectedServices.length === 0}
                                                >
                                                    <Calendar className="h-5 w-5 mr-2" />
                                                    Book Appointment
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}