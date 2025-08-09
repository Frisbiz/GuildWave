'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Hash, 
  Search, 
  Bell, 
  Pin, 
  Users, 
  Inbox,
  HelpCircle
} from 'lucide-react';
import Message from './Message';
import MessageInput from './MessageInput';

interface ChatAreaProps {
  selectedChannel: string;
}

interface Msg {
  id: string;
  author: string;
  avatar: string;
  content: string;
  role: string;
  timestampText?: string;
}

const initialMessages: Msg[] = [
  { id: '1', author: 'Alex Johnson', avatar: 'AJ', content: 'Hey everyone! Welcome to the Discord Clone! 👋', role: 'admin', timestampText: '12:00' },
  { id: '2', author: 'Sarah Wilson', avatar: 'SW', content: 'This looks amazing! The UI is spot on!', role: 'moderator', timestampText: '12:01' },
  { id: '3', author: 'Mike Chen', avatar: 'MC', content: 'I love the dark theme and the animations. Great work!', role: 'member', timestampText: '12:02' },
  { id: '4', author: 'Emma Davis', avatar: 'ED', content: 'The channel list and server sidebar are perfect replicas!', role: 'member', timestampText: '12:03' },
  { id: '5', author: 'Tom Brown', avatar: 'TB', content: "Can't wait to see more features being added! 🚀", role: 'member', timestampText: '12:04' },
];

export default function ChatArea({ selectedChannel }: ChatAreaProps) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const newMsg: Msg = {
        id: String(Date.now()),
        author: 'You',
        avatar: 'U',
        content,
        role: 'member',
        timestampText: `${hh}:${mm}`,
      };
      setMessages((m) => [...m, newMsg]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-discord-dark">
      {/* Channel header */}
      <div className="h-14 bg-discord-dark border-b border-discord-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <Hash size={20} className="text-discord-text-muted" />
          <span className="text-discord-text font-semibold">#{selectedChannel}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text">
            <Bell size={20} />
          </button>
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text">
            <Pin size={20} />
          </button>
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text">
            <Users size={20} />
          </button>
          <div className="w-px h-6 bg-discord-border"></div>
          <input
            type="text"
            placeholder="Search"
            className="bg-discord-darkest text-discord-text text-sm px-3 py-2 rounded border-none focus:outline-none focus:ring-1 focus:ring-discord-accent"
          />
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text">
            <Inbox size={20} />
          </button>
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text">
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-5">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
