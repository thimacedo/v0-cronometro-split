'use client';

interface TimerControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function TimerControls({ isRunning, onToggle, onReset }: TimerControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={onToggle}
        className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-95 shadow-lg ${
          isRunning 
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
        }`}
      >
        {isRunning ? 'Pausar Partilha' : 'Iniciar Partilha'}
      </button>

      <button
        onClick={onReset}
        className="w-full py-3 text-slate-500 font-black text-[10px] tracking-widest uppercase hover:text-slate-300 transition-colors"
      >
        Reiniciar Cronômetro
      </button>
    </div>
  );
}
