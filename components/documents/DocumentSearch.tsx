"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import type { SearchApiResponse, SearchResult, Document } from "@/types";

interface DocumentSearchProps {
  documents: Document[];
  onSearchResults?: (results: SearchResult[], isSearching: boolean, query: string) => void;
}

export function DocumentSearch({ documents, onSearchResults }: DocumentSearchProps) {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && user) {
      performSearch(debouncedQuery.trim());
    } else {
      // If search is empty, use local filename filtering as fallback
      if (query.trim()) {
        performLocalSearch(query.trim());
      } else {
        onSearchResults?.([], false, "");
      }
    }
  }, [debouncedQuery, user, documents, query]);

  const performLocalSearch = (searchQuery: string) => {
    // Local search through document filenames and metadata
    const localResults: SearchResult[] = documents
      .filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.metadata?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.metadata?.content && doc.metadata.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map(doc => ({
        docId: doc.docId,
        content: doc.metadata?.content?.substring(0, 200) || "No content preview available",
        score: 0.8, // Default score for local matches
        documentTitle: doc.filename,
        createdAt: doc.createdAt,
        chunkIndex: 0
      }));

    onSearchResults?.(localResults, false, searchQuery);
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!user) return;

    try {
      setIsSearching(true);
      onSearchResults?.([], true, searchQuery);

      const response = await axios.post<SearchApiResponse>("/api/search", {
        query: searchQuery,
        userId: user.id,
        limit: 20,
        minScore: 0.1, // Lower threshold to get more results
      });

      if (response.data.success && response.data.results) {
        onSearchResults?.(response.data.results, false, searchQuery);
      } else {
        // Fallback to local search if API search fails
        performLocalSearch(searchQuery);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      // Fallback to local search on error
      performLocalSearch(searchQuery);
    } finally {
      setIsSearching(false);
    }
  }, [user, onSearchResults, documents]);

  const clearSearch = () => {
    setQuery("");
    onSearchResults?.([], false, "");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-200 text-sm"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}