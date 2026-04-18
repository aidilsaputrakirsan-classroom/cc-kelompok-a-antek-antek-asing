import { useState, useEffect, useRef } from "react";

export function useAnimatedCounter(targetValue, speed = 200, demoMode = true) {
  const [displayValue, setDisplayValue] = useState(0);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    // Handle non-numeric values
    if (typeof targetValue !== "number") {
      setDisplayValue(targetValue);
      return;
    }

    // Tentukan apakah target adalah integer atau decimal
    const isInteger = Number.isInteger(targetValue);

    // Tentukan demo target yang lebih natural
    let demoTarget;
    if (demoMode) {
      if (targetValue === 0) {
        demoTarget = 10; // Jika 0, demo ke 10
      } else if (targetValue < 1) {
        demoTarget = 1; // Jika <1 (decimal), demo ke 1
      } else {
        demoTarget = Math.ceil(targetValue * 2); // Jika >1, demo ke 2x nilai
      }
    } else {
      demoTarget = targetValue;
    }
    
    // Use step-based animation with proper rounding
    let progress = 0;
    const demoIncrement = 1 / speed; // 0-1 range
    let phase = "demo"; // "demo" or "target"

    const animate = () => {
      progress += demoIncrement;
      
      if (progress >= 1) {
        if (phase === "demo") {
          // Move to target phase
          phase = "target";
          progress = 0;
        } else {
          // Done
          if (isInteger) {
            setDisplayValue(Math.round(targetValue));
          } else {
            setDisplayValue(targetValue);
          }
          return;
        }
      }

      // Calculate current value based on phase
      let currentValue;
      if (phase === "demo") {
        currentValue = demoTarget * progress;
      } else {
        currentValue = targetValue * progress;
      }

      // Round untuk integer values, otherwise keep decimal
      if (isInteger) {
        currentValue = Math.round(currentValue);
      }

      setDisplayValue(currentValue);
      timeoutIdRef.current = setTimeout(animate, 1);
    };

    animate();

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [targetValue, speed, demoMode]);

  return displayValue;
}
