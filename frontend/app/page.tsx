'use client';

import { useEffect, useState, Suspense } from 'react';
import zoomSdk from '@zoom/appssdk';
import { useTimerSocket } from './hooks/useTimerSocket';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { PhaseSelector } from './components/PhaseSelector';

/**
 * 🔷 SPH Partilhas - Interface de Cronômetro Sincronizada
 */
function ZoomAppContent() {
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);
  
  // Executa o hook do socket. 
  // Se o hook falhar por algum motivo interno, ele deve retornar valores padrão.
  const timer = useTimerSocket(meetingUUID);
  
  const time = timer?.time ?? 0;
  const isRunning = timer?.isRunning ?? false;
  const phase = timer?.phase ?? 'Partilha';
  const setPhase = timer?.setPhase;
  const sendAction = timer?.sendAction;

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
        if (context && context.meetingUUID) {
          setMeetingUUID(context.meetingUUID);
        } else {
          setMeetingUUID('browser-test-id');
        }
      } catch (error) {
        console.error('🔷 Zoom SDK Error:', error);
        setMeetingUUID('dev-local-id');
      }
    };
    initializeZoom();
  }, []);

  return (
    <div className="w-full max-w-[280px] flex flex-col items-center">
      {/* Selector de Modo */}
      <PhaseSelector 
        currentPhase={phase} 
        onSelect={(p) => {
          if (setPhase) setPhase(p);
          if (sendAction) sendAction('reset', { phase: p });
        }} 
      />

      {/* Display do Tempo */}
      <TimerDisplay time={time} />

      {/* Controlos de Ação */}
      <TimerControls 
        isRunning={isRunning} 
        onToggle={() => {
          if (!sendAction) return;
          isRunning ? sendAction('pause') : sendAction('start');
        }} 
        onReset={() => {
          if (sendAction) sendAction('reset');
        }} 
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
