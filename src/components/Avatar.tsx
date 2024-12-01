import React from "react";
import Image from "next/image";
interface AvatarProps {
  children: React.ReactNode;
}

export function Avatar({ children }: AvatarProps) {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
      {children}
    </div>
  );
}

export function AvatarImage({ src }: { src: string }) {
  return (
    <Image src={src} alt="Avatar" className="w-full h-full rounded-full object-cover" />
  );
}

export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-semibold text-white">{children}</span>;
}
