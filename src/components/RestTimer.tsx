
"use client";

import { useState, useEffect } from 'react';

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const COUNTDOWN_SECONDS = 8;

export function RestTimer({ isOpen, onClose }: RestTimerProps) {
  const [phase, setPhase] = useState<'countdown' | 'running'>('countdown');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPhase('countdown');
      setCountdown(COUNTDOWN_SECONDS);
      setSeconds(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let intervalId: NodeJS.Timeout;

    if (phase === 'countdown') {
      intervalId = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setPhase('running');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'running') {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }

    // @ts-ignore
    return () => clearInterval(intervalId);
  }, [isOpen, phase]);


  if (!isOpen) {
    return null;
  }

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center cursor-pointer"
    >
      <div className="relative">
        {phase === 'countdown' ? (
           <div className="font-headline text-8xl md:text-9xl text-muted-foreground select-none">
             {countdown}
           </div>
        ) : (
          <div className="font-headline text-8xl md:text-9xl text-primary select-none" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(seconds)}
          </div>
        )}
      </div>
    </div>
  );
}
