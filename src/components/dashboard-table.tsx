"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  New: "default",
  "In Progress": "outline",
  Completed: "secondary",
  "On Hold": "destructive",
};

export function DashboardTable() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/store-3/requests?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = await response.json();
      if (data.requests) {
        setRequests(data.requests);
        setSelectedIds(new Set()); // Clear selection on refresh
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/store-3/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchRequests();
        toast({
          title: "Success",
          description: "Request status updated successfully",
        });
      }
    } catch (error) {
      console.error('Failed to update request:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const deleteRequest = async (requestId: string, customerName: string) => {
    // Delete immediately without confirm dialog
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/store-3/requests/${requestId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRequests();
        // Trigger stats refresh
        window.dispatchEvent(new Event('refresh-stats'));
        toast({
          title: "Success",
          description: `Request deleted successfully`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete request",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete selected requests
  const deleteSelectedRequests = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select requests to delete",
        variant: "destructive",
      });
      return;
    }

    // Delete immediately without confirm dialog
    setIsDeleting(true);
    try {
      const response = await fetch('/api/store-3/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await fetchRequests();
        // Trigger stats refresh
        window.dispatchEvent(new Event('refresh-stats'));
        toast({
          title: "Success",
          description: result.message || `Successfully deleted ${result.deletedCount} request(s)`,
        });
      } else {
        throw new Error(result.error || 'Failed to delete requests');
      }
    } catch (error) {
      console.error('Failed to bulk delete requests:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete requests",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle single selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Toggle all selection
  const toggleSelectAll = () => {
    if (selectedIds.size === requests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requests.map(r => r.id)));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Loading requests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Repair Requests</CardTitle>
          <CardDescription>Manage all customer repair requests</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              onClick={deleteSelectedRequests}
              variant="destructive"
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button onClick={fetchRequests} variant="outline" size="sm" disabled={isDeleting}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={requests.length > 0 && selectedIds.size === requests.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow
                  key={request.uniqueKey || `${request.id}-${index}`}
                  className={selectedIds.has(request.id) ? "bg-red-50" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(request.id)}
                      onCheckedChange={() => toggleSelection(request.id)}
                      aria-label={`Select ${request.customer}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    <span className="truncate block max-w-[70px]" title={request.id}>
                      {request.id?.substring(0, 8)}...
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.customer}</div>
                      <div className="text-sm text-muted-foreground">{request.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.brand} {request.model}</div>
                      <div className="text-sm text-muted-foreground">{request.deviceType}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={request.message}>
                      {request.message || 'No description provided'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(value) => updateRequestStatus(request.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <Badge variant={statusVariant[request.status] || "default"}>
                            {request.status}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          alert(`Request Details:\n\nID: ${request.id}\nCustomer: ${request.customer}\nPhone: ${request.phone}\nEmail: ${request.email}\nAddress: ${request.address}\nDevice: ${request.brand} ${request.model}\nType: ${request.deviceType}\nIssue: ${request.message}`);
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRequest(request.id, request.customer)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Request"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {requests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No repair requests found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
