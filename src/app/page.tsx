"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RepairForm } from '@/components/repair-form';
import { AppLogo } from '@/components/icons';
import { Store } from 'lucide-react';

export default function Home() {
  const [storeId, setStoreId] = useState('Loading...');
  const [storeName, setStoreName] = useState('Loading...');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success && data.settings) {
          setStoreId(data.settings.storeId || 'Store');
          setStoreName(data.settings.storeName || 'Quick Phone Fix N More');
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setStoreId('Store');
        setStoreName('Quick Phone Fix N More');
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 sm:h-20 md:h-24 items-center justify-between px-3 sm:px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>

          {/* Shop Address - Dynamic from Settings */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-rose-50">
              <Store className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-rose-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-base font-semibold text-gray-900">{storeId}</span>
              <span className="text-[10px] sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">{storeName}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50/50">
        <div className="container relative py-4 sm:py-6 md:py-8 lg:py-12 px-3 sm:px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <RepairForm />
          </div>
        </div>
      </main>
    </div>
  );
}
