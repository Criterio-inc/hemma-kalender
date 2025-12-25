import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import {
  CheckCircle2,
  Plus,
  Image,
  StickyNote,
  BookOpen,
  Link2,
  Users,
  Activity,
} from "lucide-react";
import { useActivityLog } from "@/hooks/useSharing";
import { cn } from "@/lib/utils";

interface ActivityLogProps {
  eventId: string;
}

const actionIcons: Record<string, any> = {
  completed: CheckCircle2,
  created: Plus,
  added: Plus,
};

const entityIcons: Record<string, any> = {
  todo: CheckCircle2,
  note: StickyNote,
  recipe: BookOpen,
  image: Image,
  link: Link2,
  guest: Users,
};

const actionLabels: Record<string, string> = {
  completed: "slutförde",
  created: "skapade",
  added: "lade till",
  updated: "uppdaterade",
  deleted: "tog bort",
};

const entityLabels: Record<string, string> = {
  todo: "uppgiften",
  note: "anteckningen",
  recipe: "receptet",
  image: "bilden",
  link: "länken",
  guest: "gästen",
};

const ActivityLog = ({ eventId }: ActivityLogProps) => {
  const { data: activities = [], isLoading } = useActivityLog(eventId);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Laddar aktivitet...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Ingen aktivitet ännu</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Senaste aktivitet
      </h4>
      <div className="space-y-2">
        {activities.map((activity: any) => {
          const EntityIcon = entityIcons[activity.entity_type] || Activity;
          const actionLabel = actionLabels[activity.action_type] || activity.action_type;
          const entityLabel = entityLabels[activity.entity_type] || activity.entity_type;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm"
            >
              <div className="p-1.5 rounded-full bg-primary/10">
                <EntityIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p>
                  <span className="font-medium">{activity.actor_name || "Någon"}</span>
                  {" "}
                  <span className="text-muted-foreground">{actionLabel}</span>
                  {" "}
                  <span className="text-muted-foreground">{entityLabel}</span>
                  {activity.entity_title && (
                    <>
                      {" "}
                      <span className="font-medium">"{activity.entity_title}"</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                    locale: sv,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
