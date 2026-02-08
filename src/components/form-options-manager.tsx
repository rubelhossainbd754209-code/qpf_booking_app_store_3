"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormOptions {
  brands: string[];
  deviceTypes: { [key: string]: string[] };
  models: { [key: string]: string[] };
}

export function FormOptionsManager() {
  const [formOptions, setFormOptions] = useState<FormOptions>({
    brands: [],
    deviceTypes: {},
    models: {}
  });
  const [loading, setLoading] = useState(true);
  const [newBrand, setNewBrand] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("");
  const [selectedBrandForDevice, setSelectedBrandForDevice] = useState("");
  const [newModel, setNewModel] = useState("");
  const [selectedBrandForModel, setSelectedBrandForModel] = useState("");
  const [selectedDeviceTypeForModel, setSelectedDeviceTypeForModel] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const fetchFormOptions = async () => {
    try {
      const response = await fetch('/api/store-3/form-options');
      const data = await response.json();
      if (data.formOptions) {
        setFormOptions(data.formOptions);
      }
    } catch (error) {
      console.error('Failed to fetch form options:', error);
      toast({
        title: "Error",
        description: "Failed to fetch form options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBrand = async () => {
    if (!newBrand.trim()) return;

    try {
      const response = await fetch('/api/store-3/form-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'addBrand',
          data: { brand: newBrand.trim() }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormOptions(data.formOptions);
        setNewBrand("");
        toast({
          title: "Success",
          description: "Brand added successfully",
        });
      }
    } catch (error) {
      console.error('Failed to add brand:', error);
      toast({
        title: "Error",
        description: "Failed to add brand",
        variant: "destructive",
      });
    }
  };

  const addDeviceType = async () => {
    if (!newDeviceType.trim() || !selectedBrandForDevice) return;

    try {
      const response = await fetch('/api/store-3/form-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'addDeviceType',
          data: {
            brand: selectedBrandForDevice,
            deviceType: newDeviceType.trim()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormOptions(data.formOptions);
        setNewDeviceType("");
        toast({
          title: "Success",
          description: "Device type added successfully",
        });
      }
    } catch (error) {
      console.error('Failed to add device type:', error);
      toast({
        title: "Error",
        description: "Failed to add device type",
        variant: "destructive",
      });
    }
  };

  const addModel = async () => {
    if (!newModel.trim() || !selectedBrandForModel || !selectedDeviceTypeForModel) return;

    try {
      const response = await fetch('/api/store-3/form-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'addModel',
          data: {
            brand: selectedBrandForModel,
            deviceType: selectedDeviceTypeForModel,
            model: newModel.trim()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormOptions(data.formOptions);
        setNewModel("");
        toast({
          title: "Success",
          description: "Model added successfully",
        });
      }
    } catch (error) {
      console.error('Failed to add model:', error);
      toast({
        title: "Error",
        description: "Failed to add model",
        variant: "destructive",
      });
    }
  };

  const removeBrand = async (brand: string) => {
    try {
      const response = await fetch('/api/store-3/form-options', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'removeBrand',
          data: { brand }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormOptions(data.formOptions);
        toast({
          title: "Success",
          description: "Brand removed successfully",
        });
      }
    } catch (error) {
      console.error('Failed to remove brand:', error);
      toast({
        title: "Error",
        description: "Failed to remove brand",
        variant: "destructive",
      });
    }
  };

  const removeDeviceType = async (brand: string, deviceType: string) => {
    try {
      const response = await fetch('/api/store-3/form-options', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'removeDeviceType',
          data: { brand, deviceType }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormOptions(data.formOptions);
        toast({
          title: "Success",
          description: "Device type removed successfully",
        });
      }
    } catch (error) {
      console.error('Failed to remove device type:', error);
      toast({
        title: "Error",
        description: "Failed to remove device type",
        variant: "destructive",
      });
    }
  };

  const removeModel = async (brand: string, deviceType: string, model: string) => {
    try {
      const response = await fetch('/api/store-3/form-options', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'removeModel',
          data: { brand, deviceType, model }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormOptions(data.formOptions);
        toast({
          title: "Success",
          description: "Model removed successfully",
        });
      }
    } catch (error) {
      console.error('Failed to remove model:', error);
      toast({
        title: "Error",
        description: "Failed to remove model",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading form options...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="device-types">Device Types</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Brands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new brand name"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                />
                <Button onClick={addBrand} className="bg-red-500 hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formOptions.brands.map((brand, index) => (
                  <div key={`brand-${brand}-${index}`} className="flex items-center gap-1">
                    <Badge variant="outline">{brand}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBrand(brand)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Device Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedBrandForDevice} onValueChange={setSelectedBrandForDevice}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.brands.map((brand, index) => (
                      <SelectItem key={`select-brand-${brand}-${index}`} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Enter device type"
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                />
                <Button onClick={addDeviceType} className="bg-red-500 hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device Type
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(formOptions.deviceTypes).map(([brand, deviceTypes], brandIndex) => (
                  <div key={`device-types-${brand}-${brandIndex}`} className="border rounded p-3">
                    <h4 className="font-semibold mb-2">{brand}</h4>
                    <div className="flex flex-wrap gap-2">
                      {deviceTypes.map((deviceType, index) => (
                        <div key={`device-type-${brand}-${deviceType}-${index}`} className="flex items-center gap-1">
                          <Badge variant="secondary">{deviceType}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDeviceType(brand, deviceType)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedBrandForModel} onValueChange={setSelectedBrandForModel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {formOptions.brands.map((brand, index) => (
                      <SelectItem key={`model-brand-${brand}-${index}`} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDeviceTypeForModel} onValueChange={setSelectedDeviceTypeForModel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Device Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBrandForModel && formOptions.deviceTypes[selectedBrandForModel]?.map((deviceType, index) => (
                      <SelectItem key={`model-device-type-${deviceType}-${index}`} value={deviceType}>{deviceType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Enter model name"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                />
                <Button onClick={addModel} className="bg-red-500 hover:bg-red-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </div>

              <div className="space-y-2">
                {Object.entries(formOptions.models).map(([key, models], keyIndex) => {
                  const [brand, deviceType] = key.split('-');
                  return (
                    <div key={`models-${key}-${keyIndex}`} className="border rounded p-3">
                      <h4 className="font-semibold mb-2">{key.replace('-', ' - ')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {models.map((model, index) => (
                          <div key={`model-${key}-${model}-${index}`} className="flex items-center gap-1">
                            <Badge variant="outline">{model}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeModel(brand, deviceType, model)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
