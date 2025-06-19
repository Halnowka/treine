"use client";

import { useState, useEffect, useCallback } from 'react';
import type { WorkoutType, ExerciseLogEntry, SavedWorkout, CurrentWorkout, ExerciseDefinition } from '@/types';
import { PUSH_DAY_EXERCISES, PULL_DAY_EXERCISES } from '@/lib/exercises';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { WorkoutDayToggle } from '@/components/WorkoutDayToggle';
import { ExerciseCard } from '@/components/ExerciseCard';
import { WorkoutHistory } from '@/components/WorkoutHistory';
import { useToast } from "@/hooks/use-toast";
import { Save, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LOCAL_STORAGE_KEY_WORKOUTS = 'kineticTrackerWorkouts';
const LOCAL_STORAGE_KEY_CURRENT_WORKOUT = 'kineticTrackerCurrentWorkout';

export default function HomePage() {
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout>({ type: null, exercises: [] });
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Load saved workouts from localStorage
    const storedWorkouts = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUTS);
    if (storedWorkouts) {
      setSavedWorkouts(JSON.parse(storedWorkouts));
    }
    // Load current workout progress from localStorage
    const storedCurrentWorkout = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
    if (storedCurrentWorkout) {
      setCurrentWorkout(JSON.parse(storedCurrentWorkout));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      // Save current workout progress to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT, JSON.stringify(currentWorkout));
    }
  }, [currentWorkout, isClient]);

  const handleSelectDay = useCallback((day: WorkoutType) => {
    if (currentWorkout.type === day && currentWorkout.exercises.length > 0) {
      // If re-selecting the same day with existing progress, do nothing or confirm reset
      toast({ title: "Workout Resumed", description: `Continuing with your ${day} day workout.` });
      return;
    }
    if (currentWorkout.exercises.some(ex => ex.sets.length > 0)) {
        // If there's progress on a different day type, confirm before switching
        if (!confirm("You have unsaved progress. Switching workout type will clear it. Continue?")) {
            return;
        }
    }

    const exercisesForDay: ExerciseDefinition[] = day === 'push' ? PUSH_DAY_EXERCISES : PULL_DAY_EXERCISES;
    setCurrentWorkout({
      type: day,
      exercises: exercisesForDay.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [],
        notes: '', // Initialize notes for the exercise
      })),
    });
    toast({ title: "Workout Started", description: `Selected ${day} day. Let's get to it!` });
  }, [currentWorkout, toast]);

  const handleUpdateExerciseLog = useCallback((updatedLog: ExerciseLogEntry) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.exerciseId === updatedLog.exerciseId ? updatedLog : ex
      ),
    }));
  }, []);
  
  const handleDeleteSet = useCallback((exerciseId: string, setId: string) => {
    setCurrentWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex =>
        ex.exerciseId === exerciseId
          ? { ...ex, sets: ex.sets.filter(set => set.id !== setId) }
          : ex
      ),
    }));
    toast({ title: "Set Deleted", variant: "destructive" });
  }, [toast]);


  const handleSaveWorkout = useCallback(() => {
    if (!currentWorkout.type || currentWorkout.exercises.every(ex => ex.sets.length === 0)) {
      toast({
        title: "Cannot Save Workout",
        description: "Please select a workout type and log at least one set for an exercise.",
        variant: "destructive",
      });
      return;
    }

    const newSavedWorkout: SavedWorkout = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: currentWorkout.type,
      exercises: currentWorkout.exercises.filter(ex => ex.sets.length > 0), // Only save exercises with logged sets
    };

    const updatedSavedWorkouts = [...savedWorkouts, newSavedWorkout];
    setSavedWorkouts(updatedSavedWorkouts);
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUTS, JSON.stringify(updatedSavedWorkouts));
    }

    // Reset current workout
    setCurrentWorkout({ type: null, exercises: [] });
    if (isClient) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
    }

    toast({
      title: "Workout Saved!",
      description: `${currentWorkout.type.toUpperCase()} day workout has been successfully saved.`,
    });
  }, [currentWorkout, savedWorkouts, toast, isClient]);

  const handleDeleteWorkout = useCallback((workoutId: string) => {
    const updatedSavedWorkouts = savedWorkouts.filter(w => w.id !== workoutId);
    setSavedWorkouts(updatedSavedWorkouts);
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUTS, JSON.stringify(updatedSavedWorkouts));
    }
    toast({ title: "Workout Deleted", description: "The workout has been removed from your history.", variant: "destructive" });
  }, [savedWorkouts, toast, isClient]);

  if (!isClient) {
    // Render a loading state or null during SSR to prevent hydration mismatch
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 md:p-8">
        <Header />
        <p className="text-xl text-primary">Loading Kinetic Tracker...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-8 selection:bg-primary selection:text-primary-foreground">
      <Header />
      <WorkoutDayToggle selectedDay={currentWorkout.type} onSelectDay={handleSelectDay} />

      {currentWorkout.type && (
        <div className="my-6 text-center">
          <Button 
            onClick={handleSaveWorkout} 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            disabled={currentWorkout.exercises.every(ex => ex.sets.length === 0)}
          >
            <Save className="mr-2 h-6 w-6" /> Save Current Workout
          </Button>
        </div>
      )}
      
      {!currentWorkout.type && (
         <Alert className="my-8 border-accent bg-card shadow-md">
           <Info className="h-5 w-5 text-accent" />
           <AlertTitle className="font-headline text-accent text-xl">Welcome to Kinetic Tracker!</AlertTitle>
           <AlertDescription className="text-muted-foreground text-base">
             Select 'Push Day' or 'Pull Day' above to start logging your exercises. Your progress will be saved automatically.
           </AlertDescription>
         </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 mb-10">
        {currentWorkout.exercises.map(exerciseLog => (
          <ExerciseCard
            key={exerciseLog.exerciseId}
            exerciseLog={exerciseLog}
            onUpdateExerciseLog={handleUpdateExerciseLog}
            onDeleteSet={handleDeleteSet}
          />
        ))}
      </div>
      
      {currentWorkout.type && currentWorkout.exercises.length === 0 && (
          <Alert variant="destructive" className="my-8">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline">No Exercises Loaded</AlertTitle>
            <AlertDescription>
              There might be an issue loading exercises for {currentWorkout.type} day. Please try re-selecting the day.
            </AlertDescription>
          </Alert>
      )}

      <WorkoutHistory savedWorkouts={savedWorkouts} onDeleteWorkout={handleDeleteWorkout} />
      
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Kinetic Tracker. Keep Pushing, Keep Pulling!</p>
      </footer>
    </div>
  );
}
