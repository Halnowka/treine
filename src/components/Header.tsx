import { BarChartBig } from 'lucide-react';

export function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center mb-2">
        <BarChartBig className="w-10 h-10 text-primary mr-3" />
        <h1 className="text-4xl font-headline font-bold text-primary">Kinetic Tracker</h1>
      </div>
      <p className="text-muted-foreground">Log your push & pull workouts with ease.</p>
    </header>
  );
}
