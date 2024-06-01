'use client';
import React, { useEffect, useRef, useState } from 'react';

function LongPressButton({
  onLongPress,
  title,
  className,
  defaultHoldTime,
  bgColor,
  children
}: {
  onLongPress: Function;
  title?: string;
  className: string;
  defaultHoldTime?: number;
  bgColor?: string;
  children?: React.ReactNode;
}) {
  const timerId = useRef<any>();
  const [isPressed, setIsPressed] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const holdtime = defaultHoldTime ?? 3000;
  useEffect(() => {
    if (isPressed) {
      timerId.current = setInterval(() => {
        setHoldTime((holdTime) => {
          if (!timerId.current) {
            return holdTime;
          }
          if (holdTime >= holdtime) {
            clearInterval(timerId.current);
            timerId.current = null;
            setTimeout(() => {
              onLongPress();
            });
            // Call your action function
            setIsPressed(false);
            return 0;
          }
          return holdTime + 50;
        });
      }, 50);
    } else {
      clearInterval(timerId.current);
      setHoldTime(0);
    }
    return () => clearInterval(timerId.current);
  }, [isPressed, onLongPress]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <button
        className={'relative z-10 w-full'}
        onMouseDown={() => setIsPressed(true)}
        onMouseLeave={() => setIsPressed(false)}
        onMouseUp={() => setIsPressed(false)}>
        {title ?? children}
      </button>
      {isPressed && ( // Optional: Show progress bar only when pressed
        <div
          className={`left-0 absolute h-full top-0 rounded-md ${bgColor ? bgColor : 'bg-red-700/20'}`}
          style={{
            width: `${(holdTime / holdtime) * 100}%`,
            transition: 'width 0.05s ease-in-out' // Optional: Smooth animation
          }}
        />
      )}
    </div>
  );
}

export default LongPressButton;
