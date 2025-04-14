"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc as firestoreDoc, getDoc, setDoc, collection, addDoc, deleteDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function SaloonOwnerDashboard() {
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServicePrice, setEditServicePrice] = useState("");
  const [shopId, setShopId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [shopData, setShopData] = useState<any>(null);
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [errorAppointments, setErrorAppointments] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();

        // Check for persisted user in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
          localStorage.setItem('user', JSON.stringify(user));

        // Fetch shop ID from Firestore
        const db = getFirestore(app);
        const userDocRef = firestoreDoc(db, "saloons", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const shopData = userDoc.data();
          setShopId(userDoc.id);
          setShopData(shopData);

          // Fetch services for the shop
          const servicesCollection = collection(db, "saloons", user.uid, "services");
          const servicesSnapshot = await getDocs(servicesCollection);
          const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setServices(servicesList);

          // Fetch Appointments
          const fetchAppointments = async () => {
            setLoadingAppointments(true);
            setErrorAppointments(null);

            try {
              const appointmentsCollection = collection(db, "appointments");
              const q = query(appointmentsCollection, where("saloonId", "==", userDoc.id)); // Only get appointments for this saloon
              const querySnapshot = await getDocs(q);

              // Using Promise.all to fetch all customer names concurrently
              const appointmentsList = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                  const data = doc.data();
                  const customerDocRef = firestoreDoc(db, "users", data.userId);
                  const customerDoc = await getDoc(customerDocRef);
                  const customerName = customerDoc.exists() ? customerDoc.data().email : "Unknown Customer";

                  return {
                    id: doc.id,
                    ...data,
                    customerName: customerName,
                    date: new Date(data.date).toLocaleDateString(),
                  };
                })
              );

              setAppointments(appointmentsList);
            } catch (e: any) {
              setErrorAppointments(e.message);
            } finally {
              setLoadingAppointments(false);
            }
          };
          fetchAppointments();

        } else {
          // Create a new document if one doesn't exist
          try {
            const newShopData = {
              ownerId: user.uid,
              shopName: "My Saloon", // Provide a default shop name or fetch from user input
              location: "Anytown", // Provide a default location or fetch from user input
              ownerName: user.displayName || "Owner", // Provide a default owner name
              email: user.email,
            };
            await setDoc(userDocRef, newShopData);
            setShopId(user.uid);
            setShopData(newShopData);

            // No services yet, so set to empty array
            setServices([]);

          } catch (error) {
            console.error("Error creating shop data:", error);
          }
        }
      } else {
        router.push('/saloon-owner-login');
        // Redirect or handle unauthenticated state
          localStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddService = async () => {
    if (newServiceName && newServicePrice && shopId) {
      const db = getFirestore(app);
      const servicesCollection = collection(db, "saloons", shopId, "services");
      try {
        await addDoc(servicesCollection, {
          name: newServiceName,
          price: parseFloat(newServicePrice),
        });
        toast({
          title: "Service added successfully",
          description: "Your service has been added to the shop",
        });

        // Refresh services list after adding a new service
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);

        setNewServiceName("");
        setNewServicePrice("");
      } catch (error) {
        console.error("Error adding service:", error);
        toast({
          title: "Error adding service",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleEditService = (service) => {
    setEditServiceId(service.id);
    setEditServiceName(service.name);
    setEditServicePrice(service.price.toString());
  };

  const handleSaveService = async () => {
    if (editServiceId && editServiceName && editServicePrice && shopId) {
      const db = getFirestore(app);
      const serviceDocRef = firestoreDoc(db, "saloons", shopId, "services", editServiceId);

      try {
        await updateDoc(serviceDocRef, {
          name: editServiceName,
          price: parseFloat(editServicePrice),
        });
        toast({
          title: "Service updated successfully",
          description: "Your service has been updated to the shop",
        });

        // Refresh services list after editing a service
        const servicesCollection = collection(db, "saloons", shopId, "services");
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);

        setEditServiceId(null);
        setEditServiceName("");
        setEditServicePrice("");
      } catch (error) {
        console.error("Error updating service:", error);
        toast({
          title: "Error updating service",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteService = async (id) => {
    if (shopId) {
      const db = getFirestore(app);
      const serviceDocRef = firestoreDoc(db, "saloons", shopId, "services", id);

      try {
        await deleteDoc(serviceDocRef);
        toast({
          title: "Service deleted successfully",
          description: "Your service has been deleted from the shop",
        });

        // Refresh services list after deleting a service
        const servicesCollection = collection(db, "saloons", shopId, "services");
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);

      } catch (error) {
        console.error("Error deleting service:", error);
        toast({
          title: "Error deleting service",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Saloon Owner Dashboard</h1>

      {/* Display Shop ID */}
      {shopId && (
        <div className="mb-4">
          <p className="text-gray-600">
            <strong>Shop ID:</strong> {shopId}
          </p>
        </div>
      )}

      {/* Display Shop Data */}
      {shopData ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Shop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              <strong>Shop Name:</strong> {shopData.shopName}
            </p>
            <p className="text-gray-700">
              <strong>Location:</strong> {shopData.location}
            </p>
            <p className="text-gray-700">
              <strong>Owner Name:</strong> {shopData.ownerName}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {shopData.email}
            </p>
          </CardContent>
        </Card>
      ) : (
        <p>Loading shop data...</p>
      )}

      {/* Display Appointments */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAppointments ? (
            <p>Loading appointments...</p>
          ) : errorAppointments ? (
            <p className="text-red-500">Error: {errorAppointments}</p>
          ) : appointments.length === 0 ? (
            <p>No appointments booked.</p>
          ) : (
            <ul className="list-disc pl-5">
              {appointments.map((appointment) => (
                <li key={appointment.id} className="mb-4">
                  <p><strong>Customer:</strong> {appointment.customerName || "Unknown"}</p>
                  <p><strong>Date:</strong> {appointment.date}, <strong>Time:</strong> {appointment.time}</p>
                  {/* Display Selected Services */}
                  {appointment.selectedServices && appointment.selectedServices.length > 0 ? (
                    <div>
                      <strong>Services:</strong>
                      <ul className="list-disc pl-5">
                        {appointment.selectedServices.map((service, index) => (
                          <li key={index}>{service.name} - ${service.price}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>No services selected.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Services */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Manage Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Add Service</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newServiceName">Name</Label>
                    <Input
                      type="text"
                      id="newServiceName"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newServicePrice">Price</Label>
                    <Input
                      type="number"
                      id="newServicePrice"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="mt-4" onClick={handleAddService}>Add Service</Button>
              </div>

              <h3 className="text-lg font-semibold mb-2">Current Services</h3>
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <div className="p-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between mb-2">
                      <div>
                        {editServiceId === service.id ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                              type="text"
                              value={editServiceName}
                              onChange={(e) => setEditServiceName(e.target.value)}
                            />
                            <Input
                              type="number"
                              value={editServicePrice}
                              onChange={(e) => setEditServicePrice(e.target.value)}
                            />
                          </div>
                        ) : (
                          <>
                            {service.name} - ${service.price}
                          </>
                        )}
                      </div>
                      <div>
                        {editServiceId === service.id ? (
                          <Button size="sm" onClick={handleSaveService}>Save</Button>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => handleEditService(service)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

