"use client";
import { useEffect, useState } from 'react';

export default function ThemeTransition({ isChanging }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isChanging) {
      setProgress(0);
      const duration = 600; // Total duration in ms
      const steps = 60; // Number of steps for smoother animation
      const increment = 100 / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setProgress(Math.min(currentStep * increment, 100));
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [isChanging]);

  if (!isChanging) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="w-64 bg-gray-800 rounded-lg p-4 shadow-xl">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-75 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center text-white mt-2 text-sm font-medium">
          Switching theme...
        </div>
      </div>
    </div>
  );
}
