"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type Phase = 0 | 1 | 2

const phaseConfig = {
  0: { label: "Pronto para iniciar", color: "text-muted-foreground" },
  1: { label: "Tempo Inicial", color: "text-primary" },
  2: { label: "Tempo Final", color: "text-accent" },
  paused: { label: "Pausado", color: "text-yellow-400" },
  finished: { label: "Tempo Esgotado", color: "text-destructive" },
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function CircularProgress({ 
  progress, 
  phase,
  size = 280,
  strokeWidth = 8 
}: { 
  progress: number
  phase: Phase | "paused" | "finished"
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getStrokeColor = () => {
    if (phase === "finished") return "stroke-destructive"
    if (phase === "paused") return "stroke-yellow-400"
    if (phase === 2) return "stroke-accent"
    return "stroke-primary"
  }

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${getStrokeColor()} transition-all duration-300`}
      />
    </svg>
  )
}

function Toggle({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          ${checked ? "bg-primary" : "bg-secondary"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </label>
  )
}

export default function Partilhas() {
  const [p1Minutes, setP1Minutes] = useState(3)
  const [p2Minutes, setP2Minutes] = useState(2)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [visualEnabled, setVisualEnabled] = useState(true)
  const [vibrateEnabled, setVibrateEnabled] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<Phase>(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null)
  const [totalTime, setTotalTime] = useState(0)

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

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!vibrateEnabled) return
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }, [vibrateEnabled])

  const flashScreen = useCallback((message: string) => {
    if (!visualEnabled) return
    setNotificationMessage(message)
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 150)
    setTimeout(() => setIsFlashing(true), 300)
    setTimeout(() => setIsFlashing(false), 450)
    setTimeout(() => setIsFlashing(true), 600)
    setTimeout(() => setIsFlashing(false), 750)
    setTimeout(() => setNotificationMessage(null), 3000)
  }, [visualEnabled])

  const playPhase1EndSound = useCallback((minutesLeft: number) => {
    playBeep(600, "sine", 0.8)
    vibrate([200, 100, 200])
    flashScreen(`Faltam ${minutesLeft} ${minutesLeft === 1 ? "minuto" : "minutos"}`)
  }, [playBeep, vibrate, flashScreen])

  const playFinalEndSound = useCallback(() => {
    playBeep(400, "square", 0.3)
    setTimeout(() => playBeep(400, "square", 0.3), 400)
    setTimeout(() => playBeep(400, "square", 0.8), 800)
    vibrate([300, 100, 300, 100, 500])
    flashScreen("Seu tempo acabou")
  }, [playBeep, vibrate, flashScreen])

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
        const minutesLeft = Math.ceil(p2SecondsRef.current / 60)
        playPhase1EndSound(minutesLeft)
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

      setTotalTime(p1SecondsRef.current + p2SecondsRef.current)
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
    setTotalTime(0)
  }

  const getPhaseKey = (): Phase | "paused" | "finished" => {
    if (isFinished) return "finished"
    if (isPaused) return "paused"
    return currentPhase
  }

  const phaseKey = getPhaseKey()
  const config = phaseConfig[phaseKey]

  const getButtonText = () => {
    if (isPaused) return "Retomar"
    if (isFinished) return "Reiniciar"
    return "Iniciar"
  }

  const calculateProgress = () => {
    if (totalTime === 0) return 100
    const elapsed = totalTime - (currentPhase === 1 ? timeLeft + p2SecondsRef.current : timeLeft)
    return Math.max(0, ((totalTime - elapsed) / totalTime) * 100)
  }

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center justify-center p-4
        bg-background transition-colors duration-150
        ${isFlashing ? "!bg-white" : ""}
      `}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-1">
            Partilhas
          </h1>
          <p className={`text-sm font-medium ${config.color} transition-colors`}>
            {config.label}
          </p>
        </header>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center mb-8">
          <CircularProgress 
            progress={calculateProgress()} 
            phase={phaseKey}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-mono font-bold tracking-tight text-foreground">
              {formatTime(timeLeft)}
            </span>
            {notificationMessage && (
              <div className="mt-2 px-4 py-2 bg-primary/20 rounded-lg animate-pulse">
                <span className="text-sm font-medium text-primary">
                  {notificationMessage}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Time Inputs */}
        <div
          className={`
            flex items-center justify-center gap-4 mb-8
            transition-opacity duration-200
            ${isRunning || isPaused ? "opacity-40 pointer-events-none" : ""}
          `}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Inicial</span>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
              <input
                type="number"
                value={p1Minutes}
                onChange={(e) => setP1Minutes(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-12 bg-transparent text-foreground text-center text-lg font-semibold focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>

          <span className="text-2xl font-light text-muted-foreground mt-6">+</span>

          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Final</span>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
              <input
                type="number"
                value={p2Minutes}
                onChange={(e) => setP2Minutes(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                className="w-12 bg-transparent text-foreground text-center text-lg font-semibold focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div
          className={`
            bg-card border border-border rounded-xl p-4 mb-8
            transition-opacity duration-200
            ${isRunning || isPaused ? "opacity-40 pointer-events-none" : ""}
          `}
        >
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Notificacoes
          </h2>
          <div className="flex flex-col gap-4">
            <Toggle
              label="Sonora"
              checked={soundEnabled}
              onChange={setSoundEnabled}
            />
            <Toggle
              label="Visual"
              checked={visualEnabled}
              onChange={setVisualEnabled}
            />
            <Toggle
              label="Vibrar"
              checked={vibrateEnabled}
              onChange={setVibrateEnabled}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="
                flex-1 py-4 rounded-xl font-semibold text-base
                bg-primary text-primary-foreground
                hover:bg-primary/90 active:scale-[0.98]
                transition-all duration-150
              "
            >
              {getButtonText()}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="
                flex-1 py-4 rounded-xl font-semibold text-base
                bg-yellow-500 text-yellow-950
                hover:bg-yellow-400 active:scale-[0.98]
                transition-all duration-150
              "
            >
              Pausar
            </button>
          )}
          <button
            onClick={handleReset}
            className="
              flex-1 py-4 rounded-xl font-semibold text-base
              bg-secondary text-secondary-foreground
              hover:bg-secondary/80 active:scale-[0.98]
              transition-all duration-150
            "
          >
            Zerar
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-muted-foreground/60">
            Mantenha a tela ativa durante o uso
          </p>
        </footer>
      </div>
    </div>
  )
}
