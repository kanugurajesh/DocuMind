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
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}

      <div
        className={`max-w-3xl rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
            : "bg-gradient-to-br from-white to-blue-50/30 text-gray-800 border border-blue-100 rounded-bl-sm"
        }`}
      >
        {/* Message Content */}
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Assistant Sources */}
        {!isUser &&
          message.sources &&
          message.sources.length > 0 &&
          showSources && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Sources ({message.sources.length})
                </span>
                <button
                  onClick={() => setShowSourcesExpanded(!showSourcesExpanded)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  {showSourcesExpanded ? "Hide" : "Show"} sources
                </button>
              </div>

              {showSourcesExpanded && (
                <div className="space-y-3">
                  {message.sources.map((source, index) => (
                    <div
                      key={`${source.docId}-${source.chunkId}`}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-sm cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover:shadow-md"
                      onClick={() => onSourceClick?.(source.docId)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-blue-700 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          {source.document.filename}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            {(source.score * 100).toFixed(0)}% match
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-700 line-clamp-3 pl-8 text-sm leading-relaxed">
                        "{source.text}"
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
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md font-medium"
                    >
                      <div className="w-4 h-4 rounded bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      {source.document.filename}
                    </button>
                  ))}
                  {message.sources.length > 3 && (
                    <span className="text-xs text-gray-600 px-3 py-2 bg-gray-100 rounded-xl border border-gray-200 font-medium">
                      +{message.sources.length - 3} more sources
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Timestamp */}
        <div
          className={`text-xs mt-3 flex items-center gap-2 ${
            isUser ? "text-blue-100 justify-end" : "text-gray-500 justify-start"
          }`}
        >
          <div className={`w-1 h-1 rounded-full ${isUser ? "bg-blue-200" : "bg-gray-400"}`}></div>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}
