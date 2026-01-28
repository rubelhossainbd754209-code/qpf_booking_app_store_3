import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Laravel Integration API for Statistics and Analytics
 * 
 * This API provides statistical data and analytics for Laravel dashboard integration
 */

// API Key validation
const LARAVEL_API_KEY = process.env.LARAVEL_API_KEY || 'qpx-laravel-integration-2024';

function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  return apiKey === LARAVEL_API_KEY;
}

/**
 * GET /api/laravel/stats
 * 
 * Get comprehensive statistics for Laravel dashboard
 * 
 * Headers:
 * - X-API-Key: Your API key for authentication
 * 
 * Query Parameters:
 * - period: Statistics period (today, week, month, year, all) - default: all
 * - from_date: Custom start date (YYYY-MM-DD)
 * - to_date: Custom end date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized. Please provide a valid API key in X-API-Key header.' 
        }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    // Calculate date range based on period
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = monthAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = yearAgo.toISOString().split('T')[0];
        break;
    }

    // Use custom date range if provided
    if (fromDate && toDate) {
      dateFilter = fromDate;
    }

    // Build base query
    let baseQuery = supabase.from('repair_requests').select('*');
    
    if (dateFilter && !toDate) {
      baseQuery = baseQuery.gte('created_at', dateFilter);
    } else if (fromDate && toDate) {
      baseQuery = baseQuery.gte('created_at', fromDate).lte('created_at', toDate + 'T23:59:59.999Z');
    }

    // Get all requests for the period
    const { data: requests, error } = await baseQuery;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch statistics' 
        }, 
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalRequests = requests?.length || 0;
    
    const statusCounts = {
      new: requests?.filter(r => r.status === 'New').length || 0,
      in_progress: requests?.filter(r => r.status === 'In Progress').length || 0,
      completed: requests?.filter(r => r.status === 'Completed').length || 0,
      on_hold: requests?.filter(r => r.status === 'On Hold').length || 0,
    };

    // Brand statistics
    const brandStats = requests?.reduce((acc: any, request) => {
      const brand = request.brand;
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {}) || {};

    // Device type statistics
    const deviceTypeStats = requests?.reduce((acc: any, request) => {
      const deviceType = request.device_type;
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {}) || {};

    // Daily statistics for the period
    const dailyStats = requests?.reduce((acc: any, request) => {
      const date = new Date(request.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    // Recent requests (last 10)
    const recentRequests = requests
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(request => ({
        id: request.id,
        customer_name: request.customer_name,
        device_display: `${request.brand} ${request.device_type} - ${request.model}`,
        status: request.status,
        created_at: request.created_at,
        created_date: new Date(request.created_at).toISOString().split('T')[0],
      })) || [];

    // Calculate completion rate
    const completionRate = totalRequests > 0 
      ? Math.round((statusCounts.completed / totalRequests) * 100) 
      : 0;

    // Calculate average processing time (for completed requests)
    const completedRequests = requests?.filter(r => r.status === 'Completed') || [];
    const avgProcessingTime = completedRequests.length > 0
      ? completedRequests.reduce((acc, request) => {
          const created = new Date(request.created_at).getTime();
          const updated = new Date(request.updated_at || request.created_at).getTime();
          return acc + (updated - created);
        }, 0) / completedRequests.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        // Overview statistics
        overview: {
          total_requests: totalRequests,
          completion_rate: completionRate,
          avg_processing_days: Math.round(avgProcessingTime * 10) / 10,
        },
        
        // Status breakdown
        status_breakdown: statusCounts,
        
        // Brand statistics
        brand_statistics: Object.entries(brandStats)
          .map(([brand, count]) => ({ brand, count }))
          .sort((a: any, b: any) => b.count - a.count),
        
        // Device type statistics
        device_type_statistics: Object.entries(deviceTypeStats)
          .map(([device_type, count]) => ({ device_type, count }))
          .sort((a: any, b: any) => b.count - a.count),
        
        // Daily statistics
        daily_statistics: Object.entries(dailyStats)
          .map(([date, count]) => ({ date, count }))
          .sort((a: any, b: any) => a.date.localeCompare(b.date)),
        
        // Recent requests
        recent_requests: recentRequests,
        
        // Period information
        period_info: {
          period: period,
          from_date: fromDate || dateFilter || null,
          to_date: toDate || null,
          total_days: period === 'today' ? 1 : 
                     period === 'week' ? 7 : 
                     period === 'month' ? 30 : 
                     period === 'year' ? 365 : null
        }
      }
    });

  } catch (error) {
    console.error('Laravel Stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
