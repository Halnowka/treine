
"use client";

import { Button } from '@/components/ui/button';
import { Orbit, CalendarCheck2, TrendingUp, Dumbbell } from 'lucide-react';

type View = 'workout' | 'history' | 'calendar' | 'evolution';

interface ViewSwitcherProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export function ViewSwitcher({ activeView, setActiveView }: ViewSwitcherProps) {
  const views: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'workout', label: 'workout', icon: <Dumbbell className="h-5 w-5" /> },
    { id: 'history', label: 'history', icon: <Orbit className="h-5 w-5" /> },
    { id: 'calendar', label: 'calendar', icon: <CalendarCheck2 className="h-5 w-5" /> },
    { id: 'evolution', label: 'evolution', icon: <TrendingUp className="h-5 w-5" /> },
  ];

  return (
    <div className="flex justify-center flex-wrap gap-2 my-8">
      {views.map((view) => (
        <Button
          key={view.id}
          variant={activeView === view.id ? 'default' : 'outline'}
          onClick={() => setActiveView(view.id)}
          className={`px-4 py-2 text-base rounded-lg transition-all duration-150 ease-in-out transform hover:scale-105 lowercase ${
            activeView === view.id ? 'bg-primary text-primary-foreground shadow-lg' : 'border-primary text-primary hover:bg-accent hover:text-accent-foreground'
          }`}
          aria-pressed={activeView === view.id}
        >
          {view.icon}
          <span className="ml-2">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
