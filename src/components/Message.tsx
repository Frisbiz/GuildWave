'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { 
  MoreVertical, 
  Smile, 
  Reply, 
  Pin,
  Crown,
  Shield
} from 'lucide-react';

interface MessageData {
  id: string;
  author: string;
  avatar: string;
  content: string;
  role: string;
  timestamp?: Date;
  timestampText?: string;
}

interface MessageProps {
  message: MessageData;
}

export default function Message({ message }: MessageProps) {
  const [showActions, setShowActions] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={12} className="text-discord-yellow" />;
      case 'moderator':
        return <Shield size={12} className="text-discord-green" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-discord-yellow';
      case 'moderator':
        return 'text-discord-green';
      default:
        return 'text-discord-text';
    }
  };

  const timeLabel = message.timestampText ?? (message.timestamp ? format(message.timestamp, 'HH:mm') : undefined);

  return (
    <div 
      className="group flex items-start space-x-3 hover:bg-discord-light/50 rounded px-0 py-1.5"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-discord-accent flex items-center justify-center text-white text-sm font-semibold">
          {message.avatar}
        </div>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`text-sm font-medium ${getRoleColor(message.role)}`}>
            {message.author}
          </span>
          {getRoleIcon(message.role)}
          {timeLabel && (
            <span className="text-discord-text-muted text-xs">
              {timeLabel}
            </span>
          )}
        </div>
        
        <div className="text-discord-text text-sm leading-relaxed">
          {message.content}
        </div>
      </div>

      {/* Message actions */}
      {showActions && (
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded">
            <Smile size={16} />
          </button>
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded">
            <Reply size={16} />
          </button>
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded">
            <Pin size={16} />
          </button>
          <button className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded">
            <MoreVertical size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
