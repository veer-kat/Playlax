"use client";

import Image from "next/image";
import React from "react";

interface TitleProps {
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
}

export default function Title({
  width = 300,
  height = 100,
  offsetX = 0,
  offsetY = 0,
}: TitleProps) {
  return (
    <div
      className="flex justify-center items-center"
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }}
    >
      <Image
        src="/title.png"
        alt="Title"
        width={width}
        height={height}
        className="object-contain drop-shadow-md"
        priority
      />
    </div>
  );
}
