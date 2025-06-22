"use client";

import * as React from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from '@/lib/utils';

interface QuickSetLoggerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogSet: (reps: number, weight?: number) => void;
  exerciseName: string;
}

const itemHeight = 64; // h-16
const baseRepOptions = Array.from({ length: 50 }, (_, i) => i + 1);
const repOptions = [...baseRepOptions, ...baseRepOptions, ...baseRepOptions]; // Render 3 times for infinite scroll illusion

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName }: QuickSetLoggerDialogProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  // Use a ref to prevent the scroll handler from being re-created on every render.
  const isJumpingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const getLocalStorageKey = (name: string) => `treine_last_rep_${name.replace(/\s+/g, '_')}`;

  // useLayoutEffect is critical here. It runs synchronously after DOM mutations,
  // ensuring the scroll position is set before the browser paints. This avoids flickering.
  React.useLayoutEffect(() => {
    if (isOpen && scrollerRef.current) {
      const key = getLocalStorageKey(exerciseName);
      // Default to 8 reps if no value is found.
      const lastRepCount = parseInt(localStorage.getItem(key) || '8', 10);
      
      // Calculate the index in the MIDDLE section of the triplicated array.
      const initialIndex = (lastRepCount - 1) + baseRepOptions.length;
      const initialScrollTop = initialIndex * itemHeight;

      // Set the scroll position directly and instantly.
      scrollerRef.current.scrollTop = initialScrollTop;
    }
  }, [isOpen, exerciseName]);
  
  const handleScroll = () => {
    // If we are programmatically jumping, ignore this scroll event.
    if (isJumpingRef.current) {
      isJumpingRef.current = false;
      return;
    }

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce the scroll handling to avoid excessive calculations.
    scrollTimeoutRef.current = setTimeout(() => {
      if (!scrollerRef.current) return;
      
      const { scrollTop } = scrollerRef.current;
      const sectionHeight = baseRepOptions.length * itemHeight;

      // If scrolled near the top buffer, jump to the corresponding item in the middle section.
      if (scrollTop < sectionHeight) {
        isJumpingRef.current = true; // Mark that we are about to jump
        scrollerRef.current.scrollTop += sectionHeight;
      } 
      // If scrolled near the bottom buffer, jump to the corresponding item in the middle section.
      else if (scrollTop >= sectionHeight * 2) {
        isJumpingRef.current = true; // Mark that we are about to jump
        scrollerRef.current.scrollTop -= sectionHeight;
      }
    }, 150); // A 150ms debounce is a good balance.
  };

  const handleRepSelection = (reps: number) => {
    const key = getLocalStorageKey(exerciseName);
    localStorage.setItem(key, reps.toString());
    onLogSet(reps, undefined);
    onOpenChange(false);
  };
  
  const containerHeight = itemHeight * 5; 
  const verticalPadding = (containerHeight - itemHeight) / 2;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center border-none bg-transparent p-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          <div className="relative" style={{ height: `${containerHeight}px`, width: '10rem' }}>
            <div className="absolute top-0 left-0 z-10 h-2/5 w-full bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 z-10 h-2/5 w-full bg-gradient-to-t from-background to-transparent pointer-events-none" />
            
            <div className="absolute top-1/2 left-0 z-0 w-full -translate-y-1/2 bg-primary/20 border-y border-primary" style={{ height: `${itemHeight}px` }}/>

            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.snap-y::-webkit-scrollbar { display: none; }`}</style>
              
              <div className="relative" style={{ paddingTop: `${verticalPadding}px`, paddingBottom: `${verticalPadding}px` }}>
                {repOptions.map((r, index) => (
                  <div
                    key={`${r}-${index}`}
                    onClick={() => handleRepSelection(r)}
                    className="snap-center flex items-center justify-center text-4xl font-headline text-primary cursor-pointer"
                    style={{ height: `${itemHeight}px` }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
