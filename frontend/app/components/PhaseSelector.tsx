'use client';

interface PhaseSelectorProps {
  currentPhase: string;
  onSelect: (phase: string) => void;
}

export function PhaseSelector({ currentPhase, onSelect }: PhaseSelectorProps) {
  // Fases simplificadas e objetivas para o SPH Partilhas
  const phases = ['Partilha', 'Feedback'] as const;

  return (
    <div className="flex justify-center gap-4 mb-4" role="group" aria-label="Modo do Cronômetro">
      {phases.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`text-[10px] font-black tracking-widest uppercase transition-all pb-1 border-b-2 ${
            currentPhase === p 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-600 hover:text-slate-400'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
