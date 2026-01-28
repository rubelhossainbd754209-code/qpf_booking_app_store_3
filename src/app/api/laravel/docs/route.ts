import { NextResponse } from 'next/server';

/**
 * Laravel Integration API Documentation
 * 
 * This endpoint provides comprehensive documentation for the Laravel integration APIs
 */

export async function GET() {
  const documentation = {
    title: "QPX Booking - Laravel Integration API",
    version: "1.0.0",
    description: "API endpoints for integrating QPX Booking repair requests with Laravel platform",
    base_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    
    authentication: {
      type: "API Key",
      header: "X-API-Key",
      description: "Include your API key in the X-API-Key header for all requests",
      example: "X-API-Key: qpx-laravel-integration-2024"
    },

    endpoints: {
      // Repair Requests Endpoints
      repair_requests: {
        list: {
          method: "GET",
          endpoint: "/api/laravel/requests",
          description: "Fetch all repair requests with filtering and pagination",
          headers: {
            "X-API-Key": "Your API key"
          },
          query_parameters: {
            status: "Filter by status (New, In Progress, Completed, On Hold)",
            limit: "Number of records to return (default: 100, max: 1000)",
            offset: "Number of records to skip (default: 0)",
            from_date: "Filter requests from this date (YYYY-MM-DD)",
            to_date: "Filter requests to this date (YYYY-MM-DD)"
          },
          example_request: "/api/laravel/requests?status=New&limit=50&offset=0",
          example_response: {
            success: true,
            data: [
              {
                id: "uuid-here",
                request_id: "uuid-here",
                customer_name: "John Doe",
                customer_phone: "+1234567890",
                customer_email: "john@example.com",
                customer_address: "123 Main St",
                device_brand: "Apple",
                device_type: "iPhone",
                device_model: "iPhone 14 Pro",
                issue_description: "Screen is cracked",
                status: "New",
                created_at: "2024-01-01T10:00:00Z",
                updated_at: "2024-01-01T10:00:00Z",
                is_new: true,
                is_in_progress: false,
                is_completed: false,
                is_on_hold: false,
                customer_display: "John Doe",
                device_display: "Apple iPhone - iPhone 14 Pro",
                status_display: "New",
                created_date: "2024-01-01",
                created_time: "10:00:00 AM"
              }
            ],
            meta: {
              total: 150,
              count: 50,
              limit: 50,
              offset: 0,
              has_more: true
            }
          }
        },

        create: {
          method: "POST",
          endpoint: "/api/laravel/requests",
          description: "Create a new repair request from Laravel platform",
          headers: {
            "X-API-Key": "Your API key",
            "Content-Type": "application/json"
          },
          required_fields: ["customer_name", "customer_phone", "device_brand", "device_type", "device_model"],
          request_body: {
            customer_name: "John Doe",
            customer_phone: "+1234567890",
            customer_email: "john@example.com",
            customer_address: "123 Main St",
            device_brand: "Apple",
            device_type: "iPhone",
            device_model: "iPhone 14 Pro",
            issue_description: "Screen is cracked",
            status: "New"
          },
          example_response: {
            success: true,
            message: "Request created successfully",
            data: {
              id: "uuid-here",
              request_id: "uuid-here",
              customer_name: "John Doe",
              customer_phone: "+1234567890",
              customer_email: "john@example.com",
              customer_address: "123 Main St",
              device_brand: "Apple",
              device_type: "iPhone",
              device_model: "iPhone 14 Pro",
              issue_description: "Screen is cracked",
              status: "New",
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            }
          }
        },

        get_single: {
          method: "GET",
          endpoint: "/api/laravel/requests/{id}",
          description: "Fetch a specific repair request by ID",
          headers: {
            "X-API-Key": "Your API key"
          },
          example_request: "/api/laravel/requests/uuid-here",
          example_response: {
            success: true,
            data: {
              id: "uuid-here",
              request_id: "uuid-here",
              customer_name: "John Doe",
              customer_phone: "+1234567890",
              customer_email: "john@example.com",
              customer_address: "123 Main St",
              device_brand: "Apple",
              device_type: "iPhone",
              device_model: "iPhone 14 Pro",
              issue_description: "Screen is cracked",
              status: "New",
              created_at: "2024-01-01T10:00:00Z",
              updated_at: "2024-01-01T10:00:00Z"
            }
          }
        },

        update: {
          method: "PUT",
          endpoint: "/api/laravel/requests/{id}",
          description: "Update a specific repair request",
          headers: {
            "X-API-Key": "Your API key",
            "Content-Type": "application/json"
          },
          request_body: {
            status: "In Progress",
            customer_name: "John Doe Updated",
            customer_phone: "+1234567890",
            customer_email: "john.updated@example.com",
            customer_address: "456 New St",
            device_brand: "Apple",
            device_type: "iPhone",
            device_model: "iPhone 14 Pro Max",
            issue_description: "Screen and battery replacement"
          },
          example_response: {
            success: true,
            message: "Request updated successfully",
            data: {
              id: "uuid-here",
              request_id: "uuid-here",
              customer_name: "John Doe Updated",
              status: "In Progress"
            }
          }
        },

        delete: {
          method: "DELETE",
          endpoint: "/api/laravel/requests/{id}",
          description: "Delete a specific repair request",
          headers: {
            "X-API-Key": "Your API key"
          },
          example_response: {
            success: true,
            message: "Request deleted successfully"
          }
        }
      },

      // Statistics Endpoint
      statistics: {
        get_stats: {
          method: "GET",
          endpoint: "/api/laravel/stats",
          description: "Get comprehensive statistics and analytics",
          headers: {
            "X-API-Key": "Your API key"
          },
          query_parameters: {
            period: "Statistics period (today, week, month, year, all) - default: all",
            from_date: "Custom start date (YYYY-MM-DD)",
            to_date: "Custom end date (YYYY-MM-DD)"
          },
          example_request: "/api/laravel/stats?period=month",
          example_response: {
            success: true,
            data: {
              overview: {
                total_requests: 150,
                completion_rate: 75,
                avg_processing_days: 3.5
              },
              status_breakdown: {
                new: 25,
                in_progress: 50,
                completed: 70,
                on_hold: 5
              },
              brand_statistics: [
                { brand: "Apple", count: 80 },
                { brand: "Samsung", count: 45 },
                { brand: "Google", count: 25 }
              ],
              device_type_statistics: [
                { device_type: "iPhone", count: 80 },
                { device_type: "Android Phone", count: 70 }
              ],
              daily_statistics: [
                { date: "2024-01-01", count: 5 },
                { date: "2024-01-02", count: 8 }
              ],
              recent_requests: [
                {
                  id: "uuid-here",
                  customer_name: "John Doe",
                  device_display: "Apple iPhone - iPhone 14 Pro",
                  status: "New",
                  created_at: "2024-01-01T10:00:00Z",
                  created_date: "2024-01-01"
                }
              ]
            }
          }
        }
      }
    },

    status_codes: {
      200: "Success",
      400: "Bad Request - Invalid parameters or missing required fields",
      401: "Unauthorized - Invalid or missing API key",
      404: "Not Found - Resource not found",
      500: "Internal Server Error"
    },

    error_format: {
      success: false,
      error: "Error message description"
    },

    notes: [
      "All timestamps are in ISO 8601 format (UTC)",
      "All requests must include the X-API-Key header",
      "Maximum limit for list requests is 1000 records",
      "Date filters use YYYY-MM-DD format",
      "Status values are: 'New', 'In Progress', 'Completed', 'On Hold'"
    ]
  };

  return NextResponse.json(documentation, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
