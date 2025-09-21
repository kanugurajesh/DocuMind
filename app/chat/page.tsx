"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showToast } from "@/lib/toast";
import type { ChatMessage } from "@/types";

export default function ChatPage() {
  const { user, isLoaded } = useUser();
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
          <Card className="p-8 text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the chat interface and interact with your
              documents.
            </p>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30">
        <div className="container mx-auto px-4 py-4 h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Document Chat
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Ask questions about your documents and get intelligent answers
                with sources
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="flex items-center gap-2 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Clear Chat
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2 bg-white border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md font-medium">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Card className="mb-6 card-enhanced border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-lg">
              <div className="flex items-start gap-3 p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-red-700">Chat Error</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setError(null)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors"
                >
                  ×
                </Button>
              </div>
            </Card>
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
