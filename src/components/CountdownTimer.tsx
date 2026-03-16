"use client";

import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string;
}

export default function CountdownTimer({ expiresAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const requestRef = useRef<number>(0);

  const calculateTime = (timestamp?: number) => {
    const end = new Date(expiresAt).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("EXPIRED");
      return;
    }

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft(
      `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );

    requestRef.current = requestAnimationFrame(calculateTime);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(calculateTime);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [expiresAt]);

  if (timeLeft === "EXPIRED") return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-mono text-sm font-bold shadow-lg shadow-red-200 animate-pulse">
      <Timer size={16} />
      <span>FLASH DEAL EXPIRES IN: {timeLeft}</span>
    </div>
  );
}
