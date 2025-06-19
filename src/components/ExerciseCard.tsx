
"use client";

import { useState } from 'react';
import type { ExerciseLogEntry, SetData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { PlusCircle, Trash2 } from 'lucide-react';
import { QuickSetLoggerDialog } from './QuickSetLoggerDialog';

interface ExerciseCardProps {
  exerciseLog: ExerciseLogEntry;
  onUpdateExerciseLog: (updatedLog: ExerciseLogEntry) => void;
  onDeleteSet: (exerciseId: string, setId: string) => void;
}

export function ExerciseCard({ exerciseLog, onUpdateExerciseLog, onDeleteSet }: ExerciseCardProps) {
  const [isQuickSetLoggerOpen, setIsQuickSetLoggerOpen] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string>("");

  const handleLogSet = (reps: number, weight?: number) => {
    const newSet: SetData = { id: crypto.randomUUID(), reps, weight };
    const updatedLog = {
      ...exerciseLog,
      sets: [...exerciseLog.sets, newSet],
    };
    onUpdateExerciseLog(updatedLog);
  };

  const toggleAccordion = () => {
    if (exerciseLog.sets.length > 0) {
      setActiveAccordionItem(prev => prev === "sets" ? "" : "sets");
    }
  };

  const setsContentId = `sets-content-${exerciseLog.exerciseId}`;

  return (
    <Card className="bg-card text-card-foreground border-border shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center relative">
          <CardTitle className="text-lg font-headline text-primary">
            {exerciseLog.exerciseName}
          </CardTitle>
          
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={toggleAccordion}
              className="text-3xl font-bold text-primary cursor-pointer focus:outline-none p-2 -m-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={activeAccordionItem === "sets"}
              aria-controls={setsContentId}
              disabled={exerciseLog.sets.length === 0}
            >
              {exerciseLog.sets.length}
            </button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => setIsQuickSetLoggerOpen(true)} 
            className="text-primary hover:text-accent-foreground hover:bg-accent text-lg"
            aria-label={`Add set for ${exerciseLog.exerciseName}`}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Set
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {exerciseLog.sets.length > 0 ? (
          <Accordion 
            type="single" 
            collapsible 
            className="w-full" 
            value={activeAccordionItem} 
            onValueChange={setActiveAccordionItem}
          >
            <AccordionItem value="sets" className="border-none">
              {/* AccordionTrigger is not rendered visibly; the number in header controls expansion */}
              <AccordionContent id={setsContentId} className="pt-2">
                <ul className="space-y-3">
                  {exerciseLog.sets.map((set, index) => (
                    <li key={set.id} className="p-3 bg-muted/50 rounded-md border border-border/50 shadow-sm">
                      <div className="flex justify-between items-center">
                        <p className="text-base">
                          Set {index + 1}: <span className="font-semibold text-primary">{set.reps} reps</span>
                          {set.weight && ` at ${set.weight} kg`}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteSet(exerciseLog.exerciseId, set.id)} 
                          className="text-destructive hover:text-red-400 h-8 w-8"
                          aria-label={`Delete set ${index + 1} for ${exerciseLog.exerciseName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
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
