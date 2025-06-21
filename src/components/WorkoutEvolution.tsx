
"use client";

import * as React from 'react';
import type { SavedWorkout } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

    return savedWorkouts
      .map(workout => {
        const exerciseLog = workout.exercises.find(ex => ex.exerciseName === selectedExercise);
        if (!exerciseLog) return null;

        const totalReps = exerciseLog.sets.reduce((sum, set) => sum + set.reps, 0);
        return {
          date: workout.date,
          totalReps,
        };
      })
      .filter((item): item is ChartData => item !== null && item.totalReps > 0)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map(item => ({
        ...item,
        date: format(parseISO(item.date), "d MMM", { locale: ptBR }),
      }));
  }, [selectedExercise, savedWorkouts]);

  if (savedWorkouts.length === 0 || uniqueExercises.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h3 className="text-3xl font-headline text-primary mb-6 text-center flex items-center justify-center lowercase">
        <TrendingUp className="mr-3 h-8 w-8" /> análise de evolução
      </h3>
      <Card className="bg-card text-card-foreground border-border shadow-md">
        <CardHeader>
          <CardTitle className="lowercase">veja seu progresso</CardTitle>
          <CardDescription className="lowercase">
            selecione um exercício para visualizar sua evolução no total de repetições ao longo do tempo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select onValueChange={setSelectedExercise} value={selectedExercise ?? ''}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="selecione um exercício" />
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
                    left: 12,
                    right: 12,
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
                        formatter={(value, name) => [`${value} reps`, 'Total']}
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
                    ? "você precisa de pelo menos dois treinos com este exercício para ver um gráfico."
                    : "selecione um exercício para começar a análise."
                  }
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
