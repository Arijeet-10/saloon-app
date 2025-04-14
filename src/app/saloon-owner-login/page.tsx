"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { useToast } from "@/hooks/use-toast"; // Assuming this path is correct
import { app } from "@/lib/firebase"; // Assuming this path is correct

export default function SaloonOwnerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Added type annotation
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => { // Added type annotation
    event.preventDefault();
    setError(null);
    setIsLoading(true); // Set loading true

    try {
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Security Note: Storing the whole user object in localStorage is generally not recommended.
      // Firebase Auth SDK handles session persistence securely by default.
      // Consider if you truly need to store this or parts of it in localStorage.
      localStorage.setItem('user', JSON.stringify(user));

      toast({ // Added success toast
        title: "Login successful",
        description: "Redirecting you to the dashboard...",
      });

      router.push("/saloon-owner-dashboard"); // Redirect to saloon owner dashboard

    } catch (e: any) { // Keep 'any' or use specific Firebase Auth Error type
      // Consider mapping common Firebase errors to user-friendly messages
      const errorMessage = e.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        title: "Error signing in",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
        setIsLoading(false); // Set loading false in finally block
    }
  };

  return (
    // Applied consistent layout and background from the first example
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Added wrapper div for max-width */}
      <div className="w-full max-w-md">
        {/* Added descriptive header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Saloon Owner Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your saloon</p>
        </div>

        {/* Applied consistent card styling */}
        <Card className="shadow-lg border-0">
          {/* Removed CardHeader, integrated title into the top section */}
          <CardContent className="pt-6"> {/* Adjusted padding */}
            {/* Applied consistent form spacing */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Applied consistent input group structure */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" // Consistent placeholder
                  className="h-10" // Consistent height
                  required
                  disabled={isLoading} // Disable input when loading
                />
              </div>

              {/* Applied consistent input group structure */}
              <div className="space-y-2">
                 {/* Added flex container for label and forgot password link */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  {/* Added Forgot Password link */}
                  <a href="/forgot-password" /* Adjust href as needed */ className="text-xs text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" // Kept original placeholder
                  className="h-10" // Consistent height
                  required
                  disabled={isLoading} // Disable input when loading
                />
              </div>

              {/* Consistent error display */}
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

              {/* Consistent button styling and loading state */}
              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700" // Consistent styling
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Log In"}
              </Button>
            </form>

             {/* Consistent Sign Up link section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/saloon-owner-signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Create account
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Added footer text */}
        <p className="text-xs text-center text-gray-500 mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}