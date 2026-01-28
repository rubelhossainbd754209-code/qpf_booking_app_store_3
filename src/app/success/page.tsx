import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLogo } from "@/components/icons";

// Fixed syntax error for Vercel deployment

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 sm:h-20 md:h-24 items-center justify-between px-3 sm:px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo />
          </Link>
        </div>
      </header>
      <main className="flex flex-grow items-center justify-center bg-gray-50/50">
        <div className="container relative py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
          <Card className="mx-auto max-w-md sm:max-w-lg text-center shadow-xl border-0 bg-white">
            <CardHeader className="p-6 sm:p-8">
              <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">Request Successful!</CardTitle>
              <CardDescription className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                We have successfully received your service request. Our friendly team will contact you shortly to discuss your repair needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:gap-6 p-6 sm:p-8 pt-0">
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>We'll review your request within 2 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Our team will contact you to confirm details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>We'll provide a quote and timeline</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">Thank you for choosing our service!</p>
              <Button asChild className="w-full bg-red-500 hover:bg-red-600 h-12 sm:h-14 text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
                <Link href="/">Submit New Request</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
