'use client';

import { create } from 'zustand';

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';
export type Role = 'admin' | 'moderator' | 'member';

export interface VoiceUser {
  id: string;
  name: string;
  status: PresenceStatus;
  role: Role;
  isSpeaking: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  currentChannel: string | null;
}

export interface VoiceChannelMeta {
  id: string;
  name: string;
  maxUsers: number;
}

interface VoiceStoreState {
  channels: VoiceChannelMeta[];
  users: VoiceUser[];
  currentUser: VoiceUser;
  selectedVoiceChannelId: string | null;

  // derived helpers
  getUsersInChannel: (channelId: string) => VoiceUser[];
  getChannelById: (channelId: string) => VoiceChannelMeta | undefined;

  // actions
  joinVoiceChannel: (channelId: string) => { joined: boolean; reason?: string };
  leaveVoiceChannel: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
}

const initialUsers: VoiceUser[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    status: 'online',
    role: 'admin',
    isSpeaking: false,
    isMuted: false,
    isDeafened: false,
    currentChannel: 'general',
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    status: 'idle',
    role: 'moderator',
    isSpeaking: true,
    isMuted: false,
    isDeafened: false,
    currentChannel: 'general',
  },
  {
    id: '3',
    name: 'Mike Chen',
    status: 'online',
    role: 'member',
    isSpeaking: false,
    isMuted: true,
    isDeafened: false,
    currentChannel: 'gaming',
  },
  {
    id: '4',
    name: 'Emma Davis',
    status: 'dnd',
    role: 'member',
    isSpeaking: false,
    isMuted: false,
    isDeafened: true,
    currentChannel: null,
  },
];

const initialChannels: VoiceChannelMeta[] = [
  { id: 'general', name: 'General', maxUsers: 10 },
  { id: 'gaming', name: 'Gaming', maxUsers: 5 },
  { id: 'music', name: 'Music', maxUsers: 3 },
];

export const useVoiceStore = create<VoiceStoreState>((set, get) => ({
  channels: initialChannels,
  users: initialUsers,
  currentUser: {
    id: 'current',
    name: 'You',
    status: 'online',
    role: 'member',
    isSpeaking: false,
    isMuted: false,
    isDeafened: false,
    currentChannel: null,
  },
  selectedVoiceChannelId: null,

  getUsersInChannel: (channelId) => {
    const { users, currentUser } = get();
    const others = users.filter((u) => u.currentChannel === channelId);
    const includeCurrent = currentUser.currentChannel === channelId ? [currentUser] : [];
    return [...others, ...includeCurrent];
  },
  getChannelById: (channelId) => get().channels.find((c) => c.id === channelId),

  joinVoiceChannel: (channelId) => {
    const { getUsersInChannel, getChannelById, currentUser } = get();
    const channel = getChannelById(channelId);
    if (!channel) return { joined: false, reason: 'Channel not found' };

    const currentCount = getUsersInChannel(channelId).length;
    if (currentCount >= channel.maxUsers) {
      return { joined: false, reason: 'Channel is full' };
    }

    // If already in some channel, leave first
    if (currentUser.currentChannel && currentUser.currentChannel !== channelId) {
      get().leaveVoiceChannel();
    }

    set((state) => ({
      currentUser: { ...state.currentUser, currentChannel: channelId },
      selectedVoiceChannelId: channelId,
    }));

    return { joined: true };
  },

  leaveVoiceChannel: () => {
    set((state) => ({
      currentUser: { ...state.currentUser, currentChannel: null },
      selectedVoiceChannelId: null,
    }));
  },

  toggleMute: () => {
    set((state) => ({ currentUser: { ...state.currentUser, isMuted: !state.currentUser.isMuted } }));
  },

  toggleDeafen: () => {
    set((state) => ({ currentUser: { ...state.currentUser, isDeafened: !state.currentUser.isDeafened } }));
  },
}));


