"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { app } from "@/lib/firebase";

const Header = () => {
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        const auth = getAuth(app);
        try {
            await signOut(auth);
            router.push('/login');
            localStorage.removeItem('user');
            toast({
                title: "Sign out successful",
                description: "You have been signed out",
            });
        } catch (error) {
            console.error("Sign out error", error);
            toast({
                title: "Error signing out",
                description: "There was an error signing out",
                variant: "destructive",
            });
        }
    };


    return (
        <header className="bg-background border-b p-4 flex justify-between items-center">
            <Link href="/" className="text-lg font-semibold">
                Saloon Booking App
            </Link>
            <nav>
                <ul className="flex space-x-4">
                    <li>
                        <Link href="/landing">Home</Link>
                    </li>
                    <li>
                        <Link href="/upcoming-appointments">Appointments</Link>
                    </li>
                    <li>
                        <Button variant="outline" size="sm" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;

