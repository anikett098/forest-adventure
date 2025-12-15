import React, { useState, useEffect, useRef } from 'react';
import { Bird, Trees, Cloud, Sparkles } from 'lucide-react';

const ForestFlappyGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, gameOver
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const gameRef = useRef({
    bird: { x: 100, y: 250, velocity: 0, rotation: 0 },
    obstacles: [],
    backgroundOffset: 0,
    treesOffset: 0,
    cloudsOffset: 0,
    animationId: null,
    lastObstacleTime: 0,
    birds: [], // background birds
    particles: []
  });

  const GRAVITY = 0.4;
  const FLAP_STRENGTH = -8;
  const BIRD_SIZE = 35;
  const OBSTACLE_WIDTH = 60;
  const GAP_SIZE = 180;
  const OBSTACLE_SPEED = 3;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Initialize background birds
    gameRef.current.birds = Array.from({ length: 5 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 400,
      speed: 0.5 + Math.random() * 1,
      size: 15 + Math.random() * 10,
      wingPhase: Math.random() * Math.PI * 2
    }));

    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, []);

  const drawForestBackground = (ctx) => {
    const game = gameRef.current;
    
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 600);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 800, 600);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const cloudPositions = [
      { x: (game.cloudsOffset * 0.3) % 1000 - 100, y: 80 },
      { x: (game.cloudsOffset * 0.3 + 400) % 1000 - 100, y: 140 },
      { x: (game.cloudsOffset * 0.3 + 700) % 1000 - 100, y: 60 }
    ];
    
    cloudPositions.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, 40, 0, Math.PI * 2);
      ctx.arc(cloud.x + 30, cloud.y, 50, 0, Math.PI * 2);
      ctx.arc(cloud.x + 60, cloud.y, 40, 0, Math.PI * 2);
      ctx.fill();
    });

    // Background trees (parallax)
    ctx.fillStyle = '#2d5016';
    for (let i = 0; i < 10; i++) {
      const x = (game.treesOffset * 0.5 + i * 150) % 900 - 100;
      ctx.beginPath();
      ctx.moveTo(x, 500);
      ctx.lineTo(x - 30, 350);
      ctx.lineTo(x + 30, 350);
      ctx.closePath();
      ctx.fill();
      
      // Tree trunk
      ctx.fillStyle = '#4a2c1b';
      ctx.fillRect(x - 8, 450, 16, 50);
      ctx.fillStyle = '#2d5016';
    }

    // Background birds
    game.birds.forEach(bgBird => {
      ctx.save();
      ctx.translate(bgBird.x, bgBird.y);
      ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
      
      // Simple bird shape
      bgBird.wingPhase += 0.1;
      const wingAngle = Math.sin(bgBird.wingPhase) * 0.3;
      
      ctx.beginPath();
      ctx.arc(0, 0, bgBird.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Wings
      ctx.beginPath();
      ctx.ellipse(-bgBird.size * 0.3, 0, bgBird.size * 0.5, bgBird.size * 0.3, wingAngle, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      bgBird.x += bgBird.speed;
      if (bgBird.x > 850) bgBird.x = -50;
    });

    // Ground/Forest floor
    const groundGradient = ctx.createLinearGradient(0, 500, 0, 600);
    groundGradient.addColorStop(0, '#4a7c3f');
    groundGradient.addColorStop(1, '#2d5016');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, 500, 800, 100);
    
    // Grass details
    ctx.strokeStyle = '#5a9c4f';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
      const x = (game.backgroundOffset * 2 + i * 20) % 800;
      ctx.beginPath();
      ctx.moveTo(x, 500);
      ctx.lineTo(x - 3, 485);
      ctx.stroke();
    }
  };

  const drawBird = (ctx) => {
    const bird = gameRef.current.bird;
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Bird body
    const birdGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, BIRD_SIZE / 2);
    birdGradient.addColorStop(0, '#FFD700');
    birdGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = birdGradient;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.ellipse(-10, 5, 15, 8, Math.sin(Date.now() / 100) * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(9, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(25, -3);
    ctx.lineTo(25, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  const drawObstacles = (ctx) => {
    gameRef.current.obstacles.forEach(obstacle => {
      // Tree trunk style obstacles
      const trunkGradient = ctx.createLinearGradient(obstacle.x, 0, obstacle.x + OBSTACLE_WIDTH, 0);
      trunkGradient.addColorStop(0, '#5c4033');
      trunkGradient.addColorStop(0.5, '#8B6F47');
      trunkGradient.addColorStop(1, '#5c4033');
      ctx.fillStyle = trunkGradient;
      
      // Top obstacle
      ctx.fillRect(obstacle.x, 0, OBSTACLE_WIDTH, obstacle.topHeight);
      
      // Leaves on top
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(obstacle.x + OBSTACLE_WIDTH / 2, obstacle.topHeight, 40, 0, Math.PI * 2);
      ctx.fill();
      
      // Bottom obstacle
      ctx.fillStyle = trunkGradient;
      ctx.fillRect(obstacle.x, obstacle.topHeight + GAP_SIZE, OBSTACLE_WIDTH, 600 - obstacle.topHeight - GAP_SIZE);
      
      // Leaves on bottom
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(obstacle.x + OBSTACLE_WIDTH / 2, obstacle.topHeight + GAP_SIZE, 40, 0, Math.PI * 2);
      ctx.fill();
      
      // Wood texture lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const y = obstacle.topHeight - 20 - i * 15;
        if (y > 0) {
          ctx.beginPath();
          ctx.moveTo(obstacle.x + 10, y);
          ctx.lineTo(obstacle.x + OBSTACLE_WIDTH - 10, y);
          ctx.stroke();
        }
      }
    });
  };

  const drawParticles = (ctx) => {
    gameRef.current.particles.forEach((particle, index) => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.alpha;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.alpha -= 0.02;
      
      if (particle.alpha <= 0) {
        gameRef.current.particles.splice(index, 1);
      }
    });
  };

  const createScoreParticles = (x, y) => {
    for (let i = 0; i < 10; i++) {
      gameRef.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 3 + Math.random() * 3,
        color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)`,
        alpha: 1
      });
    }
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    // Clear and draw background
    drawForestBackground(ctx);

    // Update and draw obstacles
    game.obstacles.forEach((obstacle, index) => {
      obstacle.x -= OBSTACLE_SPEED;
      
      // Check for scoring
      if (!obstacle.scored && obstacle.x + OBSTACLE_WIDTH < game.bird.x) {
        obstacle.scored = true;
        setScore(prev => {
          const newScore = prev + 1;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        createScoreParticles(game.bird.x, game.bird.y);
      }
      
      // Remove off-screen obstacles
      if (obstacle.x + OBSTACLE_WIDTH < 0) {
        game.obstacles.splice(index, 1);
      }
    });

    // Spawn new obstacles
    const now = Date.now();
    if (now - game.lastObstacleTime > 2000) {
      const topHeight = Math.random() * 200 + 100;
      game.obstacles.push({
        x: 800,
        topHeight,
        scored: false
      });
      game.lastObstacleTime = now;
    }

    drawObstacles(ctx);

    // Update bird physics
    game.bird.velocity += GRAVITY;
    game.bird.y += game.bird.velocity;
    game.bird.rotation = Math.min(Math.max(game.bird.velocity * 0.05, -0.5), 0.8);

    drawBird(ctx);
    drawParticles(ctx);

    // Collision detection
    const birdRadius = BIRD_SIZE / 2;
    const hitGround = game.bird.y + birdRadius > 500;
    const hitCeiling = game.bird.y - birdRadius < 0;
    
    const hitObstacle = game.obstacles.some(obstacle => {
      const inXRange = game.bird.x + birdRadius > obstacle.x && 
                       game.bird.x - birdRadius < obstacle.x + OBSTACLE_WIDTH;
      const hitTop = game.bird.y - birdRadius < obstacle.topHeight;
      const hitBottom = game.bird.y + birdRadius > obstacle.topHeight + GAP_SIZE;
      
      return inXRange && (hitTop || hitBottom);
    });

    if (hitGround || hitCeiling || hitObstacle) {
      setGameState('gameOver');
      return;
    }

    // Update parallax offsets
    game.backgroundOffset += OBSTACLE_SPEED;
    game.treesOffset += OBSTACLE_SPEED;
    game.cloudsOffset += OBSTACLE_SPEED;

    game.animationId = requestAnimationFrame(gameLoop);
  };

  const handleFlap = () => {
    if (gameState === 'start') {
      setGameState('playing');
      gameRef.current.bird.velocity = FLAP_STRENGTH;
      gameLoop();
    } else if (gameState === 'playing') {
      gameRef.current.bird.velocity = FLAP_STRENGTH;
    } else if (gameState === 'gameOver') {
      resetGame();
    }
  };

  const resetGame = () => {
    gameRef.current.bird = { x: 100, y: 250, velocity: 0, rotation: 0 };
    gameRef.current.obstacles = [];
    gameRef.current.lastObstacleTime = 0;
    gameRef.current.particles = [];
    setScore(0);
    setGameState('start');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    }
    return () => {
      if (gameRef.current.animationId) {
        cancelAnimationFrame(gameRef.current.animationId);
      }
    };
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-900 to-green-700 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-5xl font-bold text-yellow-300 mb-2 drop-shadow-lg" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.5)'}}>
          🌲 Forest Flight Adventure 🦜
        </h1>
        <div className="flex gap-8 justify-center text-white text-xl font-semibold">
          <div className="bg-green-800 px-6 py-2 rounded-full border-4 border-yellow-500">
            Score: {score}
          </div>
          <div className="bg-green-800 px-6 py-2 rounded-full border-4 border-yellow-500">
            Best: {highScore}
          </div>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleFlap}
          className="border-8 border-yellow-700 rounded-lg shadow-2xl cursor-pointer bg-sky-200"
          style={{ imageRendering: 'crisp-edges' }}
        />
        
        {gameState === 'start' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center bg-green-800 p-8 rounded-xl border-4 border-yellow-500">
              <Bird className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-4xl font-bold text-yellow-300 mb-4">Ready to Fly?</h2>
              <p className="text-white text-xl mb-6">Click or tap to flap!</p>
              <button 
                onClick={handleFlap}
                className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold py-4 px-8 rounded-full text-2xl transform transition hover:scale-110"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-center bg-green-800 p-8 rounded-xl border-4 border-red-500">
              <h2 className="text-4xl font-bold text-red-400 mb-4">Game Over!</h2>
              <p className="text-white text-2xl mb-2">Score: {score}</p>
              <p className="text-yellow-300 text-xl mb-6">Best: {highScore}</p>
              <button 
                onClick={resetGame}
                className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold py-4 px-8 rounded-full text-2xl transform transition hover:scale-110"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-white text-lg text-center max-w-md">
        Navigate your bird through the forest! Click or tap to flap and avoid the tree obstacles.
      </p>
    </div>
  );
};

export default ForestFlappyGame;