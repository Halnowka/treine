
"use client";

import { useState, useEffect } from 'react';
import type { ExerciseLogEntry, SetData } from '@/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuickSetLoggerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogSet: (reps: number, weight?: number) => void;
  exerciseName: string;
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName }: QuickSetLoggerDialogProps) {
  const [reps, setReps] = useState<number>(8); 

  const repOptions = Array.from({ length: 30 }, (_, i) => i + 1); 

  const handleRepSelection = (value: string) => {
    const numReps = parseInt(value, 10);
    onLogSet(numReps, undefined); 
    onOpenChange(false); 
  };
  
  useEffect(() => {
    if (isOpen) {
      setReps(8); 
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[280px] bg-card text-card-foreground border-border shadow-xl rounded-lg p-6">
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-3 items-center gap-x-4">
            <Label htmlFor="reps-select" className="text-left col-span-1 text-muted-foreground text-base lowercase">
              reps
            </Label>
            <div className="col-span-2">
              <Select 
                value={String(reps)} 
                onValueChange={handleRepSelection}
              >
                <SelectTrigger id="reps-select" className="h-12 text-lg w-full">
                  <SelectValue placeholder="selecione" />
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
      </DialogContent>
    </Dialog>
  );
}
