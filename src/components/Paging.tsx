import { WheelEvent } from 'react';

export function Paging({
  defaultValue,
  max,
  onChange
}: {
  defaultValue?: number;
  max: number;
  onChange: (page: number) => void;
}) {
  // Event handler for the wheel event
  const handleWheel = (event: WheelEvent<HTMLInputElement>) => {
    (event.target as HTMLInputElement).blur();
  };

  return (
    <div className={'flex gap-2 mx-auto'}>
      <div>
        <button
          onClick={(e) => {
            if ((defaultValue ?? 0) > 1) {
              onChange(Number((defaultValue ?? 0) - 1));
            }
          }}
          className={'bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded-md font-bold'}>
          prev
        </button>
      </div>
      <div className={'flex gap-2'}>
        <input
          onWheel={handleWheel}
          onChange={(e) => {
            onChange(Number(e.target.value));
          }}
          className={`w-16 text-center rounded-md`}
          type="number"
          max={max}
          min={1}
          value={defaultValue ?? 1}
        />
        <div className={'my-auto'}>of {max}</div>
      </div>
      <div>
        <button
          onClick={(e) => {
            if ((defaultValue ?? 0) < max) {
              onChange(Number((defaultValue ?? 0) + 1));
            }
          }}
          className={'bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded-md font-bold'}>
          next
        </button>
      </div>
    </div>
  );
}
