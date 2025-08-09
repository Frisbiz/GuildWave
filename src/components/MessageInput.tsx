'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  Paperclip, 
  AtSign,
  Send
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className={`relative bg-discord-darkest rounded-xl border transition-colors ${
          isFocused ? 'border-discord-accent' : 'border-discord-border'
        }`}>
          {/* Input area */}
          <div className="flex items-end p-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Message #general`}
                className="w-full bg-transparent text-discord-text placeholder-discord-text-muted resize-none border-none outline-none text-sm leading-relaxed min-h-[20px] max-h-[144px]"
                rows={1}
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                type="button"
                className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded transition-colors"
                title="Add emoji"
              >
                <Smile size={20} />
              </button>
              
              <button
                type="button"
                className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded transition-colors"
                title="Upload file"
              >
                <Paperclip size={20} />
              </button>
              
              <button
                type="button"
                className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded transition-colors"
                title="Mention someone"
              >
                <AtSign size={20} />
              </button>
            </div>
          </div>
          
          {/* Send button - only show when there's text */}
          {message.trim() && (
            <div className="absolute bottom-2.5 right-2.5">
              <button
                type="submit"
                className="p-1.5 bg-discord-accent text-white rounded hover:bg-discord-accent-hover transition-colors"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </form>
      
      {/* Character count */}
      {message.length > 0 && (
        <div className="absolute -bottom-6 right-0 text-xs text-discord-text-muted">
          {message.length}/2000
        </div>
      )}
    </div>
  );
}
