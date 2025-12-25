import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  household_code: string;
  event_id: string | null;
  todo_id: string | null;
  notification_type: string;
  message: string;
  scheduled_for: string | null;
  sent: boolean;
  sent_at: string | null;
  read: boolean;
  created_at: string;
}

export const useNotifications = (householdCode: string) => {
  return useQuery({
    queryKey: ['notifications', householdCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('household_code', householdCode)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!householdCode,
  });
};

export const useUnreadNotificationCount = (householdCode: string) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count', householdCode],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('household_code', householdCode)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!householdCode,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (householdCode: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('household_code', householdCode)
        .eq('read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
