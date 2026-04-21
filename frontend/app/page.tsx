'use client';

import { useEffect, useState, Suspense } from 'react';
import zoomSdk from '@zoom/appssdk';
import { useTimerSocket } from './hooks/useTimerSocket';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { PhaseSelector } from './components/PhaseSelector';

/**
 * 🔷 SPH Partilhas - Interface de Cronômetro Simplificada
 * Focada em objetividade e sincronização em tempo real.
 */
function ZoomAppContent() {
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);
  const { time, isRunning, phase, setPhase, sendAction } = useTimerSocket(meetingUUID);

  useEffect(() => {
    const initializeZoom = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        await zoomSdk.config({
          capabilities: [
            'getMeetingContext', 
            'onMeeting', 
            'getRunningContext',
            'getSupportedContexts'
          ],
        });
        const context = await zoomSdk.getMeetingContext();
        setMeetingUUID(context?.meetingUUID || 'browser-test-id');
      } catch (error) {
        console.error('🔷 Zoom SDK Error:', error);
        setMeetingUUID('dev-local-id');
      }
    };
    initializeZoom();
  }, []);

  return (
    <div className="w-full max-w-[280px] flex flex-col items-center">
      {/* Selector de Modo (Simplificado) */}
      <PhaseSelector 
        currentPhase={phase || 'Partilha'} 
        onSelect={(p) => {
          setPhase(p);
          sendAction('reset', { phase: p });
        }} 
      />

      {/* Display do Tempo (Protagonista) */}
      <TimerDisplay time={time || 0} />

      {/* Controlos de Ação (Acessibilidade e Rapidez) */}
      <TimerControls 
        isRunning={isRunning || false} 
        onToggle={() => isRunning ? sendAction('pause') : sendAction('start')} 
        onReset={() => sendAction('reset')} 
      />

      {/* Identificador Minimalista */}
      <div className="mt-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
          <p className="text-[8px] font-mono tracking-tighter uppercase text-slate-400">
            Session: {meetingUUID ? meetingUUID.split('-')[0] : '...'}
          </p>
      </div>
    </div>
  );
}

export default function ZoomAppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] p-4 text-white font-sans overflow-hidden">
      <Suspense fallback={<div className="text-xs text-slate-500 font-mono tracking-widest animate-pulse">CARREGANDO...</div>}>
        <ZoomAppContent />
      </Suspense>
    </main>
  );
}
