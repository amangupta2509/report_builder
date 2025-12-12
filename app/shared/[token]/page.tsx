"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import ComprehensiveReportViewer from "@/components/comprehensive-report-viewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, Calendar, AlertCircle } from "lucide-react";
import type { ComprehensiveReportData } from "@/types/report-types";

export default function SharedReportPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [reportData, setReportData] = useState<ComprehensiveReportData | null>(
    null
  );
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState<any>(null);

  // Force desktop mode on mobile
  useEffect(() => {
    // Set viewport meta tag for desktop mode
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.setAttribute("name", "viewport");
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute(
      "content",
      "width=1280, initial-scale=1, maximum-scale=1, user-scalable=yes"
    );
  }, []);

  const fetchReport = async (pwd?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shared-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: pwd || password,
        }),
      });

      const data = await response.json();

      if (response.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to load report");
        setLoading(false);
        return;
      }

      setReportData(data.report);
      setShareInfo(data.shareInfo);
      setRequiresPassword(false);
      setLoading(false);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReport();
    }
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      fetchReport(password);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shared report...</p>
        </div>
      </div>
    );
  }

  // Password required
  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Password Protected
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              This report is password protected. Please enter the password to
              continue.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={!password.trim()}
              >
                Access Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Report viewer with info banner
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Report Content */}
      {reportData && <ComprehensiveReportViewer reportData={reportData} />}
    </div>
  );
}
