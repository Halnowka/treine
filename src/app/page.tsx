
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
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { parseISO } from 'date-fns';


const LOCAL_STORAGE_KEY_CURRENT_WORKOUT = 'kineticTrackerCurrentWorkout';

export default function HomePage() {
  const [currentWorkout, setCurrentWorkout] = useState<CurrentWorkout>({ type: null, exercises: [], workoutNotes: '' });
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedCurrentWorkout = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
    if (storedCurrentWorkout) {
      setCurrentWorkout(JSON.parse(storedCurrentWorkout));
    } else {
      setCurrentWorkout({ type: null, exercises: [], workoutNotes: '' });
    }

    const fetchWorkouts = async () => {
      setIsLoadingHistory(true);
      try {
        const workoutsCol = collection(db, 'workouts');
        const q = query(workoutsCol, orderBy('date', 'desc'));
        const workoutSnapshot = await getDocs(q);
        const workoutList = workoutSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: data.type as WorkoutType,
            exercises: data.exercises as ExerciseLogEntry[],
            workoutNotes: data.workoutNotes as string | undefined,
            date: (data.date as Timestamp).toDate().toISOString(),
          } as SavedWorkout;
        });
        setSavedWorkouts(workoutList);
      } catch (error) {
        console.error("error fetching workouts: ", error);
        toast({ title: "error fetching workouts", description: "could not load workout history from the database.", variant: "destructive" });
      }
      setIsLoadingHistory(false);
    };

    fetchWorkouts();

  }, [toast]);

   useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT, JSON.stringify(currentWorkout));
    }
  }, [currentWorkout, isClient]);

  const handleSelectDay = useCallback((newDay: WorkoutType) => {
    const isSameDay = currentWorkout.type === newDay;
    const hasExistingProgress =
      currentWorkout.exercises.some(ex => ex.sets.length > 0) ||
      (currentWorkout.workoutNotes && currentWorkout.workoutNotes.trim() !== '');

    if (isSameDay && hasExistingProgress) {
      toast({ title: "workout resumed", description: `continuing with your ${newDay} workout.` });
      return;
    }

    if (currentWorkout.type !== null && !isSameDay && hasExistingProgress) {
      if (!confirm("you have unsaved progress (sets or notes) from your previous workout. changing workout type will clear it. continue?")) {
        return; 
      }
    }

    const exercisesForDay: ExerciseDefinition[] = newDay === 'push' ? PUSH_DAY_EXERCISES : PULL_DAY_EXERCISES;
    setCurrentWorkout({
      type: newDay,
      exercises: exercisesForDay.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: [],
      })),
      workoutNotes: '', 
    });
    toast({ title: "workout started", description: `selected ${newDay} day. let's go!` });
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
    toast({ title: "set deleted", variant: "destructive" });
  }, [toast]);

  const handleWorkoutNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentWorkout(prev => ({
        ...prev,
        workoutNotes: e.target.value,
    }));
  };

  const handleSaveWorkout = useCallback(async () => {
    if (!currentWorkout.type || (currentWorkout.exercises.every(ex => ex.sets.length === 0) && (!currentWorkout.workoutNotes || currentWorkout.workoutNotes.trim() === ''))) {
      toast({
        title: "cannot save workout",
        description: "please select a workout type and log at least one set or add workout notes.",
        variant: "destructive",
      });
      return;
    }
    
    const sanitizedExercises = currentWorkout.exercises
      .filter(ex => ex.sets.length > 0)
      .map(ex => ({
        ...ex,
        sets: ex.sets.map(set => {
          const cleanSet: { id: string; reps: number; weight?: number } = {
            id: set.id,
            reps: set.reps,
          };
          if (typeof set.weight === 'number' && !isNaN(set.weight)) {
            cleanSet.weight = set.weight;
          }
          return cleanSet;
        }),
      }));

    const workoutToSaveToFirestore = {
        type: currentWorkout.type,
        exercises: sanitizedExercises,
        workoutNotes: currentWorkout.workoutNotes || '',
        date: Timestamp.fromDate(new Date()),
    };

    try {
        const docRef = await addDoc(collection(db, "workouts"), workoutToSaveToFirestore);
        
        const newSavedWorkout: SavedWorkout = {
            id: docRef.id,
            date: workoutToSaveToFirestore.date.toDate().toISOString(),
            type: workoutToSaveToFirestore.type!,
            exercises: workoutToSaveToFirestore.exercises,
            workoutNotes: workoutToSaveToFirestore.workoutNotes,
        };

        setSavedWorkouts(prevSavedWorkouts => 
            [newSavedWorkout, ...prevSavedWorkouts].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        );
        
        setCurrentWorkout({ type: null, exercises: [], workoutNotes: '' });
        if (isClient) {
             localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
        }

        toast({
          title: "workout saved!",
          description: `your ${currentWorkout.type} workout was successfully saved to the database.`,
        });
    } catch (error) {
        console.error("error saving workout: ", error);
        toast({ title: "error saving workout", description: "could not save workout to the database.", variant: "destructive" });
    }
  }, [currentWorkout, toast, isClient]);

  const handleDeleteWorkout = useCallback(async (workoutId: string) => {
    try {
        await deleteDoc(doc(db, 'workouts', workoutId));
        setSavedWorkouts(prev => prev.filter(w => w.id !== workoutId));
        toast({ title: "workout deleted", description: "the workout has been removed from your history.", variant: "destructive" });
    } catch (error) {
        console.error("error deleting workout: ", error);
        toast({ title: "error deleting workout", description: "could not delete workout from the database.", variant: "destructive"});
    }
  }, [toast]);

  if (!isClient || isLoadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 md:p-8">
        <Header />
        <p className="text-xl text-primary lowercase">loading treine...</p>
        {isLoadingHistory && <p className="text-md text-muted-foreground lowercase">accessing workout history...</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-8 selection:bg-primary selection:text-primary-foreground">
      <Header />
      <WorkoutDayToggle selectedDay={currentWorkout.type} onSelectDay={handleSelectDay} />
      
      {!currentWorkout.type && (
         <Alert className="my-8 border-accent bg-card shadow-md">
           <Info className="h-5 w-5 text-accent" />
           <AlertTitle className="font-headline text-accent text-xl lowercase">welcome to treine!</AlertTitle>
           <AlertDescription className="text-muted-foreground text-base lowercase">
             select 'push day' or 'pull day' above to start logging your exercises. your progress will be saved to the cloud!
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
            <AlertTitle className="font-headline lowercase">no exercises loaded</AlertTitle>
            <AlertDescription className="lowercase">
              there might be an issue loading exercises for {currentWorkout.type} day. please try selecting the day again.
            </AlertDescription>
          </Alert>
      )}

      {currentWorkout.type && (
        <div className="my-6 space-y-6">
          <div className="max-w-xl mx-auto">
            <Label htmlFor="workoutNotes" className="text-lg font-semibold text-primary mb-2 flex items-center lowercase">
              <Edit3 className="mr-2 h-5 w-5" />
              workout notes ({currentWorkout.type} day)
            </Label>
            <Textarea
              id="workoutNotes"
              placeholder="add general notes for this workout (e.g., how you felt, overall rpe, etc.)..."
              value={currentWorkout.workoutNotes || ''}
              onChange={handleWorkoutNotesChange}
              className="min-h-[100px] text-base bg-card border-border shadow-sm"
            />
          </div>
          <div className="text-center">
            <Button 
              onClick={handleSaveWorkout} 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 lowercase"
              disabled={currentWorkout.exercises.every(ex => ex.sets.length === 0) && (!currentWorkout.workoutNotes || currentWorkout.workoutNotes.trim() === '')}
            >
              <Save className="mr-2 h-6 w-6" /> save current workout
            </Button>
          </div>
        </div>
      )}

      <WorkoutHistory savedWorkouts={savedWorkouts} onDeleteWorkout={handleDeleteWorkout} isLoading={isLoadingHistory} />
      
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground lowercase">&copy; {new Date().getFullYear()} treine. keep pushing, keep pulling!</p>
      </footer>
    </div>
  );
}
