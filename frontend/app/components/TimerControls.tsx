'use client';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function TimerControls({ isRunning, onToggle, onReset }: TimerControlsProps) {
  return (
    <nav className="grid grid-cols-2 gap-3 mb-6 w-full">
      <button
        onClick={onToggle}
        className={`px-6 py-4 rounded-xl font-black text-xs transition-all active:scale-95 ${
          isRunning 
            ? 'bg-rose-500 hover:bg-rose-600 text-rose-50' 
            : 'bg-emerald-500 hover:bg-emerald-600 text-emerald-50'
        }`}
      >
        {isRunning ? 'PAUSAR' : 'INICIAR'}
      </button>

      <button
        onClick={onReset}
        className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-black text-xs transition-all active:scale-95 border border-slate-700"
      >
        RESET
      </button>
    </nav>
  );
}
