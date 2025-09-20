"use client";

import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import type { ChatInterfaceProps } from "@/types";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

export function ChatInterface({
  onMessageSend,
  messages,
  loading = false,
  disabled = false,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <Card className="flex flex-col h-full card-enhanced border border-white/50 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 backdrop-blur-sm">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-enhanced bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Start a conversation
            </h3>
            <p className="text-muted-enhanced mb-10 max-w-lg mx-auto text-lg">
              Ask questions about your uploaded documents and get intelligent
              answers with precise source citations.
            </p>
            <div className="space-y-6 text-sm">
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-lg">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span>Try asking:</span>
              </div>
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:from-blue-100 hover:to-indigo-100">
                  <div className="font-medium text-blue-800 mb-1">📊 Document Analysis</div>
                  <div className="text-slate-700">"What are the main topics covered in my documents?"</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:from-green-100 hover:to-emerald-100">
                  <div className="font-medium text-green-800 mb-1">📝 Document Summary</div>
                  <div className="text-slate-700">"Summarize the key points from [document name]"</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:from-purple-100 hover:to-violet-100">
                  <div className="font-medium text-purple-800 mb-1">🔍 Information Search</div>
                  <div className="text-slate-700">"Find information about [specific topic]"</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                showSources={true}
              />
            ))}
            {loading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl rounded-bl-sm p-4 max-w-3xl shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-blue-400 opacity-20"></div>
                    </div>
                    <span className="text-sm text-blue-700 font-medium">
                      Analyzing your documents...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-3 backdrop-blur-sm">
        <ChatInput
          onSend={onMessageSend}
          disabled={disabled || loading}
          placeholder={
            messages.length === 0
              ? "Ask a question about your documents..."
              : "Follow up question..."
          }
        />
      </div>
    </Card>
  );
}
