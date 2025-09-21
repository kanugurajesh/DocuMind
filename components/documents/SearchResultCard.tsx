"use client";

import { FileText, Calendar, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/types";

interface SearchResultCardProps {
  result: SearchResult;
  searchQuery: string;
}

export function SearchResultCard({ result, searchQuery }: SearchResultCardProps) {
  const highlightText = (text: string | null | undefined, searchTerm: string) => {
    if (!text || !searchTerm) return text || '';

    // Escape special regex characters in search term
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedTerm})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ?
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> :
        part
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';

    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-gray-800 text-base">
              {highlightText(result.documentTitle || "Untitled Document", searchQuery)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
            <Hash className="h-3 w-3 mr-1" />
            {Math.round((result.score || 0) * 100)}% match
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {highlightText(result.content || 'No content available', searchQuery)}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(result.createdAt)}
            </span>
            {result.chunkIndex !== undefined && (
              <span>Chunk {result.chunkIndex + 1}</span>
            )}
          </div>
          <span>Document ID: {result.docId ? result.docId.slice(-8) : 'Unknown'}</span>
        </div>
      </CardContent>
    </Card>
  );
}