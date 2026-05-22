'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getCurrentDayNumber, getDayData, DayData } from '@/lib/routine'
import { Loader2, Play, Pause, RotateCcw, Timer } from 'lucide-react'

export default function RoutineTracker() {
  const [dayData, setDayData] = useState<DayData | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [trackedSeconds, setTrackedSeconds] = useState<Record<string, number>>({})
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const day = getCurrentDayNumber()
    const data = getDayData(day)
    setDayData(data)
    
    // Initialize completion state from localStorage
    const saved = localStorage.getItem(`routine-day-${day}`)
    if (saved) {
      setCompleted(JSON.parse(saved))
    }

    // Initialize stopwatch state
    const savedTime = localStorage.getItem(`routine-time-day-${day}`)
    if (savedTime) {
      setTrackedSeconds(JSON.parse(savedTime))
    }
    
    setIsLoading(false)
  }, [])

  // Timer Tick interval
  useEffect(() => {
    if (!activeTimerId) return
    const interval = setInterval(() => {
      setTrackedSeconds(prev => {
        const currentSecs = (prev[activeTimerId] || 0) + 1
        const newTracked = { ...prev, [activeTimerId]: currentSecs }
        localStorage.setItem(`routine-time-day-${dayData?.day}`, JSON.stringify(newTracked))
        
        // Award 1 point for every 60 seconds of focus time
        if (currentSecs % 60 === 0) {
          const pts = parseInt(localStorage.getItem('gamification-points') || '0')
          localStorage.setItem('gamification-points', (pts + 1).toString())
        }
        return newTracked
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [activeTimerId, dayData])

  const toggleRoutine = (id: string) => {
    const isNowCompleted = !completed[id]
    const newCompleted = { ...completed, [id]: isNowCompleted }
    setCompleted(newCompleted)
    localStorage.setItem(`routine-day-${dayData?.day}`, JSON.stringify(newCompleted))

    // Award/deduct 10 points for completion/uncompletion
    const pts = parseInt(localStorage.getItem('gamification-points') || '0')
    const delta = isNowCompleted ? 10 : -10
    localStorage.setItem('gamification-points', Math.max(0, pts + delta).toString())
  }

  const toggleTimer = (id: string) => {
    if (activeTimerId === id) {
      setActiveTimerId(null)
    } else {
      setActiveTimerId(id)
    }
  }

  const resetTimer = (id: string) => {
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
    setTrackedSeconds(prev => {
      const newTracked = { ...prev, [id]: 0 }
      localStorage.setItem(`routine-time-day-${dayData?.day}`, JSON.stringify(newTracked))
      return newTracked
    })
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <Card className="w-full flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (!dayData) {
    return (
      <Card className="w-full p-8 text-center">
        <p className="text-muted-foreground">No routine found for today.</p>
      </Card>
    )
  }

  const routines = dayData.time_blocks.map((block, index) => ({
    id: `block-${index}`,
    label: block.activity,
    time: block.time,
    category: block.category
  }))

  const completedCount = Object.values(completed).filter(Boolean).length

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                Day {dayData.day}
              </span>
              <span className="text-sm text-muted-foreground">{dayData.weekday}</span>
            </div>
            <h3 className="text-xl font-bold">{dayData.title}</h3>
          </div>
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
            {completedCount} / {routines.length} done
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
        {routines.map((routine) => {
          const seconds = trackedSeconds[routine.id] || 0
          const isTimerRunning = activeTimerId === routine.id
          
          return (
            <div key={routine.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-border">
              <div className="flex items-start space-x-3 flex-1 mr-4">
                <div className="pt-1">
                  <Checkbox
                    id={routine.id}
                    checked={completed[routine.id]}
                    onCheckedChange={() => toggleRoutine(routine.id)}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={routine.id}
                    className={`text-base font-semibold leading-none cursor-pointer transition-colors ${
                      completed[routine.id] ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {routine.label}
                  </Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{routine.time}</span>
                    <span>•</span>
                    <span className="capitalize">{routine.category}</span>
                  </div>
                </div>
              </div>

              {/* Time Tracking Panel */}
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                  isTimerRunning 
                    ? 'bg-emerald-500/20 text-emerald-500 animate-pulse border border-emerald-500/30' 
                    : seconds > 0 
                      ? 'bg-muted text-muted-foreground border border-border'
                      : 'bg-transparent text-muted-foreground/30 opacity-0 group-hover:opacity-100'
                }`}>
                  <Timer className="h-3 w-3" />
                  {formatTime(seconds)}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleTimer(routine.id)}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-all ${
                      isTimerRunning
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                        : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                    }`}
                    title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                  >
                    {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  {seconds > 0 && (
                    <button
                      onClick={() => resetTimer(routine.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      title="Reset Timer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
