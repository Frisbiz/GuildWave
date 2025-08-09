'use client';

import { useEffect, useRef } from 'react';
import { useVoiceStore } from '@/store/voiceStore';

function playToneSequence(steps: Array<{ freq: number; durationMs: number }>, totalGain = 0.08) {
  if (typeof window === 'undefined') return;
  const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = totalGain;
  master.connect(ctx.destination);

  let t = ctx.currentTime;

  steps.forEach(({ freq, durationMs }) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1.0, t + 0.01);
    const end = t + durationMs / 1000;
    g.gain.setTargetAtTime(0.0001, end - 0.03, 0.02);

    osc.connect(g);
    g.connect(master);

    osc.start(t);
    osc.stop(end);

    t = end + 0.01;
  });

  const totalMs = steps.reduce((acc, s) => acc + s.durationMs, 0) + 80;
  setTimeout(() => ctx.close().catch(() => {}), totalMs);
}

export default function AudioCues() {
  const currentChannel = useVoiceStore((s) => s.currentUser.currentChannel);
  const prevChannelRef = useRef<string | null>(null);
  const didInitRef = useRef(false);

  const joinAudioRef = useRef<HTMLAudioElement | null>(null);
  const leaveAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements once
  useEffect(() => {
    const join = new Audio('/sounds/join.mp3');
    join.preload = 'auto';
    join.volume = 0.35;

    const leave = new Audio('/sounds/leave.mp3');
    leave.preload = 'auto';
    leave.volume = 0.35;

    joinAudioRef.current = join;
    leaveAudioRef.current = leave;

    return () => {
      joinAudioRef.current = null;
      leaveAudioRef.current = null;
    };
  }, []);

  const playJoin = async () => {
    try {
      await joinAudioRef.current?.play();
    } catch {
      // Fallback to tones
      playToneSequence([
        { freq: 660, durationMs: 90 },
        { freq: 880, durationMs: 130 },
      ]);
    }
  };

  const playLeave = async () => {
    try {
      await leaveAudioRef.current?.play();
    } catch {
      playToneSequence([
        { freq: 660, durationMs: 90 },
        { freq: 520, durationMs: 130 },
      ]);
    }
  };

  useEffect(() => {
    const prev = prevChannelRef.current;

    if (!didInitRef.current) {
      didInitRef.current = true;
      prevChannelRef.current = currentChannel;
      return;
    }

    if (prev === currentChannel) return;

    if ((!prev && currentChannel) || (prev && currentChannel && prev !== currentChannel)) {
      void playJoin();
    }

    if (prev && !currentChannel) {
      void playLeave();
    }

    prevChannelRef.current = currentChannel;
  }, [currentChannel]);

  return null;
}
