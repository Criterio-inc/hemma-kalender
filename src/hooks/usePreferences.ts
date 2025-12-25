import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Preferences {
  notifications_enabled: boolean;
  default_reminder_times: number[];
  theme_auto: boolean;
  dark_mode: 'auto' | 'light' | 'dark';
  calendar_view: 'month' | 'week' | 'day';
  start_of_week: 0 | 1; // 0 = Sunday, 1 = Monday
  time_format: '12h' | '24h';
  date_format: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  default_event_duration: number;
  default_event_color: string | null;
  ai_enabled: boolean;
}

const defaultPreferences: Preferences = {
  notifications_enabled: true,
  default_reminder_times: [1440, 60],
  theme_auto: true,
  dark_mode: 'auto',
  calendar_view: 'month',
  start_of_week: 1,
  time_format: '24h',
  date_format: 'YYYY-MM-DD',
  default_event_duration: 60,
  default_event_color: null,
  ai_enabled: true,
};

const toJson = (obj: unknown): Json => JSON.parse(JSON.stringify(obj));

export const usePreferences = (householdCode: string) => {
  return useQuery({
    queryKey: ['preferences', householdCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('household_preferences')
        .select('*')
        .eq('household_code', householdCode)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create default preferences
        const { data: newData, error: insertError } = await supabase
          .from('household_preferences')
          .insert([{ household_code: householdCode, preferences: toJson(defaultPreferences) }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        const prefs = newData?.preferences as Record<string, unknown> | null;
        return { ...defaultPreferences, ...prefs } as Preferences;
      }
      
      const prefs = data.preferences as Record<string, unknown> | null;
      return { ...defaultPreferences, ...prefs } as Preferences;
    },
    enabled: !!householdCode,
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ householdCode, preferences }: { householdCode: string; preferences: Partial<Preferences> }) => {
      // First check if record exists
      const { data: existing } = await supabase
        .from('household_preferences')
        .select('preferences')
        .eq('household_code', householdCode)
        .maybeSingle();

      if (existing) {
        const existingPrefs = existing.preferences as Record<string, unknown> | null;
        const mergedPrefs = { ...existingPrefs, ...preferences };
        const { error } = await supabase
          .from('household_preferences')
          .update({ preferences: toJson(mergedPrefs) })
          .eq('household_code', householdCode);
        if (error) throw error;
      } else {
        const newPrefs = { ...defaultPreferences, ...preferences };
        const { error } = await supabase
          .from('household_preferences')
          .insert([{ household_code: householdCode, preferences: toJson(newPrefs) }]);
        if (error) throw error;
      }
    },
    onSuccess: (_, { householdCode }) => {
      queryClient.invalidateQueries({ queryKey: ['preferences', householdCode] });
    },
  });
};
