'use client';

interface PhaseSelectorProps {
  currentPhase: string;
  onSelect: (phase: string) => void;
}

export function PhaseSelector({ currentPhase, onSelect }: PhaseSelectorProps) {
  const phases = ['Fase 1', 'Fase 2', 'Pausa'] as const;

  return (
    <div className="flex justify-center gap-2 mb-8" role="group" aria-label="Seleção de Fase">
      {phases.map((p) => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`px-4 py-1.5 text-[9px] font-black rounded-full border transition-all ${
            currentPhase === p 
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
              : 'border-slate-800 text-slate-600 hover:border-slate-600'
          }`}
        >
          {p.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
