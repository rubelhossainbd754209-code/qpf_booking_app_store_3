"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react";

interface StatsData {
  totalRequests: number;
  newRequests: number;
  inProgress: number;
  completed: number;
  onHold: number;
  todayRequests: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalRequests: 0,
    newRequests: 0,
    inProgress: 0,
    completed: 0,
    onHold: 0,
    todayRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchStats();

    // Listen for refresh-stats event from table component
    const handleRefresh = () => fetchStats();
    window.addEventListener('refresh-stats', handleRefresh);

    return () => window.removeEventListener('refresh-stats', handleRefresh);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/store-3/requests?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      const data = await response.json();

      if (data.requests) {
        const requests = data.requests;
        const today = new Date().toISOString().split('T')[0];

        const statsData: StatsData = {
          totalRequests: requests.length,
          newRequests: requests.filter((r: any) => r.status === 'New').length,
          inProgress: requests.filter((r: any) => r.status === 'In Progress').length,
          completed: requests.filter((r: any) => r.status === 'Completed').length,
          onHold: requests.filter((r: any) => r.status === 'On Hold').length,
          todayRequests: requests.filter((r: any) =>
            r.createdAt.split('T')[0] === today
          ).length,
        };

        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: ClipboardList,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "New Requests",
      value: stats.newRequests,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "On Hold",
      value: stats.onHold,
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Today's Requests",
      value: stats.todayRequests,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={`loading-stat-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={`stat-${stat.title.replace(/\s+/g, '-').toLowerCase()}-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Today's Requests" && (
                <p className="text-xs text-muted-foreground">
                  +{Math.round((stat.value / stats.totalRequests) * 100) || 0}% from yesterday
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
