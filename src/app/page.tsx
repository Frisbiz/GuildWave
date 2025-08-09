'use client';

import { useState } from 'react';
import DiscordLayout from '@/components/DiscordLayout';
import ServerSidebar from '@/components/ServerSidebar';
import ChannelList from '@/components/ChannelList';
import ChatArea from '@/components/ChatArea';
import UserSidebar from '@/components/UserSidebar';
import VoiceNotification from '@/components/VoiceNotification';
import AudioCues from '@/components/AudioCues';

interface Notification {
  id: string;
  message: string;
  type: 'join' | 'leave' | 'mute' | 'unmute';
}

export default function Home() {
  const [selectedServer, setSelectedServer] = useState('general');
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string, type: 'join' | 'leave' | 'mute' | 'unmute') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <AudioCues />
      <DiscordLayout>
        <ServerSidebar 
          selectedServer={selectedServer}
          onServerSelect={setSelectedServer}
        />
        <ChannelList 
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
        />
        <ChatArea 
          selectedChannel={selectedChannel}
        />
        <UserSidebar onVoiceEvent={(type, message) => addNotification(message, type)} />
      </DiscordLayout>

      {/* Voice Notifications */}
      {notifications.map((notification) => (
        <VoiceNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
}
