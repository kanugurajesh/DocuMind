'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { ChatInputProps } from '@/types';
import { showToast } from '@/lib/toast';

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask a question...",
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } else if (!trimmedMessage) {
      showToast.error('Please enter a message');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`
            w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors duration-200
          `}
          style={{ maxHeight: '120px' }}
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className={`
            absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200
            ${
              !message.trim() || disabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'
            }
          `}
          title="Send message (Enter)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-2">
        {/* Clear Chat Button */}
        <button
          onClick={() => setMessage('')}
          disabled={!message || disabled}
          className={`
            p-2 rounded-lg transition-colors duration-200
            ${
              !message || disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }
          `}
          title="Clear input"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}