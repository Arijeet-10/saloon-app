"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
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
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [shopData, setShopData] = useState<any>(null);
    const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Fetch shop ID from Firestore
        const db = getFirestore(app);
        const userDocRef = doc(db, "saloons", user.uid);
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
      const serviceDocRef = doc(db, "saloons", shopId, "services", editServiceId);

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
      const serviceDocRef = doc(db, "saloons", shopId, "services", id);

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
            <h1 className="text-2xl font-semibold mb-4">Saloon Owner Dashboard</h1>

            {/* Display Shop ID */}
            {shopId && (
                <div className="mb-4">
                    <p>
                        <strong>Shop ID:</strong> {shopId}
                    </p>
                </div>
            )}

            {/* Display Shop Data */}
            {shopData ? (
                <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Shop Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            <strong>Shop Name:</strong> {shopData.shopName}
                        </p>
                        <p>
                            <strong>Location:</strong> {shopData.location}
                        </p>
                        <p>
                            <strong>Owner Name:</strong> {shopData.ownerName}
                        </p>
                        <p>
                            <strong>Email:</strong> {shopData.email}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <p>Loading shop data...</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manage Services */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Services</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">Add Service</h3>
                                <div className="grid grid-cols-2 gap-4">
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
                                                    <div className="grid grid-cols-2 gap-2">
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

                {/* View Appointments */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>No appointment data available at this time.</p>
                            {/* Replace with actual appointment data display later */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
