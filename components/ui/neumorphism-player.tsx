"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";

export interface NeumorphismTrack {
  title: string;
  artist: string;
  /** duração em segundos */
  duration: number;
  /** URL da capa (ex.: Unsplash) */
  coverUrl?: string;
}

export interface NeumorphicMusicPlayerProps {
  track?: NeumorphismTrack;
  autoPlay?: boolean;
  /** classes extras no wrapper externo (ex.: max-w-md mx-auto) */
  className?: string;
}

const defaultTrack: NeumorphismTrack = {
  title: "Ride your own wave",
  artist: "Films Dutra",
  duration: 245,
  coverUrl: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80",
};

/** Sombras soft UI alinhadas à paleta cream / tan do PRD Films Dutra */
const neo = {
  base: "#F0E8DE",
  shadowDark: "rgba(90, 78, 62, 0.22)",
  shadowLight: "rgba(255, 255, 255, 0.92)",
  accent: "#7A8C6E",
  text: "#1A1A1A",
  muted: "#555555",
} as const;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NeumorphicMusicPlayer({
  track = defaultTrack,
  autoPlay = false,
  className = "",
}: NeumorphicMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying && currentTime < track.duration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= track.duration) {
            setIsPlaying(false);
            return track.duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, track.duration]);

  const progressPct = (currentTime / track.duration) * 100;

  const raised = {
    boxShadow: `10px 10px 22px ${neo.shadowDark}, -10px -10px 22px ${neo.shadowLight}`,
  };
  const raisedLg = {
    boxShadow: `12px 12px 28px ${neo.shadowDark}, -12px -12px 28px ${neo.shadowLight}`,
  };
  const inset = {
    boxShadow: `inset 4px 4px 10px ${neo.shadowDark}, inset -4px -4px 10px ${neo.shadowLight}`,
  };
  const btn = {
    boxShadow: `6px 6px 14px ${neo.shadowDark}, -6px -6px 14px ${neo.shadowLight}`,
  };
  const btnLg = {
    boxShadow: `8px 8px 18px ${neo.shadowDark}, -8px -8px 18px ${neo.shadowLight}`,
  };

  return (
    <div
      className={`flex min-h-0 items-center justify-center rounded-3xl p-6 ${className}`}
      style={{ backgroundColor: neo.base }}
    >
      <div
        className="w-full max-w-md space-y-8 rounded-3xl p-8"
        style={{ backgroundColor: neo.base, ...raisedLg }}
      >
        <div className="relative aspect-square overflow-hidden rounded-3xl" style={raised}>
          <Image
            src={track.coverUrl ?? defaultTrack.coverUrl ?? ""}
            alt={`Capa: ${track.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 28rem"
          />
        </div>

        <div className="text-center">
          <h2 className="mb-1 text-2xl font-normal tracking-tight text-[#1A1A1A]">{track.title}</h2>
          <p className="text-sm text-[#555555]">{track.artist}</p>
        </div>

        <div className="space-y-2">
          <div className="relative h-2 w-full rounded-full" style={inset}>
            <input
              type="range"
              min={0}
              max={track.duration}
              value={currentTime}
              onChange={(e) => setCurrentTime(Number(e.target.value))}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Posição da faixa"
            />
            <div
              className="pointer-events-none absolute left-0 top-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor: neo.accent,
              }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium" style={{ color: neo.muted }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
            className="flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-[0.98]"
            style={{ backgroundColor: neo.base, ...btn, color: neo.accent }}
            aria-label="Voltar 10 segundos"
          >
            <SkipBack size={20} />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-[0.98]"
            style={{
              backgroundColor: neo.base,
              ...btnLg,
              color: neo.accent,
            }}
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause size={28} fill={neo.accent} />
            ) : (
              <Play size={28} fill={neo.accent} className="ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setCurrentTime((t) => Math.min(track.duration, t + 10))}
            className="flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-[0.98]"
            style={{ backgroundColor: neo.base, ...btn, color: neo.accent }}
            aria-label="Avançar 10 segundos"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Volume2 size={20} style={{ color: neo.accent }} aria-hidden />
          <div className="relative h-2 flex-1 rounded-full" style={inset}>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Volume"
            />
            <div
              className="pointer-events-none absolute left-0 top-0 h-full rounded-full transition-all"
              style={{
                width: `${volume}%`,
                backgroundColor: neo.accent,
              }}
            />
          </div>
          <span className="w-8 text-right text-xs" style={{ color: neo.muted }}>
            {volume}
          </span>
        </div>
      </div>
    </div>
  );
}
