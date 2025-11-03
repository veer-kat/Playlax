import Phaser from 'phaser';
import { useEffect, useRef } from 'react';

interface GameScene extends Phaser.Scene {
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  player?: Phaser.Physics.Arcade.Sprite;
}

const Game = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 800 },
          debug: false
        }
      },
      scene: {
        preload(this: GameScene) {
          this.load.image('player', '/sprites/player.png');
          this.load.image('platform', '/tiles/platform.png');
          this.load.image('bg', '/bg/background.png');
        },

        create(this: GameScene) {
          // Pixel-perfect rendering
          this.textures.get('player').setFilter(Phaser.Textures.FilterMode.NEAREST);
          this.textures.get('platform').setFilter(Phaser.Textures.FilterMode.NEAREST);

          // Set camera bounds to prevent scrolling
          this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);

          // Background (fullscreen)
          this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setScrollFactor(0);

          // Platforms (positioned at screen bottom)
          const platforms = this.physics.add.staticGroup();
          platforms.create(this.scale.width/2, this.scale.height - 50, 'platform')
            .setScale(4)
            .refreshBody();

          // Player (positioned above platform)
          this.player = this.physics.add.sprite(100, this.scale.height - 150, 'player')
            .setScale(3)
            .setCollideWorldBounds(true)
            .setSize(24, 32)
            .setOffset(4, 0);

          // Camera follows player
          this.cameras.main.startFollow(this.player);

          // Keyboard controls
          this.cursors = this.input.keyboard?.createCursorKeys();
          this.physics.world.setFPS(60);
        },

        update(this: GameScene) {
          if (!this.cursors || !this.player) return;

          // Movement
          if (this.cursors.left?.isDown) {
            this.player.setAccelerationX(-800);
          } else if (this.cursors.right?.isDown) {
            this.player.setAccelerationX(800);
          } else {
            this.player.setAccelerationX(0);
            this.player.setDragX(800);
          }

          // Jumping
          if (this.cursors.up?.isDown && 
              (this.player.body?.touching.down || this.player.body?.blocked.down)) {
            this.player.setVelocityY(-500);
          }
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <div id="phaser-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }} />
  );
};

export default Game;


'use client';

import dynamic from 'next/dynamic';
import { NextPage } from 'next';

const Game = dynamic(() => import('./components/Game'), { 
  ssr: false,
  loading: () => <p>Loading game...</p>
});

const Home: NextPage = () => {
  return (
    <main style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#222'
    }}>
      <Game />
    </main>
  );
};

export default Home;