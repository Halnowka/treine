
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

interface QuickSetLoggerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogSet: (reps: number, weight?: number) => void;
  exerciseName: string;
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName }: QuickSetLoggerDialogProps) {
  const [reps, setReps] = useState<number>(8); // Default reps

  const repOptions = Array.from({ length: 30 }, (_, i) => i + 1); // 1 to 30 reps

  const handleRepSelection = (value: string) => {
    const numReps = parseInt(value, 10);
    onLogSet(numReps, undefined); // Log set with selected reps, weight is undefined
    onOpenChange(false); // Close dialog immediately
  };
  
  useEffect(() => {
    // Reset reps to default when dialog opens
    if (isOpen) {
      setReps(8); 
    }
  }, [isOpen]); // exerciseName dependency removed as default reps don't depend on it.


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] bg-card text-card-foreground border-border shadow-xl rounded-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-headline text-primary flex items-center">
            <PlusCircle className="mr-2 h-5 w-5" /> Registrar Série para {exerciseName}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-3 items-center gap-x-4">
            <Label htmlFor="reps-select" className="text-left col-span-1 text-muted-foreground text-base">
              Repetições
            </Label>
            <div className="col-span-2">
              <Select 
                value={String(reps)} 
                onValueChange={handleRepSelection}
              >
                <SelectTrigger id="reps-select" className="h-12 text-lg w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {repOptions.map(r => (
                    <SelectItem key={r} value={String(r)} className="text-lg py-2">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* DialogFooter is removed as selection triggers action and close */}
      </DialogContent>
    </Dialog>
  );
}
