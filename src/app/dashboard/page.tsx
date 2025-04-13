"use client";

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { initializeApp } from "firebase/app";
import { app } from "@/lib/firebase";
import nextConfig from '../../../next.config';

// Access publicRuntimeConfig values directly from nextConfig
const {
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} = nextConfig.publicRuntimeConfig;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Firebase if it hasn't been already
    if (!app) {
        initializeApp({
            apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        });
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); // Redirect if not logged in
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Sign out error", error);
    }
  };


  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar collapsible="icon">
          <SidebarHeader className="m-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://picsum.photos/96/96" alt="Avatar" />
                <AvatarFallback>LK</AvatarFallback>
              </Avatar>
              <h2 className="font-semibold">{user.email}</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Icons.home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Icons.settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
              <Icons.arrowRight className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 p-4">
          <h1>Dashboard</h1>
          <p>Welcome, {user.email}!</p>
          {/* Add more dashboard content here */}
        </div>
      </div>
    </SidebarProvider>
  );
}
