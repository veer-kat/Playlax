'use client';

import { useState, useEffect } from 'react';
import Player from '../components/Player';
import Background from '../components/Background';
import A_Trophy from '../components/A_Trophy';
import B_Trophy from '../components/B_Trophy';
import T_Trophy from '../components/T_Trophy';
import A_Text from '../components/A_Text';
import B_Text from '../components/B_Text';
import T_Text from '../components/T_Text';
import BButton from '../components/backbutton';


const GameScreen3 = () => {
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
      <Background />
      <BButton />
      {/* {playerPosition.y > 0 && (
        <Player 
          position={playerPosition} 
          onPositionChange={setPlayerPosition} 
        />
      )} */}

      {/* Individual trophy containers for separate positioning */}
      <div className="absolute z-20" style={{ bottom: '130px', left: '20%' }}>
        <A_Trophy />
      </div>
      
      <div className="absolute z-20" style={{ bottom: '145px', left: '70%' }}>
        <B_Trophy />
      </div>
      
      <div className="absolute z-20" style={{ bottom: '135px', left: '45%' }}>
        <T_Trophy />
      </div>

      {/* Individual title containers for separate positioning */}
      <div className="absolute z-20" style={{ bottom: '575px', left: '20%' }}>
        <A_Text />
      </div>
      
      <div className="absolute z-20" style={{ bottom: '400px', left: '70%' }}>
        <B_Text />
      </div>
      
      <div className="absolute z-20" style={{ bottom: '510px', left: '44%' }}>
        <T_Text />
      </div>
    </div>
  );
};

export default GameScreen3;