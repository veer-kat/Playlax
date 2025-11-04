'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface AudioContextType {
  currentSong: string | null;
  isPlaying: boolean;
  playSong: (file: string) => void;
  pauseSong: () => void;
  resumeSong: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (file: string) => {
    if (currentSong === file) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const newAudio = new Audio(file);
    audioRef.current = newAudio;
    newAudio.play();
    setCurrentSong(file);
    setIsPlaying(true);

    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentSong(null);
    };
  };

  const pauseSong = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeSong = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <AudioContext.Provider value={{ currentSong, isPlaying, playSong, pauseSong, resumeSong }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};