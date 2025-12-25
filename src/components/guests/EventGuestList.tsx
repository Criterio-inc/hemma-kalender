import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  UserPlus,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useEventGuests,
  useAddGuest,
  useUpdateGuest,
  useDeleteGuest,
  Guest,
} from "@/hooks/useGuests";
import { toast } from "sonner";

interface EventGuestListProps {
  eventId: string;
  hasGuestList: boolean;
}

const rsvpStatuses = [
  { value: "pending", label: "Inväntar svar", color: "bg-yellow-500/20 text-yellow-700" },
  { value: "accepted", label: "Kommer", color: "bg-green-500/20 text-green-700" },
  { value: "declined", label: "Kommer inte", color: "bg-red-500/20 text-red-700" },
];

const EventGuestList = ({ eventId, hasGuestList }: EventGuestListProps) => {
  const { data: guests = [], isLoading } = useEventGuests(eventId);
  const addGuest = useAddGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRsvpStatus, setFormRsvpStatus] = useState("pending");
  const [formPlusOne, setFormPlusOne] = useState(false);
  const [formDietary, setFormDietary] = useState("");
  const [formNotes, setFormNotes] = useState("");

  if (!hasGuestList) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Gästlista är inte aktiverad för denna händelse</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Laddar gästlista...</div>;
  }

  const filteredGuests = filterStatus === "all"
    ? guests
    : guests.filter((g) => g.rsvp_status === filterStatus);

  const acceptedCount = guests.filter((g) => g.rsvp_status === "accepted").length;
  const declinedCount = guests.filter((g) => g.rsvp_status === "declined").length;
  const pendingCount = guests.filter((g) => g.rsvp_status === "pending").length;
  const plusOneCount = guests.filter((g) => g.plus_one && g.rsvp_status === "accepted").length;

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRsvpStatus("pending");
    setFormPlusOne(false);
    setFormDietary("");
    setFormNotes("");
  };

  const openAddForm = () => {
    resetForm();
    setEditingGuest(null);
    setIsFormOpen(true);
  };

  const openEditForm = (guest: Guest) => {
    setFormName(guest.name);
    setFormEmail(guest.email || "");
    setFormPhone(guest.phone || "");
    setFormRsvpStatus(guest.rsvp_status || "pending");
    setFormPlusOne(guest.plus_one);
    setFormDietary(guest.dietary_requirements || "");
    setFormNotes(guest.notes || "");
    setEditingGuest(guest);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error("Ange ett namn");
      return;
    }

    try {
      if (editingGuest) {
        await updateGuest.mutateAsync({
          id: editingGuest.id,
          eventId,
          updates: {
            name: formName.trim(),
            email: formEmail.trim() || null,
            phone: formPhone.trim() || null,
            rsvp_status: formRsvpStatus,
            plus_one: formPlusOne,
            dietary_requirements: formDietary.trim() || null,
            notes: formNotes.trim() || null,
          },
        });
        toast.success("Gäst uppdaterad!");
      } else {
        await addGuest.mutateAsync({
          eventId,
          name: formName.trim(),
          email: formEmail.trim() || undefined,
          phone: formPhone.trim() || undefined,
          rsvpStatus: formRsvpStatus,
          plusOne: formPlusOne,
          dietaryRequirements: formDietary.trim() || undefined,
          notes: formNotes.trim() || undefined,
        });
        toast.success("Gäst tillagd!");
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingGuest ? "Kunde inte uppdatera gäst" : "Kunde inte lägga till gäst");
    }
  };

  const handleDelete = async (guest: Guest) => {
    try {
      await deleteGuest.mutateAsync({ id: guest.id, eventId });
      toast.success("Gäst borttagen!");
    } catch (error) {
      toast.error("Kunde inte ta bort gäst");
    }
  };

  const exportToCSV = () => {
    const headers = ["Namn", "E-post", "Telefon", "RSVP", "+1", "Allergier", "Anteckningar"];
    const rows = guests.map((g) => [
      g.name,
      g.email || "",
      g.phone || "",
      rsvpStatuses.find((s) => s.value === g.rsvp_status)?.label || "Inväntar svar",
      g.plus_one ? "Ja" : "Nej",
      g.dietary_requirements || "",
      g.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gastlista.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Gästlista exporterad!");
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{guests.length}</p>
          <p className="text-xs text-muted-foreground">Totalt</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
          <p className="text-xs text-muted-foreground">Kommer</p>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{declinedCount}</p>
          <p className="text-xs text-muted-foreground">Nej</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Väntar</p>
        </div>
      </div>

      {plusOneCount > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          + {plusOneCount} medföljande = <strong>{acceptedCount + plusOneCount}</strong> totalt
        </p>
      )}

      {/* Actions bar */}
      <div className="flex items-center justify-between gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla gäster</SelectItem>
            {rsvpStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {guests.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          )}
          <Button size="sm" onClick={openAddForm}>
            <UserPlus className="w-4 h-4 mr-1" />
            Lägg till
          </Button>
        </div>
      </div>

      {/* Guest list */}
      {filteredGuests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>
            {filterStatus === "all"
              ? "Inga gäster ännu"
              : "Inga gäster med denna status"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGuests.map((guest) => {
            const statusInfo = rsvpStatuses.find((s) => s.value === guest.rsvp_status);
            return (
              <div
                key={guest.id}
                className="bg-card border rounded-lg p-3 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{guest.name}</p>
                    {guest.plus_one && (
                      <Badge variant="outline" className="text-xs">+1</Badge>
                    )}
                    <Badge className={`text-xs ${statusInfo?.color}`}>
                      {statusInfo?.label}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    {guest.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {guest.email}
                      </span>
                    )}
                    {guest.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {guest.phone}
                      </span>
                    )}
                  </div>
                  {guest.dietary_requirements && (
                    <p className="text-xs text-amber-600 mt-1">
                      🍽️ {guest.dietary_requirements}
                    </p>
                  )}
                  {guest.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {guest.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditForm(guest)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(guest)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Guest Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGuest ? "Redigera gäst" : "Lägg till gäst"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="guest-name">Namn *</Label>
              <Input
                id="guest-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Anna Andersson"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="guest-email">E-post</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="anna@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-phone">Telefon</Label>
                <Input
                  id="guest-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="070-123 45 67"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="guest-rsvp">RSVP Status</Label>
                <Select value={formRsvpStatus} onValueChange={setFormRsvpStatus}>
                  <SelectTrigger id="guest-rsvp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rsvpStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formPlusOne}
                    onCheckedChange={(checked) => setFormPlusOne(checked === true)}
                  />
                  <span className="text-sm">Har +1</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-dietary">Allergier/Kost</Label>
              <Input
                id="guest-dietary"
                value={formDietary}
                onChange={(e) => setFormDietary(e.target.value)}
                placeholder="T.ex. vegetarian, glutenfri, nötallergi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-notes">Anteckningar</Label>
              <Textarea
                id="guest-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Övrigt att tänka på..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                Avbryt
              </Button>
              <Button type="submit" disabled={addGuest.isPending || updateGuest.isPending}>
                {editingGuest ? "Spara" : "Lägg till"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventGuestList;
