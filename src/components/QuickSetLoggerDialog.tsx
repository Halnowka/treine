
"use client";

import * as React from 'react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface QuickSetLoggerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogSet: (reps: number, weight?: number) => void;
  exerciseName: string;
  lastRepCount?: number;
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName, lastRepCount }: QuickSetLoggerDialogProps) {
  const repOptions = React.useMemo(() => {
    // Always generate the full list to allow scrolling
    return Array.from({ length: 50 }, (_, i) => i + 1);
  }, []);

  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // No-op if not open or ref not attached
    if (!isOpen || !viewportRef.current) return;

    // Defer scrolling to allow for render & animation.
    // This gives the dialog time to open before we try to scroll.
    const timer = setTimeout(() => {
      if (!viewportRef.current) return;

      if (lastRepCount) {
        const buttonToCenter = viewportRef.current.querySelector(
          `[data-rep-value="${lastRepCount}"]`
        ) as HTMLButtonElement | null;
        
        // Using scrollIntoView is a more robust, browser-native approach.
        if (buttonToCenter) {
          buttonToCenter.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // If no last rep count, just scroll to the top.
        viewportRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 150); // Increased delay slightly for more reliability

    return () => clearTimeout(timer);
  }, [isOpen, lastRepCount]);


  const handleRepSelection = (value: string) => {
    const numReps = parseInt(value, 10);
    onLogSet(numReps, undefined);
    onOpenChange(false); // Close dialog after selection
  };

  const pickerContainerClasses = "w-40 bg-card border border-primary/50 p-2 shadow-2xl";
  const contentWrapperClasses = "fixed inset-0 z-50 flex items-center justify-center";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            contentWrapperClasses,
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          <div className={pickerContainerClasses}>
            <ScrollArea viewportRef={viewportRef} className="h-96 w-full">
                <div className="flex flex-col space-y-1 p-1">
                {repOptions.map(r => (
                    <Button
                    key={r}
                    variant="ghost"
                    className="w-full justify-center text-3xl font-headline py-4 h-auto text-primary hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleRepSelection(String(r))}
                    data-rep-value={r}
                    >
                    {r}
                    </Button>
                ))}
                </div>
            </ScrollArea>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
