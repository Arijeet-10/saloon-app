"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image'; // Import the Image component
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area"; // Keep if table height needs limiting
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Trash2, Edit, Save, X as CancelIcon, Loader2, ExternalLink } from "lucide-react"; // Added icons
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc as firestoreDoc, getDoc, setDoc, collection, addDoc, deleteDoc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link'; // Keep Link for navigation

// Define a type for Service data for better type safety
type Service = {
    id: string;
    name: string;
    price: number;
};

// Define a type for Shop data
type ShopData = {
    ownerId: string;
    shopName: string;
    location: string;
    ownerName: string;
    email: string;
    image?: string | null; // Add the image field
};

export default function SaloonOwnerDashboard() {
    const [services, setServices] = useState<Service[]>([]);
    const [newServiceName, setNewServiceName] = useState("");
    const [newServicePrice, setNewServicePrice] = useState("");
    const [editServiceId, setEditServiceId] = useState<string | null>(null);
    const [editServiceName, setEditServiceName] = useState("");
    const [editServicePrice, setEditServicePrice] = useState("");

    const [shopId, setShopId] = useState<string | null>(null);
    const [shopData, setShopData] = useState<ShopData | null>(null);
    const [user, setUser] = useState<User | null>(null); // Keep track of Firebase user

    const [isLoadingShop, setIsLoadingShop] = useState(true);
    const [isLoadingServices, setIsLoadingServices] = useState(true);
    const [isAddingService, setIsAddingService] = useState(false);
    const [isUpdatingService, setIsUpdatingService] = useState(false);
    const [isDeletingService, setIsDeletingService] = useState<string | null>(null); // Store ID being deleted

    const router = useRouter();
    const { toast } = useToast();

    // --- Data Fetching ---
    const fetchShopAndServices = useCallback(async (currentUser: User) => {
        setIsLoadingShop(true);
        setIsLoadingServices(true);
        const db = getFirestore(app);
        const shopDocRef = firestoreDoc(db, "saloons", currentUser.uid);

        try {
            const shopDoc = await getDoc(shopDocRef);
            let currentShopData: ShopData | null = null;
            let currentShopId = currentUser.uid; // Assume UID is shop ID

            if (shopDoc.exists()) {
                currentShopData = shopDoc.data() as ShopData;
                setShopData(currentShopData);
                setShopId(currentShopId);
            } else {
                 // Auto-create a basic profile if none exists.
                 // Consider redirecting to a setup page for a better UX in a real app.
                console.log("No shop document found for user, creating one.");
                const newShopData: ShopData = {
                    ownerId: currentUser.uid,
                    shopName: "My New Saloon", // Default name
                    location: "Update Location", // Default location
                    ownerName: currentUser.displayName || "Owner Name",
                    email: currentUser.email || "owner@example.com",
                };
                await setDoc(shopDocRef, newShopData);
                setShopData(newShopData);
                setShopId(currentShopId);
                currentShopData = newShopData; // Use the newly created data
                 toast({
                    title: "Shop Profile Created",
                    description: "Basic shop profile created. Please update details.",
                 });
            }
            setIsLoadingShop(false); // Shop data loaded or created

            // Fetch services only if we have a valid shop ID
            if (currentShopId) {
                const servicesCollectionRef = collection(db, "saloons", currentShopId, "services");
                const servicesSnapshot = await getDocs(servicesCollectionRef);
                const servicesList = servicesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Service, 'id'>) // Cast data part
                }));
                setServices(servicesList);
            } else {
                setServices([]); // No shop ID, no services
            }

        } catch (error: any) {
            console.error("Error fetching shop/services data:", error);
            toast({
                title: "Error Loading Data",
                description: error.message || "Could not load shop information.",
                variant: "destructive",
            });
            setShopData(null); // Reset on error
            setServices([]);
        } finally {
            setIsLoadingShop(false);
            setIsLoadingServices(false);
        }
    }, [toast]); // Add toast to dependencies


    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchShopAndServices(currentUser); // Fetch data when user is confirmed
            } else {
                setUser(null);
                setShopData(null);
                setServices([]);
                setIsLoadingShop(false); // Stop loading if no user
                setIsLoadingServices(false);
                // No need to manually remove from localStorage, Firebase handles session
                router.push('/saloon-owner-login');
            }
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [router, fetchShopAndServices]); // Add fetchShopAndServices to dependencies

    // --- Service Actions ---

    const handleAddService = async () => {
        if (!newServiceName.trim() || !newServicePrice.trim() || !shopId) {
            toast({ title: "Missing Information", description: "Please provide service name and price.", variant: "destructive" });
            return;
        }
        if (isNaN(parseFloat(newServicePrice))) {
            toast({ title: "Invalid Price", description: "Please enter a valid number for the price.", variant: "destructive" });
            return;
        }

        setIsAddingService(true);
        const db = getFirestore(app);
        const servicesCollection = collection(db, "saloons", shopId, "services");

        try {
            const docRef = await addDoc(servicesCollection, {
                name: newServiceName.trim(),
                price: parseFloat(newServicePrice),
            });

            // Optimistically add to UI or refetch
            const newService: Service = { id: docRef.id, name: newServiceName.trim(), price: parseFloat(newServicePrice) };
            setServices(prevServices => [...prevServices, newService]);

            toast({
                title: "Service Added",
                description: `"${newServiceName}" added successfully.`,
            });
            setNewServiceName("");
            setNewServicePrice("");
        } catch (error: any) {
            console.error("Error adding service:", error);
            toast({
                title: "Error Adding Service",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsAddingService(false);
        }
    };

    const handleEditClick = (service: Service) => {
        setEditServiceId(service.id);
        setEditServiceName(service.name);
        setEditServicePrice(service.price.toString());
    };

    const handleCancelEdit = () => {
        setEditServiceId(null);
        setEditServiceName("");
        setEditServicePrice("");
    };

    const handleSaveService = async () => {
        if (!editServiceId || !editServiceName.trim() || !editServicePrice.trim() || !shopId) {
             toast({ title: "Missing Information", description: "Please provide service name and price.", variant: "destructive" });
            return;
        }
         if (isNaN(parseFloat(editServicePrice))) {
            toast({ title: "Invalid Price", description: "Please enter a valid number for the price.", variant: "destructive" });
            return;
        }

        setIsUpdatingService(true);
        const db = getFirestore(app);
        const serviceDocRef = firestoreDoc(db, "saloons", shopId, "services", editServiceId);

        try {
            const updatedPrice = parseFloat(editServicePrice);
            await updateDoc(serviceDocRef, {
                name: editServiceName.trim(),
                price: updatedPrice,
            });

            // Update UI state
            setServices(prevServices =>
                prevServices.map(service =>
                    service.id === editServiceId
                        ? { ...service, name: editServiceName.trim(), price: updatedPrice }
                        : service
                )
            );

            toast({
                title: "Service Updated",
                description: `"${editServiceName}" updated successfully.`,
            });
            handleCancelEdit(); // Close edit form
        } catch (error: any) {
            console.error("Error updating service:", error);
            toast({
                title: "Error Updating Service",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsUpdatingService(false);
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (!shopId) return;

        // Optional: Add a confirmation dialog here for better UX

        setIsDeletingService(id); // Set ID being deleted for specific loader/disabling
        const db = getFirestore(app);
        const serviceDocRef = firestoreDoc(db, "saloons", shopId, "services", id);

        try {
            await deleteDoc(serviceDocRef);

            // Update UI state
            setServices(prevServices => prevServices.filter(service => service.id !== id));

            toast({
                title: "Service Deleted",
                description: `"${name}" deleted successfully.`,
            });
        } catch (error: any) {
            console.error("Error deleting service:", error);
            toast({
                title: "Error Deleting Service",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsDeletingService(null); // Reset deleting ID
        }
    };

    // --- Render Logic ---

    if (!user && !isLoadingShop) {
        // Should have been redirected, but this prevents rendering before redirect happens
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
             <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
                 <h1 className="text-2xl font-semibold">Saloon Dashboard</h1>
                 {/* Add Logout button or user profile dropdown here later */}
            </header>

            <main className="container mx-auto py-6 px-4 sm:px-6 grid gap-8">

                {/* Shop Info & Quick Actions Row */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Shop Information</CardTitle>
                            <CardDescription>Details about your registered saloon.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingShop ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Loading shop details...</span>
                                </div>
                            ) : shopData ? (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    {shopData.image && (
                                        <div className="col-span-1 sm:col-span-2 flex justify-center">
                                            <Image
                                                src={shopData.image}
                                                alt={shopData.shopName}
                                                width={200} // Adjust as needed
                                                height={150} // Adjust as needed
                                                className="rounded-md object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="font-medium">Shop Name:</div><div>{shopData.shopName}</div>
                                    <div className="font-medium">Owner Name:</div><div>{shopData.ownerName}</div>
                                    <div className="font-medium">Location:</div><div>{shopData.location}</div>
                                    <div className="font-medium">Contact Email:</div><div>{shopData.email}</div>
                                    {/* Add Shop ID if needed, maybe less prominent */}
                                    {/* <div className="font-medium text-xs text-gray-500 col-span-2 pt-1">Shop ID: {shopId}</div> */}
                                </dl>
                            ) : (
                                <p className="text-sm text-red-600">Could not load shop information.</p>
                            )}
                        </CardContent>
                         <CardFooter>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/saloon-owner-dashboard/profile">
                                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Manage appointments and profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-3">
                             <Button variant="outline" asChild>
                                <Link href="/saloon-owner-dashboard/view-appointments">
                                    <ExternalLink className="h-4 w-4 mr-2" /> View Appointments
                                </Link>
                            </Button>
                             {/* Removed profile link here as it's in Shop Info card footer */}
                        </CardContent>
                    </Card>
                </div>

                {/* Manage Services Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Services</CardTitle>
                        <CardDescription>Add, edit, or remove services offered by your saloon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Service Form */}
                        <div>
                            <h3 className="text-lg font-medium mb-3">Add New Service</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                <div className="space-y-1.5">
                                    <Label htmlFor="newServiceName">Service Name</Label>
                                    <Input
                                        id="newServiceName"
                                        type="text"
                                        placeholder="e.g., Haircut"
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        disabled={isAddingService}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="newServicePrice">Price (₹)</Label>
                                    <Input
                                        id="newServicePrice"
                                        type="number"
                                        placeholder="e.g., 25.00"
                                        value={newServicePrice}
                                        onChange={(e) => setNewServicePrice(e.target.value)}
                                        step="0.01"
                                        min="0"
                                        disabled={isAddingService}
                                    />
                                </div>
                                <Button onClick={handleAddService} disabled={isAddingService} className="w-full sm:w-auto">
                                    {isAddingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Add Service
                                </Button>
                            </div>
                        </div>

                        {/* Services Table */}
                        <div>
                             <h3 className="text-lg font-medium mb-3">Current Services</h3>
                             <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service Name</TableHead>
                                            <TableHead className="w-[120px] text-right">Price</TableHead>
                                            <TableHead className="w-[180px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingServices ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-4">
                                                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Loading services...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : services.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-sm text-gray-500 py-4">
                                                    No services added yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            services.map((service) => (
                                                <TableRow key={service.id} className={editServiceId === service.id ? "bg-muted/50" : ""}>
                                                    {editServiceId === service.id ? (
                                                        // Edit Mode Cells
                                                        <>
                                                            <TableCell>
                                                                <Input
                                                                    type="text"
                                                                    value={editServiceName}
                                                                    onChange={(e) => setEditServiceName(e.target.value)}
                                                                    className="h-8"
                                                                    disabled={isUpdatingService}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Input
                                                                    type="number"
                                                                    value={editServicePrice}
                                                                    onChange={(e) => setEditServicePrice(e.target.value)}
                                                                    step="0.01" min="0"
                                                                    className="h-8 text-right"
                                                                    disabled={isUpdatingService}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-green-600 hover:text-green-700"
                                                                    onClick={handleSaveService}
                                                                    disabled={isUpdatingService}
                                                                    aria-label="Save changes"
                                                                >
                                                                    {isUpdatingService ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4" />}
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8"
                                                                    onClick={handleCancelEdit}
                                                                    disabled={isUpdatingService}
                                                                    aria-label="Cancel edit"
                                                                >
                                                                    <CancelIcon className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        // View Mode Cells
                                                        <>
                                                            <TableCell className="font-medium">{service.name}</TableCell>
                                                            <TableCell className="text-right">₹{service.price.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                                 <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleEditClick(service)}
                                                                    disabled={!!isDeletingService || !!editServiceId} // Disable if any delete/edit is active
                                                                    aria-label="Edit service"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                 <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                                                    onClick={() => handleDeleteService(service.id, service.name)}
                                                                    disabled={isDeletingService === service.id || !!editServiceId} // Disable if this one is deleting or any edit is active
                                                                    aria-label="Delete service"
                                                                >
                                                                    {isDeletingService === service.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                                                </Button>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                     {/* Optional: Add TableCaption if needed */}
                                     {/* <TableCaption>A list of your offered services.</TableCaption> */}
                                </Table>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </main>
        </div>
    );
}