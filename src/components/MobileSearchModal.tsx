import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSearchStore } from '@/stores/searchStore';

interface MobileSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
}

export function MobileSearchModal({ 
  open, 
  onOpenChange,
  placeholder = "Search..."
}: MobileSearchModalProps) {
  const { query, setQuery } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 translate-y-0 max-w-full h-auto min-h-50 rounded-none rounded-b-xl p-0 gap-0 max-sm:top-0 max-sm:bottom-auto max-sm:rounded-t-none max-sm:rounded-b-xl max-sm:data-[state=open]:slide-in-from-top">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 text-base p-0 h-auto"
          />
          {query && (
            <button 
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <div className="p-4">
          {query ? (
            <p className="text-sm text-muted-foreground">
              Filtering results for "<span className="font-medium text-foreground">{query}</span>"
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Type to search across the current view
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
