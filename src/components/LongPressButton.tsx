'use client';
import React, { useEffect, useState } from 'react';

function LongPressButton({
  onLongPress,
  title,
  className
}: {
  onLongPress: Function;
  title: string;
  className: string;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const holdtime = 3000;
  useEffect(() => {
    let timerId: any;
    if (isPressed) {
      timerId = setInterval(() => {
        setHoldTime((holdTime) => {
          if (holdTime >= holdtime) {
            onLongPress(); // Call your action function
            setHoldTime(0);
            clearInterval(timerId);
          }
          return holdTime + 100;
        });
      }, 100);
    } else {
      clearInterval(timerId);
      if (holdTime >= holdtime) {
        onLongPress(); // Call your action function
      }
      setHoldTime(0);
    }
    return () => clearInterval(timerId);
  }, [isPressed]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <button
        className={'relative z-[100] w-full'}
        onMouseDown={() => setIsPressed(true)}
        onMouseLeave={() => setIsPressed(false)}
        onMouseUp={() => setIsPressed(false)}>
        {title}
      </button>
      {isPressed && ( // Optional: Show progress bar only when pressed
        <div
          className="absolute h-full top-0 rounded-md bg-red-700 bg-opacity-20"
          style={{
            width: `${(holdTime / holdtime) * 100}%`,
            transition: 'width 0.2s ease-in-out' // Optional: Smooth animation
          }}
        />
      )}
    </div>
  );
}

export default LongPressButton;
