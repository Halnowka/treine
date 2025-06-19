"use client";

import { useState } from 'react';
import type { ExerciseLogEntry, SetData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Edit3, Trash2, Dumbbell, Info } from 'lucide-react';
import { QuickSetLoggerDialog } from './QuickSetLoggerDialog';

interface ExerciseCardProps {
  exerciseLog: ExerciseLogEntry;
  onUpdateExerciseLog: (updatedLog: ExerciseLogEntry) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
}

export function ExerciseCard({ exerciseLog, onUpdateExerciseLog, onDeleteSet }: ExerciseCardProps) {
  const [isQuickSetLoggerOpen, setIsQuickSetLoggerOpen] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState(exerciseLog.notes || '');

  const handleLogSet = (reps: number, weight?: number, notes?: string) => {
    const newSet: SetData = { id: crypto.randomUUID(), reps, weight, notes };
    const updatedLog = {
      ...exerciseLog,
      sets: [...exerciseLog.sets, newSet],
    };
    onUpdateExerciseLog(updatedLog);
  };
  
  const handleExerciseNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExerciseNotes(e.target.value);
  };

  const handleSaveExerciseNotes = () => {
     const updatedLog = {
      ...exerciseLog,
      notes: exerciseNotes,
    };
    onUpdateExerciseLog(updatedLog);
  };


  return (
    <Card className="bg-card text-card-foreground border-border shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Dumbbell className="mr-3 h-6 w-6" />
            {exerciseLog.exerciseName}
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={() => setIsQuickSetLoggerOpen(true)} className="text-primary hover:text-accent-foreground hover:bg-accent">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Set
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {exerciseLog.sets.length > 0 && (
            <AccordionItem value="sets">
              <AccordionTrigger className="text-lg hover:text-accent-foreground font-semibold">
                Logged Sets ({exerciseLog.sets.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 mt-2">
                  {exerciseLog.sets.map((set, index) => (
                    <li key={set.id} className="p-3 bg-muted/50 rounded-md border border-border/50 shadow-sm">
                      <div className="flex justify-between items-center">
                        <p className="text-base">
                          Set {index + 1}: <span className="font-semibold text-primary">{set.reps} reps</span>
                          {set.weight && ` at ${set.weight} kg`}
                        </p>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteSet(exerciseLog.exerciseId, set.id)} className="text-destructive hover:text-red-400 h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {set.notes && <p className="text-sm text-muted-foreground mt-1 pl-1 border-l-2 border-accent ml-1">Notes: {set.notes}</p>}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
          
          <AccordionItem value="exercise-notes">
            <AccordionTrigger className="text-lg hover:text-accent-foreground font-semibold">
              <Info className="mr-2 h-5 w-5 text-primary" />
              Exercise Notes
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <Textarea
                placeholder="Add general notes for this exercise (e.g., form cues, RPE target)..."
                value={exerciseNotes}
                onChange={handleExerciseNotesChange}
                className="min-h-[80px] text-base mb-2"
              />
              <Button size="sm" onClick={handleSaveExerciseNotes} className="bg-accent text-accent-foreground hover:bg-accent/80">
                <Edit3 className="mr-2 h-4 w-4" /> Save Notes
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {exerciseLog.sets.length === 0 && (
           <p className="text-muted-foreground text-center py-4">No sets logged yet. Click 'Add Set' to start!</p>
        )}
      </CardContent>

      <QuickSetLoggerDialog
        isOpen={isQuickSetLoggerOpen}
        onOpenChange={setIsQuickSetLoggerOpen}
        onLogSet={handleLogSet}
        exerciseName={exerciseLog.exerciseName}
      />
    </Card>
  );
}
