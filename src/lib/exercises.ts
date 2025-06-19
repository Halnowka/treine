import type { ExerciseDefinition } from '@/types';

export const PUSH_DAY_EXERCISES: ExerciseDefinition[] = [
  { id: 'bench_press', name: 'Bench Press' },
  { id: 'overhead_press', name: 'Overhead Press' },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown' },
  { id: 'lateral_raises', name: 'Lateral Raises' },
];

export const PULL_DAY_EXERCISES: ExerciseDefinition[] = [
  { id: 'pull_ups', name: 'Pull-ups / Lat Pulldown' },
  { id: 'barbell_row', name: 'Barbell Row / Dumbbell Row' },
  { id: 'face_pulls', name: 'Face Pulls' },
  { id: 'bicep_curls', name: 'Bicep Curls' },
  { id: 'shrugs', name: 'Shrugs' },
];
