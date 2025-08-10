'use client';

import { useState } from 'react';
import {
  Hash,
  Users,
  Plus,
  Compass,
  Download
} from 'lucide-react';

interface ServerSidebarProps {
  selectedServer: string;
  onServerSelect: (server: string) => void;
}

const servers = [
  { id: 'general', name: 'General', icon: Hash, color: '#43b581' },
  { id: 'gaming', name: 'Gaming', icon: Users, color: '#f04747' },
  { id: 'music', name: 'Music', icon: Users, color: '#faa61a' },
  { id: 'tech', name: 'Tech', icon: Users, color: '#00b0f4' },
];

export default function ServerSidebar({ selectedServer, onServerSelect }: ServerSidebarProps) {
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);

  return (
    <div className="server-sidebar w-16 bg-discord-darkest flex flex-col items-center py-3">
      {/* Home button (uses project logo) */}
      <div
        className={`server-icon w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
          selectedServer === 'home' 
            ? 'bg-discord-accent text-white' 
            : 'bg-discord-light text-discord-text hover:bg-discord-accent hover:text-white'
        }`}
        onClick={() => onServerSelect('home')}
        onMouseEnter={() => setHoveredServer('home')}
        onMouseLeave={() => setHoveredServer(null)}
      >
        <img src="/logo.png" alt="GuildWave" className="w-8 h-8 object-contain" />
      </div>

      {/* Separator */}
      <div className="w-8 h-px bg-discord-separator my-4"></div>

      {/* Server buttons */}
      <div className="server-list w-full flex flex-col items-center">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`server-icon relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
              selectedServer === server.id 
                ? 'bg-discord-accent text-white' 
                : 'bg-discord-light text-discord-text hover:bg-discord-accent hover:text-white'
            }`}
            onClick={() => onServerSelect(server.id)}
            onMouseEnter={() => setHoveredServer(server.id)}
            onMouseLeave={() => setHoveredServer(null)}
          >
            <server.icon size={20} />
            
            {/* Hover indicator */}
            {hoveredServer === server.id && selectedServer !== server.id && (
              <div className="absolute -left-2 w-1 h-8 bg-white rounded-r-full"></div>
            )}
            
            {/* Selected indicator */}
            {selectedServer === server.id && (
              <div className="absolute -left-2 w-1 h-8 bg-white rounded-r-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="w-8 h-px bg-discord-separator my-4"></div>

      {/* Add server button */}
      <div
        className="server-icon w-12 h-12 rounded-full bg-discord-light text-discord-text hover:bg-discord-green hover:text-white flex items-center justify-center cursor-pointer transition-all duration-200"
        title="Add a Server"
      >
        <Plus size={20} />
      </div>

      {/* Explore button */}
      <div
        className="server-icon w-12 h-12 rounded-full bg-discord-light text-discord-text hover:bg-discord-accent hover:text-white flex items-center justify-center cursor-pointer transition-all duration-200"
        title="Explore Public Servers"
      >
        <Compass size={20} />
      </div>

      {/* Download button */}
      <div
        className="server-icon w-12 h-12 rounded-full bg-discord-light text-discord-text hover:bg-discord-accent hover:text-white flex items-center justify-center cursor-pointer transition-all duration-200"
        title="Download Apps"
      >
        <Download size={20} />
      </div>
    </div>
  );
}
