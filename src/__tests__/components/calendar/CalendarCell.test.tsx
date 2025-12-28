import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test-utils';
import CalendarCell from '@/components/calendar/CalendarCell';
import { Event } from '@/hooks/useEvents';

// Mock events for testing
const mockEvents: Event[] = [
  {
    id: '1',
    household_code: 'test-household',
    title: 'Födelsedag',
    start_date: '2024-12-15T10:00:00Z',
    end_date: null,
    description: 'Karins födelsedag',
    all_day: true,
    recurring: false,
    recurring_pattern: null,
    event_type: 'simple',
    event_category: 'birthday',
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
    title: 'Möte',
    start_date: '2024-12-15T14:00:00Z',
    end_date: null,
    description: null,
    all_day: false,
    recurring: false,
    recurring_pattern: null,
    event_type: 'simple',
    event_category: 'appointment',
    color: '#3b82f6',
    has_budget: false,
    has_guest_list: false,
    has_timeline: false,
    theme_settings: null,
    created_at: '2024-12-01',
    updated_at: '2024-12-01',
    created_by: null,
  },
];

describe('CalendarCell', () => {
  const defaultProps = {
    day: new Date(2024, 11, 15), // December 15, 2024
    isCurrentMonth: true,
    isToday: false,
    isWeekend: false,
    events: [],
    onClick: vi.fn(),
    onEventClick: vi.fn(),
  };

  describe('Renderar dagnummer korrekt', () => {
    it('visar rätt dagnummer', () => {
      render(<CalendarCell {...defaultProps} />);
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('visar dagnummer 1 för första dagen i månaden', () => {
      render(<CalendarCell {...defaultProps} day={new Date(2024, 11, 1)} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('visar dagnummer 31 för sista dagen i december', () => {
      render(<CalendarCell {...defaultProps} day={new Date(2024, 11, 31)} />);
      expect(screen.getByText('31')).toBeInTheDocument();
    });
  });

  describe('Visar händelseindikatorer när händelser finns', () => {
    it('visar händelseindikatorer för en händelse', () => {
      render(<CalendarCell {...defaultProps} events={[mockEvents[0]]} />);
      
      // Should show event dot with title attribute
      const eventButton = screen.getByTitle('Födelsedag');
      expect(eventButton).toBeInTheDocument();
    });

    it('visar flera händelseindikatorer', () => {
      render(<CalendarCell {...defaultProps} events={mockEvents} />);
      
      expect(screen.getByTitle('Födelsedag')).toBeInTheDocument();
      expect(screen.getByTitle('Möte')).toBeInTheDocument();
    });

    it('visar "+X mer" när det finns fler än 2 händelser på desktop', () => {
      const manyEvents = [
        ...mockEvents,
        { ...mockEvents[0], id: '3', title: 'Händelse 3' },
      ];
      
      render(<CalendarCell {...defaultProps} events={manyEvents} />);
      
      // Should show "+1 mer" text
      expect(screen.getByText('+1 mer')).toBeInTheDocument();
    });
  });

  describe('onClick callback aktiveras', () => {
    it('anropar onClick när cellen klickas', () => {
      const handleClick = vi.fn();
      render(<CalendarCell {...defaultProps} onClick={handleClick} />);
      
      const cell = screen.getByRole('button', { name: /15/i });
      fireEvent.click(cell);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('anropar onEventClick när händelse klickas', () => {
      const handleEventClick = vi.fn();
      render(
        <CalendarCell 
          {...defaultProps} 
          events={[mockEvents[0]]} 
          onEventClick={handleEventClick} 
        />
      );
      
      const eventButton = screen.getByTitle('Födelsedag');
      fireEvent.click(eventButton);
      
      expect(handleEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('stoppar propagation när händelse klickas (onClick ska inte anropas)', () => {
      const handleClick = vi.fn();
      const handleEventClick = vi.fn();
      render(
        <CalendarCell 
          {...defaultProps} 
          events={[mockEvents[0]]} 
          onClick={handleClick}
          onEventClick={handleEventClick} 
        />
      );
      
      const eventButton = screen.getByTitle('Födelsedag');
      fireEvent.click(eventButton);
      
      expect(handleEventClick).toHaveBeenCalledTimes(1);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('isToday styling appliceras korrekt', () => {
    it('har rätt klass när isToday är true', () => {
      render(<CalendarCell {...defaultProps} isToday={true} />);
      
      const dayNumber = screen.getByText('15');
      expect(dayNumber).toHaveClass('bg-primary');
      expect(dayNumber).toHaveClass('text-primary-foreground');
    });

    it('har inte today-styling när isToday är false', () => {
      render(<CalendarCell {...defaultProps} isToday={false} />);
      
      const dayNumber = screen.getByText('15');
      expect(dayNumber).not.toHaveClass('bg-primary');
    });
  });

  describe('Styling för helg och annan månad', () => {
    it('applicerar helgstyling när isWeekend är true', () => {
      render(<CalendarCell {...defaultProps} isWeekend={true} />);
      
      const dayNumber = screen.getByText('15');
      expect(dayNumber).toHaveClass('text-accent');
    });

    it('applicerar annan-månad styling när isCurrentMonth är false', () => {
      render(<CalendarCell {...defaultProps} isCurrentMonth={false} />);
      
      const dayNumber = screen.getByText('15');
      expect(dayNumber).toHaveClass('text-muted-foreground/50');
    });
  });
});
