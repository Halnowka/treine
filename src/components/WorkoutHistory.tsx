
"use client";

import * as React from 'react';
import type { SavedWorkout } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Trash2, Dumbbell, ListChecks, StickyNote, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WorkoutHistoryProps {
  savedWorkouts: SavedWorkout[];
  onDeleteWorkout: (workoutId: string) => void;
  isLoading: boolean;
}

export function WorkoutHistory({ savedWorkouts, onDeleteWorkout, isLoading }: WorkoutHistoryProps) {
  const [activeWorkoutId, setActiveWorkoutId] = React.useState<string | null>(null);
  const [workoutToDeleteId, setWorkoutToDeleteId] = React.useState<string | null>(null);

  const toggleWorkoutExpansion = (workoutId: string) => {
    setActiveWorkoutId(prevId => (prevId === workoutId ? null : workoutId));
  };

  const handleDeleteConfirm = () => {
    if (workoutToDeleteId) {
      onDeleteWorkout(workoutToDeleteId);
    }
    setWorkoutToDeleteId(null); 
  };

  const openDeleteDialog = (workoutId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card from toggling expansion
    setWorkoutToDeleteId(workoutId);
  };

  if (isLoading) {
    return (
      <div className="mt-10 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-2xl font-headline text-primary mb-2 lowercase">loading history...</h3>
        <p className="text-muted-foreground lowercase">fetching your saved workouts.</p>
      </div>
    );
  }
  
  if (savedWorkouts.length === 0 && !isLoading) {
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
      <div className="space-y-4">
        {savedWorkouts.map((workout) => {
          const isExpanded = activeWorkoutId === workout.id;
          return (
            <Card key={workout.id} className="bg-card text-card-foreground border-border shadow-md overflow-hidden">
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toggleWorkoutExpansion(workout.id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-grow">
                    <CardTitle className="text-2xl font-headline text-primary flex items-center lowercase">
                      <Dumbbell className="mr-2 h-6 w-6" />
                      {workout.type} day workout
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground flex items-center mt-1 lowercase">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {format(parseISO(workout.date), "MMMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    { (workout.workoutNotes && workout.workoutNotes.trim() !== "" || workout.exercises.length > 0) && (
                        isExpanded ? <ChevronUp className="h-6 w-6 text-primary mr-2" /> : <ChevronDown className="h-6 w-6 text-primary mr-2" />
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => openDeleteDialog(workout.id, e)}
                            className="text-destructive hover:text-red-400 h-10 w-10"
                            aria-label="delete workout"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      {workoutToDeleteId === workout.id && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="lowercase">are you sure?</AlertDialogTitle>
                            <AlertDialogDescription className="lowercase">
                              this action cannot be undone. this will permanently delete this workout session.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setWorkoutToDeleteId(null)} className="lowercase">cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm} className="lowercase bg-destructive text-destructive-foreground hover:bg-destructive/90">delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="pt-2 pb-4">
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
                    <div>
                      <h4 className="font-semibold text-accent text-md mb-2 lowercase">
                        logged exercises ({workout.exercises.length}):
                      </h4>
                      <ul className="space-y-3">
                        {workout.exercises.map((exerciseLog) => (
                          <li key={exerciseLog.exerciseId} className="p-3 bg-muted/50 rounded-md border border-border/50">
                            <h5 className="font-semibold text-primary text-lg lowercase">{exerciseLog.exerciseName}</h5>
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
                    </div>
                  )}
                  {(!workout.workoutNotes || workout.workoutNotes.trim() === "") && workout.exercises.length === 0 && (
                     <p className="text-sm text-muted-foreground lowercase">no details recorded for this workout.</p>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

