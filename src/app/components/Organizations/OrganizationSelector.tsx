"use client";

import { useState, useMemo } from "react";

export function OrganizationSelector() {
  const [orgSlug, setOrgSlug] = useState("");
  const [error, setError] = useState("");

  // Dynamically determine the base domain and display text
  const { baseDomain, displayDomain, isLocalhost } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { baseDomain: '', displayDomain: '', isLocalhost: false };
    }

    const { hostname, port, protocol } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    let baseDomain: string;
    let displayDomain: string;

    if (isLocalhost) {
      // Development environment
      baseDomain = `${hostname}${port ? `:${port}` : ''}`;
      displayDomain = `.${hostname}${port ? `:${port}` : ''}`;
    } else if (hostname.includes('.workers.dev')) {
      // Cloudflare Workers environment
      // Extract the base domain (e.g., "myapp.workers.dev" from "subdomain.myapp.workers.dev")
      const parts = hostname.split('.');
      if (parts.length > 3) {
        // Already on a subdomain, get the base
        baseDomain = parts.slice(-3).join('.');
      } else {
        baseDomain = hostname;
      }
      displayDomain = `.${baseDomain}`;
    } else {
      // Production website (custom domain)
      // Handle both subdomain and root domain cases
      const parts = hostname.split('.');
      if (parts.length > 2) {
        // Already on a subdomain, get the base domain (last 2 parts)
        baseDomain = parts.slice(-2).join('.');
      } else {
        baseDomain = hostname;
      }
      displayDomain = `.${baseDomain}`;
    }

    return { baseDomain, displayDomain, isLocalhost };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgSlug.trim()) {
      setError("Please enter an organization name");
      return;
    }

    // Clean the slug
    const cleanSlug = orgSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    
    if (!cleanSlug) {
      setError("Please enter a valid organization name");
      return;
    }

    setError("");

    // Construct the new URL based on environment
    const { protocol } = window.location;
    const newUrl = `${protocol}//${cleanSlug}.${baseDomain}`;
    
    window.location.href = newUrl;
  };

  const handleQuickSelect = (slug: string) => {
    setOrgSlug(slug);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="orgSlug" className="block text-sm font-medium text-gray-700 mb-2">
          Organization Name
        </label>
        <div className="flex rounded-md shadow-sm">
          <input
            id="orgSlug"
            type="text"
            value={orgSlug}
            onChange={(e) => setOrgSlug(e.target.value)}
            placeholder="your-company"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md text-sm">
            {displayDomain}
          </span>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        <p className="mt-2 text-xs text-gray-500">
          Enter your organization's subdomain to access your workspace
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Go to Organization
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            {isLocalhost ? 'Quick select' : 'Popular organizations'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleQuickSelect("test")}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          test
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect("demo")}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          demo
        </button>
      </div>
    </form>
  );
}