
import { SidebarTrigger } from './ui/sidebar';

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-center relative">
        <div className="absolute left-0">
          <SidebarTrigger className="text-primary" />
        </div>
        <div className="text-center">
            <div className="flex items-center justify-center mb-2">
                <h1 className="text-4xl font-headline font-bold text-primary">TREINE</h1>
            </div>
            <p className="text-muted-foreground lowercase">log your push & pull workouts with ease.</p>
        </div>
    </header>
  );
}
