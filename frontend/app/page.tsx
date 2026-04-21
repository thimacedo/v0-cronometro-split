'use client';

import { useEffect, useState } from 'react';
import zoomSdk from '@zoom/appssdk';
import { useTimerSocket } from './hooks/useTimerSocket';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { PhaseSelector } from './components/PhaseSelector';

/**
 * 🔷 SPH Partilhas - Interface de Cronômetro Simplificada
 * Focada em objetividade e sincronização em tempo real.
 */
export default function ZoomAppPage() {
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);
  const { time, isRunning, phase, setPhase, sendAction } = useTimerSocket(meetingUUID);

  useEffect(() => {
    const initializeZoom = async () => {
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
        setMeetingUUID(context.meetingUUID || 'browser-test-id');
      } catch (error) {
        setMeetingUUID('dev-local-id');
      }
    };
    initializeZoom();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] p-4 text-white font-sans overflow-hidden">
      {/* Container Principal Ultra-Objetivo */}
      <div className="w-full max-w-[280px] flex flex-col items-center">
        
        {/* Selector de Modo (Simplificado) */}
        <PhaseSelector 
          currentPhase={phase} 
          onSelect={(p) => {
            setPhase(p);
            sendAction('reset', { phase: p });
          }} 
        />

        {/* Display do Tempo (Protagonista) */}
        <TimerDisplay time={time} />

        {/* Controlos de Ação (Acessibilidade e Rapidez) */}
        <TimerControls 
          isRunning={isRunning} 
          onToggle={() => isRunning ? sendAction('pause') : sendAction('start')} 
          onReset={() => sendAction('reset')} 
        />

        {/* Identificador Minimalista */}
        <div className="mt-8 opacity-20 hover:opacity-100 transition-opacity duration-500">
           <p className="text-[8px] font-mono tracking-tighter uppercase text-slate-400">
             Session: {meetingUUID?.split('-')[0] || '...'}
           </p>
        </div>
      </div>
    </main>
  );
}
