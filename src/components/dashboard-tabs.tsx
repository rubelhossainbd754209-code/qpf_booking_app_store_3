"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardTable } from "@/components/dashboard-table";
import { FormOptionsManager } from "@/components/form-options-manager";
import { ApiDocumentation } from "@/components/api-documentation";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="requests">Repair Requests</TabsTrigger>
        <TabsTrigger value="form-options">Form Options</TabsTrigger>
        <TabsTrigger value="api-docs">API Documentation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="requests" className="space-y-4">
        <DashboardTable />
      </TabsContent>
      
      <TabsContent value="form-options" className="space-y-4">
        <FormOptionsManager />
      </TabsContent>
      
      <TabsContent value="api-docs" className="space-y-4">
        <ApiDocumentation />
      </TabsContent>
    </Tabs>
  );
}
