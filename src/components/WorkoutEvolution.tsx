
"use client";

import * as React from 'react';
import type { SavedWorkout } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { parseISO, format } from 'date-fns';
import { TrendingUp, BarChart } from 'lucide-react';

interface WorkoutEvolutionProps {
  savedWorkouts: SavedWorkout[];
}

type ChartData = {
  date: string;
  totalReps: number;
};

const chartConfig = {
  totalReps: {
    label: "Total Reps",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function WorkoutEvolution({ savedWorkouts }: WorkoutEvolutionProps) {
  const [selectedExercise, setSelectedExercise] = React.useState<string | null>(null);

  const uniqueExercises = React.useMemo(() => {
    const exerciseSet = new Set<string>();
    savedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseSet.add(exercise.exerciseName);
      });
    });
    return Array.from(exerciseSet).sort();
  }, [savedWorkouts]);

  const evolutionData = React.useMemo(() => {
    if (!selectedExercise) return [];
    // The `savedWorkouts` prop is sorted descending by date, so we reverse it for chronological order.
    return savedWorkouts
      .filter(workout => 
        workout.exercises.some(ex => ex.exerciseName === selectedExercise && ex.sets.length > 0)
      )
      .map(workout => {
        const exerciseLog = workout.exercises.find(ex => ex.exerciseName === selectedExercise)!;
        const totalReps = exerciseLog.sets.reduce((sum, set) => sum + set.reps, 0);
        return {
          date: format(parseISO(workout.date), "d MMM"),
          totalReps: totalReps,
        };
      })
      .reverse();
  }, [selectedExercise, savedWorkouts]);


  if (savedWorkouts.length === 0 || uniqueExercises.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h3 className="text-3xl font-headline text-primary mb-6 text-center flex items-center justify-center lowercase">
        <TrendingUp className="mr-3 h-8 w-8" /> workout evolution
      </h3>
      <Card className="bg-card text-card-foreground border-border shadow-md">
        <CardContent className="p-6 space-y-6">
          <Select onValueChange={setSelectedExercise} value={selectedExercise ?? ''}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {uniqueExercises.map(ex => (
                <SelectItem key={ex} value={ex} className="lowercase">
                  {ex}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedExercise && evolutionData.length > 1 ? (
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={evolutionData}
                  margin={{
                    left: 0,
                    right: 30,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tickMargin={8}
                    domain={['dataMin - 5', 'auto']}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        indicator="dot" 
                        formatter={(value) => [`${value} reps`, 'Total']}
                    />}
                  />
                  <Area
                    dataKey="totalReps"
                    type="natural"
                    fill="var(--color-totalReps)"
                    fillOpacity={0.4}
                    stroke="var(--color-totalReps)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-center bg-muted/50 rounded-lg">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground lowercase">
                  {selectedExercise 
                    ? "you need at least two workouts with this exercise to see a chart."
                    : "select an exercise to start the analysis."
                  }
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
