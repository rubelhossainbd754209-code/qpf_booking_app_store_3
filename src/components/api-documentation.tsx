"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, ExternalLink, Code, Database, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ApiDocumentation() {
  const [copiedText, setCopiedText] = useState<string>("");
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(""), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiKey = 'qpx-laravel-integration-2024';

  const endpoints = [
    {
      method: 'GET',
      path: '/api/laravel/requests',
      title: 'Get All Requests',
      description: 'Fetch all repair requests with filtering and pagination',
      example: `${baseUrl}/api/laravel/requests?status=New&limit=50`
    },
    {
      method: 'POST',
      path: '/api/laravel/requests',
      title: 'Create Request',
      description: 'Create a new repair request',
      example: `${baseUrl}/api/laravel/requests`
    },
    {
      method: 'GET',
      path: '/api/laravel/requests/{id}',
      title: 'Get Single Request',
      description: 'Fetch a specific repair request by ID',
      example: `${baseUrl}/api/laravel/requests/uuid-here`
    },
    {
      method: 'PUT',
      path: '/api/laravel/requests/{id}',
      title: 'Update Request',
      description: 'Update a specific repair request',
      example: `${baseUrl}/api/laravel/requests/uuid-here`
    },
    {
      method: 'GET',
      path: '/api/laravel/stats',
      title: 'Get Statistics',
      description: 'Get comprehensive statistics and analytics',
      example: `${baseUrl}/api/laravel/stats?period=month`
    }
  ];

  const curlExamples = {
    get: `curl -X GET "${baseUrl}/api/laravel/requests" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json"`,
    
    post: `curl -X POST "${baseUrl}/api/laravel/requests" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "customer_email": "john@example.com",
    "device_brand": "Apple",
    "device_type": "iPhone",
    "device_model": "iPhone 14 Pro",
    "issue_description": "Screen is cracked"
  }'`,
    
    stats: `curl -X GET "${baseUrl}/api/laravel/stats?period=month" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json"`
  };

  const phpExamples = {
    get: `<?php
// Laravel HTTP Client Example
use Illuminate\\Support\\Facades\\Http;

$response = Http::withHeaders([
    'X-API-Key' => '${apiKey}',
    'Content-Type' => 'application/json'
])->get('${baseUrl}/api/laravel/requests');

$requests = $response->json()['data'];
?>`,
    
    post: `<?php
// Create New Request
$response = Http::withHeaders([
    'X-API-Key' => '${apiKey}',
    'Content-Type' => 'application/json'
])->post('${baseUrl}/api/laravel/requests', [
    'customer_name' => 'John Doe',
    'customer_phone' => '+1234567890',
    'customer_email' => 'john@example.com',
    'device_brand' => 'Apple',
    'device_type' => 'iPhone',
    'device_model' => 'iPhone 14 Pro',
    'issue_description' => 'Screen is cracked'
]);

$newRequest = $response->json()['data'];
?>`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Laravel Integration API</h2>
          <p className="text-muted-foreground">
            Copy and use these endpoints in your Laravel application
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open(`${baseUrl}/api/laravel/docs`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Full Documentation
        </Button>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">API Key (Required for all requests):</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                  {apiKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(apiKey, 'API Key')}
                >
                  {copiedText === 'API Key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Include this in the <code>X-API-Key</code> header for all requests
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={`endpoint-${endpoint.method}-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : endpoint.method === 'POST' ? 'secondary' : 'outline'}>
                      {endpoint.method}
                    </Badge>
                    <span className="font-medium">{endpoint.title}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(endpoint.example, endpoint.title)}
                  >
                    {copiedText === endpoint.title ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>
                <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
                  {endpoint.example}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="curl">cURL Examples</TabsTrigger>
              <TabsTrigger value="php">Laravel/PHP Examples</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curl" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Get All Requests</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(curlExamples.get, 'cURL GET')}
                    >
                      {copiedText === 'cURL GET' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                    <code>{curlExamples.get}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Create New Request</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(curlExamples.post, 'cURL POST')}
                    >
                      {copiedText === 'cURL POST' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                    <code>{curlExamples.post}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Get Statistics</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(curlExamples.stats, 'cURL Stats')}
                    >
                      {copiedText === 'cURL Stats' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                    <code>{curlExamples.stats}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="php" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Fetch Requests in Laravel</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(phpExamples.get, 'PHP GET')}
                    >
                      {copiedText === 'PHP GET' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                    <code>{phpExamples.get}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Create Request in Laravel</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(phpExamples.post, 'PHP POST')}
                    >
                      {copiedText === 'PHP POST' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-sm overflow-x-auto">
                    <code>{phpExamples.post}</code>
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <strong>Copy the API Key:</strong> Use the API key above in all your requests
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <strong>Include Headers:</strong> Always include <code>X-API-Key</code> and <code>Content-Type: application/json</code>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <strong>Test with cURL:</strong> Copy any cURL example above and test in your terminal
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <strong>Integrate with Laravel:</strong> Use the PHP examples in your Laravel controllers
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
