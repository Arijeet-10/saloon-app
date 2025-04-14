"use client";

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Scissors, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          setError("You must be logged in to view appointments.");
          return;
        }
        
        const db = getFirestore(app);
        const appointmentsCollection = collection(db, "appointments");
        const q = query(appointmentsCollection, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const appointmentsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date,
          };
        });
        
        // Sort appointments by date (newest first)
        appointmentsList.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setAppointments(appointmentsList);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  const calculateTotalPrice = (services) => {
    if (!services || services.length === 0) return 0;
    return services.reduce((total, service) => total + parseFloat(service.price), 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Upcoming Appointments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading appointments</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold">Upcoming Appointments</h1>
        <p className="text-gray-500 mt-2 md:mt-0">
          {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} scheduled
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg mb-4">You don't have any upcoming appointments.</p>
          <p className="text-gray-400">Book a new appointment to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => {
            const appointmentDate = new Date(appointment.date);
            const isToday = new Date().toDateString() === appointmentDate.toDateString();
            const totalPrice = calculateTotalPrice(appointment.selectedServices);
            
            return (
              <Card key={appointment.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>Appointment</CardTitle>
                    {isToday && <Badge className="bg-blue-500">Today</Badge>}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Calendar size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-semibold">Date</p>
                      <p>{appointmentDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock size={20} className="text-gray-500 mt-1" />
                    <div>
                      <p className="font-semibold">Time</p>
                      <p>{appointment.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Scissors size={20} className="text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">Services</p>
                      {appointment.selectedServices && appointment.selectedServices.length > 0 ? (
                        <ul className="space-y-2 mt-1">
                          {appointment.selectedServices.map((service, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span>{service.name}</span>
                              <span className="text-gray-600">${service.price}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No services selected</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                {appointment.selectedServices && appointment.selectedServices.length > 0 && (
                  <CardFooter className="bg-gray-50 justify-between border-t py-4">
                    <div className="flex items-center">
                      <DollarSign size={18} className="text-gray-600 mr-1" />
                      <span className="font-semibold">Total</span>
                    </div>
                    <span className="font-bold">${totalPrice.toFixed(2)}</span>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}