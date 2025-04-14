"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";
import { addDoc, collection, getFirestore } from "firebase/firestore";

export default function SaloonOwnerSignupPage() {
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get a reference to the Firestore database
      const db = getFirestore(app);

      // Create a new document in the "saloons" collection
      const saloonsCollection = collection(db, "saloons");
      await addDoc(saloonsCollection, {
        ownerId: user.uid, // Link to the Firebase Auth user
        shopName: shopName,
        location: location,
        ownerName: ownerName,
        email: email, // Store email for easy access
      });

      router.push("/saloon-owner-dashboard"); // Redirect to saloon owner dashboard
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error signing up",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);

    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Get a reference to the Firestore database
      const db = getFirestore(app);

      // Create a new document in the "saloons" collection
      const saloonsCollection = collection(db, "saloons");
      await addDoc(saloonsCollection, {
        ownerId: user.uid, // Link to the Firebase Auth user
        shopName: shopName,
        location: location,
        ownerName: ownerName,
        email: email, // Store email for easy access
      });

      router.push("/saloon-owner-dashboard"); // Redirect to saloon owner dashboard
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error signing up with Google",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid h-screen place-items-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Saloon Owner Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter your shop name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full mt-4">
              Sign Up
            </Button>
          </form>
          <div className="flex items-center">
            <div className="border-t border-border flex-grow"></div>
            <div className="mx-4 text-muted-foreground">Or</div>
            <div className="border-t border-border flex-grow"></div>
          </div>
          <Button type="button" className="w-full mt-4" onClick={handleGoogleSignIn}>
            Sign Up with Google
          </Button>
          <p className="text-sm text-center">
            Already have an account?{" "}
            <a href="/saloon-owner-login" className="text-primary hover:underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
