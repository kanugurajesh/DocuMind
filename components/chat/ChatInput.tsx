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
        <div className="relative bg-background rounded-sm border border-input focus-within:border-ring transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full resize-none bg-transparent px-3 py-2 pr-20 text-foreground placeholder-muted-foreground
              focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
              text-sm leading-normal min-h-[36px]
            `}
            style={{ maxHeight: "100px" }}
          />

          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            {/* Attachment Button */}
            <button
              type="button"
              className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent transition-colors"
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
                className="p-1.5 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
                p-1.5 rounded-sm transition-colors
                ${
                  !message.trim() || disabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/85"
                }
              `}
              title={disabled ? "Please wait…" : "Send message (Enter)"}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Input hint */}
        <div className="flex items-center justify-between mt-2 px-1 catalog-number">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{message.length}/2000</span>
        </div>
      </div>
    </div>
  );
}
