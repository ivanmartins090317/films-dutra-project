"use client";

import Image from "next/image";
import { User } from "@phosphor-icons/react";
import { useState } from "react";

interface StudentListAvatarProps {
  name: string | null;
  avatarUrl: string | null;
}

export function StudentListAvatar({ name, avatarUrl }: StudentListAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = buildInitials(name);

  if (avatarUrl && !failed) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={44}
        height={44}
        unoptimized
        className="size-11 shrink-0 rounded-full object-cover ring-1 ring-border"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border"
      aria-hidden
    >
      {initials ? (
        <span className="leading-none">{initials}</span>
      ) : (
        <User className="size-5 opacity-70" weight="duotone" />
      )}
    </span>
  );
}

function buildInitials(name: string | null): string {
  if (!name?.trim()) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
