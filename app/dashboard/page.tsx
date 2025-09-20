"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import {
  AlertCircle,
  BarChart3,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { showToast } from "@/lib/toast";
import type { Document } from "@/types";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/documents");
      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      const errorMsg = "Failed to load documents";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's documents
  useEffect(() => {
    if (isLoaded && user) {
      fetchDocuments();
    }
  }, [isLoaded, user, fetchDocuments]);

  const handleUploadComplete = (document: Document) => {
    setDocuments((prev) => [document, ...prev]);
    setError(null);
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const handleDocumentDelete = async (docId: string) => {
    const deletingDocument = documents.find((doc) => doc.docId === docId);
    const documentName = deletingDocument?.filename || "document";

    try {
      const response = await axios.delete(`/api/documents?docId=${docId}`);
      if (response.data.success) {
        setDocuments((prev) => prev.filter((doc) => doc.docId !== docId));
        showToast.dismiss(); // Dismiss any loading toast
        showToast.success(`"${documentName}" deleted successfully`);
      } else {
        const errorMsg = response.data.error || "Failed to delete document";
        setError(errorMsg);
        showToast.dismiss();
        showToast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to delete document";
      setError(errorMsg);
      showToast.dismiss();
      showToast.error(errorMsg);
    }
  };

  if (!isLoaded || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  // Calculate statistics
  const completedDocs = documents.filter(
    (doc) => doc.processingStatus === "completed",
  ).length;
  const processingDocs = documents.filter(
    (doc) => doc.processingStatus === "processing",
  ).length;
  const totalWords = documents.reduce(
    (sum, doc) => sum + (doc.metadata?.wordCount || 0),
    0,
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Manage your documents and explore your knowledge base with
            AI-powered insights.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-destructive">Error</h3>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setError(null)}
                className="h-8 w-8 text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedDocs} processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processingDocs}</div>
              <p className="text-xs text-muted-foreground">
                Documents in queue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalWords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Free</div>
              <p className="text-xs text-muted-foreground">Plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setShowUpload(!showUpload)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload Documents</CardTitle>
                  <CardDescription>
                    Add new files to your knowledge base
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Link href="/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ask Questions</CardTitle>
                    <CardDescription>
                      Query your documents with natural language
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/graph">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Knowledge Graph</CardTitle>
                    <CardDescription>
                      Visualize document relationships
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Document Upload */}
        {showUpload && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload PDFs, Word documents, and text files to expand your
                    knowledge base
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
              />
            </CardContent>
          </Card>
        )}

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>
                  Manage and organize your uploaded documents
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDocuments}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setShowUpload(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={documents}
              onDocumentDelete={handleDocumentDelete}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
