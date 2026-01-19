"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Share2,
  Copy,
  Eye,
  Calendar,
  Lock,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ShareManagementProps {
  reportId: string;
  patientId: string;
  reportName?: string;
}

interface ShareToken {
  id: string;
  token: string;
  url: string;
  expiresAt: Date | null;
  maxViews: number | null;
  viewCount: number;
  hasPassword: boolean;
  createdAt: Date;
  lastAccessedAt: Date | null;
  isActive: boolean;
  reportName: string;
  isExpired: boolean;
  isMaxViewsReached: boolean;
}

export default function ShareManagement({
  reportId,
  patientId,
  reportName,
}: ShareManagementProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareTokens, setShareTokens] = useState<ShareToken[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form state
  const [expirationOption, setExpirationOption] = useState<string>("7");
  const [customDays, setCustomDays] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);

  // Load existing share tokens
  const loadShareTokens = async () => {
    try {
      const response = await fetch(`/api/share-report?reportId=${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setShareTokens(data.shareTokens || []);
      }
    } catch (error) {
      console.error("Failed to load share tokens:", error);
    }
  };

  useEffect(() => {
    loadShareTokens();
  }, [reportId]);

  const handleCreateShare = async () => {
    setIsLoading(true);

    try {
      // Calculate expiration days
      let expiresInDays: number | null = null;
      if (expirationOption === "custom" && customDays) {
        expiresInDays = parseInt(customDays);
      } else if (expirationOption !== "never") {
        expiresInDays = parseInt(expirationOption);
      }

      const response = await fetch("/api/share-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          patientId,
          password: usePassword && password ? password : null,
          expiresInDays,
          maxViews: maxViews ? parseInt(maxViews) : null,
          createdBy: "admin", // You can replace with actual user info
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();

      toast({
        title: "Share Link Created!",
        description: "The secure share link has been generated.",
        variant: "success",
        duration: 3000,
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(data.shareToken.url);
      setCopiedToken(data.shareToken.token);

      // Reset form
      setExpirationOption("7");
      setCustomDays("");
      setMaxViews("");
      setPassword("");
      setUsePassword(false);
      setIsDialogOpen(false);

      // Reload tokens
      loadShareTokens();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create share link",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async (url: string, token: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      toast({
        description: "Link copied to clipboard!",
        variant: "success",
        duration: 2000,
      });

      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast({
        description: "Failed to copy link",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this share link? It will no longer be accessible."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/share-report?tokenId=${tokenId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to revoke token");
      }

      toast({
        title: "Token Revoked",
        description: "The share link has been revoked.",
        variant: "success",
        duration: 2000,
      });

      loadShareTokens();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke token",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const getStatusBadge = (token: ShareToken) => {
    if (!token.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <XCircle className="w-3 h-3" />
          Revoked
        </span>
      );
    }
    if (token.isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Expired
        </span>
      );
    }
    if (token.isMaxViewsReached) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <XCircle className="w-3 h-3" />
          Max Views
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="mb-8 w-full">
          <Card className="shadow-lg border-0 w-full">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white rounded-lg p-4 sm:p-5">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold uppercase flex items-center justify-center sm:justify-start text-center sm:text-left">
                Share Management
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Share2 className="w-4 h-4 " />
              Create Share Link
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Secure Share Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Expiration */}
            <div className="space-y-2">
              <Label>Link Expiration</Label>
              <Select
                value={expirationOption}
                onValueChange={setExpirationOption}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="never">Never Expire</SelectItem>
                </SelectContent>
              </Select>
              {expirationOption === "custom" && (
                <Input
                  type="number"
                  placeholder="Number of days"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  min="1"
                />
              )}
            </div>

            {/* Max Views - Optional, typically not used with password */}
            <div className="space-y-2">
              <Label>Maximum Total Views (Optional)</Label>
              <Input
                type="number"
                placeholder="Leave empty for unlimited"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                min="1"
              />
              <p className="text-xs text-gray-500">
                Rarely used. Anyone with the password can access unlimited times
                unless this is set.
              </p>
            </div>

            {/* Password Protection - Primary Security */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="usePassword"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="rounded"
                />
                <Label
                  htmlFor="usePassword"
                  className="cursor-pointer font-semibold"
                >
                  Password Protection (Recommended)
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Anyone with the password can access this report unlimited times
              </p>
              {usePassword && (
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>

            <Button
              onClick={handleCreateShare}
              disabled={isLoading || (usePassword && !password)}
              className="w-full"
            >
              {isLoading ? "Creating..." : "Generate Share Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Share Links */}
      <div className="space-y-3">
        {shareTokens.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 text-sm">
                No share links created yet. Create one to share this report
                securely.
              </p>
            </CardContent>
          </Card>
        ) : (
          shareTokens.map((token) => (
            <Card key={token.id} className="relative">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(token)}
                        {token.hasPassword && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Lock className="w-3 h-3" />
                            Protected
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-mono text-gray-600 truncate">
                        {token.url}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyLink(token.url, token.token)}
                        className="gap-1"
                      >
                        {copiedToken === token.token ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      {token.isActive && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRevokeToken(token.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>
                        Total Views: {token.viewCount}
                        {token.maxViews ? `/${token.maxViews}` : " (Unlimited)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {token.expiresAt
                          ? `Expires: ${new Date(
                              token.expiresAt
                            ).toLocaleDateString()}`
                          : "Never expires"}
                      </span>
                    </div>
                  </div>

                  {token.lastAccessedAt && (
                    <div className="text-xs text-gray-500">
                      Last accessed:{" "}
                      {new Date(token.lastAccessedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
