"use client";

import { Compass, FileSearch, Loader2, ListTree, MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import type { ChatInterfaceProps } from "@/types";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

const promptExamples = [
  {
    icon: ListTree,
    label: "Document analysis",
    prompt: "What are the main topics covered in my documents?",
  },
  {
    icon: FileSearch,
    label: "Document summary",
    prompt: "Summarize the key points from [document name]",
  },
  {
    icon: Compass,
    label: "Information search",
    prompt: "Find information about [specific topic]",
  },
];

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
  }, [messages, loading]);

  return (
    <Card className="flex flex-col h-full card-index overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-8 rounded-sm border border-border bg-background flex items-center justify-center">
              <MessageSquare className="h-7 w-7 icon-blue" />
            </div>
            <h3 className="font-display text-2xl font-semibold mb-3 text-enhanced">
              Start a conversation
            </h3>
            <p className="text-muted-enhanced mb-10 max-w-lg mx-auto">
              Ask a question about your uploaded documents and get an answer
              with the exact passage it came from.
            </p>
            <div className="space-y-4 max-w-lg mx-auto">
              <p className="catalog-number text-left">TRY ASKING</p>
              {promptExamples.map((example) => (
                <div
                  key={example.label}
                  className="card-index p-4 text-left flex items-start gap-3"
                >
                  <example.icon className="h-4 w-4 icon-blue mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-mono tracking-wide text-muted-foreground mb-1 uppercase">
                      {example.label}
                    </div>
                    <div className="text-foreground">"{example.prompt}"</div>
                  </div>
                </div>
              ))}
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
                <div className="border border-border bg-secondary/50 p-4 max-w-3xl">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                    <span className="text-sm text-foreground font-medium">
                      Reading your documents…
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
      <div className="border-t border-border bg-secondary/30 p-3">
        <ChatInput
          onSend={onMessageSend}
          disabled={disabled || loading}
          placeholder={
            messages.length === 0
              ? "Ask a question about your documents…"
              : "Ask a follow-up…"
          }
        />
      </div>
    </Card>
  );
}
