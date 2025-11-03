import React, { useEffect, useRef, useState } from "react";

// IndexedDB setup
const DB_NAME = "GameDB";
const DB_VERSION = 1;
const STORE_NAME = "Scores";

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("score", "score", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
};

const storeScore = async (score: number): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    await store.add({
      score,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to store score:", error);
  }
};

export default function Minigame({ width = 1500, height = 400 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<any>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const logError = (reason: unknown, context: unknown = "") => {
    try {
      const ctxStr = typeof context === "string" ? context : JSON.stringify(context);
    } catch (e) {}
  };

  useEffect(() => {
    if (!gameStarted) return;
    const onError = (ev: ErrorEvent) => {
      logError(ev.message || ev.error, { filename: ev.filename, lineno: ev.lineno });
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      logError(ev.reason || "unhandledrejection", { type: "unhandledrejection" });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection as any);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection as any);
    };
  }, [restartKey, gameStarted]);

  // Store score when game over occurs
  useEffect(() => {
    if (gameOver && finalScore > 0) {
      storeScore(finalScore).catch((error) => {
        console.error("Error storing score:", error);
      });
    }
  }, [gameOver, finalScore]);

  useEffect(() => {
    if (!gameStarted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const GAME_SCALE = 3;
    const internalWidth = Math.floor(width / GAME_SCALE);
    const internalHeight = Math.floor(height / GAME_SCALE);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(internalWidth * dpr);
    canvas.height = Math.floor(internalHeight * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      ctx.imageSmoothingEnabled = false;
    } catch (e) {}

    const G = 0.6;
    const groundY = internalHeight - 6;

    const player = {
      x: Math.floor(internalWidth * 0.12),
      y: groundY - 10,
      w: 8,
      h: 10,
      vy: 0,
      isOnGround: true
    };

    type Obstacle = { x: number; y: number; w: number; h: number; speed: number; passed?: boolean; type: "debris" | "comet" | "sat" };
    const obstacles: Obstacle[] = [];

    const state = {
      score: 0,
      lastSpawn: 0,
      spawnInterval: 1500,
      baseSpeed: 0.25,
      speedMultiplier: 1,
      running: true,
      lastTime: performance.now(),
      internalWidth,
      internalHeight,
      dpr,
      GAME_SCALE,
      player,
      obstacles,
      ctx,
      logError
    };

    stateRef.current = state;

    const spawnObstacle = () => {
      try {
        const r = Math.random();
        let type: Obstacle["type"];
        let w = 6;
        let h = 6;
        let y = groundY - 6;

        if (r < 0.6) {
          type = "debris";
          w = 6;
          h = 6;
          y = groundY - h;
        } else if (r < 0.85) {
          type = "comet";
          w = 6;
          h = 4;
          y = groundY - 18 - Math.floor(Math.random() * 8);
        } else {
          type = "sat";
          w = 8;
          h = 12;
          y = groundY - h;
        }

        const speed = state.baseSpeed * state.speedMultiplier;
        obstacles.push({ x: internalWidth + 4, y, w, h, speed, passed: false, type });
      } catch (e) {}
    };

    const doJump = () => {
      try {
        if (!state.running || gameOver) return;
        if (player.isOnGround) {
          player.vy = -5.6;
          player.isOnGround = false;
        }
      } catch (e) {}
    };

    const onKey = (e: KeyboardEvent) => {
      try {
        if (e.code === "Space" || e.key === " ") {
          e.preventDefault();
          doJump();
        }
      } catch (err) {}
    };

    const onPointerDown = () => {
      try {
        doJump();
      } catch (err) {}
    };

    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointerDown);

    const onResize = () => {
      try {
        const newDpr = Math.max(1, window.devicePixelRatio || 1);
        if (newDpr !== state.dpr) {
          state.dpr = newDpr;
          canvas.width = Math.floor(internalWidth * newDpr);
          canvas.height = Math.floor(internalHeight * newDpr);
        }
      } catch (e) {}
    };

    window.addEventListener("resize", onResize);

    const loop = (now: number) => {
      try {
        if (!state.running) return;
        rafRef.current = requestAnimationFrame(loop);

        if (gameOver) {
          state.lastTime = now;
          return;
        }

        const dt = Math.min(40, now - state.lastTime);
        state.lastTime = now;

        if (state.score >= 400) {
          state.speedMultiplier = 1.6;
          state.spawnInterval = 700;
        } else if (state.score >= 200) {
          state.speedMultiplier = 1.3;
          state.spawnInterval = 900;
        } else {
          state.speedMultiplier = 1;
          state.spawnInterval = 1500;
        }

        player.vy += G * (dt / 16.67);
        player.y += player.vy * (dt / 16.67);

        if (player.y >= groundY - player.h) {
          player.y = groundY - player.h;
          player.vy = 0;
          player.isOnGround = true;
        }

        state.lastSpawn += dt;
        if (state.lastSpawn >= state.spawnInterval) {
          state.lastSpawn = 0;
          spawnObstacle();
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
          const ob = obstacles[i];
          ob.x -= ob.speed * dt;

          if (!ob.passed && ob.x + ob.w < player.x) {
            ob.passed = true;
            state.score += 1;
          }

          const collided =
            player.x < ob.x + ob.w &&
            player.x + player.w > ob.x &&
            player.y < ob.y + ob.h &&
            player.y + player.h > ob.y;

          if (collided) {
            state.running = false;
            setFinalScore(state.score);
            setGameOver(true);
            break;
          }

          if (ob.x + ob.w < -20) obstacles.splice(i, 1);
        }

        ctx.save();
        ctx.scale(state.dpr, state.dpr);
        ctx.clearRect(0, 0, internalWidth, internalHeight);

        drawBackground(ctx, internalWidth, internalHeight, now);
        ctx.fillStyle = "#111";
        ctx.fillRect(0, groundY + 1, internalWidth, internalHeight - groundY);

        drawPlayer(ctx, Math.round(player.x), Math.round(player.y), player.w, player.h);
        for (const ob of obstacles) drawObstacle(ctx, Math.round(ob.x), Math.round(ob.y), ob.w, ob.h, ob.type);

        ctx.fillStyle = "#eee";
        ctx.font = "9px monospace";
        ctx.textBaseline = "top";
        ctx.fillText(`Score: ${state.score}`, 4, 2);

        ctx.restore();
      } catch (e) {}
    };

    rafRef.current = requestAnimationFrame(loop);

    function drawPlayer(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
      try {
        c.fillStyle = "#cfe";
        c.fillRect(x, y, w, h);
        c.fillStyle = "#9fb";
        c.fillRect(x + w - 3, y + 1, 3, 3);
        c.fillStyle = "#034";
        c.fillRect(x + 1, y + 2, 4, 3);
      } catch (e) {}
    }

    function drawObstacle(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: Obstacle["type"]) {
      try {
        if (t === "debris") {
          c.fillStyle = "#a65";
          c.fillRect(x, y, w, h);
          c.fillStyle = "#ffb";
          c.fillRect(x + 1, y + 1, 2, 1);
        } else if (t === "comet") {
          c.fillStyle = "#fdb";
          c.fillRect(x, y, w, h);
          c.fillRect(x + 2, y + 1, 3, 1);
        } else {
          c.fillStyle = "#88b";
          c.fillRect(x, y, w, h);
          c.fillStyle = "#ccf";
          c.fillRect(x + 1, y + 1, w - 2, 2);
        }
      } catch (e) {}
    }

    function drawBackground(c: CanvasRenderingContext2D, w: number, h: number, t: number) {
      try {
        const grd = c.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, "#020214");
        grd.addColorStop(1, "#05051a");
        c.fillStyle = grd;
        c.fillRect(0, 0, w, h);

        const starCount = 18;
        for (let i = 0; i < starCount; i++) {
          const sx = ((i * 73) % (w - 4)) + ((t / (1000 + i * 10)) % 3);
          const sy = ((i * 37) % (h - 20)) + Math.sin(t / 1000 + i) * 1.2;
          c.fillStyle = "#9ad";
          c.fillRect(Math.round(sx), Math.round(sy), 1, 1);
        }
      } catch (e) {}
    }

    return () => {
      try {
        state.running = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("keydown", onKey);
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("resize", onResize);
      } catch (e) {}
    };
  }, [width, height, restartKey, gameOver, gameStarted]);

  const handleRestart = () => {
    setGameOver(false);
    setFinalScore(0);
    setRestartKey((k) => k + 1);
  };

  const handleStart = () => {
    setGameStarted(true);
    setRestartKey((k) => k + 1);
  };

  return (
    <div className="minigame-container" style={{ width: width + 8, padding: 4, position: "relative" }}>
      <div
        style={{
          width: width,
          height: height,
          borderRadius: 8,
          overflow: "hidden",
          background: "#071023",
          border: "2px solid #222",
          boxShadow: "0 6px 12px rgba(0,0,0,0.6)",
          position: "relative"
        }}
      >
        <canvas
          key={restartKey}
          ref={canvasRef}
          role="img"
          aria-label="Astronaut endless runner mini-game"
          style={{ display: "block", width: "100%", height: "100%" }}
        ></canvas>

        {!gameStarted && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <button
              onClick={handleStart}
              style={{
                padding: "16px 32px",
                fontSize: "22px",
                borderRadius: 8,
                border: "1px solid #555",
                background: "#223",
                color: "#eee",
                cursor: "pointer"
              }}
            >
              Start
            </button>
          </div>
        )}

        {gameOver && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#000",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px"
            }}
          >
            <img src="/text/gameover.png" alt="Game Over" style={{ maxWidth: "50%", maxHeight: "50%" }} />
            <div
              style={{
                color: "white",
                fontSize: "24px",
                fontFamily: "monospace",
                textAlign: "center"
              }}
            >
              Final Score: {finalScore}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleRestart}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "12px 24px",
          background: "#223",
          color: "#eee",
          border: "1px solid #555",
          borderRadius: 4,
          fontSize: "18px",
          cursor: "pointer"
        }}
      >
        Restart
      </button>
    </div>
  );
}