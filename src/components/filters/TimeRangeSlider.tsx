import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface TimeRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export function TimeRangeSlider({
  value,
  onChange,
  min = 0,
  max = 180,
  step = 5,
  label,
  unit = "min",
  className,
}: TimeRangeSliderProps) {
  const formatValue = (val: number) => {
    if (val >= 60) {
      const hours = Math.floor(val / 60);
      const minutes = val % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${val} ${unit}`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">
            {formatValue(value[0])} - {formatValue(value[1])}
          </span>
        </div>
      )}
      <Slider
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}

export default TimeRangeSlider;
