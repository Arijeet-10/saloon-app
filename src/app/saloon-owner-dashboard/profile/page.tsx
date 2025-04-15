"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// Removed Avatar components, no longer needed for rectangular image
import { Loader2, Edit, X as CancelIcon, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// Define a type for the shop data for better type safety
type ShopProfileData = {
    shopName: string;
    location: string;
    ownerName: string;
    email: string;
    image?: string | null; // Image URL is optional
    ownerId?: string; // Keep track of owner ID
};

// Default empty state matching the type
const initialShopData: ShopProfileData = {
    shopName: "",
    location: "",
    ownerName: "",
    email: "",
    image: null,
};

export default function SaloonOwnerProfilePage() {
    // State for current form data
    const [shopData, setShopData] = useState<ShopProfileData>(initialShopData);
    // State to store the original data loaded from Firestore (for cancellation)
    const [originalShopData, setOriginalShopData] = useState<ShopProfileData | null>(null);
    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);
    // State for Firebase user
    const [user, setUser] = useState<User | null>(null);
    // State for the selected image file
    const [imageFile, setImageFile] = useState<File | null>(null);
    // State for image preview URL
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    // Loading states
    const [isLoading, setIsLoading] = useState(true); // Initial data load
    const [isSaving, setIsSaving] = useState(false); // Saving data

    const router = useRouter();
    const { toast } = useToast();

    // --- Data Fetching ---
    const fetchShopData = useCallback(async (currentUser: User) => {
        setIsLoading(true);
        const db = getFirestore(app);
        const shopDocRef = doc(db, "saloons", currentUser.uid);

        try {
            const shopDoc = await getDoc(shopDocRef);

            if (shopDoc.exists()) {
                const data = shopDoc.data() as ShopProfileData;
                setShopData(data);
                setOriginalShopData(data);
            } else {
                console.log("Shop data not found, creating initial structure for user:", currentUser.uid);
                 const initialData: ShopProfileData = {
                    shopName: "My Saloon",
                    location: "",
                    ownerName: currentUser.displayName || "",
                    email: currentUser.email || "",
                    image: null,
                    ownerId: currentUser.uid,
                 };
                 setShopData(initialData);
                 setOriginalShopData(initialData);
                 setIsEditing(true);
                 toast({
                    title: "Setup Profile",
                    description: "Please complete your shop details.",
                    variant: "default"
                 });
            }
        } catch (error: any) {
            console.error("Error fetching shop data:", error);
            toast({
                title: "Error Loading Profile",
                description: error.message || "Could not load shop details.",
                variant: "destructive",
            });
            setShopData(initialShopData);
            setOriginalShopData(null);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchShopData(currentUser);
            } else {
                setUser(null);
                router.push('/saloon-owner-login');
            }
        });

        return () => {
            unsubscribe();
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, fetchShopData]);

    // --- Event Handlers ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShopData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);
        } else {
            setImageFile(null);
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            setImagePreviewUrl(null);
        }
    };

    const handleCancelEdit = () => {
        if (originalShopData) {
            setShopData(originalShopData);
        }
        setImageFile(null);
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(null);
        setIsEditing(false);
    };

    // --- Save Logic ---
    const handleSave = async (event: FormEvent) => {
        event.preventDefault();
        if (!user) {
            toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        const db = getFirestore(app);
        const storage = getStorage(app);
        const shopDocRef = doc(db, "saloons", user.uid);

        let newImageUrl: string | null = shopData.image ?? null;

        try {
            if (imageFile) {
                if (shopData.image) {
                    try {
                       const oldImageRef = ref(storage, shopData.image);
                       await deleteObject(oldImageRef);
                       console.log("Old image deleted successfully");
                    } catch(delErr: any) {
                        // Log error but continue - maybe the old URL was invalid or permissions changed
                        if (delErr.code !== 'storage/object-not-found') {
                            console.warn("Old image delete failed:", delErr);
                        }
                    }
                }

                const imageRef = ref(storage, `saloon-images/${user.uid}/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                newImageUrl = await getDownloadURL(snapshot.ref);
            }

            const dataToUpdate: Partial<ShopProfileData> = { // Use Partial for updateDoc
                shopName: shopData.shopName,
                location: shopData.location,
                ownerName: shopData.ownerName,
                email: shopData.email,
                image: newImageUrl,
                ownerId: user.uid, // Ensure ownerId is always present
            };

             // Use setDoc with merge if creating/updating, or updateDoc if sure it exists
            // Using updateDoc here assuming fetchShopData ensures it exists or creates it.
            await updateDoc(shopDocRef, dataToUpdate);

            const updatedFullData = { ...shopData, ...dataToUpdate }; // Create the full data object for local state
            setShopData(updatedFullData);
            setOriginalShopData(updatedFullData);
            setImageFile(null);
            if (imagePreviewUrl) {
                 URL.revokeObjectURL(imagePreviewUrl);
                 setImagePreviewUrl(null);
            }
            setIsEditing(false);

            toast({
                title: "Profile Updated",
                description: "Your shop details have been saved successfully.",
            });

        } catch (error: any) {
            console.error("Error updating shop data:", error);
            toast({
                title: "Save Failed",
                description: error.message || "Could not save profile changes.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Determine the source for the image display
    const imageDisplaySrc = imagePreviewUrl || shopData.image;
    // Fallback text (e.g., initials)
    const fallbackText = shopData.shopName?.substring(0, 2).toUpperCase() || "SN";

    return (
        <div className="container mx-auto py-10 px-4 md:px-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Shop Profile</h1>
                <p className="text-muted-foreground">Manage your saloon's information.</p>
            </header>

            {isLoading ? (
                // --- Loading Skeleton ---
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        {/* Skeleton for Image Area */}
                        <div className="flex flex-col items-center md:items-start space-y-4">
                             {/* Rectangular Skeleton */}
                             <Skeleton className="w-full h-40 md:h-48 rounded-md" />
                             <Skeleton className="h-9 w-full" />
                        </div>
                        {/* Skeleton for Form Fields */}
                        <div className="md:col-span-2 grid gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="grid gap-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                         <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>

            ) : (
                 // --- Profile Card ---
                 <Card className="w-full max-w-3xl mx-auto">
                     <form onSubmit={handleSave}>
                         <CardHeader>
                             <CardTitle>Shop Details</CardTitle>
                             <CardDescription>
                                 {isEditing ? "Update your shop's name, location, and image." : "View your current shop details."}
                             </CardDescription>
                         </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                             {/* Image Section (Rectangular) */}
                             <div className="flex flex-col items-center md:items-start space-y-4">
                                 <Label htmlFor={isEditing ? "shopImage" : undefined} className="text-center md:text-left font-medium self-stretch">Shop Image</Label>
                                 {/* Rectangular Image Display Container */}
                                 <div className="w-full aspect-video md:aspect-[4/3] max-h-48 overflow-hidden rounded-md ring-1 ring-muted flex items-center justify-center bg-muted text-muted-foreground">
                                     {imageDisplaySrc ? (
                                         <img
                                             src={imageDisplaySrc}
                                             alt={shopData.shopName || "Shop Image"}
                                             className="h-full w-full object-cover" // cover ensures the image fills the container without distortion
                                         />
                                     ) : (
                                         // Fallback content when no image
                                         <span className="text-2xl font-semibold">{fallbackText}</span>
                                     )}
                                 </div>
                                 {isEditing && (
                                     <div className="w-full">
                                         <Input
                                             id="shopImage"
                                             type="file"
                                             accept="image/png, image/jpeg, image/webp"
                                             onChange={handleImageChange}
                                             className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                                             disabled={isSaving}
                                         />
                                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 2MB.</p>
                                     </div>
                                 )}
                             </div>

                             {/* Details Section */}
                             <div className="md:col-span-2 grid gap-4">
                                 {/* Input fields remain the same */}
                                 <div className="grid gap-1.5">
                                     <Label htmlFor="shopName">Shop Name</Label>
                                     <Input
                                         id="shopName"
                                         name="shopName"
                                         value={shopData.shopName}
                                         onChange={handleInputChange}
                                         disabled={!isEditing || isSaving}
                                         required
                                     />
                                 </div>
                                 <div className="grid gap-1.5">
                                     <Label htmlFor="location">Location</Label>
                                     <Input
                                         id="location"
                                         name="location"
                                         value={shopData.location}
                                         onChange={handleInputChange}
                                         disabled={!isEditing || isSaving}
                                         placeholder="e.g., 123 Main St, Anytown"
                                     />
                                 </div>
                                 <div className="grid gap-1.5">
                                     <Label htmlFor="ownerName">Owner Name</Label>
                                     <Input
                                         id="ownerName"
                                         name="ownerName"
                                         value={shopData.ownerName}
                                         onChange={handleInputChange}
                                         disabled={!isEditing || isSaving}
                                     />
                                 </div>
                                 <div className="grid gap-1.5">
                                     <Label htmlFor="email">Contact Email</Label>
                                     <Input
                                         id="email"
                                         name="email"
                                         type="email"
                                         value={shopData.email}
                                         onChange={handleInputChange}
                                         disabled={!isEditing || isSaving}
                                         required
                                     />
                                 </div>
                             </div>
                         </CardContent>
                         <CardFooter className="flex justify-end space-x-3 border-t pt-6">
                            {/* Footer buttons remain the same */}
                             {isEditing ? (
                                 <>
                                     <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                                         <CancelIcon className="h-4 w-4 mr-2" /> Cancel
                                     </Button>
                                     <Button type="submit" disabled={isSaving || !user}> {/* Disable save if no user */}
                                         {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                         Save Changes
                                     </Button>
                                 </>
                             ) : (
                                 <Button type="button" onClick={() => setIsEditing(true)} disabled={isLoading}>
                                     <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                 </Button>
                             )}
                         </CardFooter>
                     </form>
                 </Card>
            )}
        </div>
    );
}