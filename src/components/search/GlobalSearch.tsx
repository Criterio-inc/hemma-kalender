import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, X, Calendar, BookOpen, CheckSquare, StickyNote,
  Clock, ChevronRight, Loader2, Command
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

// Types for search results
interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'event' | 'recipe' | 'todo' | 'note';
  url: string;
  date?: string;
}

interface GlobalSearchProps {
  householdCode: string;
  events?: Array<{ id: string; title: string; start_date: string; event_category?: string }>;
  recipes?: Array<{ id: string; title: string; category?: string; created_at: string }>;
  todos?: Array<{ id: string; title: string; due_date?: string; completed?: boolean }>;
  notes?: Array<{ id: string; title?: string; content: string; event_id?: string; created_at: string }>;
}

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'global-search-recent';

export function GlobalSearch({ householdCode, events = [], recipes = [], todos = [], notes = [] }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(s => s !== term)].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    setIsSearching(true);
    const q = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search events
    events.forEach(event => {
      if (event.title.toLowerCase().includes(q)) {
        searchResults.push({
          id: event.id,
          title: event.title,
          subtitle: format(new Date(event.start_date), 'd MMMM yyyy', { locale: sv }),
          type: 'event',
          url: '/calendar',
          date: event.start_date,
        });
      }
    });

    // Search recipes
    recipes.forEach(recipe => {
      if (recipe.title.toLowerCase().includes(q)) {
        searchResults.push({
          id: recipe.id,
          title: recipe.title,
          subtitle: recipe.category,
          type: 'recipe',
          url: `/recipe/${recipe.id}`,
        });
      }
    });

    // Search todos
    todos.forEach(todo => {
      if (todo.title.toLowerCase().includes(q)) {
        searchResults.push({
          id: todo.id,
          title: todo.title,
          subtitle: todo.due_date 
            ? format(new Date(todo.due_date), 'd MMMM', { locale: sv })
            : todo.completed ? 'Klar' : 'Ej slutförd',
          type: 'todo',
          url: '/todos',
        });
      }
    });

    // Search notes
    notes.forEach(note => {
      const noteTitle = note.title || note.content.slice(0, 50);
      if (noteTitle.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) {
        searchResults.push({
          id: note.id,
          title: noteTitle,
          subtitle: 'Anteckning',
          type: 'note',
          url: note.event_id ? '/calendar' : '/calendar',
        });
      }
    });

    setIsSearching(false);
    return searchResults.slice(0, 10);
  }, [query, events, recipes, todos, notes]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          saveRecentSearch(query);
          navigate(results[selectedIndex].url);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [results, selectedIndex, query, navigate, saveRecentSearch]);

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    navigate(result.url);
    setIsOpen(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'event': return Calendar;
      case 'recipe': return BookOpen;
      case 'todo': return CheckSquare;
      case 'note': return StickyNote;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'event': return 'Händelse';
      case 'recipe': return 'Recept';
      case 'todo': return 'Uppgift';
      case 'note': return 'Anteckning';
    }
  };

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    });
    return groups;
  }, [results]);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Sök...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-0 gap-0 max-w-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Sök händelser, recept, uppgifter..."
              className="border-0 shadow-none focus-visible:ring-0 text-lg px-0"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground font-medium px-2 mb-2">Senaste sökningar</p>
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(term)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{term}</span>
                  </button>
                ))}
              </div>
            )}

            {query && results.length === 0 && !isSearching && (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Inga resultat för "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">Prova ett annat sökord</p>
              </div>
            )}

            {Object.entries(groupedResults).map(([type, items]) => {
              const Icon = getIcon(type as SearchResult['type']);
              return (
                <div key={type} className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium px-4 py-2">
                    {getTypeLabel(type as SearchResult['type'])}
                  </p>
                  {items.map((result) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                          globalIndex === selectedIndex ? "bg-primary/10" : "hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          type === 'event' && "bg-primary/10 text-primary",
                          type === 'recipe' && "bg-orange-500/10 text-orange-500",
                          type === 'todo' && "bg-green-500/10 text-green-500",
                          type === 'note' && "bg-yellow-500/10 text-yellow-500"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↓</kbd>
                navigera
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Enter</kbd>
                öppna
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd>
                stäng
              </span>
            </div>
            {results.length > 0 && (
              <span>{results.length} resultat</span>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GlobalSearch;
