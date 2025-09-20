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
import { showToast } from "@/lib/toast";
import type { Document, SearchResult } from "@/types";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
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
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 text-lg">
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
          <Card className="card-enhanced border-l-4 border-l-blue-500 hover:border-l-blue-600 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-enhanced">
                Total Documents
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <FileText className="h-4 w-4 icon-blue" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{documents.length}</div>
              <p className="text-xs text-muted-enhanced font-medium">
                {completedDocs} processed
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced border-l-4 border-l-orange-500 hover:border-l-orange-600 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-enhanced">Processing</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                <TrendingUp className="h-4 w-4 icon-orange" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{processingDocs}</div>
              <p className="text-xs text-muted-enhanced font-medium">
                Documents in queue
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced border-l-4 border-l-green-500 hover:border-l-green-600 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-enhanced">Total Words</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                <BarChart3 className="h-4 w-4 icon-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {totalWords.toLocaleString()}
              </div>
              <p className="text-xs text-muted-enhanced font-medium">
                Across all documents
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced border-l-4 border-l-purple-500 hover:border-l-purple-600 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-enhanced">Account</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                <Users className="h-4 w-4 icon-purple" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">Free</div>
              <p className="text-xs text-muted-enhanced font-medium">Plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="card-enhanced hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-500 hover:border-l-blue-600"
            onClick={() => setShowUpload(!showUpload)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-enhanced group-hover:text-blue-700 transition-colors">Upload Documents</CardTitle>
                  <CardDescription className="text-muted-enhanced">
                    Add new files to your knowledge base
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Link href="/chat">
            <Card className="card-enhanced hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-green-500 hover:border-l-green-600">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300 shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-enhanced group-hover:text-green-700 transition-colors">Ask Questions</CardTitle>
                    <CardDescription className="text-muted-enhanced">
                      Query your documents with natural language
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/graph">
            <Card className="card-enhanced hover:shadow-xl transition-all duration-300 cursor-pointer group border-l-4 border-l-purple-500 hover:border-l-purple-600">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-enhanced group-hover:text-purple-700 transition-colors">Knowledge Graph</CardTitle>
                    <CardDescription className="text-muted-enhanced">
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
                  Search, manage and organize your uploaded documents
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
          <CardContent className="space-y-6">
            {/* Header with Search */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">
                  {isSearching ? "Searching..." : "Loading documents..."}
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
                        <div className="text-gray-500 mb-2">No documents found matching "{searchQuery}"</div>
                        <div className="text-sm text-gray-400">Try different keywords or check your spelling</div>
                      </div>
                    ) : (
                      currentPageItems.map((result, index) => (
                        <SearchResultCard
                          key={`${result.docId}-${result.chunkIndex}-${index}`}
                          result={result}
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
