'use client';

import { useEffect, useState } from 'react';

export default function EasterEgg() {
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [isActivated, setIsActivated] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Konami Code: Up, Up, Down, Down, Left, Right, Left, Right, B, A
  const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isActivated) return;

      const newSequence = [...konamiSequence, event.code];
      
      // Keep only the last 10 keys
      if (newSequence.length > 10) {
        newSequence.shift();
      }

      setKonamiSequence(newSequence);

      // Check if the sequence matches the Konami code
      if (newSequence.length === 10) {
        const matches = newSequence.every((key, index) => key === konamiCode[index]);
        if (matches) {
          setIsActivated(true);
          setShowMessage(true);
          
          // Add some fun effects before redirect
          document.body.style.animation = 'rainbow 2s infinite';
          
          // Redirect after 2 seconds of effects
          setTimeout(() => {
            window.open('https://www.youtube.com/watch?v=IPG3eDTy-yo', '_blank');
            document.body.style.animation = '';
            setIsActivated(false);
            setKonamiSequence([]);
          }, 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiSequence, isActivated, konamiCode]);

  // Reset after 30 seconds
  useEffect(() => {
    if (isActivated) {
      const timer = setTimeout(() => {
        setIsActivated(false);
        setKonamiSequence([]);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isActivated]);

  if (!isActivated) return null;

  return (
    <>
      {/* CSS for rainbow animation */}
      <style jsx global>{`
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .konami-active {
          animation: float 2s ease-in-out infinite;
        }
        
        .sparkle {
          position: fixed;
          pointer-events: none;
          animation: sparkle 2s ease-out forwards;
          z-index: 9999;
        }
        
        @keyframes sparkle {
          0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: scale(0) rotate(360deg);
          }
        }
      `}</style>

      {/* Activation message */}
      {showMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg shadow-2xl animate-bounce">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">� KONAMI CODE ACTIVATED! �</div>
            <div className="text-sm">Redirecting to a special surprise...</div>
            <div className="text-xs mt-1 opacity-75">
              (↑↑↓↓←→←→BA)
            </div>
          </div>
        </div>
      )}

      {/* Sparkle effects */}
      <SparkleEffect />
    </>
  );
}

function SparkleEffect() {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const createSparkle = () => {
      const sparkle = {
        id: Math.random(),
        left: Math.random() * window.innerWidth,
        top: Math.random() * window.innerHeight,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)],
        size: Math.random() * 20 + 10
      };
      
      setSparkles(prev => [...prev, sparkle]);
      
      // Remove sparkle after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
      }, 2000);
    };

    const interval = setInterval(createSparkle, 200);
    
    // Stop after 4 seconds
    setTimeout(() => clearInterval(interval), 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            backgroundColor: sparkle.color,
            width: sparkle.size,
            height: sparkle.size,
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size}px ${sparkle.color}`,
          }}
        />
      ))}
    </>
  );
}
