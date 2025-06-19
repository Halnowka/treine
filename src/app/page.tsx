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
import { Save, AlertTriangle, Info, Edit3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const LOCAL_STORAGE_KEY_WORKOUTS = 'kineticTrackerWorkouts';
const LOCAL_STORAGE_KEY_CURRENT_WORKOUT = 'kineticTrackerCurrentWorkout';

export default function HomePage() {
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout>({ type: null, exercises: [], workoutNotes: '' });
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedWorkouts = localStorage.getItem(LOCAL_STORAGE_KEY_WORKOUTS);
    if (storedWorkouts) {
      setSavedWorkouts(JSON.parse(storedWorkouts));
    }
    const storedCurrentWorkout = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
    if (storedCurrentWorkout) {
      setCurrentWorkout(JSON.parse(storedCurrentWorkout));
    } else {
      setCurrentWorkout({ type: null, exercises: [], workoutNotes: '' });
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT, JSON.stringify(currentWorkout));
    }
  }, [currentWorkout, isClient]);

  const handleSelectDay = useCallback((day: WorkoutType) => {
    if (currentWorkout.type === day && currentWorkout.exercises.length > 0) {
      toast({ title: "Workout Resumed", description: `Continuing with your ${day} day workout.` });
      return;
    }
    if (currentWorkout.exercises.some(ex => ex.sets.length > 0) || (currentWorkout.workoutNotes && currentWorkout.workoutNotes.trim() !== '')) {
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
      })),
      workoutNotes: '', // Reset workout notes when starting a new day
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

  const handleWorkoutNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentWorkout(prev => ({
        ...prev,
        workoutNotes: e.target.value,
    }));
  };

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
      exercises: currentWorkout.exercises.filter(ex => ex.sets.length > 0),
      workoutNotes: currentWorkout.workoutNotes,
    };

    const updatedSavedWorkouts = [...savedWorkouts, newSavedWorkout];
    setSavedWorkouts(updatedSavedWorkouts);
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY_WORKOUTS, JSON.stringify(updatedSavedWorkouts));
    }

    setCurrentWorkout({ type: null, exercises: [], workoutNotes: '' });
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
        <div className="my-6 space-y-6">
          <div className="max-w-xl mx-auto">
            <Label htmlFor="workoutNotes" className="text-lg font-semibold text-primary mb-2 flex items-center">
              <Edit3 className="mr-2 h-5 w-5" />
              Anotações do Treino ({currentWorkout.type} Day)
            </Label>
            <Textarea
              id="workoutNotes"
              placeholder="Adicione anotações gerais para este treino (ex: como se sentiu, RPE geral, etc.)..."
              value={currentWorkout.workoutNotes || ''}
              onChange={handleWorkoutNotesChange}
              className="min-h-[100px] text-base bg-card border-border shadow-sm"
            />
          </div>
          <div className="text-center">
            <Button 
              onClick={handleSaveWorkout} 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              disabled={currentWorkout.exercises.every(ex => ex.sets.length === 0)}
            >
              <Save className="mr-2 h-6 w-6" /> Salvar Treino Atual
            </Button>
          </div>
        </div>
      )}
      
      {!currentWorkout.type && (
         <Alert className="my-8 border-accent bg-card shadow-md">
           <Info className="h-5 w-5 text-accent" />
           <AlertTitle className="font-headline text-accent text-xl">Bem-vindo ao Kinetic Tracker!</AlertTitle>
           <AlertDescription className="text-muted-foreground text-base">
             Selecione 'Push Day' ou 'Pull Day' acima para começar a registrar seus exercícios. Seu progresso será salvo automaticamente.
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
            <AlertTitle className="font-headline">Nenhum Exercício Carregado</AlertTitle>
            <AlertDescription>
              Pode haver um problema ao carregar os exercícios para o dia de {currentWorkout.type}. Por favor, tente selecionar o dia novamente.
            </AlertDescription>
          </Alert>
      )}

      <WorkoutHistory savedWorkouts={savedWorkouts} onDeleteWorkout={handleDeleteWorkout} />
      
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Kinetic Tracker. Continue Pushing, Continue Pulling!</p>
      </footer>
    </div>
  );
}
