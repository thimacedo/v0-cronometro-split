"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type Phase = 0 | 1 | 2

const phaseStyles: Record<Phase | "paused" | "finished", { bg: string; badge: string; badgeText: string }> = {
  0: {
    bg: "bg-slate-900",
    badge: "bg-slate-700 text-slate-300",
    badgeText: "Aguardando Configuracao",
  },
  1: {
    bg: "bg-indigo-900",
    badge: "bg-indigo-700 text-indigo-100",
    badgeText: "Tempo Inicial",
  },
  2: {
    bg: "bg-orange-800",
    badge: "bg-orange-600 text-orange-100",
    badgeText: "Tempo Final (Atencao)",
  },
  paused: {
    bg: "bg-slate-900",
    badge: "bg-yellow-600 text-yellow-100",
    badgeText: "Pausado",
  },
  finished: {
    bg: "bg-red-900",
    badge: "bg-red-600 text-red-100",
    badgeText: "Tempo Esgotado",
  },
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export default function SplitTimer() {
  const [p1Minutes, setP1Minutes] = useState(3)
  const [p2Minutes, setP2Minutes] = useState(2)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<Phase>(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const p1SecondsRef = useRef(0)
  const p2SecondsRef = useRef(0)

  const playBeep = useCallback(
    (frequency: number, type: OscillatorType, duration: number, vol = 1) => {
      if (!soundEnabled) return

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }
      const audioCtx = audioCtxRef.current

      if (audioCtx.state === "suspended") {
        audioCtx.resume()
      }

      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.type = type
      oscillator.frequency.value = frequency

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.start()
      gainNode.gain.setValueAtTime(vol, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)

      setTimeout(() => {
        oscillator.stop()
      }, duration * 1000)
    },
    [soundEnabled]
  )

  const playPhase1EndSound = useCallback(() => {
    playBeep(600, "sine", 0.8)
  }, [playBeep])

  const playFinalEndSound = useCallback(() => {
    playBeep(400, "square", 0.3)
    setTimeout(() => playBeep(400, "square", 0.3), 400)
    setTimeout(() => playBeep(400, "square", 0.8), 800)
  }, [playBeep])

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
      }
    } catch (err) {
      console.log("Wake Lock error:", err)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        wakeLockRef.current !== null &&
        document.visibilityState === "visible" &&
        currentPhase !== 0
      ) {
        requestWakeLock()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [currentPhase, requestWakeLock])

  useEffect(() => {
    if (!isRunning || isPaused) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          return prev - 1
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused])

  useEffect(() => {
    if (!isRunning || isPaused) return

    if (timeLeft === 0) {
      if (currentPhase === 1) {
        playPhase1EndSound()
        if (p2SecondsRef.current > 0) {
          setCurrentPhase(2)
          setTimeLeft(p2SecondsRef.current)
        } else {
          playFinalEndSound()
          setIsRunning(false)
          setIsFinished(true)
          setCurrentPhase(0)
        }
      } else if (currentPhase === 2) {
        playFinalEndSound()
        setIsRunning(false)
        setIsFinished(true)
        setCurrentPhase(0)
      }
    }
  }, [timeLeft, currentPhase, isRunning, isPaused, playPhase1EndSound, playFinalEndSound])

  const handleStart = () => {
    if (!audioCtxRef.current && soundEnabled) {
      audioCtxRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }

    if (currentPhase === 0 && !isPaused) {
      p1SecondsRef.current = p1Minutes * 60
      p2SecondsRef.current = p2Minutes * 60

      if (p1SecondsRef.current === 0 && p2SecondsRef.current === 0) return

      const initialTime = p1SecondsRef.current > 0 ? p1SecondsRef.current : p2SecondsRef.current
      const initialPhase: Phase = p1SecondsRef.current > 0 ? 1 : 2

      setTimeLeft(initialTime)
      setCurrentPhase(initialPhase)
    }

    setIsRunning(true)
    setIsPaused(false)
    setIsFinished(false)
    requestWakeLock()
  }

  const handlePause = () => {
    setIsPaused(true)
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setIsFinished(false)
    setCurrentPhase(0)
    setTimeLeft(0)
  }

  const getStyle = () => {
    if (isFinished) return phaseStyles.finished
    if (isPaused) return phaseStyles.paused
    return phaseStyles[currentPhase]
  }

  const style = getStyle()

  const getButtonText = () => {
    if (isPaused) return "Retomar"
    if (isFinished) return "Reiniciar"
    if (isRunning) return "Iniciar"
    return "Iniciar"
  }

  return (
    <div
      className={`${style.bg} text-white min-h-screen flex flex-col items-center justify-center font-sans transition-colors duration-500`}
    >
      <div className="w-full max-w-md p-6 bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Cronometro Split</h1>
          <div
            className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${style.badge}`}
          >
            {style.badgeText}
          </div>
        </div>

        <div className="flex justify-center items-baseline mb-8">
          <span className="text-8xl font-mono font-bold tracking-tighter">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div
          className={`space-y-4 mb-8 transition-opacity ${
            isRunning || isPaused ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-600">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Tempo Inicial (Fase 1)
              </label>
              <span className="text-xs text-slate-500">Ex: 3 ou 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={p1Minutes}
                onChange={(e) => setP1Minutes(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-16 bg-slate-700 text-white text-center rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400">min</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-600">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Tempo Final (Fase 2)
              </label>
              <span className="text-xs text-slate-500">Ex: 2 ou 1 minuto</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={p2Minutes}
                onChange={(e) => setP2Minutes(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-16 bg-slate-700 text-white text-center rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400">min</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-sm font-medium text-slate-300">Notificacoes Sonoras</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors text-lg"
            >
              {getButtonText()}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 rounded-xl transition-colors text-lg"
            >
              Pausar
            </button>
          )}
          <button
            onClick={handleReset}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          >
            Zerar
          </button>
        </div>
      </div>
    </div>
  )
}
