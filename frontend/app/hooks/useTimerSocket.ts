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
  const [phase, setPhase] = useState('Partilha');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!uuid || typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = window.location.hostname.includes('vercel.app') 
      ? `wss://v0-cronometro-split.onrender.com/ws/${uuid}`
      : `${protocol}//${window.location.host.replace('3000', '8000')}/ws/${uuid}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'request_sync', timestamp: Date.now() / 1000, payload: {} }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data === 'object') {
            handleMessage(data as SocketMessage);
          }
        } catch (e) {
          console.error("🔷 WebSocket parse error:", e);
        }
      };

      ws.onerror = (err) => console.error("🔷 WebSocket error:", err);
      
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    } catch (err) {
      console.error("🔷 WebSocket connection failed:", err);
    }
  }, [uuid]);

  const handleMessage = (msg: SocketMessage) => {
    if (!msg || !msg.payload) return;

    const { action, payload, timestamp: serverTimestamp } = msg;
    const latency = (Date.now() / 1000) - (serverTimestamp || Date.now() / 1000);

    if (action === 'start' || action === 'sync_state') {
      const remoteIsRunning = !!payload.is_running;
      let remoteTime = payload.time_elapsed ?? 0;
      if (remoteIsRunning && latency > 0) remoteTime += Math.floor(latency);
      
      setIsRunning(remoteIsRunning);
      setTime(remoteTime);
      if (payload.phase) setPhase(payload.phase);
    } else if (action === 'pause') {
      setIsRunning(false);
      if (payload.time_elapsed !== undefined) setTime(payload.time_elapsed);
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
