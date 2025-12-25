import { useState } from "react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Share2,
  Copy,
  Check,
  Trash2,
  Link,
  Eye,
  Edit,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useEventShares,
  useCreateEventShare,
  useDeleteEventShare,
} from "@/hooks/useSharing";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const expirationOptions = [
  { value: "1d", label: "1 dag" },
  { value: "1w", label: "1 vecka" },
  { value: "1m", label: "1 månad" },
  { value: "never", label: "Aldrig" },
];

const ShareEventModal = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: ShareEventModalProps) => {
  const [accessLevel, setAccessLevel] = useState<"view" | "edit">("view");
  const [expiration, setExpiration] = useState("1w");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: shares = [], isLoading } = useEventShares(eventId);
  const createShare = useCreateEventShare();
  const deleteShare = useDeleteEventShare();

  const getExpirationDate = (value: string): Date | null => {
    const now = new Date();
    switch (value) {
      case "1d":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "1w":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "1m":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  };

  const handleCreateShare = async () => {
    try {
      const share = await createShare.mutateAsync({
        eventId,
        accessLevel,
        expiresAt: getExpirationDate(expiration),
        recipientEmail: recipientEmail.trim() || undefined,
      });

      const shareUrl = `${window.location.origin}/shared/${share.share_token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Delningslänk skapad och kopierad!");
      setRecipientEmail("");
    } catch (error) {
      toast.error("Kunde inte skapa delningslänk");
    }
  };

  const handleCopyLink = async (token: string, id: string) => {
    const shareUrl = `${window.location.origin}/shared/${token}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedId(id);
    toast.success("Länk kopierad!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteShare = async (id: string) => {
    try {
      await deleteShare.mutateAsync({ id, eventId });
      toast.success("Delningslänk borttagen");
    } catch (error) {
      toast.error("Kunde inte ta bort länken");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Dela händelse
          </DialogTitle>
          <DialogDescription>
            Dela "{eventTitle}" med andra
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create new share */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
            <h4 className="font-semibold text-sm">Skapa ny delningslänk</h4>

            {/* Access level */}
            <div className="space-y-2">
              <Label>Åtkomstnivå</Label>
              <RadioGroup
                value={accessLevel}
                onValueChange={(v) => setAccessLevel(v as "view" | "edit")}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view" className="font-normal flex items-center gap-1 cursor-pointer">
                    <Eye className="w-4 h-4" />
                    Endast visa
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit" className="font-normal flex items-center gap-1 cursor-pointer">
                    <Edit className="w-4 h-4" />
                    Kan redigera
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label>Giltighetstid</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {expirationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional email */}
            <div className="space-y-2">
              <Label htmlFor="email">Mottagarens e-post (valfritt)</Label>
              <Input
                id="email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="namn@exempel.se"
              />
            </div>

            <Button
              onClick={handleCreateShare}
              disabled={createShare.isPending}
              className="w-full"
            >
              {createShare.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link className="w-4 h-4 mr-2" />
              )}
              Skapa och kopiera länk
            </Button>
          </div>

          {/* Existing shares */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Aktiva delningslänkar</h4>
              <div className="space-y-2">
                {shares.map((share) => {
                  const isExpired = share.expires_at && new Date(share.expires_at) < new Date();
                  return (
                    <div
                      key={share.id}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border",
                        isExpired ? "bg-muted/30 opacity-60" : "bg-background"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {share.access_level === "view" ? (
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <Edit className="w-3.5 h-3.5 text-primary" />
                          )}
                          <span className="text-sm font-medium">
                            {share.access_level === "view" ? "Visa" : "Redigera"}
                          </span>
                          {isExpired && (
                            <span className="text-xs text-destructive">Utgången</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {share.recipient_email && (
                            <span>{share.recipient_email}</span>
                          )}
                          {share.expires_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(share.expires_at), "d MMM", { locale: sv })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyLink(share.share_token, share.id)}
                        className="h-8 w-8"
                      >
                        {copiedId === share.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteShare(share.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareEventModal;
