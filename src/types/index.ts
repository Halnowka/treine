export type WorkoutType = 'push' | 'pull';

export type SetData = {
  id: string; // unique id for the set
  reps: number;
  weight?: number; // Optional weight in kg
  notes?: string; // Optional notes for the set
};

export type ExerciseLogEntry = {
  exerciseId: string;
  exerciseName: string;
  sets: SetData[];
  notes?: string; // General notes for the exercise in this workout
};

export type CurrentWorkout = {
  type: WorkoutType | null;
  exercises: ExerciseLogEntry[];
};

export type SavedWorkout = {
  id: string; // unique id for the workout session
  date: string; // ISO string
  type: WorkoutType;
  exercises: ExerciseLogEntry[];
};

// For predefined exercise list
export type ExerciseDefinition = {
  id: string;
  name: string;
};
