
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
  lastRepCount?: number;
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName, lastRepCount }: QuickSetLoggerDialogProps) {
  const repOptions = React.useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  
  // Each item is h-16, which is 4rem or 64px
  const itemHeight = 64; 

  React.useEffect(() => {
    if (isOpen && scrollerRef.current) {
      // We use requestAnimationFrame to ensure the scroll happens after the dialog is painted.
      // This is more reliable than a fixed setTimeout.
      const frameId = requestAnimationFrame(() => {
        if (!scrollerRef.current) return;
        
        // Default to centering around 8 reps if no previous set exists.
        let initialIndex = 8 - 1; 
        if (lastRepCount) {
          // The array is 0-indexed, but reps are 1-based.
          initialIndex = lastRepCount - 1;
        }

        // We ensure the index is within bounds.
        initialIndex = Math.max(0, Math.min(repOptions.length - 1, initialIndex));
        
        const scrollTop = initialIndex * itemHeight;
        
        scrollerRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
      });

      return () => cancelAnimationFrame(frameId);
    }
  }, [isOpen, lastRepCount, repOptions.length, itemHeight]);

  const handleRepSelection = (reps: number) => {
    onLogSet(reps, undefined);
    onOpenChange(false);
  };
  
  // The container height is 5 * itemHeight, which is 320px
  const containerHeight = itemHeight * 5; 
  // Padding is used to allow the first and last items to be centered in the viewport
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
            {/* Fades for the wheel effect */}
            <div className="absolute top-0 left-0 z-10 h-2/5 w-full bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 z-10 h-2/5 w-full bg-gradient-to-t from-background to-transparent pointer-events-none" />
            
            {/* Highlight bar for the selected item */}
            <div className="absolute top-1/2 left-0 z-0 w-full -translate-y-1/2 bg-primary/20 border-y border-primary" style={{ height: `${itemHeight}px` }}/>

            <div
              ref={scrollerRef}
              className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`.snap-y::-webkit-scrollbar { display: none; }`}</style>
              
              <div className="relative" style={{ paddingTop: `${verticalPadding}px`, paddingBottom: `${verticalPadding}px` }}>
                {repOptions.map(r => (
                  <div
                    key={r}
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
