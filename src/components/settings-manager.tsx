"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw, Database, Server, Smartphone, Eye, EyeOff, Copy, FileCode, ChevronDown, ChevronUp } from "lucide-react";

// SQL Setup Script for Supabase
const SUPABASE_SQL_SCRIPT = `-- =============================================
-- 📦 Supabase Setup Script for Booking App
-- =============================================
-- Run this script in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- ⚠️ IMPORTANT: This script works for BOTH:
-- 1. New installations (creates tables from scratch)
-- 2. Existing tables (adds missing columns)

-- ============================================
-- 🔧 STEP 1: Add missing columns to existing tables
-- ============================================
-- (Run this FIRST if you have existing tables)

ALTER TABLE IF EXISTS repair_requests 
ADD COLUMN IF NOT EXISTS store_id VARCHAR(50);

ALTER TABLE IF EXISTS repair_requests
ADD COLUMN IF NOT EXISTS store_name VARCHAR(255);

ALTER TABLE IF EXISTS repair_requests
ADD COLUMN IF NOT EXISTS store_code VARCHAR(50);

ALTER TABLE IF EXISTS repair_requests
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- 1️⃣ Create repair_requests table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS repair_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    brand VARCHAR(100) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'New',
    store_id VARCHAR(50),
    store_name VARCHAR(255),
    store_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2️⃣ Create form_options table
-- ============================================
CREATE TABLE IF NOT EXISTS form_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'brand', 'device_type', 'model'
    value VARCHAR(255) NOT NULL,
    brand VARCHAR(100), -- parent brand for device_type/model
    device_type VARCHAR(100), -- parent device_type for model
    store_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3️⃣ Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_options ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4️⃣ Create policies (DROP first to avoid conflicts)
-- ============================================
DROP POLICY IF EXISTS "Allow public read repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Allow public insert repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Allow public update repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Allow public delete repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Allow public read form_options" ON form_options;
DROP POLICY IF EXISTS "Allow public insert form_options" ON form_options;
DROP POLICY IF EXISTS "Allow public delete form_options" ON form_options;

-- Create fresh policies
CREATE POLICY "Allow public read repair_requests" ON repair_requests
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert repair_requests" ON repair_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update repair_requests" ON repair_requests
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete repair_requests" ON repair_requests
    FOR DELETE USING (true);

CREATE POLICY "Allow public read form_options" ON form_options
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert form_options" ON form_options
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete form_options" ON form_options
    FOR DELETE USING (true);

-- ============================================
-- 5️⃣ Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_requests_store_id ON repair_requests(store_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_created_at ON repair_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_options_type ON form_options(type);
CREATE INDEX IF NOT EXISTS idx_form_options_brand ON form_options(brand);

-- ============================================
-- 6️⃣ Insert default form options (optional)
-- ============================================
INSERT INTO form_options (type, value) VALUES
    ('brand', 'Apple'),
    ('brand', 'Samsung'),
    ('brand', 'Google'),
    ('brand', 'OnePlus'),
    ('brand', 'Xiaomi')
ON CONFLICT DO NOTHING;

INSERT INTO form_options (type, value, brand) VALUES
    ('device_type', 'iPhone', 'Apple'),
    ('device_type', 'iPad', 'Apple'),
    ('device_type', 'MacBook', 'Apple'),
    ('device_type', 'Galaxy S Series', 'Samsung'),
    ('device_type', 'Galaxy A Series', 'Samsung'),
    ('device_type', 'Pixel Phone', 'Google')
ON CONFLICT DO NOTHING;

-- ✅ Setup Complete!
-- Your Supabase database is now ready for the Booking App.
`;

export function SettingsManager() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTestingSupabase, setIsTestingSupabase] = useState(false);
    const [showSupabaseKey, setShowSupabaseKey] = useState(false);
    const [showSqlScript, setShowSqlScript] = useState(false);
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

    const copySqlScript = () => {
        navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
        toast({ title: "Copied!", description: "SQL script copied to clipboard" });
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
                            <div className="flex gap-2">
                                <Input
                                    id="supabaseKey"
                                    type={showSupabaseKey ? "text" : "password"}
                                    placeholder="Paste your anon key here"
                                    value={settings.supabaseAnonKey}
                                    onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                                    title={showSupabaseKey ? "Hide Key" : "Show Key"}
                                >
                                    {showSupabaseKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(settings.supabaseAnonKey);
                                        toast({ title: "Copied!", description: "Anon Key copied to clipboard" });
                                    }}
                                    title="Copy Key"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
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

                {/* SQL Setup Script */}
                <Card className="md:col-span-2 border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <FileCode className="h-5 w-5" />
                            📋 Supabase SQL Setup Script
                        </CardTitle>
                        <CardDescription>
                            Run this SQL in your new Supabase project to create required tables and permissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-100 text-blue-700"
                                onClick={() => setShowSqlScript(!showSqlScript)}
                            >
                                {showSqlScript ? (
                                    <>
                                        <ChevronUp className="mr-2 h-4 w-4" />
                                        Hide SQL Script
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        View SQL Script
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="border-blue-300 hover:bg-blue-100 text-blue-700"
                                onClick={copySqlScript}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy SQL Script
                            </Button>
                        </div>

                        {showSqlScript && (
                            <div className="mt-4">
                                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
                                    <pre className="text-green-400 text-sm font-mono whitespace-pre">
                                        {SUPABASE_SQL_SCRIPT}
                                    </pre>
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                    💡 Go to Supabase Dashboard → SQL Editor → New Query → Paste this script → Run
                                </p>
                            </div>
                        )}
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
