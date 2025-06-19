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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save } from 'lucide-react';

interface QuickSetLoggerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLogSet: (reps: number, weight?: number, notes?: string) => void;
  exerciseName: string;
}

export function QuickSetLoggerDialog({ isOpen, onOpenChange, onLogSet, exerciseName }: QuickSetLoggerDialogProps) {
  const [reps, setReps] = useState<number>(8); // Default reps
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const repOptions = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleSubmit = () => {
    onLogSet(reps, weight ? parseFloat(weight) : undefined, notes);
    // Reset form for next entry, or close dialog
    setWeight('');
    setNotes('');
    onOpenChange(false);
  };
  
  // Reset local state when dialog opens/closes or exercise changes
  useEffect(() => {
    if (isOpen) {
      setReps(8); // Reset to default when opening
      setWeight('');
      setNotes('');
    }
  }, [isOpen, exerciseName]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center">
            <PlusCircle className="mr-2 h-6 w-6" /> Log Set for {exerciseName}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reps" className="text-right col-span-1 text-muted-foreground">
              Reps
            </Label>
            <Select value={String(reps)} onValueChange={(val) => setReps(Number(val))} >
              <SelectTrigger id="reps" className="col-span-3 h-12 text-lg">
                <SelectValue placeholder="Select reps" />
              </SelectTrigger>
              <SelectContent>
                {repOptions.map(r => (
                  <SelectItem key={r} value={String(r)} className="text-lg">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right col-span-1 text-muted-foreground">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Optional"
              className="col-span-3 h-12 text-lg"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right col-span-1 pt-3 text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional set notes (e.g., form check)"
              className="col-span-3 min-h-[80px] text-base"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="h-12 text-base">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-5 w-5" /> Log Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
