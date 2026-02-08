"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TermsModal } from '@/components/terms-modal';

// Schema for Step 1: Brand Selection
const step1Schema = z.object({
  brand: z.string({ required_error: "Please select a brand." }).min(1, { message: "Please select a brand." }),
});

// Schema for Step 2: Device Type Selection
const step2Schema = z.object({
  deviceType: z.string({ required_error: "Please select a device type." }).min(1, { message: "Please select a device type." }),
});

// Schema for Step 3: Device Model Selection
const step3Schema = z.object({
  model: z.string({ required_error: "Please select a device model." }).min(1, { message: "Please select a device model." }),
});

// Schema for Step 4: Message/Issue Description
const step4Schema = z.object({
  message: z.string().optional(),
});

// Schema for Step 5: Personal Information
const step5Schema = z.object({
  name: z.string({ required_error: "Please enter your full name." }).min(2, { message: "Please enter your full name." }),
  phone: z.string({ required_error: "Please enter your phone number." }).min(1, { message: "Please enter your phone number." }),
  email: z.string({ required_error: "Please enter your email address." }).email({ message: "Please enter a valid email address." }),
  address: z.string().optional(),
  agreeToPolicy: z.boolean().refine(val => val === true, { message: "You must agree to our privacy policy." }),
});

export function RepairForm() {
  const [step, setStep] = useState(1);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    deviceType: '',
    model: '',
    message: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    agreeToPolicy: false
  });
  const router = useRouter();

  // Dynamic form options from API
  const [formOptions, setFormOptions] = useState<{
    brands: string[];
    deviceTypes: { [key: string]: string[] };
    models: { [key: string]: string[] };
  }>({
    brands: [],
    deviceTypes: {},
    models: {}
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Fetch form options from API on mount
  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const response = await fetch('/api/store-3/form-options');
        const data = await response.json();
        if (data.formOptions) {
          setFormOptions(data.formOptions);
        }
      } catch (error) {
        console.error('Failed to fetch form options:', error);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchFormOptions();
  }, []);

  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange'
  });

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange'
  });

  const step3Form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    mode: 'onChange'
  });

  const step4Form = useForm<z.infer<typeof step4Schema>>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      message: ''
    }
  });

  const step5Form = useForm<z.infer<typeof step5Schema>>({
    resolver: zodResolver(step5Schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      agreeToPolicy: false
    }
  });

  const onSubmitStep1 = (data: z.infer<typeof step1Schema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const onSubmitStep2 = (data: z.infer<typeof step2Schema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const onSubmitStep3 = (data: z.infer<typeof step3Schema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(4);
  };

  const onSubmitStep4 = (data: z.infer<typeof step4Schema>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(5);
  };

  const onSubmitStep5 = async (data: z.infer<typeof step5Schema>) => {
    console.log('Step 5 form submitted with data:', data);

    // Prevent double submission
    if (isSubmitting || isSubmitted) {
      console.log('Form already submitted or submitting, ignoring...');
      return;
    }

    setIsSubmitting(true);
    const finalData = { ...formData, ...data };
    console.log('Final data to submit:', finalData);

    try {
      console.log('Sending POST request to /api/store-3/requests...');

      // Send data to our Next.js API (Store 3) which will forward to Laravel
      const response = await fetch('/api/store-3/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Parse response body
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok && responseData.success) {
        console.log('Booking successful! Redirecting to success page...');
        setIsSubmitted(true); // Mark as submitted to prevent any further submissions
        router.push('/success');
      } else {
        console.error('Failed to submit request:', responseData);
        setIsSubmitting(false); // Allow retry on error
        alert(`Failed to submit booking: ${responseData.error || 'Unknown error'}. Please try again.`);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setIsSubmitting(false); // Allow retry on error
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Dynamic brands from API
  const brands = formOptions.brands.length > 0 ? formOptions.brands : ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Others"];

  // Device types based on selected brand (dynamic from API with fallback)
  const getDeviceTypes = (brand: string) => {
    if (formOptions.deviceTypes[brand] && formOptions.deviceTypes[brand].length > 0) {
      return formOptions.deviceTypes[brand];
    }
    // Fallback for brands not in database
    return [
      "Mobile Phone",
      "Tablet",
      "Laptop",
      "Smart Watch",
      "Other"
    ];
  };

  // Device models based on selected device type (dynamic from API with fallback)
  const getDeviceModels = (deviceType: string) => {
    const key = `${formData.brand}-${deviceType}`;
    if (formOptions.models[key] && formOptions.models[key].length > 0) {
      return formOptions.models[key];
    }
    // Fallback for device types not in database
    return [
      "Other Model"
    ];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with back button and title */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center mb-4 sm:mb-6">
          {step > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(step - 1)}
              className="mr-3 sm:mr-4 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-left">BOOKING</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base text-left">Our friendly team would love to hear from you.</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex space-x-2 sm:space-x-3">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`h-2 w-8 sm:w-12 rounded-full transition-colors ${stepNumber <= step ? 'bg-black' : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Brand Selection */}
      {step === 1 && (
        <Form {...step1Form}>
          <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg rounded-xl border-0 bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <FormField
                  control={step1Form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block text-gray-900">
                        Select Brand *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors">
                            <SelectValue placeholder="Choose device brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand} className="text-base py-3">
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="text-center mt-6 sm:mt-8">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium min-w-[180px] sm:min-w-[200px] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 2: Device Type Selection */}
      {step === 2 && (
        <Form {...step2Form}>
          <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg rounded-xl border-0 bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6">
                  <p className="text-sm text-gray-600">Selected Brand: <span className="font-semibold text-black">{formData.brand}</span></p>
                </div>
                <FormField
                  control={step2Form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block text-gray-900">
                        Device Type *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors">
                            <SelectValue placeholder="Choose device type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {getDeviceTypes(formData.brand).map((type) => (
                            <SelectItem key={type} value={type} className="text-base py-3">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="text-center mt-6 sm:mt-8">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium min-w-[180px] sm:min-w-[200px] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 3: Device Model Selection */}
      {step === 3 && (
        <Form {...step3Form}>
          <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg rounded-xl border-0 bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6 space-y-1">
                  <p className="text-sm text-gray-600">Selected Brand: <span className="font-semibold text-black">{formData.brand}</span></p>
                  <p className="text-sm text-gray-600">Device Type: <span className="font-semibold text-black">{formData.deviceType}</span></p>
                </div>
                <FormField
                  control={step3Form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block text-gray-900">
                        Device Model *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors">
                            <SelectValue placeholder="Choose device model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {getDeviceModels(formData.deviceType).map((model) => (
                            <SelectItem key={model} value={model} className="text-base py-3">
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm mt-2" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="text-center mt-6 sm:mt-8">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium min-w-[180px] sm:min-w-[200px] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 4: Message/Issue Description */}
      {step === 4 && (
        <Form {...step4Form}>
          <form onSubmit={step4Form.handleSubmit(onSubmitStep4)} className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg rounded-xl border-0 bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6 space-y-1">
                  <p className="text-sm text-gray-600">Selected Device: <span className="font-semibold text-black">{formData.brand} {formData.deviceType} - {formData.model}</span></p>
                </div>
                <FormField
                  control={step4Form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 block text-gray-900">
                        Describe the Issue (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your repair requirement in detail..."
                          {...field}
                          rows={6}
                          className="resize-none min-h-[120px] sm:min-h-[150px] text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors"
                        />
                      </FormControl>
                      <FormMessage className="text-sm mt-2" />
                      <p className="text-xs text-gray-500 mt-2">This helps us understand your repair needs better</p>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="text-center mt-6 sm:mt-8">
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium min-w-[180px] sm:min-w-[200px] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Step 5: Personal Information */}
      {step === 5 && (
        <Form {...step5Form}>
          <form onSubmit={step5Form.handleSubmit(onSubmitStep5, (errors) => {
            console.log('Form validation errors:', errors);
            // Show first error to user
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
              alert(`Validation Error: ${firstError.message}`);
            }
          })} className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg rounded-xl border-0 bg-white">
              <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <p className="text-sm text-gray-600">We'll use this information to contact you about your repair</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={step5Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="text-left sm:col-span-2">
                        <FormLabel className="text-sm sm:text-base font-semibold mb-2 block text-gray-900">Full Name *</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors"
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-sm mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step5Form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel className="text-sm sm:text-base font-semibold mb-2 block text-gray-900">Email Address *</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors"
                            placeholder="your@email.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-sm mt-1" />
                        <p className="text-xs text-gray-500 mt-1">For warranty papers & invoice</p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step5Form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="text-left">
                        <FormLabel className="text-sm sm:text-base font-semibold mb-2 block text-gray-900">Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors"
                            placeholder="+1 (555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-sm mt-1" />
                        <p className="text-xs text-gray-500 mt-1">For contact & updates</p>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step5Form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="text-left">
                      <FormLabel className="text-sm sm:text-base font-semibold mb-2 block text-gray-900">Address (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 sm:h-14 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-black transition-colors"
                          placeholder="Your address for pickup/delivery"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-sm mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step5Form.control}
                  name="agreeToPolicy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6 p-4 bg-gray-50 rounded-lg">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked === true);
                          }}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="text-sm text-gray-700 cursor-pointer">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setIsTermsModalOpen(true)}
                            className="text-blue-600 hover:text-blue-800 underline font-medium"
                          >
                            privacy policy and terms of service
                          </button>
                          . I understand that my information will be used to process my repair request.
                        </FormLabel>
                        <FormMessage className="text-sm mt-1" />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="text-center mt-6 sm:mt-8">
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                onClick={() => {
                  console.log('Complete Booking button clicked');
                  console.log('Form errors:', step5Form.formState.errors);
                  console.log('Form values:', step5Form.getValues());
                }}
                className="bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed rounded-full px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium min-w-[180px] sm:min-w-[200px] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Processing...
                  </>
                ) : isSubmitted ? (
                  'Booking Submitted!'
                ) : (
                  'Complete Booking'
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
}
