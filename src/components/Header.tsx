
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="mb-8 grid grid-cols-3 items-center relative z-50">
        <pre className="text-muted-foreground text-xs leading-tight select-none justify-self-start">
{` l、
（ﾟ､ ｡ ７
  l  ~ヽ
  じしf_,)ノ`}
        </pre>
        
        <h1 className="text-4xl font-headline font-bold text-primary justify-self-center">TREINE</h1>
        
        <button
          onClick={onMenuToggle}
          className="p-2 text-primary hover:text-accent transition-colors justify-self-end"
          aria-label="toggle navigation menu"
        >
          <Menu className="h-8 w-8" />
        </button>
    </header>
  );
}
