
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-center relative z-50">
        <div className="text-center">
            <div className="flex items-center justify-center mb-2">
                <h1 className="text-4xl font-headline font-bold text-primary">TREINE</h1>
            </div>
            <p className="text-muted-foreground lowercase">log your push & pull workouts with ease.</p>
        </div>
        <button
          onClick={onMenuToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-accent transition-colors"
          aria-label="toggle navigation menu"
        >
          <Menu className="h-8 w-8" />
        </button>
    </header>
  );
}
