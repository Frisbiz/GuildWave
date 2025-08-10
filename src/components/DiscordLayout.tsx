'use client';

import { ReactNode } from 'react';

interface DiscordLayoutProps {
  children: ReactNode;
}

export default function DiscordLayout({ children }: DiscordLayoutProps) {
  return (
    <div className="flex h-screen bg-discord-dark overflow-hidden gap-x-0">
      {children}
    </div>
  );
}
