import { forwardRef } from 'react';
import type { InputHTMLAttributes, ChangeEvent } from 'react';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className = '', ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onValueChange([Number(e.target.value)]);
    };

    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div className={`relative w-full ${className}`}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="slider-input w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-coral)] focus:ring-offset-2"
          style={{
            background: `linear-gradient(to right, var(--brand-coral) 0%, var(--brand-coral) ${percentage}%, var(--muted) ${percentage}%, var(--muted) 100%)`,
          }}
          {...props}
        />
        <style>{`
          .slider-input::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--brand-coral);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .slider-input::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--brand-coral);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
