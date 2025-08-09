'use client';

import { useState, useEffect } from 'react';
import { Volume2, LogOut } from 'lucide-react';

interface VoiceNotificationProps {
  message: string;
  type: 'join' | 'leave' | 'mute' | 'unmute';
  onClose: () => void;
}

export default function VoiceNotification({ message, type, onClose }: VoiceNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'join':
        return <Volume2 size={16} className="text-discord-green" />;
      case 'leave':
        return <LogOut size={16} className="text-discord-red" />;
      case 'mute':
        return <Volume2 size={16} className="text-discord-red" />;
      case 'unmute':
        return <Volume2 size={16} className="text-discord-green" />;
      default:
        return <Volume2 size={16} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'join':
      case 'unmute':
        return 'bg-discord-green/20 border-discord-green/30';
      case 'leave':
      case 'mute':
        return 'bg-discord-red/20 border-discord-red/30';
      default:
        return 'bg-discord-light/20 border-discord-border';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg border ${getBgColor()} transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex items-center space-x-2">
        {getIcon()}
        <span className="text-discord-text text-sm">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-discord-text-muted hover:text-discord-text"
        >
          ×
        </button>
      </div>
    </div>
  );
}
