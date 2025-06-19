
"use client";

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickSetLoggerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogSet: (reps: number, weight?: number) => void;
  exerciseName: string; // Kept for potential future use, though not directly displayed now
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName }: QuickSetLoggerDialogProps) {
  const repOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleRepSelection = (value: string) => {
    const numReps = parseInt(value, 10);
    onLogSet(numReps, undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[160px] bg-card text-card-foreground border-border shadow-xl rounded-lg p-2">
        <ScrollArea className="h-[240px] w-full rounded-md">
          <div className="flex flex-col space-y-1 p-1">
            {repOptions.map(r => (
              <Button
                key={r}
                variant="ghost"
                className="w-full justify-center text-lg py-2 h-auto"
                onClick={() => handleRepSelection(String(r))}
              >
                {r}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
