"use client";

import dynamic from "next/dynamic";

const Avatar = dynamic(() => import("@avatune/react").then((mod) => mod.Avatar), {
  ssr: false,
});

import theme from "@avatune/ashley-seo-theme/react";

type UserAvatarProps = {
  seed: string;
  size?: number;
};

export const UserAvatar = ({ seed, size = 44 }: UserAvatarProps) => {
  return (
    <div className="size-11 flex justify-center">
      <Avatar theme={theme} seed={seed} size={size} className="aspect-square size-11 rounded-full" />
    </div>
  );
};
