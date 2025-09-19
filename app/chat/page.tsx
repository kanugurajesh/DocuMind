'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

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
          id: 'welcome',
          role: 'assistant',
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
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      // Send request to chat API
      const response = await axios.post('/api/chat', {
        query: message,
        userId: user.id,
        maxResults: 10,
      });

      if (response.data.success) {
        const chatResponse = response.data.data;

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: chatResponse.answer,
          timestamp: new Date(),
          sources: chatResponse.sources || [],
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);

      let errorMessage = 'Sorry, I encountered an error while processing your request.';

      if (error.response?.status === 401) {
        errorMessage = 'Please sign in to continue chatting.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Add error message
      const errorAssistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        sources: [],
      };

      setMessages(prev => [...prev, errorAssistantMessage]);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceClick = (docId: string) => {
    // TODO: Navigate to document view or open document details
    console.log('Clicked source document:', docId);
  };

  const clearChat = () => {
    if (user) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Chat cleared! How can I help you with your documents today, ${user.firstName}?`,
          timestamp: new Date(),
          sources: [],
        },
      ]);
    }
    setError(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the chat interface.</p>
          <a
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Document Chat</h1>
            <p className="text-gray-600 mt-1">
              Ask questions about your documents and get intelligent answers
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Clear Chat */}
            <button
              onClick={clearChat}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Chat</span>
            </button>

            {/* Back to Dashboard */}
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Chat Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div style={{ height: 'calc(100vh - 240px)' }}>
          <ChatInterface
            onMessageSend={handleMessageSend}
            messages={messages}
            loading={loading}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}