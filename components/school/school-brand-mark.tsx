import Image from "next/image";

import { cn } from "@/lib/utils";

import { BrandLogo } from "@/components/brand/brand-logo";

interface SchoolBrandMarkProps {
  schoolName: string;
  logoUrl?: string | null;
  priority?: boolean;
  className?: string;
}

/**
 * Logo customizado quando `logo_url` existe; caso contrário usa a marca Dutra estática em `public/`.
 */
export function SchoolBrandMark({
  schoolName,
  logoUrl,
  priority = false,
  className,
}: SchoolBrandMarkProps) {
  const trimmedUrl = logoUrl?.trim();

  if (trimmedUrl) {
    return (
      <Image
        alt={schoolName}
        className={cn("h-12 w-auto max-w-[min(280px,100%)] object-contain object-center", className)}
        height={112}
        src={trimmedUrl}
        unoptimized
        width={400}
      />
    );
  }

  return <BrandLogo className={cn("h-12 w-auto", className)} priority={priority} />;
}
