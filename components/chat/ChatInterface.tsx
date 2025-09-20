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
    <Card className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Start a conversation</h3>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Ask questions about your uploaded documents and get intelligent
              answers with precise source citations.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Try asking:</span>
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <div className="bg-muted/50 rounded-lg p-3 text-left">
                  "What are the main topics covered in my documents?"
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-left">
                  "Summarize the key points from [document name]"
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-left">
                  "Find information about [specific topic]"
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
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-2xl rounded-bl-sm p-4 max-w-3xl">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
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
      <div className="border-t bg-muted/30 p-4">
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
