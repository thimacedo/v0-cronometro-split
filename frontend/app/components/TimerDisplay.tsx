'use client';

interface TimerDisplayProps {
  time: number;
}

export function TimerDisplay({ time }: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-6" aria-live="polite">
      <div className="text-8xl font-mono font-black text-white tabular-nums tracking-tighter leading-none">
        {formatTime(time)}
      </div>
    </div>
  );
}
