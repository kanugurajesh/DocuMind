"use client";

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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-lg p-4 ${
          isUser
            ? "bg-blue-600 text-white ml-12"
            : "bg-gray-100 text-gray-900 mr-12"
        }`}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Assistant Sources */}
        {!isUser &&
          message.sources &&
          message.sources.length > 0 &&
          showSources && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Sources ({message.sources.length})
                </span>
                <button
                  onClick={() => setShowSourcesExpanded(!showSourcesExpanded)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showSourcesExpanded ? "Hide" : "Show"} sources
                </button>
              </div>

              {showSourcesExpanded && (
                <div className="space-y-2">
                  {message.sources.map((source, index) => (
                    <div
                      key={`${source.docId}-${source.chunkId}`}
                      className="bg-white rounded border p-3 text-sm cursor-pointer hover:bg-gray-50"
                      onClick={() => onSourceClick?.(source.docId)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-blue-600">
                          [{index + 1}] {source.document.filename}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(source.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <div className="text-gray-700 line-clamp-3">
                        {source.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showSourcesExpanded && (
                <div className="flex flex-wrap gap-2">
                  {message.sources.slice(0, 3).map((source, index) => (
                    <button
                      key={`${source.docId}-${source.chunkId}`}
                      onClick={() => onSourceClick?.(source.docId)}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      [{index + 1}] {source.document.filename}
                    </button>
                  ))}
                  {message.sources.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{message.sources.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
