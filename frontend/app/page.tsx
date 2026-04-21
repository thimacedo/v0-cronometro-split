'use client';

import { useEffect, useState } from 'react';
import zoomSdk from '@zoom/appsdk';
import { useTimerSocket } from './hooks/useTimerSocket';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { PhaseSelector } from './components/PhaseSelector';

export default function ZoomAppPage() {
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);
  const { time, isRunning, phase, setPhase, sendAction } = useTimerSocket(meetingUUID);

  // Inicialização do Zoom SDK
  useEffect(() => {
    const initializeZoom = async () => {
      try {
        await zoomSdk.config({
          capabilities: ['getMeetingContext', 'onMeeting', 'getRunningContext'],
        });
        const context = await zoomSdk.getMeetingContext();
        setMeetingUUID(context.meetingUUID || 'browser-test-id');
      } catch (error) {
        console.error('🔷 Zoom SDK Fallback:', error);
        setMeetingUUID('dev-local-id');
      }
    };
    initializeZoom();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white font-sans" role="main">
      <section className="rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800 w-full max-w-sm text-center" aria-labelledby="app-title">
        <header>
          <h1 id="app-title" className="text-xl font-bold mb-6 text-indigo-400 tracking-tight uppercase">
            SPH Partilhas
          </h1>
        </header>
        
        <TimerDisplay time={time} phase={phase} />

        <TimerControls 
          isRunning={isRunning} 
          onToggle={() => isRunning ? sendAction('pause') : sendAction('start')} 
          onReset={() => sendAction('reset')} 
        />

        <PhaseSelector 
          currentPhase={phase} 
          onSelect={(p) => {
            setPhase(p);
            sendAction('reset', { phase: p });
          }} 
        />

        <footer className="pt-6 border-t border-slate-800/50">
          <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Meeting UUID</p>
          <code className="block mt-1 text-[9px] text-slate-500 font-mono truncate px-4">
            {meetingUUID || 'INITIALIZING SDK...'}
          </code>
        </footer>
      </section>
    </main>
  );
}
