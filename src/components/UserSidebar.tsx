'use client';

import { useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones,
  Settings,
  Crown,
  Shield,
  User,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { useVoiceStore } from '@/store/voiceStore';

interface UserSidebarProps {
  onVoiceEvent?: (type: 'join' | 'leave' | 'mute' | 'unmute', message: string) => void;
}

export default function UserSidebar({ onVoiceEvent }: UserSidebarProps) {
  const {
    users,
    currentUser,
    getChannelById,
    leaveVoiceChannel,
    toggleMute,
    toggleDeafen,
  } = useVoiceStore();

  const onlineUsers = useMemo(() => users.filter(u => u.status !== 'offline'), [users]);

  const handleLeave = () => {
    const prevId = currentUser.currentChannel;
    const prev = prevId ? getChannelById(prevId) : undefined;
    leaveVoiceChannel();
    if (prev) onVoiceEvent?.('leave', `Disconnected from ${prev.name}`);
  };

  const handleToggleMute = () => {
    toggleMute();
    const nextMuted = !currentUser.isMuted;
    onVoiceEvent?.(nextMuted ? 'mute' : 'unmute', nextMuted ? 'Muted' : 'Unmuted');
  };

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

  return (
    <div className="w-60 bg-discord-darker flex flex-col">
      {/* Members list (no voice channels here) */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        {/* Fixed spacer to ensure separation from top border regardless of hot-reload */}
        <div className="h-3" />
        <h3 className="text-discord-text-muted text-xs font-semibold uppercase tracking-wide mb-3">
          Members — {onlineUsers.length}
        </h3>
        
        <div className="space-y-1.5">
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-2.5 rounded-md cursor-pointer text-sm hover:bg-discord-light group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white text-xs font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-discord-darkest ${getStatusColor(user.status)}`}></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-discord-text text-sm font-medium truncate">
                    {user.name}
                  </span>
                  {getRoleIcon(user.role)}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {user.isMuted ? (
                  <MicOff size={14} className="text-discord-red" />
                ) : (
                  <Mic size={14} className="text-discord-text-muted" />
                )}
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-1.5 text-discord-text-muted hover:text-discord-text">
                <MoreVertical size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Voice controls */}
      <div className="bg-discord-darkest border-t border-discord-border p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-discord-accent flex items-center justify-center text-white text-xs font-semibold">
              U
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-discord-green border-2 border-discord-darkest"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-discord-text text-sm font-medium">You</div>
            <div className="text-discord-text-muted text-xs">
              {currentUser.currentChannel 
                ? `Connected to ${getChannelById(currentUser.currentChannel)?.name}`
                : 'Not connected to voice'
              }
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5">
            {currentUser.currentChannel && (
              <button 
                className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded"
                onClick={handleLeave}
                title="Leave voice channel"
              >
                <LogOut size={16} />
              </button>
            )}
            <button 
              className={`p-1.5 rounded transition-colors ${
                currentUser.isMuted 
                  ? 'text-discord-red hover:text-discord-red hover:bg-discord-light' 
                  : 'text-discord-text-muted hover:text-discord-text hover:bg-discord-light'
              }`}
              onClick={handleToggleMute}
              title={currentUser.isMuted ? 'Unmute' : 'Mute'}
            >
              {currentUser.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button 
              className={`p-1.5 rounded transition-colors ${
                currentUser.isDeafened 
                  ? 'text-discord-red hover:text-discord-red hover:bg-discord-light' 
                  : 'text-discord-text-muted hover:text-discord-text hover:bg-discord-light'
              }`}
              onClick={() => toggleDeafen()}
              title={currentUser.isDeafened ? 'Undeafen' : 'Deafen'}
            >
              <Headphones size={16} />
            </button>
            <button className="p-1.5 text-discord-text-muted hover:text-discord-text hover:bg-discord-light rounded">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
