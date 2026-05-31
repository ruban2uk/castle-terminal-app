'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { submitRetailerApplication } from './actions';

export default function RetailerOnboardPage() {
  const [state, action, isPending] = useActionState(submitRetailerApplication, null);

  if (state?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-700">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-600 mb-4">
              Your retailer application has been received and is pending admin approval.
            </p>
            <p className="text-sm text-zinc-500">
              You will receive an email notification once your account is approved.
            </p>
            <Link href="/retailer/dashboard">
              <Button className="mt-6">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Retailer Onboarding</CardTitle>
            <p className="text-zinc-600 mt-1">
              Complete your business profile to start selling digital value products
            </p>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Business Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Name *</label>
                    <Input name="businessName" required placeholder="e.g. Asha Telecom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Trading Name</label>
                    <Input name="tradingName" placeholder="Optional trading name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Number</label>
                    <Input name="companyNumber" placeholder="UK Company House number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">VAT Number</label>
                    <Input name="vatNumber" placeholder="VAT registration number" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Business Email *</label>
                  <Input name="email" type="email" required placeholder="business@example.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <Input name="phone" type="tel" required placeholder="+44 20 7123 4567" />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Business Address</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                  <Input name="addressLine1" required placeholder="Street address" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <Input name="addressLine2" placeholder="Apartment, suite, etc." />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input name="city" required placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postcode *</label>
                    <Input name="postcode" required placeholder="Postcode" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input name="country" defaultValue="GB" placeholder="GB" />
                  </div>
                </div>
              </div>

              {state?.error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{state.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Submitting Application...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
