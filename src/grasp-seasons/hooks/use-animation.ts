import { useEffect, useRef, useState } from "react";

interface IOptions {
  value: number;
  setValue: (value: number) => void;
  speed: number
}

// React hook that provides animation functionality.
export const useAnimation = ({ value, setValue, speed }: IOptions) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const prevTimestampRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const valueRef = useRef(value);
  const setValueRef = useRef(setValue);
  const speedRef = useRef(speed);

  // Always keep refs up-to-date
  valueRef.current = value;
  setValueRef.current = setValue;
  speedRef.current = speed;

  const toggleState = () => {
    if (!animationStarted) {
      startAnimation();
    } else {
      stopAnimation();
    }
  };

  const startAnimation = () => {
    rafIdRef.current = requestAnimationFrame(animate);
    setAnimationStarted(true);
  };

  const stopAnimation = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    prevTimestampRef.current = null;
    setAnimationStarted(false);
  };

  const animate = (timestamp: number) => {
    if (rafIdRef.current !== null) {
      rafIdRef.current = requestAnimationFrame(animate);
    }
    const progress = prevTimestampRef.current ? timestamp - prevTimestampRef.current : 0;
    const newValue = valueRef.current + progress * speedRef.current;
    valueRef.current = newValue;
    prevTimestampRef.current = timestamp;
    setValueRef.current(newValue);
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    animationStarted,
    toggleState
  };
};
