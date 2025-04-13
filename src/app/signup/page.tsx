"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default role
    const [firebaseApp, setFirebaseApp] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadFirebase = async () => {
      const firebase = await import('../../lib/firebase');
      setFirebaseApp(firebase.app);
    };

    loadFirebase();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!firebaseApp) {
      setError("Firebase not initialized.");
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      await createUserWithEmailAndPassword(auth, email, password);
      // Here, you would typically save the user's role to a database
      // associated with their Firebase UID.  Since we don't have a DB setup, we skip this.

      router.push("/landing"); // Redirect to landing after successful signup
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

    if (!firebaseApp) {
      setError("Firebase not initialized.");
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/landing"); // Or wherever you want to redirect after signup
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
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>
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

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="saloon owner">Saloon Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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
            <a href="/login" className="text-primary hover:underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

