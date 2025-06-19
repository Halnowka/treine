"use client";

import type { SavedWorkout } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarDays, Trash2, Dumbbell, ListChecks } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface WorkoutHistoryProps {
  savedWorkouts: SavedWorkout[];
  onDeleteWorkout: (workoutId: string) => void;
}

export function WorkoutHistory({ savedWorkouts, onDeleteWorkout }: WorkoutHistoryProps) {
  if (savedWorkouts.length === 0) {
    return (
      <div className="mt-10 text-center">
        <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-headline text-primary mb-2">Workout History</h3>
        <p className="text-muted-foreground">No workouts saved yet. Complete a session and save it to see it here!</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h3 className="text-3xl font-headline text-primary mb-6 text-center flex items-center justify-center">
         <ListChecks className="mr-3 h-8 w-8" /> Workout History
      </h3>
      <div className="space-y-6">
        {savedWorkouts.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map((workout) => (
          <Card key={workout.id} className="bg-card text-card-foreground border-border shadow-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-headline text-primary capitalize flex items-center">
                    <Dumbbell className="mr-2 h-6 w-6" />
                    {workout.type} Day Workout
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground flex items-center mt-1">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {format(parseISO(workout.date), "MMMM d, yyyy 'at' h:mm a")}
                  </CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => onDeleteWorkout(workout.id)} className="text-destructive hover:text-red-400 h-10 w-10">
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Delete workout</span>
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-lg hover:text-accent-foreground font-semibold">
                    View Exercises ({workout.exercises.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-4 mt-2">
                      {workout.exercises.map((exerciseLog) => (
                        <li key={exerciseLog.exerciseId} className="p-3 bg-muted/50 rounded-md border border-border/50">
                          <h4 className="font-semibold text-primary text-lg">{exerciseLog.exerciseName}</h4>
                          {exerciseLog.notes && <p className="text-sm text-muted-foreground italic mb-1">Notes: {exerciseLog.notes}</p>}
                          <ul className="space-y-1 mt-1 pl-4 list-disc list-inside text-sm">
                            {exerciseLog.sets.map((set, idx) => (
                              <li key={set.id}>
                                Set {idx + 1}: {set.reps} reps
                                {set.weight && ` at ${set.weight} kg`}
                                {set.notes && <span className="text-xs text-muted-foreground/80 italic"> - {set.notes}</span>}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
