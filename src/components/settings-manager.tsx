"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw, Database, Server, Smartphone } from "lucide-react";

export function SettingsManager() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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
                            <Input
                                id="laravelKey"
                                type="password"
                                placeholder="Your Laravel API Key"
                                value={settings.laravelApiKey}
                                onChange={(e) => setSettings({ ...settings, laravelApiKey: e.target.value })}
                            />
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
