'use client';

interface TimerDisplayProps {
  time: number;
  phase: string;
}

export function TimerDisplay({ time, phase }: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mb-8" aria-live="polite">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 font-black">
        {phase}
      </p>
      <div className="text-7xl font-mono font-black text-white tabular-nums tracking-tighter">
        {formatTime(time)}
      </div>
    </div>
  );
}
