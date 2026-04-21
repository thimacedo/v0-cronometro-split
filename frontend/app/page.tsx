'use client';

import { useEffect, useState, useRef } from 'react';
import zoomSdk from '@zoom/appsdk';

/**
 * 🔷 SPH_Partilhas - Cronómetro Sincronizado para Zoom.
 * Refatorado para Sincronização de Delta e Backoff de Conexão.
 */

interface TimerPayload {
  phase?: string;
  time_elapsed?: number;
  is_running?: boolean;
}

interface SocketMessage {
  action: 'start' | 'pause' | 'reset' | 'request_sync' | 'sync_state';
  timestamp: number;
  payload: TimerPayload;
}

export default function ZoomAppPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('Fase 1');
  const [meetingUUID, setMeetingUUID] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Inicialização do Zoom SDK
  useEffect(() => {
    const initializeZoom = async () => {
      try {
        const config = await zoomSdk.config({
          capabilities: [
            'getMeetingContext',
            'onMeeting',
            'getRunningContext'
          ],
        });
        console.log('🔷 Zoom SDK Configurado:', config);

        const context = await zoomSdk.getMeetingContext();
        if (context.meetingUUID) {
          setMeetingUUID(context.meetingUUID);
          connectWebSocket(context.meetingUUID);
        } else {
          // Fallback para desenvolvimento local fora do Zoom
          const devId = 'dev-meeting-local';
          setMeetingUUID(devId);
          connectWebSocket(devId);
        }
      } catch (error) {
        console.error('🔷 Falha ao inicializar Zoom SDK:', error);
        // Fallback para teste no browser comum
        connectWebSocket('browser-test-id');
      }
    };

    initializeZoom();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  // 2. Conexão WebSocket com Sincronização de Drift
  const connectWebSocket = (uuid: string) => {
    // Protocolo WSS se estiver em HTTPS (Ngrok)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host.includes('3000') 
      ? window.location.host.replace('3000', '8000') 
      : window.location.host;
    
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${host}/ws/${uuid}`;
    
    try {
      if (socketRef.current) socketRef.current.close();
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🔷 WebSocket conectado.');
        ws.send(JSON.stringify({ 
          action: 'request_sync', 
          timestamp: Date.now() / 1000, 
          payload: {} 
        }));
      };

      ws.onmessage = (event) => {
        const message: SocketMessage = JSON.parse(event.data);
        handleSocketMessage(message);
      };

      ws.onclose = () => {
        console.warn('🔷 WebSocket desconectado. Reconectando em 3s...');
        reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(uuid), 3000);
      };

      socketRef.current = ws;
    } catch (error) {
      console.error('🔷 Erro na conexão WebSocket:', error);
    }
  };

  // 3. Processador de Mensagens com Compensação de Delta (Network Drift)
  const handleSocketMessage = (msg: SocketMessage) => {
    const { action, payload, timestamp: serverTimestamp } = msg;
    const clientTimestamp = Date.now() / 1000;
    
    // Calcula o atraso de rede (ida e volta estimada)
    const latency = clientTimestamp - serverTimestamp;

    switch (action) {
      case 'start':
      case 'sync_state':
        const remoteIsRunning = payload.is_running ?? true;
        let remoteTime = payload.time_elapsed ?? 0;

        // Se o cronómetro estiver a correr, compensa o tempo perdido no trânsito
        if (remoteIsRunning && latency > 0) {
          remoteTime += Math.floor(latency);
        }

        setIsRunning(remoteIsRunning);
        setTime(remoteTime);
        if (payload.phase) setPhase(payload.phase);
        break;

      case 'pause':
        setIsRunning(false);
        if (payload.time_elapsed !== undefined) setTime(payload.time_elapsed);
        break;

      case 'reset':
        setIsRunning(false);
        setTime(0);
        break;
    }
  };

  // 4. Envio de Ações
  const sendAction = (action: 'start' | 'pause' | 'reset', extraPayload: TimerPayload = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message: SocketMessage = {
        action,
        timestamp: Date.now() / 1000,
        payload: {
          phase,
          time_elapsed: time,
          ...extraPayload
        }
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  // 5. Incremento Local
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-white font-sans" role="main">
      <section className="rounded-2xl bg-slate-900 p-8 shadow-2xl border border-slate-800 w-full max-w-sm text-center" aria-labelledby="app-title">
        <header>
          <h1 id="app-title" className="text-xl font-bold mb-6 text-indigo-400 tracking-tight uppercase">
            SPH Partilhas
          </h1>
        </header>
        
        <div className="mb-8" aria-live="polite">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2 font-black">
            {phase}
          </p>
          <div className="text-7xl font-mono font-black text-white tabular-nums tracking-tighter">
            {formatTime(time)}
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => isRunning ? sendAction('pause') : sendAction('start')}
            className={`px-6 py-4 rounded-xl font-black text-xs transition-all active:scale-95 ${
              isRunning 
                ? 'bg-rose-500 hover:bg-rose-600 text-rose-50' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-emerald-50'
            }`}
          >
            {isRunning ? 'PAUSAR' : 'INICIAR'}
          </button>

          <button
            onClick={() => sendAction('reset')}
            className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-black text-xs transition-all active:scale-95 border border-slate-700"
          >
            RESET
          </button>
        </nav>

        <div className="flex justify-center gap-2 mb-8" role="group">
          {(['Fase 1', 'Fase 2', 'Pausa'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPhase(p);
                sendAction('reset', { phase: p });
              }}
              className={`px-4 py-1.5 text-[9px] font-black rounded-full border transition-all ${
                phase === p 
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                  : 'border-slate-800 text-slate-600 hover:border-slate-600'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <footer className="pt-6 border-t border-slate-800/50">
          <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
            Meeting UUID
          </p>
          <code className="block mt-1 text-[9px] text-slate-500 font-mono truncate px-4">
            {meetingUUID || 'INITIALIZING SDK...'}
          </code>
        </footer>
      </section>
    </main>
  );
}
