"use client";

import type { WorkoutType } from '@/types';
import { Button } from '@/components/ui/button';
import { Sparkle, Orbit } from 'lucide-react';

interface WorkoutDayToggleProps {
  selectedDay: WorkoutType | null;
  onSelectDay: (day: WorkoutType) => void;
}

export function WorkoutDayToggle({ selectedDay, onSelectDay }: WorkoutDayToggleProps) {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      <Button
        variant={selectedDay === 'push' ? 'default' : 'outline'}
        onClick={() => onSelectDay('push')}
        className={`px-6 py-3 text-lg rounded-lg transition-all duration-150 ease-in-out transform hover:scale-105 lowercase ${
          selectedDay === 'push' ? 'bg-primary text-primary-foreground shadow-lg' : 'border-primary text-primary hover:bg-accent hover:text-accent-foreground'
        }`}
        aria-pressed={selectedDay === 'push'}
      >
        <Sparkle className="mr-2 h-5 w-5" /> push day
      </Button>
      <Button
        variant={selectedDay === 'pull' ? 'default' : 'outline'}
        onClick={() => onSelectDay('pull')}
        className={`px-6 py-3 text-lg rounded-lg transition-all duration-150 ease-in-out transform hover:scale-105 lowercase ${
          selectedDay === 'pull' ? 'bg-primary text-primary-foreground shadow-lg' : 'border-primary text-primary hover:bg-accent hover:text-accent-foreground'
        }`}
        aria-pressed={selectedDay === 'pull'}
      >
        <Orbit className="mr-2 h-5 w-5" /> pull day
      </Button>
    </div>
  );
}
