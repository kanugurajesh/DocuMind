"use client";

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
import { DocumentSearch } from "@/components/documents/DocumentSearch";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { SearchResultCard } from "@/components/documents/SearchResultCard";
import { AppLayout } from "@/components/layout/app-layout";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthUser } from "@/lib/auth/client";
import { showToast } from "@/lib/toast";
import type { Document, SearchResult } from "@/types";

export default function DashboardPage() {
  const { user, isLoaded } = useAuthUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchDocuments = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      const response = await axios.get("/api/documents");
      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      const errorMsg = "Failed to load documents";
      setError(errorMsg);
      if (showLoadingState) {
        showToast.error(errorMsg);
      }
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch user's documents
  useEffect(() => {
    if (isLoaded && user) {
      fetchDocuments();
    }
  }, [isLoaded, user, fetchDocuments]);

  // Poll for document status updates when there are pending/processing documents
  useEffect(() => {
    const hasPendingOrProcessing = documents.some(
      (doc) => doc.processingStatus === "pending" || doc.processingStatus === "processing"
    );

    if (!hasPendingOrProcessing) {
      return;
    }

    const pollInterval = setInterval(() => {
      fetchDocuments(false); // Don't show loading state during polling
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [documents, fetchDocuments]);

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

  const handleSearchResults = (results: SearchResult[], searching: boolean, query: string) => {
    setSearchResults(results);
    setIsSearching(searching);
    setSearchQuery(query);
    setIsSearchActive(query.length > 0);
    setCurrentPage(1); // Reset to first page when search changes
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

  // Get current items to display (either search results or documents)
  const currentItems = isSearchActive ? searchResults : documents;
  const totalItems = currentItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = currentItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="catalog-number mb-2">YOUR COLLECTION</p>
          <h1 className="font-display text-3xl font-semibold mb-2 text-foreground">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your documents and explore your knowledge base with
            AI-powered insights.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 border border-destructive/50 bg-stamp-tint">
            <div className="flex items-start gap-3 p-4">
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
            </div>
          </div>
        )}

        {/* Stats Overview — a ledger totals strip, not four colorful tiles */}
        <div className="card-index mb-8 grid grid-cols-2 md:grid-cols-4 divide-y divide-border md:divide-y-0 md:divide-x">
          <div className="p-5 flex items-center gap-3">
            <FileText className="h-4 w-4 icon-blue shrink-0" />
            <div>
              <div className="text-2xl font-display font-semibold text-foreground leading-none">
                {documents.length}
              </div>
              <p className="catalog-number mt-1">
                Documents · {completedDocs} processed
              </p>
            </div>
          </div>

          <div className="p-5 flex items-center gap-3">
            <TrendingUp className="h-4 w-4 icon-orange shrink-0" />
            <div>
              <div className="text-2xl font-display font-semibold text-foreground leading-none">
                {processingDocs}
              </div>
              <p className="catalog-number mt-1">In queue</p>
            </div>
          </div>

          <div className="p-5 flex items-center gap-3">
            <BarChart3 className="h-4 w-4 icon-green shrink-0" />
            <div>
              <div className="text-2xl font-display font-semibold text-foreground leading-none">
                {totalWords.toLocaleString()}
              </div>
              <p className="catalog-number mt-1">Words on file</p>
            </div>
          </div>

          <div className="p-5 flex items-center gap-3">
            <Users className="h-4 w-4 icon-purple shrink-0" />
            <div>
              <div className="text-2xl font-display font-semibold text-foreground leading-none">
                Free
              </div>
              <p className="catalog-number mt-1">Plan</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            type="button"
            className="card-enhanced text-left p-5 flex items-center gap-4 group"
            onClick={() => setShowUpload(!showUpload)}
          >
            <div className="w-11 h-11 rounded-sm border border-border bg-background flex items-center justify-center shrink-0 group-hover:border-ledger transition-colors">
              <Upload className="w-5 h-5 icon-blue" />
            </div>
            <div>
              <div className="font-display font-semibold text-enhanced">Upload Documents</div>
              <p className="text-sm text-muted-enhanced">Add new files to your knowledge base</p>
            </div>
          </button>

          <Link
            href="/chat"
            className="card-enhanced p-5 flex items-center gap-4 group"
          >
            <div className="w-11 h-11 rounded-sm border border-border bg-background flex items-center justify-center shrink-0 group-hover:border-ledger transition-colors">
              <MessageSquare className="w-5 h-5 icon-green" />
            </div>
            <div>
              <div className="font-display font-semibold text-enhanced">Ask Questions</div>
              <p className="text-sm text-muted-enhanced">Query your documents with natural language</p>
            </div>
          </Link>

          <Link
            href="/graph"
            className="card-enhanced p-5 flex items-center gap-4 group"
          >
            <div className="w-11 h-11 rounded-sm border border-border bg-background flex items-center justify-center shrink-0 group-hover:border-ledger transition-colors">
              <BarChart3 className="w-5 h-5 icon-purple" />
            </div>
            <div>
              <div className="font-display font-semibold text-enhanced">Knowledge Graph</div>
              <p className="text-sm text-muted-enhanced">Visualize document relationships</p>
            </div>
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
                  Search, manage and organize your uploaded documents
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDocuments(true)}
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
          <CardContent className="space-y-6">
            {/* Header with Search */}
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {isSearchActive
                  ? `Search Results for "${searchQuery}" (${totalItems})`
                  : `All Documents (${totalItems})`}
              </h3>
              <div className="w-80 relative">
                <DocumentSearch
                  documents={documents}
                  onSearchResults={handleSearchResults}
                />
              </div>
            </div>

            {/* Loading State */}
            {(loading || isSearching) && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                <span className="ml-3 text-muted-foreground">
                  {isSearching ? "Searching…" : "Loading documents…"}
                </span>
              </div>
            )}

            {/* Content */}
            {!loading && !isSearching && (
              <>
                {/* Search Results */}
                {isSearchActive && (
                  <div className="space-y-4">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-foreground mb-2">No documents on file match "{searchQuery}"</div>
                        <div className="text-sm text-muted-foreground">Try different keywords, or check the spelling</div>
                      </div>
                    ) : (
                      currentPageItems.map((result, index) => (
                        <SearchResultCard
                          key={`${result.docId}-${(result as SearchResult).chunkIndex || index}`}
                          result={result as SearchResult}
                          searchQuery={searchQuery}
                        />
                      ))
                    )}
                  </div>
                )}

                {/* Document List */}
                {!isSearchActive && (
                  <DocumentList
                    documents={currentPageItems as Document[]}
                    onDocumentDelete={handleDocumentDelete}
                    onUploadClick={() => setShowUpload(true)}
                    loading={false}
                  />
                )}

                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
