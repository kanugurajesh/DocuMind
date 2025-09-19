'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatInterfaceProps } from '@/types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatInterface({
  onMessageSend,
  messages,
  loading = false,
  disabled = false,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Start a conversation
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Ask questions about your uploaded documents and get intelligent answers with sources.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <p><strong>Try asking:</strong></p>
              <div className="space-y-1">
                <p>"What are the main topics covered in my documents?"</p>
                <p>"Summarize the key points from [document name]"</p>
                <p>"Find information about [specific topic]"</p>
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
                <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
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
    </div>
  );
}