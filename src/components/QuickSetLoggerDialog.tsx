
"use client";

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
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet }: QuickSetLoggerDialogProps) {
  const repOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleRepSelection = (value: string) => {
    const numReps = parseInt(value, 10);
    onLogSet(numReps, undefined);
    onOpenChange(false); // Close dialog after selection
  };

  // Base classes from ShadCN's DialogContent for consistent behavior and animations
  const dialogPrimitiveContentBaseClasses = "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]";
  // Specific classes for this dialog's appearance
  const quickSetDialogSpecificClasses = "sm:max-w-[160px] bg-card text-card-foreground border-border shadow-xl rounded-lg p-2";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(dialogPrimitiveContentBaseClasses, quickSetDialogSpecificClasses)}
          onEscapeKeyDown={(e) => {
            // Radix Dialog handles escape by default if onOpenChange is provided to root
            // This explicit handler is mostly for clarity or if specific logic was needed
            if (isOpen) {
                onOpenChange(false);
            }
          }}
        >
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
          {/* The 'X' close button (DialogPrimitive.Close) is intentionally omitted here */}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
