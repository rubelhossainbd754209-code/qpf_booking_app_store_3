"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw, Database, Server, Smartphone, Eye, EyeOff, Copy } from "lucide-react";

export function SettingsManager() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingSupabase, setIsTestingSupabase] = useState(false);
    const [showSupabaseKey, setShowSupabaseKey] = useState(false);
    const [showLaravelKey, setShowLaravelKey] = useState(false);
    const [settings, setSettings] = useState({
        supabaseUrl: "",
        supabaseAnonKey: "",
        laravelApiUrl: "",
        laravelApiKey: "",
        storeId: "",
        storeName: "",
        storeCode: "",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/settings");
            const data = await response.json();
            if (data.success) {
                setSettings(data.settings);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load settings.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestSupabase = async () => {
        if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
            toast({
                title: "Validation Error",
                description: "Please enter both Supabase URL and Anon Key.",
                variant: "destructive",
            });
            return;
        }

        setIsTestingSupabase(true);
        try {
            const response = await fetch("/api/settings/test-supabase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    supabaseUrl: settings.supabaseUrl,
                    supabaseAnonKey: settings.supabaseAnonKey,
                }),
            });
            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Connection Successful",
                    description: data.message,
                    variant: data.tableMissing ? "default" : "default",
                });
            } else {
                toast({
                    title: "Connection Failed",
                    description: data.error || "Could not connect to Supabase.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred during the test.",
                variant: "destructive",
            });
        } finally {
            setIsTestingSupabase(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await response.json();
            if (data.success) {
                toast({
                    title: "Success",
                    description: "Settings updated successfully. Some changes may require a page refresh.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Supabase Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <Database className="h-5 w-5" />
                            Supabase Configuration
                        </CardTitle>
                        <CardDescription>
                            Connect to your Supabase database for data persistence.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supabaseUrl">Supabase URL</Label>
                            <Input
                                id="supabaseUrl"
                                placeholder="https://your-project.supabase.co"
                                value={settings.supabaseUrl}
                                onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="supabaseKey">Anon Key</Label>
                            <Input
                                id="supabaseKey"
                                type="password"
                                placeholder="Paste your anon key here"
                                value={settings.supabaseAnonKey}
                                onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={handleTestSupabase}
                            disabled={isTestingSupabase}
                        >
                            {isTestingSupabase ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Test Connection
                        </Button>
                    </CardContent>
                </Card>

                {/* Your Booking API - Dynamic URL for Laravel */}
                <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <Server className="h-5 w-5" />
                            📡 Your Booking API for Laravel
                        </CardTitle>
                        <CardDescription>
                            Copy this URL and API Key to configure in your Laravel system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-green-700 font-semibold">Booking API URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/api/laravel/requests` : ''}
                                    className="bg-white border-green-300"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-green-300 hover:bg-green-100"
                                    onClick={() => {
                                        const url = `${window.location.origin}/api/laravel/requests`;
                                        navigator.clipboard.writeText(url);
                                        toast({ title: "Copied!", description: "API URL copied to clipboard" });
                                    }}
                                >
                                    <Copy className="h-4 w-4 text-green-700" />
                                </Button>
                            </div>
                            <p className="text-xs text-green-600">
                                {typeof window !== 'undefined' && window.location.hostname === 'localhost'
                                    ? "🖥️ Local Development Mode - Only accessible on your PC"
                                    : "🌐 Live Mode - Accessible from anywhere"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-green-700 font-semibold">API Key (for Laravel X-API-Key header)</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={settings.laravelApiKey}
                                    className="bg-white border-green-300"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-green-300 hover:bg-green-100"
                                    onClick={() => {
                                        navigator.clipboard.writeText(settings.laravelApiKey);
                                        toast({ title: "Copied!", description: "API Key copied to clipboard" });
                                    }}
                                >
                                    <Copy className="h-4 w-4 text-green-700" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Laravel Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <Server className="h-5 w-5" />
                            Laravel API Integration
                        </CardTitle>
                        <CardDescription>
                            Configure the connection to your Laravel backend.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="laravelUrl">Laravel API Base URL</Label>
                            <Input
                                id="laravelUrl"
                                placeholder="https://your-laravel-app.com/api"
                                value={settings.laravelApiUrl}
                                onChange={(e) => setSettings({ ...settings, laravelApiUrl: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="laravelKey">API Key (X-API-Key)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="laravelKey"
                                    type={showLaravelKey ? "text" : "password"}
                                    placeholder="Your Laravel API Key"
                                    value={settings.laravelApiKey}
                                    onChange={(e) => setSettings({ ...settings, laravelApiKey: e.target.value })}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => setShowLaravelKey(!showLaravelKey)}
                                    title={showLaravelKey ? "Hide API Key" : "Show API Key"}
                                >
                                    {showLaravelKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(settings.laravelApiKey);
                                        toast({ title: "Copied!", description: "API Key copied to clipboard" });
                                    }}
                                    title="Copy API Key"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Store Identification */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <Smartphone className="h-5 w-5" />
                            Store Identification
                        </CardTitle>
                        <CardDescription>
                            These values identify this specific store deployment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="storeId">Store ID (e.g., store-3)</Label>
                            <Input
                                id="storeId"
                                placeholder="store-3"
                                value={settings.storeId}
                                onChange={(e) => setSettings({ ...settings, storeId: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storeName">Store Name</Label>
                            <Input
                                id="storeName"
                                placeholder="Quick Phone Fix Germantown"
                                value={settings.storeName}
                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storeCode">Store Code (e.g., QPF-S3)</Label>
                            <Input
                                id="storeCode"
                                placeholder="QPF-S3"
                                value={settings.storeCode}
                                onChange={(e) => setSettings({ ...settings, storeCode: e.target.value })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t pt-6 mt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isSaving ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Configuration
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
