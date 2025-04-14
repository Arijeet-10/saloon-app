"use client";

import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function SaloonOwnerProfilePage() {
    const [shopData, setShopData] = useState({
        shopName: "",
        location: "",
        ownerName: "",
        email: "",
        image: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [imageFile, setImageFile] = useState(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);

                // Fetch shop data from Firestore
                const db = getFirestore(app);
                const userDocRef = doc(db, "saloons", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setShopData(userDoc.data());
                } else {
                    console.error("Shop data not found for user:", user.uid);
                    toast({
                        title: "Error",
                        description: "Shop data not found. Please contact support.",
                        variant: "destructive"
                    });
                }
            } else {
                router.push('/saloon-owner-login');
            }
        });

        return () => unsubscribe();
    }, [router, toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShopData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };


    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                throw new Error("Not authenticated");
            }

            const db = getFirestore(app);
            const userDocRef = doc(db, "saloons", user.uid);

            let imageUrl = shopData.image; // Default to existing image URL

            if (imageFile) {
                const storage = getStorage(app);
                const imageRef = ref(storage, `saloon-images/${user.uid}/${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref); // Get the download URL
            }

            await updateDoc(userDocRef, {
                ...shopData,
                image: imageUrl // Store the image URL in Firestore
            });

            setIsEditing(false);
            toast({
                title: "Success",
                description: "Shop details updated successfully."
            });
        } catch (error) {
            console.error("Error updating shop data:", error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Saloon Owner Profile</h1>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Shop Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <div className="grid gap-2">
                            <Label htmlFor="image">Shop Image</Label>
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={shopData.image || "https://images.unsplash.com/photo-1616226384899-f9890b13d852?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"} alt="Shop Image" />
                                <AvatarFallback>SS</AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            )}
                        </div>
                    <div className="grid gap-2">
                        <Label htmlFor="shopName">Shop Name</Label>
                        <Input
                            id="shopName"
                            name="shopName"
                            value={shopData.shopName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            name="location"
                            value={shopData.location}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ownerName">Owner Name</Label>
                        <Input
                            id="ownerName"
                            name="ownerName"
                            value={shopData.ownerName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={shopData.email}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="flex justify-end">
                        {isEditing ? (
                            <>
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button className="ml-2" onClick={handleSave}>Save</Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

