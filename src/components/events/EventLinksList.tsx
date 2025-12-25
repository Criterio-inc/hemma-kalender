import { useState } from "react";
import { Link2, Plus, ExternalLink, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Link,
  LinkInsert,
  LinkUpdate,
  useEventLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
} from "@/hooks/useLinks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventLinksListProps {
  eventId: string;
  householdCode: string;
}

const EventLinksList = ({ eventId, householdCode }: EventLinksListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [deletingLink, setDeletingLink] = useState<Link | null>(null);

  const { data: links = [], isLoading } = useEventLinks(eventId);
  const deleteLink = useDeleteLink();

  const handleDelete = async () => {
    if (!deletingLink) return;
    try {
      await deleteLink.mutateAsync(deletingLink.id);
      toast.success("Länk borttagen");
      setDeletingLink(null);
    } catch (error) {
      toast.error("Kunde inte ta bort länken");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-16 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Länkar</h4>
          <span className="text-sm text-muted-foreground">({links.length})</span>
        </div>
        <Button variant="hero" size="sm" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Ny
        </Button>
      </div>

      {/* Links list */}
      {links.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-xl">
          <Link2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-muted-foreground">Inga länkar</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Lägg till länk
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={() => { setEditingLink(link); setIsFormOpen(true); }}
              onDelete={() => setDeletingLink(link)}
            />
          ))}
        </div>
      )}

      {/* Link form */}
      <LinkForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingLink(null); }}
        householdCode={householdCode}
        eventId={eventId}
        link={editingLink}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingLink} onOpenChange={() => setDeletingLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort länk?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort "{deletingLink?.title}"?
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

// Link card component
const LinkCard = ({
  link,
  onEdit,
  onDelete,
}: {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Link2 className="w-5 h-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          {link.title}
          <ExternalLink className="w-3 h-3" />
        </a>
        {link.description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {link.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{getDomain(link.url)}</p>
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
  );
};

// Link form component
const LinkForm = ({
  isOpen,
  onClose,
  householdCode,
  eventId,
  link,
}: {
  isOpen: boolean;
  onClose: () => void;
  householdCode: string;
  eventId: string;
  link: Link | null;
}) => {
  const [title, setTitle] = useState(link?.title || "");
  const [url, setUrl] = useState(link?.url || "");
  const [description, setDescription] = useState(link?.description || "");

  const createLink = useCreateLink();
  const updateLink = useUpdateLink();

  // Reset form when link changes
  useState(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setDescription(link.description || "");
    } else {
      setTitle("");
      setUrl("");
      setDescription("");
    }
  });

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Ange en titel");
      return;
    }

    if (!url.trim() || !isValidUrl(url)) {
      toast.error("Ange en giltig URL (börja med https://)");
      return;
    }

    try {
      if (link) {
        const updates: LinkUpdate = {
          title: title.trim(),
          url: url.trim(),
          description: description.trim() || null,
        };
        await updateLink.mutateAsync({ id: link.id, updates });
        toast.success("Länk uppdaterad!");
      } else {
        const newLink: LinkInsert = {
          household_code: householdCode,
          event_id: eventId,
          title: title.trim(),
          url: url.trim(),
          description: description.trim() || null,
        };
        await createLink.mutateAsync(newLink);
        toast.success("Länk skapad!");
      }
      onClose();
    } catch (error) {
      toast.error("Något gick fel");
    }
  };

  const isPending = createLink.isPending || updateLink.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{link ? "Redigera länk" : "Ny länk"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-title">Titel *</Label>
            <Input
              id="link-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="T.ex. Julskyltning Stockholm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL *</Label>
            <Input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-description">Beskrivning (valfritt)</Label>
            <Textarea
              id="link-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kort beskrivning..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Avbryt
            </Button>
            <Button type="submit" variant="hero" disabled={isPending} className="flex-1">
              {isPending ? "Sparar..." : link ? "Spara" : "Skapa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventLinksList;
