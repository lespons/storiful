'use client';
import { CheckIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({ min, max, value, onChange }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative flex items-center justify-between gap-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, #22c55e ${percentage}%, #d1d5db ${percentage}%)`
        }}
        className="h-2 w-full cursor-pointer appearance-none rounded-full"
      />
      <div className="size-5 text-center">
        <span>{value === max ? <CheckIcon className="size-5 text-green-600" /> : value}</span>
      </div>
    </div>
  );
};

export default Slider;
