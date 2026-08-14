"use client";

import axios from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/lib/auth/client";
import { showToast } from "@/lib/toast";
import type { ChatMessage } from "@/types";

export default function ChatPage() {
  const { user, isLoaded } = useAuthUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load welcome message
  useEffect(() => {
    if (isLoaded && user) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello ${user.firstName}! I'm your AI document assistant. I can help you find information, answer questions, and provide insights based on your uploaded documents. What would you like to know?`,
          timestamp: new Date(),
          sources: [],
        },
      ]);
    }
  }, [isLoaded, user]);

  const handleMessageSend = async (message: string) => {
    if (!user) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Send request to chat API
      const response = await axios.post("/api/chat", {
        query: message,
        userId: user.id,
        maxResults: 10,
      });

      if (response.data.success) {
        const chatResponse = response.data.data;

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: chatResponse.answer,
          timestamp: new Date(),
          sources: chatResponse.sources || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || "Failed to get response");
      }
    } catch (error: any) {
      console.error("Chat error:", error);

      let errorMessage =
        "Sorry, I encountered an error while processing your request.";

      if (error.response?.status === 401) {
        errorMessage = "Please sign in to continue chatting.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add error message
      const errorAssistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        sources: [],
      };

      setMessages((prev) => [...prev, errorAssistantMessage]);
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const _handleSourceClick = (docId: string) => {
    // TODO: Navigate to document view or open document details
  };

  const clearChat = () => {
    if (user) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Chat cleared! How can I help you with your documents today, ${user.firstName}?`,
          timestamp: new Date(),
          sources: [],
        },
      ]);
      showToast.success("Chat cleared successfully");
    }
    setError(null);
  };

  if (!isLoaded) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="card-index p-8 text-center max-w-md mx-auto">
            <h1 className="font-display text-2xl font-semibold mb-4 text-foreground">
              Sign in required
            </h1>
            <p className="text-muted-foreground mb-6">
              Sign in to reach the chat interface and ask questions of your
              documents.
            </p>
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="catalog-number mb-1">READING ROOM</p>
              <h1 className="font-display text-3xl font-semibold mb-1 text-foreground">
                Document Chat
              </h1>
              <p className="text-muted-foreground">
                Ask a question in plain language and get an answer with its
                source attached.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
                Clear chat
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 border border-destructive/50 bg-stamp-tint">
              <div className="flex items-start gap-3 p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-destructive">Chat error</h3>
                  <p className="text-sm text-destructive/90 mt-1">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setError(null)}
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="h-[calc(100vh-180px)]">
            <ChatInterface
              onMessageSend={handleMessageSend}
              messages={messages}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
