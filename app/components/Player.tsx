import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PlayerProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

const Player = ({ position, onPositionChange }: PlayerProps) => {
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isMoving, setIsMoving] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const speed = 2; // Increased speed for better responsiveness with larger character
  const playerWidth = 128; // Increased from w-16 (64px)
  const playerHeight = 128; // Increased from h-16 (64px)
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setDirection('right');
        setIsMoving(true);
      } else if (e.key === 'ArrowLeft') {
        setDirection('left');
        setIsMoving(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        setIsMoving(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const movePlayer = () => {
      if (!isMoving) return;

      let newX = direction === 'right' 
        ? position.x + speed 
        : position.x - speed;

      // Boundary checks
      const viewportWidth = window.innerWidth;
if (newX < 0) {
  // Redirect instead of clamping
  router.push('/TrophySection');
  return; // stop further updates
} else if (newX + playerWidth > viewportWidth) {
  newX = viewportWidth - playerWidth; // Prevent moving past right edge
  router.push('/Game');
  return; // stop further updates
}

      onPositionChange({ x: newX, y: position.y });
    };

    const animationFrame = requestAnimationFrame(movePlayer);
    return () => cancelAnimationFrame(animationFrame);
  }, [isMoving, direction, position, onPositionChange]);

  return (
    <div
      ref={playerRef}
      className="absolute transition-transform duration-100"
      style={{
        width: `${playerWidth}px`,
        height: `${playerHeight}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {isMoving ? (
        <img 
          src="sprites/player_ani.gif" 
          alt="Player character" 
          className="w-full h-full object-contain"
        />
      ) : (
        <img 
          src="sprites/player.png" 
          alt="Player character" 
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

export default Player;