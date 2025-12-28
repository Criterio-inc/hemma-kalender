import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@/test-utils';
import { useEvents, useEventsForDate, useEventsForWeek } from '@/hooks/useEvents';
import { QueryWrapper } from '@/test-utils';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockEvents = [
  {
    id: '1',
    household_code: 'test-household',
    title: 'Möte',
    start_date: '2024-12-15T10:00:00Z',
    end_date: null,
    description: null,
    all_day: false,
    recurring: false,
    recurring_pattern: null,
    event_type: 'simple',
    event_category: 'appointment',
    color: null,
    has_budget: false,
    has_guest_list: false,
    has_timeline: false,
    theme_settings: null,
    created_at: '2024-12-01',
    updated_at: '2024-12-01',
    created_by: null,
  },
  {
    id: '2',
    household_code: 'test-household',
    title: 'Julafton',
    start_date: '2024-12-24T18:00:00Z',
    end_date: null,
    description: 'Julfirande',
    all_day: true,
    recurring: false,
    recurring_pattern: null,
    event_type: 'major',
    event_category: 'holiday',
    color: null,
    has_budget: true,
    has_guest_list: true,
    has_timeline: true,
    theme_settings: null,
    created_at: '2024-12-01',
    updated_at: '2024-12-01',
    created_by: null,
  },
];

describe('useEvents hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Returnerar händelser för hushåll', () => {
    it('hämtar händelser för ett hushåll', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockGte = vi.fn().mockReturnThis();
      const mockLt = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        lt: mockLt,
        order: mockOrder,
      } as any);

      const { result } = renderHook(
        () => useEvents('test-household', new Date(2024, 11, 15)),
        { wrapper: QueryWrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEvents);
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('returnerar tom array om inga händelser finns', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      } as any);

      const { result } = renderHook(
        () => useEvents('test-household', new Date(2024, 11, 15)),
        { wrapper: QueryWrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('Loading state', () => {
    it('visar loading state initialt', () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnValue(new Promise(() => {})), // Never resolves
      } as any);

      const { result } = renderHook(
        () => useEvents('test-household', new Date(2024, 11, 15)),
        { wrapper: QueryWrapper }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Error state', () => {
    it('hanterar fel korrekt', async () => {
      const mockError = new Error('Database error');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      } as any);

      const { result } = renderHook(
        () => useEvents('test-household', new Date(2024, 11, 15)),
        { wrapper: QueryWrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Query är inaktiverad när householdCode saknas', () => {
    it('gör inte förfrågan om householdCode är tom', () => {
      renderHook(
        () => useEvents('', new Date(2024, 11, 15)),
        { wrapper: QueryWrapper }
      );

      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});

describe('useEventsForDate hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hämtar händelser för ett specifikt datum', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [mockEvents[0]],
        error: null,
      }),
    } as any);

    const { result } = renderHook(
      () => useEventsForDate('test-household', new Date(2024, 11, 15)),
      { wrapper: QueryWrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([mockEvents[0]]);
  });
});

describe('useEventsForWeek hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hämtar händelser för en vecka', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockEvents,
        error: null,
      }),
    } as any);

    const { result } = renderHook(
      () => useEventsForWeek('test-household', new Date(2024, 11, 15)),
      { wrapper: QueryWrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEvents);
  });
});
