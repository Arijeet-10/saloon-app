"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import Link from "next/link";
import imageData from "@/assets/images/images.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Assuming images.json looks like: { "images": ["url1.jpg", "url2.png", ...] }
const images = imageData.images;

export default function SaloonOwnerSignupPage() {
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Store the selected image URL
  const [selectedImage, setSelectedImage] = useState<string>(""); // Initialize as empty string for Select component
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic validation: Ensure an image is selected
    if (!selectedImage) {
        setError("Please select a shop image style.");
        toast({
            title: "Missing Information",
            description: "Please select a shop image style.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const db = getFirestore(app);
      const saloonDoc = doc(db, "saloons", user.uid);

      await setDoc(saloonDoc, {
          ownerId: user.uid,
          shopName,
          location,
          ownerName,
          email,
          image: selectedImage, // Save the selected image URL
          createdAt: new Date().toISOString(),
      });

      toast({
        title: "Account created successfully",
        description: "Redirecting to your dashboard...",
      });

      router.push("/saloon-owner-dashboard");
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error signing up",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    // Also check image selection for Google sign-in if needed (optional, depends on flow)
    // if (!selectedImage) {
    //     setError("Please select a shop image style before signing in with Google.");
    //     toast({
    //         title: "Missing Information",
    //         description: "Please select a shop image style.",
    //         variant: "destructive",
    //     });
    //     setIsLoading(false);
    //     return;
    // }

    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const db = getFirestore(app);
      const saloonDoc = doc(db, "saloons", user.uid);

      // You might want to fetch existing data if the user already exists via Google sign-in
      // For simplicity, we're overwriting/creating here.
      await setDoc(saloonDoc, {
          ownerId: user.uid,
          // Use form fields if filled, otherwise maybe prompt later or use defaults
          shopName: shopName || `Shop for ${user.displayName || user.email}`,
          location: location || "", // Might require location later
          ownerName: ownerName || user.displayName || "Google User",
          email: user.email || "",
          image: selectedImage || images[0] || "", // Default to first image or empty if none selected
          createdAt: new Date().toISOString(),
      }, { merge: true }); // Use merge: true if you want to update existing docs without overwriting all fields

      toast({
        title: "Login successful",
        description: "Redirecting to your dashboard...",
      });

      router.push("/saloon-owner-dashboard");
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error signing up with Google",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Saloon Owner Sign Up</h1>
          <p className="text-gray-600 mt-2">Create your business account</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... other input fields (shopName, location, ownerName, email, password) ... */}
               <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Barber King"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Mumbai, India"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6} // Add minLength validation
                />
              </div>

              {/* --- Improved Image Selection --- */}
              <div className="space-y-2">
                <Label htmlFor="shopImage">Shop Image Style</Label>
                <Select onValueChange={setSelectedImage} value={selectedImage}>
                  <SelectTrigger
                    id="shopImage"
                    className="w-full h-auto min-h-[2.5rem] items-start py-2" // Adjust height and padding
                  >
                    {selectedImage ? (
                       // Display selected image preview
                       <div className="flex items-center gap-3 text-sm">
                          <img
                            src={selectedImage}
                            alt="Selected shop style"
                            className="h-10 w-10 rounded-md object-cover" // Preview size
                          />
                           {/* Find the index to display a user-friendly name */}
                           <span>Selected: Style {images.indexOf(selectedImage) + 1}</span>
                       </div>
                    ) : (
                       // Use SelectValue only for the placeholder text
                       <SelectValue placeholder="Select a visual style for your shop" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {images.map((image, index) => (
                      <SelectItem key={index} value={image}>
                        {/* Display thumbnail and text in the dropdown */}
                        <div className="flex items-center gap-3">
                           <img
                              src={image}
                              alt={`Shop Style ${index + 1}`}
                              className="h-8 w-8 rounded-md object-cover" // Thumbnail size
                           />
                           <span>Style {index + 1}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* --- End of Improved Image Selection --- */}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {/* ... Google Sign-in and Login Link ... */}
             <div className="mt-6 flex items-center">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or sign up with</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>

            <Button
              type="button"
              className="w-full mt-4 h-10 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/saloon-owner-login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-gray-500 mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}