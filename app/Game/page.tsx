'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 👈 Added for navigation
import Background from '../components/Background';
import Minigame from '../components/Minigame';

const GameScreen2 = () => {
  const [playerPosition, setPlayerPosition] = useState({ 
    x: 100, 
    y: 0 
  });

  const router = useRouter(); // 👈 Hook for routing

  useEffect(() => {
    setPlayerPosition({
      x: 100,
      y: window.innerHeight - 287
    });
  }, []);

  const goHome = () => {
    router.push('/'); // 👈 Navigate to home
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Background />

      {/* Back button on top-left */}
      <button
        onClick={goHome}
        className="absolute top-4 left-4 z-20 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 shadow"
      >
        ← Home
      </button>

      {/* Centered Minigame container */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Minigame />
      </div>
    </div>
  );
};

export default GameScreen2;
