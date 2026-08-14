"use client";

import { Bot, User } from "lucide-react";
import { useState } from "react";
import type { ChatMessageProps } from "@/types";

export function ChatMessage({
  message,
  showSources = true,
  onSourceClick,
}: ChatMessageProps) {
  const [showSourcesExpanded, setShowSourcesExpanded] = useState(false);

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-sm border border-border bg-primary flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      <div
        className={`max-w-3xl p-4 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "card-index text-foreground"
        }`}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Assistant Sources — footnotes */}
        {!isUser &&
          message.sources &&
          message.sources.length > 0 &&
          showSources && (
            <div className="mt-4 pt-3 rule-ledger">
              <div className="flex items-center justify-between mb-3">
                <span className="catalog-number">
                  REFERENCES ({message.sources.length})
                </span>
                <button
                  onClick={() => setShowSourcesExpanded(!showSourcesExpanded)}
                  className="text-xs text-foreground underline decoration-ledger font-medium"
                >
                  {showSourcesExpanded ? "Collapse" : "Expand"}
                </button>
              </div>

              {showSourcesExpanded ? (
                <div className="space-y-2">
                  {message.sources.map((source, index) => (
                    <div
                      key={`${source.docId}-${source.chunkId}`}
                      className="border border-border bg-background p-3 text-sm cursor-pointer hover:border-ledger transition-colors"
                      onClick={() => onSourceClick?.(source.docId)}
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <span className="font-medium text-foreground flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">
                            [{index + 1}]
                          </span>
                          {source.document.filename}
                        </span>
                        <span className="catalog-number shrink-0">
                          {(source.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <div className="text-muted-foreground line-clamp-3 pl-6 leading-relaxed">
                        "{source.text}"
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {message.sources.slice(0, 3).map((source, index) => (
                    <button
                      key={`${source.docId}-${source.chunkId}`}
                      onClick={() => onSourceClick?.(source.docId)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-border hover:border-ledger transition-colors font-mono"
                    >
                      <span className="text-muted-foreground">[{index + 1}]</span>
                      {source.document.filename}
                    </button>
                  ))}
                  {message.sources.length > 3 && (
                    <span className="catalog-number px-2.5 py-1 border border-border">
                      +{message.sources.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-3 font-mono ${
            isUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-sm border border-border bg-secondary flex items-center justify-center">
          <User className="h-4 w-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
}
