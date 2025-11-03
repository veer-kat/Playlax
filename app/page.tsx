'use client';

import { useState, useEffect } from 'react';
import Player from './components/Player';
import Background from './components/Background';
import Spotify from './components/Spotify';
import Title from './components/title';

const GameScreen1 = () => {
  const [playerPosition, setPlayerPosition] = useState({ 
    x: 100, 
    y: 0 
  });

  useEffect(() => {
    setPlayerPosition({
      x: 100,
      y: window.innerHeight - 287
    });
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
    
    {/* Corner images only (no bars) */}
    <img
      src="/li.png"
      alt="Left Indicator"
      className="absolute top-[5px] left-[5px] w-20 h-auto z-40 pointer-events-none object-contain"
    />

    <img
      src="/ri.png"
      alt="Right Indicator"
      className="absolute top-[5px] right-[5px] w-16 h-auto z-40 pointer-events-none object-contain"
    />

      <Background />

      {/* Player above Spotify */}
      {playerPosition.y > 0 && (
        <div className="absolute z-[60]">
          <Player 
            position={playerPosition} 
            onPositionChange={setPlayerPosition} 
          />
        </div>
      )}



      {/* Title + Spotify side by side */}
      <div className="flex justify-center items-center h-screen absolute inset-0 z-50">
        <div className="flex justify-end w-1/2">
          <Title width={550} height={550} offsetX={0} offsetY={-95}/>
        </div>
        <div className="flex justify-start w-1/2">
          <Spotify width={450} height={450} offsetX={150} offsetY={-85} />
        </div>
      </div>
    </div>
  );
};

export default GameScreen1;