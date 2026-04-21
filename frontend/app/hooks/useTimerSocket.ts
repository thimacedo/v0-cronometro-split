'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerPayload {
  phase?: string;
  time_elapsed?: number;
  is_running?: boolean;
}

interface SocketMessage {
  action: string;
  timestamp: number;
  payload: TimerPayload;
}

export function useTimerSocket(uuid: string | null) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('Partilha'); // 🔷 Ajustado para o novo padrão
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!uuid || typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname.includes('vercel.app') 
      ? `wss://v0-cronometro-split.onrender.com/ws/${uuid}`
      : `${protocol}//${window.location.host.replace('3000', '8000')}/ws/${uuid}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'request_sync', timestamp: Date.now() / 1000, payload: {} }));
      };

      ws.onmessage = (event) => {
        try {
          const msg: SocketMessage = JSON.parse(event.data);
          if (msg) handleMessage(msg);
        } catch (e) {
          console.error("🔷 Erro ao processar mensagem WebSocket:", e);
        }
      };

      ws.onclose = () => {
        // Reconexão silenciosa
      };

      socketRef.current = ws;
      return () => ws.close();
    } catch (err) {
      console.error("🔷 Erro ao conectar WebSocket:", err);
    }
  }, [uuid]);

  const handleMessage = (msg: SocketMessage) => {
    if (!msg || !msg.payload) return; // 🛡️ Proteção contra mensagens malformadas

    const { action, payload, timestamp: serverTimestamp } = msg;
    const latency = (Date.now() / 1000) - (serverTimestamp || Date.now() / 1000);

    if (action === 'start' || action === 'sync_state') {
      const remoteIsRunning = payload.is_running ?? true;
      let remoteTime = payload.time_elapsed ?? 0;
      if (remoteIsRunning && latency > 0) remoteTime += Math.floor(latency);
      
      setIsRunning(remoteIsRunning);
      setTime(remoteTime);
      if (payload.phase) setPhase(payload.phase);
    } else if (action === 'pause') {
      setIsRunning(false);
    } else if (action === 'reset') {
      setIsRunning(false);
      setTime(0);
      if (payload.phase) setPhase(payload.phase);
    }
  };

  const sendAction = (action: string, extraPayload: TimerPayload = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action,
        timestamp: Date.now() / 1000,
        payload: { phase, time_elapsed: time, ...extraPayload }
      }));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return { time, isRunning, phase, setPhase, sendAction };
}
