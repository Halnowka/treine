
"use client";

import type { SavedWorkout } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarDays, Trash2, Dumbbell, ListChecks, StickyNote, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface WorkoutHistoryProps {
  savedWorkouts: SavedWorkout[];
  onDeleteWorkout: (workoutId: string) => void;
  isLoading: boolean;
}

export function WorkoutHistory({ savedWorkouts, onDeleteWorkout, isLoading }: WorkoutHistoryProps) {
  if (isLoading) {
    return (
      <div className="mt-10 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-2xl font-headline text-primary mb-2 lowercase">loading history...</h3>
        <p className="text-muted-foreground lowercase">fetching your saved workouts.</p>
      </div>
    );
  }
  
  if (savedWorkouts.length === 0) {
    return (
      <div className="mt-10 text-center">
        <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-headline text-primary mb-2 lowercase">workout history empty</h3>
        <p className="text-muted-foreground lowercase">no workouts saved yet. complete a session and save it to see it here!</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h3 className="text-3xl font-headline text-primary mb-6 text-center flex items-center justify-center lowercase">
         <ListChecks className="mr-3 h-8 w-8" /> workout history
      </h3>
      <div className="space-y-6">
        {savedWorkouts.map((workout) => (
          <Card key={workout.id} className="bg-card text-card-foreground border-border shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-headline text-primary flex items-center lowercase">
                    <Dumbbell className="mr-2 h-6 w-6" />
                    {workout.type} day workout
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground flex items-center mt-1 lowercase">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {format(parseISO(workout.date), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => onDeleteWorkout(workout.id)} className="text-destructive hover:text-red-400 h-10 w-10">
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only lowercase">delete workout</span>
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
              {workout.workoutNotes && workout.workoutNotes.trim() !== "" && (
                <div className="mb-4 p-3 bg-muted/30 rounded-md border border-border/30">
                  <h4 className="font-semibold text-accent text-md flex items-center mb-1 lowercase">
                    <StickyNote className="mr-2 h-5 w-5" />
                    workout notes:
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workout.workoutNotes}</p>
                </div>
              )}
              {workout.exercises.length > 0 && (
                <Accordion type="single" collapsible className="w-full" defaultValue={workout.exercises.length > 0 ? "details" : undefined}>
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-lg hover:text-accent-foreground font-semibold lowercase">
                      view exercises ({workout.exercises.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-4 mt-2">
                        {workout.exercises.map((exerciseLog) => (
                          <li key={exerciseLog.exerciseId} className="p-3 bg-muted/50 rounded-md border border-border/50">
                            <h4 className="font-semibold text-primary text-lg lowercase">{exerciseLog.exerciseName}</h4>
                            <ul className="space-y-1 mt-1 pl-4 list-disc list-inside text-sm lowercase">
                              {exerciseLog.sets.map((set, idx) => (
                                <li key={set.id}>
                                  set {idx + 1}: {set.reps} reps
                                  {set.weight && ` at ${set.weight} kg`}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
