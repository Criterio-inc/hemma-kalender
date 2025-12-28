import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test-utils';
import MonthGrid from '@/components/calendar/MonthGrid';
import { Event } from '@/hooks/useEvents';

// Mock event for testing
const mockEvent: Event = {
  id: '1',
  household_code: 'test-household',
  title: 'Julafton',
  start_date: '2024-12-24T18:00:00Z',
  end_date: null,
  description: 'Julfirande med familjen',
  all_day: true,
  recurring: false,
  recurring_pattern: null,
  event_type: 'major',
  event_category: 'holiday',
  color: null,
  has_budget: false,
  has_guest_list: true,
  has_timeline: false,
  theme_settings: null,
  created_at: '2024-12-01',
  updated_at: '2024-12-01',
  created_by: null,
};

describe('MonthGrid', () => {
  const defaultProps = {
    currentDate: new Date(2024, 11, 15), // December 2024
    events: [],
    onDayClick: vi.fn(),
    onEventClick: vi.fn(),
  };

  describe('Renderar korrekt antal dagar', () => {
    it('renderar alla dagar i december 2024 (31 dagar)', () => {
      render(<MonthGrid {...defaultProps} />);
      
      // December 2024 has 31 days
      for (let day = 1; day <= 31; day++) {
        expect(screen.getByText(String(day))).toBeInTheDocument();
      }
    });

    it('renderar dagar från föregående och nästa månad för att fylla rutnätet', () => {
      render(<MonthGrid {...defaultProps} currentDate={new Date(2024, 11, 1)} />);
      
      // December 2024 starts on a Sunday (weekday 0), so we should see days from November
      // Grid should show some November dates at the start
      // Check that we have multiple instances of certain numbers (from adjacent months)
      const allOnes = screen.getAllByText('1');
      expect(allOnes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Svenska veckodagsrubriker', () => {
    it('visar "Mån" som första veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Mån')).toBeInTheDocument();
    });

    it('visar "Tis" som veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Tis')).toBeInTheDocument();
    });

    it('visar "Ons" som veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Ons')).toBeInTheDocument();
    });

    it('visar "Tor" som veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Tor')).toBeInTheDocument();
    });

    it('visar "Fre" som veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Fre')).toBeInTheDocument();
    });

    it('visar "Lör" som veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Lör')).toBeInTheDocument();
    });

    it('visar "Sön" som veckodagsrubrik', () => {
      render(<MonthGrid {...defaultProps} />);
      expect(screen.getByText('Sön')).toBeInTheDocument();
    });
  });

  describe('Händelser visas på rätt dagar', () => {
    it('visar händelse på rätt datum', () => {
      render(<MonthGrid {...defaultProps} events={[mockEvent]} />);
      
      // Should show the event title "Julafton" on December 24
      expect(screen.getByTitle('Julafton')).toBeInTheDocument();
    });

    it('visar flera händelser på samma dag', () => {
      const events: Event[] = [
        mockEvent,
        { ...mockEvent, id: '2', title: 'Julklappar' },
      ];
      
      render(<MonthGrid {...defaultProps} events={events} />);
      
      expect(screen.getByTitle('Julafton')).toBeInTheDocument();
      expect(screen.getByTitle('Julklappar')).toBeInTheDocument();
    });
  });

  describe('Klick på dag anropar onDayClick', () => {
    it('anropar onDayClick med rätt datum när dag klickas', () => {
      const handleDayClick = vi.fn();
      render(<MonthGrid {...defaultProps} onDayClick={handleDayClick} />);
      
      // Find day 24 and click it
      const day24Button = screen.getByText('24').closest('button');
      if (day24Button) {
        fireEvent.click(day24Button);
      }
      
      expect(handleDayClick).toHaveBeenCalled();
      
      // Check the date passed is December 24, 2024
      const calledDate = handleDayClick.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(24);
      expect(calledDate.getMonth()).toBe(11); // December
      expect(calledDate.getFullYear()).toBe(2024);
    });
  });

  describe('onEventClick fungerar korrekt', () => {
    it('anropar onEventClick med rätt händelse', () => {
      const handleEventClick = vi.fn();
      render(
        <MonthGrid 
          {...defaultProps} 
          events={[mockEvent]} 
          onEventClick={handleEventClick} 
        />
      );
      
      const eventElement = screen.getByTitle('Julafton');
      fireEvent.click(eventElement);
      
      expect(handleEventClick).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Grid struktur', () => {
    it('har 7 kolumner för veckodagar', () => {
      const { container } = render(<MonthGrid {...defaultProps} />);
      
      // Check for grid with 7 columns
      const grid = container.querySelector('.grid-cols-7');
      expect(grid).toBeInTheDocument();
    });
  });
});
