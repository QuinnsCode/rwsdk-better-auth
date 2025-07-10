"use client";

import { useState } from "react";
import { BetterAuthLogin } from "@/app/pages/user/BetterAuthLogin";
import { createOrganization } from "@/app/serverActions/orgs/createOrg";

interface CreateOrgClientProps {
  initialUser: any;
}

export function CreateOrgClient({ initialUser }: CreateOrgClientProps) {
  const [user, setUser] = useState(initialUser);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle successful authentication
  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    // Optional: Show a brief success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle form submission with client-side redirect
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData(event.currentTarget);
      const result = await createOrganization(formData);
      
      if (result.success) {
        console.log('✅ Organization created successfully, redirecting to:', result.redirectUrl);
        // Force a full page redirect to the new subdomain
        window.location.href = result.redirectUrl;
        // Note: Don't set isSubmitting to false here as we're redirecting
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('❌ Form submission error:', err);
      setError('Failed to create organization');
      setIsSubmitting(false);
    }
  };

  // If user is not logged in, show the login form
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create Your Organization
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign up or sign in to get started
            </p>
          </div>
          
          <BetterAuthLogin
            onAuthSuccess={handleAuthSuccess}
            redirectOnSuccess={false}
            showDevTools={false}
            className="max-w-md w-full space-y-8"
          />
        </div>
      </div>
    );
  }

  // User is logged in, show the org creation form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Welcome {user.name || user.email}! Now create your organization below.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Organization</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome {user.name || user.email}! Set up your organization to get started.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Changed from action={createOrganization} to onSubmit={handleSubmit} */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Subdomain
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  disabled={isSubmitting}
                  pattern="[a-z0-9\-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="acme-corp"
                />
                <span className="inline-flex blur-xs items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md text-sm">
                  .quinncodes.com
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                <div className="inline-flex">Your organization will be available at: https://[subdomain]</div>
                <div className="inline-flex blur-xs mx-1">.quinncodes.com</div>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Organization...
                </span>
              ) : (
                "Create Organization"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You'll become the admin of this organization</li>
              <li>• Get a custom subdomain for your team</li>
              <li>• Set up integrations like ShipStation</li>
              <li>• Invite team members</li>
            </ul>
          </div>

          {/* Show current user info and sign out option */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Signed in as {user.name || user.email}
              </span>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  // Sign out and reset user state
                  import("@/lib/auth-client").then(({ authClient }) => {
                    authClient.signOut().then(() => {
                      setUser(null);
                    });
                  });
                }}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}