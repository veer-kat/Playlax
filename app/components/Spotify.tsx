'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

interface Song {
  title: string;
  artist: string;
  file: string;
  cover: string;
  duration: string;
}

interface SpotifyProps {
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
}

const Spotify: React.FC<SpotifyProps> = ({
  width = 720,
  height = 500,
  offsetX = 250,
  offsetY = 50,
}) => {
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songs: Song[] = [
    {
      title: 'If You Believe',
      artist: 'Strive to be',
      file: '/songs/if_you_believe.mp3',
      cover: '/covers/if_you_believe.jpg',
      duration: '3:55',
    },
    {
      title: 'Ala Barfi',
      artist: 'Pritam, Mohit Chauhan',
      file: '/songs/ala_barfi.mp3',
      cover: '/covers/ala_barfi.jpg',
      duration: '4:10',
    },
    {
      title: 'All Time Low',
      artist: 'Jon Bellion',
      file: '/songs/all_time_low.mp3',
      cover: '/covers/all_time_low.jpg',
      duration: '3:39',
    },
    {
      title: 'When I Grow Up',
      artist: 'NF',
      file: '/songs/when_i_grow_up.mp3',
      cover: '/covers/when_i_grow_up.jpg',
      duration: '3:17',
    },
    {
      title: 'Hawái',
      artist: 'Maluma',
      file: '/songs/hawai.mp3',
      cover: '/covers/hawai.png',
      duration: '3:21',
    },
  ];

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }}
      className="bg-gradient-to-b from-purple-800 to-black rounded-xl p-6 flex flex-col items-center shadow-lg"
    >
      <h1 className="text-white text-4xl font-bold mb-4">Liked Songs</h1>

      <div className="flex flex-col gap-4 w-full overflow-y-auto">
        {songs.map((song, idx) => {
          const isCurrent = currentSong === song.file && isPlaying;
          return (
            <div
              key={idx}
              className={`flex items-center gap-4 bg-black/30 hover:bg-black/50 p-3 rounded-lg cursor-pointer transition-all ${
                isCurrent ? 'border border-green-400' : ''
              }`}
              onClick={() => playSong(song.file)}
            >
              <Image
                src={song.cover}
                alt={song.title}
                width={60}
                height={60}
                className="rounded"
              />
              <div className="flex-1">
                <p className="text-white font-semibold">{song.title}</p>
                <p className="text-gray-400 text-sm">{song.artist}</p>
              </div>

              {/* Play / Pause SVG icons */}
              <div className="flex items-center gap-2">
                {isCurrent ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    strokeWidth={5}
                    stroke="white"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 5.25v13.5m10.5-13.5v13.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="white"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 4.5l13.5 7.5-13.5 7.5V4.5z"
                    />
                  </svg>
                )}
                <p className="text-gray-300 text-sm">{song.duration}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Spotify;