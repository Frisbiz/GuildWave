'use client';

import { 
  Mic, 
  MicOff, 
  Headphones,
  Crown,
  Shield,
  User
} from 'lucide-react';

interface VoiceUser {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  role: 'admin' | 'moderator' | 'member';
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  currentChannel: string | null;
}

interface VoiceChannelUsersProps {
  channelId: string;
  users: VoiceUser[];
}

export default function VoiceChannelUsers({ channelId, users }: VoiceChannelUsersProps) {
  const channelUsers = users.filter(user => user.currentChannel === channelId);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown size={12} className="text-discord-yellow" />;
      case 'moderator':
        return <Shield size={12} className="text-discord-green" />;
      default:
        return <User size={12} className="text-discord-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-discord-green';
      case 'idle':
        return 'bg-discord-yellow';
      case 'dnd':
        return 'bg-discord-red';
      default:
        return 'bg-discord-text-muted';
    }
  };

  const getVoiceStatusIcon = (user: VoiceUser) => {
    if (user.isDeafened) {
      return <Headphones size={12} className="text-discord-red" />;
    } else if (user.isMuted) {
      return <MicOff size={12} className="text-discord-red" />;
    } else if (user.isSpeaking) {
      return <Mic size={12} className="text-discord-green" />;
    } else {
      return <Mic size={12} className="text-discord-text-muted" />;
    }
  };

  if (channelUsers.length === 0) {
    return (
      <div className="px-4 py-3">
        <div className="text-discord-text-muted text-xs text-center">
          No one is in this voice channel
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      {channelUsers.map((user) => (
        <div
          key={user.id}
          className="voice-user-row flex items-center space-x-3 p-3 rounded-md cursor-pointer text-sm hover:bg-discord-light/60"
        >
          {/* Avatar with status */}
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-discord-accent flex items-center justify-center text-white text-[11px] font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-discord-darker ${getStatusColor(user.status)}`}></div>
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-discord-text text-xs font-medium truncate">
                {user.name}
              </span>
              {getRoleIcon(user.role)}
            </div>
          </div>

          {/* Voice status */}
          <div className="flex items-center space-x-1">
            {user.isSpeaking && (
              <div className="w-2 h-2 rounded-full bg-discord-green animate-pulse"></div>
            )}
            {getVoiceStatusIcon(user)}
          </div>
        </div>
      ))}
    </div>
  );
}
