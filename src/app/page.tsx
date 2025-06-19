
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
import { db } from '@/lib/firebase'; // Firebase import
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
    // Load current workout from localStorage
    const storedCurrentWorkout = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
    if (storedCurrentWorkout) {
      setCurrentWorkout(JSON.parse(storedCurrentWorkout));
    } else {
      setCurrentWorkout({ type: null, exercises: [], workoutNotes: '' });
    }

    // Fetch saved workouts from Firestore
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
        console.error("Error fetching workouts: ", error);
        toast({ title: "Erro ao Carregar Histórico", description: "Não foi possível carregar o histórico de treinos do banco de dados.", variant: "destructive" });
      }
      setIsLoadingHistory(false);
    };

    fetchWorkouts();

  }, [toast]); // Removed isClient from here as fetch should run once on mount if client

   useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT, JSON.stringify(currentWorkout));
    }
  }, [currentWorkout, isClient]);

  const handleSelectDay = useCallback((day: WorkoutType) => {
    if (currentWorkout.type === day && currentWorkout.exercises.length > 0) {
      toast({ title: "Treino Retomado", description: `Continuando com seu treino de ${day}.` });
      return;
    }
    if (currentWorkout.exercises.some(ex => ex.sets.length > 0) || (currentWorkout.workoutNotes && currentWorkout.workoutNotes.trim() !== '')) {
        if (!confirm("Você tem progresso não salvo. Mudar o tipo de treino irá limpá-lo. Continuar?")) {
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
      workoutNotes: '',
    });
    toast({ title: "Treino Iniciado", description: `Selecionado dia de ${day}. Vamos nessa!` });
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
    toast({ title: "Série Deletada", variant: "destructive" });
  }, [toast]);

  const handleWorkoutNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentWorkout(prev => ({
        ...prev,
        workoutNotes: e.target.value,
    }));
  };

  const handleSaveWorkout = useCallback(async () => {
    if (!currentWorkout.type || currentWorkout.exercises.every(ex => ex.sets.length === 0)) {
      toast({
        title: "Não é Possível Salvar o Treino",
        description: "Por favor, selecione um tipo de treino e registre pelo menos uma série para um exercício.",
        variant: "destructive",
      });
      return;
    }

    const workoutToSaveToFirestore = {
        type: currentWorkout.type,
        exercises: currentWorkout.exercises.filter(ex => ex.sets.length > 0),
        workoutNotes: currentWorkout.workoutNotes || '',
        date: Timestamp.fromDate(new Date()),
    };

    try {
        const docRef = await addDoc(collection(db, "workouts"), workoutToSaveToFirestore);
        
        const newSavedWorkout: SavedWorkout = {
            id: docRef.id,
            date: workoutToSaveToFirestore.date.toDate().toISOString(),
            type: workoutToSaveToFirestore.type,
            exercises: workoutToSaveToFirestore.exercises,
            workoutNotes: workoutToSaveToFirestore.workoutNotes,
        };

        setSavedWorkouts(prevSavedWorkouts => 
            [newSavedWorkout, ...prevSavedWorkouts].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        );
        
        setCurrentWorkout({ type: null, exercises: [], workoutNotes: '' });
        // No need to touch localStorage for saved workouts here
        if (isClient) {
             localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_WORKOUT);
        }

        toast({
          title: "Treino Salvo!",
          description: `Seu treino de ${currentWorkout.type.toUpperCase()} foi salvo com sucesso no banco de dados.`,
        });
    } catch (error) {
        console.error("Error saving workout: ", error);
        toast({ title: "Erro ao Salvar", description: "Não foi possível salvar o treino no banco de dados.", variant: "destructive" });
    }
  }, [currentWorkout, toast, isClient]);

  const handleDeleteWorkout = useCallback(async (workoutId: string) => {
    try {
        await deleteDoc(doc(db, 'workouts', workoutId));
        setSavedWorkouts(prev => prev.filter(w => w.id !== workoutId));
        toast({ title: "Treino Deletado", description: "O treino foi removido do seu histórico.", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting workout: ", error);
        toast({ title: "Erro ao Deletar", description: "Não foi possível deletar o treino do banco de dados.", variant: "destructive"});
    }
  }, [toast]);

  if (!isClient || isLoadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 md:p-8">
        <Header />
        <p className="text-xl text-primary">Carregando Kinetic Tracker...</p>
        {isLoadingHistory && <p className="text-md text-muted-foreground">Acessando histórico de treinos...</p>}
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
              Anotações do Treino ({currentWorkout.type.toUpperCase()} Day)
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
              disabled={currentWorkout.exercises.every(ex => ex.sets.length === 0) && (!currentWorkout.workoutNotes || currentWorkout.workoutNotes.trim() === '')}
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
             Selecione 'Push Day' ou 'Pull Day' acima para começar a registrar seus exercícios. Seu progresso será salvo na nuvem!
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

      <WorkoutHistory savedWorkouts={savedWorkouts} onDeleteWorkout={handleDeleteWorkout} isLoading={isLoadingHistory} />
      
      <footer className="text-center mt-12 py-6 border-t border-border">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Kinetic Tracker. Continue Pushing, Continue Pulling!</p>
      </footer>
    </div>
  );
}
