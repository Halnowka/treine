"use client";

import * as React from 'react';
import type { SavedWorkout } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { parseISO } from 'date-fns';
import { CalendarCheck2 } from 'lucide-react';

interface WorkoutCalendarProps {
  savedWorkouts: SavedWorkout[];
}

export function WorkoutCalendar({ savedWorkouts }: WorkoutCalendarProps) {
  const [month, setMonth] = React.useState(new Date());

  const workoutDays = React.useMemo(() => {
    const pushDays: Date[] = [];
    const pullDays: Date[] = [];

    // Use a Set to track dates that have already been marked, to avoid duplicates if multiple workouts on the same day
    const markedDates = new Set<string>();

    // We iterate backwards to ensure the MOST RECENT workout type for a given day is used for coloring
    for (let i = savedWorkouts.length - 1; i >= 0; i--) {
        const workout = savedWorkouts[i];
        const workoutDate = parseISO(workout.date);
        const dateString = workoutDate.toDateString();

        if (!markedDates.has(dateString)) {
            if (workout.type === 'push') {
                pushDays.push(workoutDate);
            } else if (workout.type === 'pull') {
                pullDays.push(workoutDate);
            }
            markedDates.add(dateString);
        }
    }
    
    return { push: pushDays, pull: pullDays };
  }, [savedWorkouts]);

  if (savedWorkouts.length < 1) {
    return null;
  }

  return (
    <div className="mt-10">
      <h3 className="text-3xl font-headline text-primary mb-6 text-center flex items-center justify-center lowercase">
        <CalendarCheck2 className="mr-3 h-8 w-8" /> workout calendar
      </h3>
      <Card className="bg-card text-card-foreground border-border shadow-md">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <Calendar
            month={month}
            onMonthChange={setMonth}
            modifiers={{
              push: workoutDays.push,
              pull: workoutDays.pull,
            }}
            modifiersClassNames={{
              push: 'day-push',
              pull: 'day-pull',
            }}
            className="rounded-md border"
          />
          <div className="flex flex-row md:flex-col gap-4 self-center">
            <h4 className="text-lg font-semibold text-primary lowercase sr-only md:not-sr-only">legend</h4>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm bg-primary/30" />
              <span className="text-sm text-muted-foreground lowercase">push day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-sm bg-accent/30" />
              <span className="text-sm text-muted-foreground lowercase">pull day</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
