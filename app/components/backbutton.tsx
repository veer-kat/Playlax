"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function goBack() {
    try {
      router.back();
    } catch {
      if (typeof window !== "undefined") window.history.back();
    }
  }

  return (
    <button
      aria-label="Back"
      onClick={goBack}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-sm bg-black/70 text-white text-sm font-bold backdrop-blur-sm border-2 border-yellow-400 shadow-lg hover:scale-110 transform-gpu transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      title="Back"
    >
      {/* Pixel-style arrow pointing right */}
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        role="img"
        aria-hidden={false}
        className="block"
      >
        <rect x="0" y="0" width="24" height="24" fill="transparent" />
        <rect x="4" y="9" width="10" height="2" fill="#ffffff" />
        <rect x="4" y="11" width="10" height="2" fill="#ffffff" />
        <rect x="14" y="7" width="2" height="2" fill="#ffffff" />
        <rect x="16" y="9" width="2" height="2" fill="#ffffff" />
        <rect x="18" y="11" width="2" height="2" fill="#ffffff" />
        <rect x="16" y="13" width="2" height="2" fill="#ffffff" />
        <rect x="14" y="15" width="2" height="2" fill="#ffffff" />
      </svg>
      Home
    </button>
  );
}