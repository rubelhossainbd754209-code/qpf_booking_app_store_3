"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardTable } from "@/components/dashboard-table";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { AppLogo } from "@/components/icons";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeName, setStoreName] = useState("Store-3");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check Auth
        const authResponse = await fetch('/api/auth/verify');
        if (authResponse.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
          return;
        }

        // Fetch Store Name
        const settingsResponse = await fetch('/api/settings');
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setStoreName(settingsData.settings.storeName || settingsData.settings.storeId || "Store-3");
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-24 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Button asChild variant="default" className="bg-red-500 hover:bg-red-600">
              <Link href="/">New Request</Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6 md:py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] font-headline">
                Admin Dashboard <span className="text-red-500 font-normal text-xl md:text-2xl ml-2">— {storeName}</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl mt-2">
                Manage repair requests and form configurations
              </p>
            </div>
          </div>

          <DashboardStats />

          <div className="mt-8">
            <DashboardTabs />
          </div>
        </div>
      </main>
    </>
  );
}
