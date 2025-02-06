'use client';
import Slider from '@/components/Slider';
import { startTransition, useState } from 'react';

export function TodoOrdersSummaryItem({
  name,
  quantity,
  progress,
  onProgressChange
}: Readonly<{
  name: string;
  quantity: number;
  progress?: number;
  onProgressChange: (value: number) => Promise<void>;
}>) {
  const [_progress, setProgress] = useState(progress ?? 0);

  return (
    <div className="flex flex-col gap-1 rounded-md px-4 py-2 shadow-md">
      <div className="flex justify-between gap-2">
        <div className="font-bold">{name}</div>
        <div className="rounded-full bg-fuchsia-800/10 px-1">{quantity}</div>
      </div>
      <Slider
        min={0}
        value={_progress}
        max={quantity}
        onChange={(value) => {
          setProgress(() => value);
          startTransition(() => {
            onProgressChange(value).catch(console.error);
          });
        }}
      />
    </div>
  );
}
