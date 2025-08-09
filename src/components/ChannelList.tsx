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
  Headphones
} from 'lucide-react';
import { useVoiceStore } from '@/store/voiceStore';

interface ChannelListProps {
  selectedChannel: string;
  onChannelSelect: (channel: string) => void;
}

export default function ChannelList({ selectedChannel, onChannelSelect }: ChannelListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const { channels, getUsersInChannel, selectedVoiceChannelId, joinVoiceChannel, getChannelById, currentUser } = useVoiceStore();

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

  return (
    <div className="w-60 bg-discord-darker flex flex-col">
      {/* Server header */}
      <div className="h-14 bg-discord-darkest flex items-center justify-between px-5 border-b border-discord-border">
        <h1 className="text-discord-text font-semibold text-sm">Discord Clone</h1>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-discord-green"></div>
          <span className="text-discord-text-muted text-xs">voice</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {textCategories.map((category) => (
            <div key={category.category} className="mb-6">
              <div 
                className="flex items-center justify-between text-discord-text-muted text-xs font-semibold uppercase tracking-wide px-3 py-2 cursor-pointer hover:text-discord-text"
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
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-md cursor-pointer text-sm ${
                        selectedChannel === channel.id
                          ? 'bg-discord-light text-discord-text'
                          : 'text-discord-text-muted hover:bg-discord-light hover:text-discord-text'
                      }`}
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
          <div className="mb-6">
            <div 
              className="flex items-center justify-between text-discord-text-muted text-xs font-semibold uppercase tracking-wide px-3 py-2"
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
                      className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md cursor-pointer ${
                        isSelected || isInThisChannel
                          ? 'bg-discord-light text-discord-text'
                          : 'text-discord-text-muted hover:text-discord-text hover:bg-discord-light'
                      }`}
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
                      <div className="ml-6 mt-2 space-y-1.5">
                        {users.map((u) => (
                          <div key={u.id} className="flex items-center justify-between px-2.5 py-1.5 text-xs text-discord-text hover:bg-discord-light/60 rounded">
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

      {/* Footer current user */}
      <div className="bg-discord-darkest border-t border-discord-border">
        <div className="p-4 flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-discord-accent flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-discord-green border-2 border-discord-darkest"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-discord-text text-sm font-medium">User</div>
            <div className="text-discord-text-muted text-xs">Online</div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button className="p-1.5 text-discord-text-muted hover:text-discord-text">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
