import { useState } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { StickyNote, Plus, Edit2, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Note,
  NoteInsert,
  NoteUpdate,
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "@/hooks/useNotes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventNotesListProps {
  eventId: string;
  householdCode: string;
}

const noteTypes = [
  { value: "general", label: "Allmänt", color: "bg-muted" },
  { value: "tradition", label: "Tradition", color: "bg-primary/20" },
  { value: "idea", label: "Idé", color: "bg-accent/20" },
  { value: "memory", label: "Minne", color: "bg-success/20" },
];

const EventNotesList = ({ eventId, householdCode }: EventNotesListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const { data: notes = [], isLoading } = useNotes(householdCode, eventId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const handleDelete = async () => {
    if (!deletingNote) return;
    try {
      await deleteNote.mutateAsync(deletingNote.id);
      toast.success("Anteckning borttagen");
      setDeletingNote(null);
    } catch (error) {
      toast.error("Kunde inte ta bort anteckningen");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Anteckningar</h4>
          <span className="text-sm text-muted-foreground">({notes.length})</span>
        </div>
        <Button variant="hero" size="sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Ny
        </Button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <StickyNote className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Inga anteckningar</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till anteckning
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => { setEditingNote(note); setIsFormOpen(true); }}
              onDelete={() => setDeletingNote(note)}
            />
          ))}
        </div>
      )}

      {/* Note form */}
      <NoteForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingNote(null); }}
        householdCode={householdCode}
        eventId={eventId}
        note={editingNote}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingNote} onOpenChange={() => setDeletingNote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort anteckning?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort denna anteckning?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Note card component
const NoteCard = ({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const typeConfig = noteTypes.find((t) => t.value === note.note_type) || noteTypes[0];

  return (
    <div className="group bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2", typeConfig.color)}>
            {typeConfig.label}
          </span>

          {/* Title */}
          {note.title && (
            <h5 className="font-semibold text-foreground mb-1">{note.title}</h5>
          )}

          {/* Content */}
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
            {note.content}
          </p>

          {/* Tags & date */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {note.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">
              {format(new Date(note.created_at), "d MMM yyyy", { locale: sv })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Note form component
const NoteForm = ({
  isOpen,
  onClose,
  householdCode,
  eventId,
  note,
}: {
  isOpen: boolean;
  onClose: () => void;
  householdCode: string;
  eventId: string;
  note: Note | null;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  // Reset form when note changes
  useState(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content);
      setNoteType(note.note_type || "general");
      setTags(note.tags || []);
    } else {
      setTitle("");
      setContent("");
      setNoteType("general");
      setTags([]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Ange innehåll");
      return;
    }

    try {
      if (note) {
        const updates: NoteUpdate = {
          title: title.trim() || null,
          content: content.trim(),
          note_type: noteType,
          tags: tags.length ? tags : null,
        };
        await updateNote.mutateAsync({ id: note.id, updates });
        toast.success("Anteckning uppdaterad!");
      } else {
        const newNote: NoteInsert = {
          household_code: householdCode,
          event_id: eventId,
          title: title.trim() || null,
          content: content.trim(),
          note_type: noteType,
          tags: tags.length ? tags : null,
        };
        await createNote.mutateAsync(newNote);
        toast.success("Anteckning skapad!");
      }
      onClose();
    } catch (error) {
      toast.error("Något gick fel");
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const isPending = createNote.isPending || updateNote.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{note ? "Redigera anteckning" : "Ny anteckning"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-title">Titel (valfritt)</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Julens traditioner"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Innehåll *</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Skriv din anteckning..."
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Typ</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {noteTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Taggar</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Lägg till tagg..."
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Tag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Avbryt
            </Button>
            <Button type="submit" variant="hero" disabled={isPending} className="flex-1">
              {isPending ? "Sparar..." : note ? "Spara" : "Skapa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventNotesList;
