"use client";

import { Paperclip, Send, X } from "lucide-react";
import type React from "react";
import { type KeyboardEvent, useRef, useState } from "react";
import { showToast } from "@/lib/toast";
import type { ChatInputProps } from "@/types";

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask a question...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } else if (!trimmedMessage) {
      showToast.error("Please enter a message");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
  };

  return (
    <div className="flex items-end space-x-4">
      <div className="flex-1 relative">
        <div className="relative bg-white rounded-2xl border-2 border-blue-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300 shadow-lg hover:shadow-xl">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full resize-none bg-transparent px-3 py-2 pr-20 text-gray-800 placeholder-gray-500
              focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
              text-sm leading-normal font-medium min-h-[36px]
            `}
            style={{ maxHeight: "100px" }}
          />

          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            {/* Attachment Button */}
            <button
              type="button"
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 transition-all duration-200 hover:scale-105"
              title="Attach file (coming soon)"
              disabled
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            {/* Clear Button */}
            {message && (
              <button
                onClick={() => setMessage("")}
                disabled={disabled}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-105"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              className={`
                p-1.5 rounded-lg transition-all duration-300 hover:scale-105
                ${
                  !message.trim() || disabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }
              `}
              title={disabled ? "Please wait..." : "Send message (Enter)"}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input hint */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-gray-500 font-medium">
            Press Enter to send, Shift+Enter for new line
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {message.length}/2000
          </span>
        </div>
      </div>
    </div>
  );
}
