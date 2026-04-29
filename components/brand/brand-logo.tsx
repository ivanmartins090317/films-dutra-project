import Image from "next/image";

const LOGO_SRC = "/logo_cores_films_dutra/Logo%203/Ativo%2018.png";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      alt="Films Dutra Audiovisual Co."
      className={className}
      height={112}
      priority={priority}
      src={LOGO_SRC}
      width={400}
    />
  );
}
