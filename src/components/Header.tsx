
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-4">
            <pre className="text-muted-foreground text-xs leading-tight select-none">
{`／l、
（ﾟ､ ｡ ７
  l  ~ヽ
  じしf_,)ノ`}
            </pre>
            <h1 className="text-4xl font-headline font-bold text-primary">TREINE</h1>
        </div>
        <button
          onClick={onMenuToggle}
          className="p-2 text-primary hover:text-accent transition-colors"
          aria-label="toggle navigation menu"
        >
          <Menu className="h-8 w-8" />
        </button>
    </header>
  );
}
