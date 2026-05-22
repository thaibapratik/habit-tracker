'use client'

import { useState, useEffect } from 'react'
import RoadmapHeader from '@/components/dashboard/RoadmapHeader'
import RoutineTracker from '@/components/dashboard/RoutineTracker'
import RevenueMilestones from '@/components/dashboard/RevenueMilestones'
import DailyMetrics from '@/components/dashboard/DailyMetrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { getCurrentDayNumber, getWeekData, getMeta } from '@/lib/routine'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [startDateStr, setStartDateStr] = useState('')
  const [dayCount, setDayCount] = useState(1)

  useEffect(() => {
    setMounted(true)
    
    // Load initial start date value from localStorage
    const saved = localStorage.getItem('challenge-start-date') || '2026-05-16'
    setStartDateStr(saved)
    setDayCount(getCurrentDayNumber())
  }, [])

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) return
    
    setStartDateStr(val)
    localStorage.setItem('challenge-start-date', val)
    setDayCount(getCurrentDayNumber())
    
    // Refresh guarantees all local timers, checklist keys, and metrics recalculate
    window.location.reload()
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  const weekData = getWeekData(dayCount)
  const phaseName = weekData?.phase || 'Foundation'
  const phaseFocus = weekData?.weekly_goal || 'Setting up'
  const currentRevenue = 0 // Starting fresh tomorrow!

  if (dayCount <= 0) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center space-y-6">
        {/* Start Date Selector Capsule */}
        <div className="flex items-center gap-2.5 bg-background border border-border p-2.5 rounded-xl shadow-sm max-w-sm w-full justify-center">
          <CalendarIcon className="h-4.5 w-4.5 text-primary ml-1" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Adjust Start Date</span>
            <input
              type="date"
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none focus:ring-0 w-28 cursor-pointer"
              value={startDateStr}
              onChange={handleStartDateChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            The Content Engine
          </h1>
          <p className="text-xl text-muted-foreground">
            Your 90-day challenge starts in {Math.abs(dayCount) + 1} days.
          </p>
        </div>
        
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Core Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-left space-y-2">
              {getMeta().core_rules.map((rule: string, i: number) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Container */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-secondary/15 p-4 md:p-6 rounded-2xl border border-primary/10">
        <div className="flex-1 w-full">
          <RoadmapHeader 
            dayCount={dayCount} 
            phaseName={phaseName} 
            phaseFocus={phaseFocus} 
          />
        </div>
        
        {/* Start Date Selector Capsule */}
        <div className="flex items-center gap-2.5 bg-background border border-border p-2.5 rounded-xl shadow-sm w-full lg:w-auto justify-start lg:justify-center">
          <CalendarIcon className="h-4.5 w-4.5 text-primary ml-1" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Challenge Start Date</span>
            <input
              type="date"
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none focus:ring-0 w-28 cursor-pointer"
              value={startDateStr}
              onChange={handleStartDateChange}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Focus */}
        <div className="lg:col-span-8 space-y-8">
          <RoutineTracker />
          <DailyMetrics kpiTargets={weekData?.kpi_targets} />
          
          {/* Recent History Heatmap Strip */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 justify-between">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-12 w-full rounded-md border ${
                      i < 4 ? 'bg-primary/80' : 'bg-muted'
                    }`}
                    title={`Day ${i + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Milestones & Stats */}
        <div className="lg:col-span-4 space-y-8">
          <RevenueMilestones currentRevenue={currentRevenue} />
          
          <Card>
            <CardHeader>
              <CardTitle>Business Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground text-sm">MRR</span>
                <span className="text-xl font-bold">$0</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground text-sm">Total Earned</span>
                <span className="text-xl font-bold">$0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Active Streak</span>
                <span className="text-xl font-bold text-orange-500">0 Days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Core Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getMeta().core_rules.map((rule: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
