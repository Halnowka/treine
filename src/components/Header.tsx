"use client";

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  onCatClick: () => void;
}

export function Header({ onMenuToggle, onCatClick }: HeaderProps) {
  const [tail, setTail] = useState('ノ');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTail(prevTail => (prevTail === 'ノ' ? 'ー' : 'ノ'));
    }, 600); // A calm tail wag interval

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  return (
    <header className="mb-8 grid grid-cols-3 items-center relative z-50">
        <button 
          onClick={onCatClick} 
          className="p-0 bg-transparent border-none cursor-pointer justify-self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" 
          aria-label="start rest timer"
        >
          <pre className="text-muted-foreground text-xs leading-tight select-none">
{`  l、
（ﾟ､ ｡ ７
  l  ~ヽ
  じしf_,)${tail}`}
          </pre>
        </button>
        
        <h1 className="text-4xl font-headline font-bold text-primary justify-self-center">TREINE</h1>
        
        <button
          onClick={onMenuToggle}
          className="p-2 text-primary hover:text-accent transition-colors justify-self-end"
          aria-label="toggle navigation menu"
        >
          <Menu className="h-8 w-8" />
        </button>
    </header>
  );
}
