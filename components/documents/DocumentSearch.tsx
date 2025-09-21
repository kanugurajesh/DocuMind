"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SearchResult, Document } from "@/types";

interface DocumentSearchProps {
  documents: Document[];
  onSearchResults?: (results: SearchResult[], isSearching: boolean, query: string) => void;
}

export function DocumentSearch({ documents, onSearchResults }: DocumentSearchProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      const results = documents
        .filter(doc => doc.filename.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aName = a.filename.toLowerCase();
          const bName = b.filename.toLowerCase();
          if (aName === searchTerm) return -1;
          if (bName === searchTerm) return 1;
          if (aName.startsWith(searchTerm)) return -1;
          if (bName.startsWith(searchTerm)) return 1;
          return 0;
        })
        .map(doc => ({
          chunkId: `${doc.docId}-0`,
          chunkIndex: 0,
          docId: doc.docId,
          text: doc.metadata?.title || "No content preview available",
          content: doc.metadata?.title?.substring(0, 200) || "No content preview available",
          documentTitle: doc.filename,
          createdAt: doc.uploadedAt.toISOString(),
          score: 0.8,
          document: {
            filename: doc.filename,
            uploadedAt: doc.uploadedAt
          }
        }));
      onSearchResults?.(results, false, query);
    } else {
      onSearchResults?.([], false, "");
    }
  }, [query, documents]);


  const clearSearch = () => setQuery("");

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

    </div>
  );
}