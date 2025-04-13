"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";

export default function LoginPage() {
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Here, you would typically fetch the user's role from a database
      // associated with their Firebase UID. For now, we'll just hardcode a role for testing.
      // const role = await fetchUserRoleFromDatabase(user.uid);  //Example function

      // Hardcoded role for demonstration
      const role = "saloon owner"; // Replace with actual role fetching logic

      if (role === "saloon owner") {
        router.push("/saloon-owner-dashboard");
      } else {
        router.push("/landing");
      }

    } catch (e: any) {
      setError(e.message);
           toast({
               title: "Error signing in",
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

      // Here, you would typically fetch the user's role from a database
      // associated with their Firebase UID. For now, we'll just hardcode a role for testing.
      // const role = await fetchUserRoleFromDatabase(user.uid);  //Example function

      // Hardcoded role for demonstration
      const role = "saloon owner"; // Replace with actual role fetching logic

      if (role === "saloon owner") {
        router.push("/saloon-owner-dashboard");
      } else {
        router.push("/landing");
      }
    } catch (e: any) {
      setError(e.message);
          toast({
              title: "Error signing in with Google",
              description: e.message,
              variant: "destructive",
          });
    }
  };

  return (
    <div className="grid h-screen place-items-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
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
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full mt-4">
              Log In
            </Button>
          </form>
            <div className="flex items-center">
                <div className="border-t border-border flex-grow"></div>
                <div className="mx-4 text-muted-foreground">Or</div>
                <div className="border-t border-border flex-grow"></div>
            </div>
          <Button type="button" className="w-full mt-4" onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>
          <p className="text-sm text-center">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
