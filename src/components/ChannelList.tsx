'use client';

import { useMemo, useState } from 'react';
import { 
  Hash, 
  Volume2, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Crown,
  Shield,
  User,
  Mic,
  MicOff,
  Headphones,
  LogOut
} from 'lucide-react';
import { useVoiceStore } from '@/store/voiceStore';

interface ChannelListProps {
  selectedChannel: string;
  onChannelSelect: (channel: string) => void;
  onVoiceEvent?: (type: 'join' | 'leave' | 'mute' | 'unmute', message: string) => void;
}

export default function ChannelList({ selectedChannel, onChannelSelect, onVoiceEvent }: ChannelListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const { channels, getUsersInChannel, selectedVoiceChannelId, joinVoiceChannel, getChannelById, currentUser, leaveVoiceChannel, toggleMute, toggleDeafen } = useVoiceStore();

  const textCategories = [
    {
      category: 'TEXT CHANNELS',
      channels: [
        { id: 'general', name: 'general', icon: Hash },
        { id: 'announcements', name: 'announcements', icon: Hash },
        { id: 'rules', name: 'rules', icon: Hash },
        { id: 'general-chat', name: 'general-chat', icon: Hash },
        { id: 'memes', name: 'memes', icon: Hash },
      ]
    }
  ];

  const toggleCategory = (category: string) => {
    const next = new Set(collapsedCategories);
    if (next.has(category)) next.delete(category); else next.add(category);
    setCollapsedCategories(next);
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

  const handleJoinVoice = (channelId: string) => {
    const res = joinVoiceChannel(channelId);
    if (!res.joined && res.reason) alert(res.reason);
  };

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

  return (
    <div className="w-60 bg-discord-darker flex flex-col border-r border-discord-border px-6 channel-panel">
      {/* Server header */}
      <div className="h-14 bg-discord-darkest flex items-center justify-between pl-5 pr-5 border-b border-discord-border">
        <h1 className="text-discord-text font-semibold text-sm">Discord Clone</h1>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-discord-green"></div>
          <span className="text-discord-text-muted text-xs">voice</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-2 pb-2">
          {textCategories.map((category) => (
            <div key={category.category} className="mb-4">
              <div 
                className="flex items-center justify-between text-discord-text-muted text-xs font-semibold uppercase tracking-wide pl-6 py-2 cursor-pointer hover:text-discord-text"
                onClick={() => toggleCategory(category.category)}
              >
                <span>{category.category}</span>
                {collapsedCategories.has(category.category) ? (
                  <ChevronRight size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
              </div>
              
              {!collapsedCategories.has(category.category) && (
                <div className="mt-2 space-y-1.5">
                  {category.channels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`flex items-center space-x-2 pl-8 py-3 rounded-md cursor-pointer text-sm ${
                        selectedChannel === channel.id
                          ? 'bg-discord-light text-discord-text'
                          : 'text-discord-text-muted hover:bg-discord-light hover:text-discord-text'
                      }`}
                      style={{ paddingLeft: '32px' }}
                      onClick={() => onChannelSelect(channel.id)}
                    >
                      <channel.icon size={16} />
                      <span className="flex-1">{channel.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Voice channels */}
            <div className="mb-4">
              <div 
                className="flex items-center justify-between text-discord-text-muted text-xs font-semibold uppercase tracking-wide pl-6 py-2"
              >
                <span>VOICE CHANNELS</span>
              </div>
              <div className="mt-2 space-y-1.5">
              {channels.map((vc) => {
                const users = getUsersInChannel(vc.id);
                const isSelected = selectedVoiceChannelId === vc.id;
                const isInThisChannel = currentUser.currentChannel === vc.id;
                return (
                  <div key={vc.id} className="mb-2">
                    <div
                      className={`flex items-center justify-between pl-8 py-3 text-sm rounded-md cursor-pointer ${
                        isSelected || isInThisChannel
                          ? 'bg-discord-light text-discord-text'
                          : 'text-discord-text-muted hover:text-discord-text hover:bg-discord-light'
                      }`}
                      style={{ paddingLeft: '32px' }}
                      onClick={() => handleJoinVoice(vc.id)}
                    >
                          <div className="flex items-center space-x-2">
                            <Volume2 size={16} />
                            <span>{vc.name}</span>
                          </div>
                          <span className="text-xs">{users.length}/{vc.maxUsers}</span>
                        </div>

                    {/* Show users under voice channel like Discord */}
                    {users.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {users.map((u) => (
                          <div key={u.id} className="flex items-center justify-between pl-8 py-3 text-xs text-discord-text hover:bg-discord-light/60 rounded" style={{ paddingLeft: '32px' }}>
                            <div className="flex items-center space-x-2 min-w-0">
                              <div className="relative">
                                <div className="w-6 h-6 rounded-full bg-discord-accent flex items-center justify-center text-white text-[10px] font-semibold">
                                  {u.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-discord-darker ${getStatusColor(u.status)}`}></div>
                              </div>
                              <span className="truncate">{u.name}</span>
                              {u.role !== 'member' && getRoleIcon(u.role)}
                            </div>
                            <div className="flex items-center space-x-1">
                              {u.isDeafened ? (
                                <Headphones size={12} className="text-discord-red" />
                              ) : u.isMuted ? (
                                <MicOff size={12} className="text-discord-red" />
                              ) : (
                                <Mic size={12} className="text-discord-text-muted" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current user voice controls */}
      <div className="bg-discord-darkest border-t border-discord-border pl-5 pr-5 py-4">
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
