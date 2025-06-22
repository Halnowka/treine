"use client";

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle: () => void;
  onCatClick: () => void;
  isRestTimerOpen?: boolean;
}

export function Header({ onMenuToggle, onCatClick, isRestTimerOpen }: HeaderProps) {
  const [tail, setTail] = useState('ノ');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTail(prevTail => (prevTail === 'ノ' ? 'ー' : 'ノ'));
    }, 600); // A calm tail wag interval

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <header className="mb-8 grid grid-cols-3 items-center relative z-60">
        <div 
          onClick={onCatClick} 
          className="justify-self-start cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCatClick(); }}
          aria-label="toggle rest timer"
        >
          <pre className="text-muted-foreground text-xs leading-tight select-none">
{`  l、
（ﾟ､ ｡ ７
  l  ~ヽ
  じしf_,)${tail}`}
          </pre>
        </div>
        
        <h1 className={cn(
          "text-4xl font-headline font-bold text-primary justify-self-center transition-opacity",
          isRestTimerOpen && "opacity-0"
        )}>TREINE</h1>
        
        <button
          onClick={onMenuToggle}
          className={cn(
            "p-2 text-primary hover:text-accent transition-all justify-self-end",
            isRestTimerOpen && "opacity-0 pointer-events-none"
          )}
          aria-label="toggle navigation menu"
        >
          <Menu className="h-8 w-8" />
        </button>
    </header>
  );
}
