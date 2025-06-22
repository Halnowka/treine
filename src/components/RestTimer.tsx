"use client";

import { useState, useEffect } from 'react';

interface RestTimerProps {
  isOpen: boolean;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function RestTimer({ isOpen }: RestTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
      const intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center"
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <div className="font-headline text-8xl md:text-9xl text-primary select-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(seconds)}
        </div>
      </div>
    </div>
  );
}
