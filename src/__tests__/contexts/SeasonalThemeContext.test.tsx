import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@/test-utils';
import { 
  SeasonalThemeProvider, 
  useSeasonalTheme, 
  getSeasonName 
} from '@/contexts/SeasonalThemeContext';

// Test component to access context
function TestComponent() {
  const { theme, month, seasonalClass, setEventTheme, isEventThemeActive, eventThemeClass } = useSeasonalTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="month">{month}</span>
      <span data-testid="seasonal-class">{seasonalClass}</span>
      <span data-testid="event-active">{isEventThemeActive ? 'true' : 'false'}</span>
      <span data-testid="event-class">{eventThemeClass || 'none'}</span>
      <button onClick={() => setEventTheme('christmas')}>Set Christmas</button>
      <button onClick={() => setEventTheme(null)}>Clear Theme</button>
    </div>
  );
}

describe('SeasonalThemeContext', () => {
  describe('getSeasonName - returnerar korrekta svenska namn för alla månader', () => {
    it('returnerar "Vintervit" för januari (månad 0)', () => {
      expect(getSeasonName(0)).toBe('Vintervit');
    });

    it('returnerar "Vintersport" för februari (månad 1)', () => {
      expect(getSeasonName(1)).toBe('Vintersport');
    });

    it('returnerar "Tidig Vår" för mars (månad 2)', () => {
      expect(getSeasonName(2)).toBe('Tidig Vår');
    });

    it('returnerar "Vårblomning" för april (månad 3)', () => {
      expect(getSeasonName(3)).toBe('Vårblomning');
    });

    it('returnerar "Grönska" för maj (månad 4)', () => {
      expect(getSeasonName(4)).toBe('Grönska');
    });

    it('returnerar "Sommar & Midsommar" för juni (månad 5)', () => {
      expect(getSeasonName(5)).toBe('Sommar & Midsommar');
    });

    it('returnerar "Högsommar" för juli (månad 6)', () => {
      expect(getSeasonName(6)).toBe('Högsommar');
    });

    it('returnerar "Sensommar" för augusti (månad 7)', () => {
      expect(getSeasonName(7)).toBe('Sensommar');
    });

    it('returnerar "Höstfärger" för september (månad 8)', () => {
      expect(getSeasonName(8)).toBe('Höstfärger');
    });

    it('returnerar "Höstlov" för oktober (månad 9)', () => {
      expect(getSeasonName(9)).toBe('Höstlov');
    });

    it('returnerar "Mörk Höst" för november (månad 10)', () => {
      expect(getSeasonName(10)).toBe('Mörk Höst');
    });

    it('returnerar "Advent & Jul" för december (månad 11)', () => {
      expect(getSeasonName(11)).toBe('Advent & Jul');
    });

    it('returnerar fallback för ogiltigt månadsvärde', () => {
      expect(getSeasonName(12)).toBe('Familjekalendern');
      expect(getSeasonName(-1)).toBe('Familjekalendern');
    });
  });

  describe('SeasonalThemeProvider - tema baserat på månad', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('sätter korrekt tema för december', () => {
      vi.setSystemTime(new Date(2024, 11, 25)); // December

      render(
        <SeasonalThemeProvider>
          <TestComponent />
        </SeasonalThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('jul');
      expect(screen.getByTestId('month').textContent).toBe('11');
      expect(screen.getByTestId('seasonal-class').textContent).toBe('season-jul');
    });

    it('sätter korrekt tema för juni', () => {
      vi.setSystemTime(new Date(2024, 5, 21)); // June

      render(
        <SeasonalThemeProvider>
          <TestComponent />
        </SeasonalThemeProvider>
      );

      expect(screen.getByTestId('theme').textContent).toBe('midsommar');
      expect(screen.getByTestId('seasonal-class').textContent).toBe('season-midsommar');
    });
  });

  describe('Event theme override - händelsetema åsidosätter säsongstema', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('aktiverar händelsetema när setEventTheme anropas', async () => {
      vi.setSystemTime(new Date(2024, 5, 21)); // June

      render(
        <SeasonalThemeProvider>
          <TestComponent />
        </SeasonalThemeProvider>
      );

      // Initialt är inget händelsetema aktivt
      expect(screen.getByTestId('event-active').textContent).toBe('false');
      expect(screen.getByTestId('event-class').textContent).toBe('none');

      // Sätt jultema
      await act(async () => {
        screen.getByText('Set Christmas').click();
      });

      expect(screen.getByTestId('event-active').textContent).toBe('true');
      expect(screen.getByTestId('event-class').textContent).toBe('event-christmas');
    });

    it('återställer till säsongstema när händelsetema rensas', async () => {
      vi.setSystemTime(new Date(2024, 5, 21)); // June

      render(
        <SeasonalThemeProvider>
          <TestComponent />
        </SeasonalThemeProvider>
      );

      // Sätt jultema
      await act(async () => {
        screen.getByText('Set Christmas').click();
      });

      expect(screen.getByTestId('event-active').textContent).toBe('true');

      // Rensa tema
      await act(async () => {
        screen.getByText('Clear Theme').click();
      });

      expect(screen.getByTestId('event-active').textContent).toBe('false');
      expect(screen.getByTestId('event-class').textContent).toBe('none');
    });
  });

  describe('useSeasonalTheme hook', () => {
    it('kastar fel om används utanför Provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useSeasonalTheme must be used within a SeasonalThemeProvider');

      consoleSpy.mockRestore();
    });
  });
});
