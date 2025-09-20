"use client";

import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentListProps } from "@/types";
import { DocumentCard } from "./DocumentCard";

export function DocumentList({
  documents,
  onDocumentDelete,
  onDocumentSelect,
  loading = false,
}: DocumentListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-6 w-6 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/2" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-3">No documents yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Upload your first document to get started with intelligent document
          analysis and AI-powered insights.
        </p>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.docId}
          document={document}
          onDelete={onDocumentDelete}
          onClick={() => onDocumentSelect?.(document)}
        />
      ))}
    </div>
  );
}
