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
import { supabase } from '@/lib/supabase';

interface ChatAreaProps {
  selectedChannel: string;
}

interface Msg {
  id: string;
  channel_id: string;
  author_id?: string;
  author?: string;
  avatar?: string;
  content: string;
  role?: string;
  created_at?: string;
  timestampText?: string;
}

export default function ChatArea({ selectedChannel }: ChatAreaProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const realtimeSubRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Resolve channel id from channel name (selectedChannel)
  useEffect(() => {
    let mounted = true;
    async function resolveChannel() {
      if (!selectedChannel) {
        setChannelId(null);
        return;
      }

      // Try to find a channel by name
      const { data: channels, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', selectedChannel)
        .limit(1);

      if (error) {
        console.error('Failed to query channel id:', error);
        setChannelId(null);
        return;
      }

      if (mounted) {
        if (channels && channels.length > 0) {
          setChannelId(channels[0].id);
        } else {
          setChannelId(null);
        }
      }
    }

    resolveChannel();

    return () => {
      mounted = false;
    };
  }, [selectedChannel]);

  // Fetch messages for the current channel
  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      if (!channelId) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      if (mounted) {
        setMessages(data || []);
      }
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [channelId]);

  // Realtime subscription to new messages for the channel
  useEffect(() => {
    // cleanup previous subscription
    if (realtimeSubRef.current) {
      try {
        supabase.removeChannel(realtimeSubRef.current);
      } catch (e) {
        // ignore
      }
      realtimeSubRef.current = null;
    }

    if (!channelId) return;

    const channel = supabase
      .channel(`public:messages:channel=${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload: { new: Msg }) => {
          const newMsg = payload.new as Msg;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe((status: string) => {
        // optional: handle subscribe status
        // console.log('realtime status', status);
      });

    realtimeSubRef.current = channel;

    return () => {
      if (realtimeSubRef.current) {
        supabase.removeChannel(realtimeSubRef.current).catch(() => {});
        realtimeSubRef.current = null;
      }
    };
  }, [channelId]);

  const handleSendMessage = async (content: string) => {
    if (!channelId) {
      alert('No channel selected or channel not found on the server.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert('You must be signed in to send messages. Please sign in first.');
      return;
    }

    const insert = {
      channel_id: channelId,
      author_id: user.id,
      body: content
    };

    const { error } = await supabase.from('messages').insert([insert]);

    if (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Check console for details.');
    }
    // Success will be handled by realtime subscription which appends the new message.
  };

  return (
    <div className="flex-1 flex flex-col bg-discord-dark border-r border-discord-border px-8 chat-panel">
      {/* Channel header */}
      <div className="h-14 bg-discord-dark border-b border-discord-border flex items-center justify-between px-8">
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
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div>
          {messages.map((message) => (
            <div key={message.id} className="message-block">
              <Message
                message={{
                  id: message.id,
                  author: message.author || (message.author_id ? 'User' : 'Unknown'),
                  avatar: (message.author || '').slice(0, 2).toUpperCase() || 'U',
                  content: (message as any).body || message.content || '',
                  role: message.role || 'member',
                  timestampText: message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
                }}
              />
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-8 py-4">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
