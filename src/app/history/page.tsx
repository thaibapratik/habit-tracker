'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCurrentDayNumber, getMeta, getChallengeStartDate } from '@/lib/routine'
import {
  Trophy,
  Flame,
  Award,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  Video,
  Plus,
  CheckCircle2,
  Lock,
  Calendar as CalendarIcon,
  ChevronRight,
  Star,
  Users,
  Target,
  BarChart2,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Loader2
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

// Badge Types
interface BadgeItem {
  id: string
  title: string
  desc: string
  icon: any
  points: number
  unlocked: boolean
  requirement: string
}

// Content Post Type
interface ContentPost {
  id: string
  title: string
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  date: string
}

export default function HistoryPage() {
  const [mounted, setMounted] = useState(false)
  const [startDateStr, setStartDateStr] = useState('')
  const [dayCount, setDayCount] = useState(1)

  const [activeTab, setActiveTab] = useState<'analytics' | 'gamification' | 'content'>('analytics')
  const [points, setPoints] = useState(0)
  const [selectedDay, setSelectedDay] = useState<any>(null)
  
  // Content Metrics State
  const [contentPosts, setContentPosts] = useState<ContentPost[]>([])
  const [newPost, setNewPost] = useState({
    title: '',
    platform: 'LinkedIn',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    date: new Date().toISOString().split('T')[0]
  })
  const [isAddPostOpen, setIsAddPostOpen] = useState(false)

  // Challenges States
  const [dailyCompleted, setDailyCompleted] = useState(false)
  const [weeklyCompleted, setWeeklyCompleted] = useState(false)

  // Streaks
  const [currentStreak, setCurrentStreak] = useState(3)

  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [manualDays, setManualDays] = useState<Record<number, boolean>>({})
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load initial start date value from localStorage
    const saved = localStorage.getItem('challenge-start-date') || '2026-05-16'
    setStartDateStr(saved)
    
    const activeDayCount = Math.max(1, getCurrentDayNumber())
    setDayCount(activeDayCount)

    // 1. Fetch points from localStorage
    const savedPoints = parseInt(localStorage.getItem('gamification-points') || '350') // Default 350 so leaderboard looks interesting
    setPoints(savedPoints)

    // Save initial points if not set yet to guarantee active leaderboards
    if (!localStorage.getItem('gamification-points')) {
      localStorage.setItem('gamification-points', '350')
    }

    // 2. Load Content Posts
    const savedPosts = localStorage.getItem('routine-content-posts')
    if (savedPosts) {
      setContentPosts(JSON.parse(savedPosts))
    } else {
      const mockPosts: ContentPost[] = [
        { id: '1', title: 'Why I left my 9-5 to build The Content Engine', platform: 'LinkedIn', views: 2450, likes: 142, comments: 24, shares: 8, date: '2026-05-12' },
        { id: '2', title: 'How to scale outreach without burning out (Systems guide)', platform: 'Twitter/X', views: 4200, likes: 210, comments: 45, shares: 19, date: '2026-05-14' },
        { id: '3', title: 'Building in public: Day 1 of the 90-Day Challenge', platform: 'LinkedIn', views: 1890, likes: 98, comments: 12, shares: 2, date: '2026-05-15' }
      ]
      setContentPosts(mockPosts)
      localStorage.setItem('routine-content-posts', JSON.stringify(mockPosts))
    }

    // Load challenge states
    setDailyCompleted(localStorage.getItem('challenge-daily') === 'true')
    setWeeklyCompleted(localStorage.getItem('challenge-weekly') === 'true')

    // Load manual worked days
    const manual: Record<number, boolean> = {}
    for (let d = 1; d <= 90; d++) {
      if (localStorage.getItem(`routine-manual-day-${d}`) === 'true') {
        manual[d] = true
      }
    }
    setManualDays(manual)

    // 3. Generate 90 days heatmap data
    const start = getChallengeStartDate()
    const generatedDays = Array.from({ length: 90 }, (_, i) => {
      const dayNum = i + 1
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      
      // Let's populate realistic consistency levels
      let level = 0 // 0 to 4
      let completedCount = 0
      let totalCount = 5
      let focusTime = 0
      
      const isManual = localStorage.getItem(`routine-manual-day-${dayNum}`) === 'true'
      
      if (isManual) {
        level = 4
        completedCount = 5
        focusTime = 60
      } else if (dayNum < activeDayCount) {
        // Realistic historic mock consistency
        const rand = Math.random()
        if (rand > 0.85) {
          level = 4
          completedCount = 5
          focusTime = Math.floor(Math.random() * 40) + 60
        } else if (rand > 0.5) {
          level = 3
          completedCount = 4
          focusTime = Math.floor(Math.random() * 30) + 40
        } else if (rand > 0.2) {
          level = 2
          completedCount = 3
          focusTime = Math.floor(Math.random() * 20) + 20
        } else if (rand > 0.08) {
          level = 1
          completedCount = 1
          focusTime = Math.floor(Math.random() * 15)
        } else {
          level = 0
          completedCount = 0
          focusTime = 0
        }
      } else if (dayNum === activeDayCount) {
        // Load real live state for today
        const savedRoutine = localStorage.getItem(`routine-day-${dayNum}`)
        const savedTime = localStorage.getItem(`routine-time-day-${dayNum}`)
        
        let completedObj = {}
        let timeObj = {}
        
        if (savedRoutine) completedObj = JSON.parse(savedRoutine)
        if (savedTime) timeObj = JSON.parse(savedTime)
        
        completedCount = Object.values(completedObj).filter(Boolean).length
        const totalSecs = Object.values(timeObj).reduce((acc: number, cur: any) => acc + (parseInt(cur) || 0), 0)
        focusTime = Math.round(totalSecs / 60)
        
        const ratio = completedCount / totalCount
        if (ratio === 1) level = 4
        else if (ratio >= 0.75) level = 3
        else if (ratio >= 0.5) level = 2
        else if (ratio > 0) level = 1
        else level = 0
      }
      
      return {
        dayNumber: dayNum,
        date,
        level,
        completedCount,
        totalCount,
        focusTime
      }
    })
    
    setHeatmapData(generatedDays)
    setSelectedDay(generatedDays[activeDayCount - 1] || generatedDays[0])
  }, [])

  // Award Points Helper
  const awardPoints = (amount: number) => {
    const newPoints = points + amount
    setPoints(newPoints)
    localStorage.setItem('gamification-points', newPoints.toString())
  }

  const handleToggleManualDay = (dayNum: number) => {
    const currentlyManual = !!manualDays[dayNum]
    const nextState = !currentlyManual
    
    // Update manualDays state
    const updatedManual = { ...manualDays, [dayNum]: nextState }
    setManualDays(updatedManual)
    
    // Save to localStorage
    localStorage.setItem(`routine-manual-day-${dayNum}`, nextState ? 'true' : 'false')
    
    // Re-generate heatmapData array so that the grid updates reactively
    setHeatmapData(prev => prev.map(day => {
      if (day.dayNumber === dayNum) {
        return {
          ...day,
          level: nextState ? 4 : 0,
          completedCount: nextState ? 5 : 0,
          focusTime: nextState ? 60 : 0
        }
      }
      return day
    }))
    
    // Update selectedDay to reflect the change immediately in details card
    setSelectedDay((prev: any) => {
      if (prev && prev.dayNumber === dayNum) {
        return {
          ...prev,
          level: nextState ? 4 : 0,
          completedCount: nextState ? 5 : 0,
          focusTime: nextState ? 60 : 0
        }
      }
      return prev
    })
    
    // Award or deduct points
    const pts = nextState ? 110 : -110 // 50 pts for habits + 60 pts for focus time = 110 pts!
    awardPoints(pts)
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!val) return
    
    setStartDateStr(val)
    localStorage.setItem('challenge-start-date', val)
    setDayCount(getCurrentDayNumber())
    window.location.reload()
  }

  const confirmResetProgress = () => {
    // Clear all localStorage keys related to our engine
    localStorage.removeItem('gamification-points')
    localStorage.removeItem('routine-content-posts')
    localStorage.removeItem('challenge-daily')
    localStorage.removeItem('challenge-weekly')
    
    // Clear routine trackers for all 90 days
    for (let d = 1; d <= 90; d++) {
      localStorage.removeItem(`routine-day-${d}`)
      localStorage.removeItem(`routine-time-day-${d}`)
      localStorage.removeItem(`routine-manual-day-${d}`)
    }
    
    // Reset state values
    setPoints(0)
    setCurrentStreak(0)
    setContentPosts([])
    setDailyCompleted(false)
    setWeeklyCompleted(false)
    setManualDays({})
    
    // Re-initialize heatmap to blank fresh starts
    const freshDays = heatmapData.map(day => ({
      ...day,
      level: 0,
      completedCount: 0,
      focusTime: 0
    }))
    setHeatmapData(freshDays)
    if (freshDays.length > 0) {
      setSelectedDay(freshDays[0])
    }
    
    setIsResetConfirmOpen(false)
    setShowSuccessToast(true)
    
    setTimeout(() => {
      setShowSuccessToast(false)
    }, 4000)
  }

  // Complete Daily Challenge
  const handleCompleteDaily = () => {
    if (dailyCompleted) return
    setDailyCompleted(true)
    localStorage.setItem('challenge-daily', 'true')
    awardPoints(50)
  }

  // Complete Weekly Challenge
  const handleCompleteWeekly = () => {
    if (weeklyCompleted) return
    setWeeklyCompleted(true)
    localStorage.setItem('challenge-weekly', 'true')
    awardPoints(200)
  }

  // Save new post to Content Tracker
  const handleAddPost = () => {
    if (!newPost.title) return
    
    const post: ContentPost = {
      id: Math.random().toString(),
      title: newPost.title,
      platform: newPost.platform,
      views: Number(newPost.views),
      likes: Number(newPost.likes),
      comments: Number(newPost.comments),
      shares: Number(newPost.shares),
      date: newPost.date
    }
    
    const updated = [post, ...contentPosts]
    setContentPosts(updated)
    localStorage.setItem('routine-content-posts', JSON.stringify(updated))
    
    // Award 30 points for logging a content post
    awardPoints(30)
    
    setIsAddPostOpen(false)
    setNewPost({
      title: '',
      platform: 'LinkedIn',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      date: new Date().toISOString().split('T')[0]
    })
  }

  // Dynamic Badges/Achievements check
  const totalDMsTracked = 120 // Simulating some cumulative progress
  const totalFocusMin = heatmapData.reduce((acc, d) => acc + d.focusTime, 0)
  const totalFocusHrs = (totalFocusMin / 60).toFixed(1)

  const badges: BadgeItem[] = [
    { id: '1', title: 'First Blood', desc: 'Complete your first outreach DM', icon: Target, points: 50, unlocked: true, requirement: '1 DM sent' },
    { id: '2', title: 'Outreach Machine', desc: 'Log 100 total outreach DMs', icon: Zap, points: 200, unlocked: totalDMsTracked >= 100, requirement: '100 DMs' },
    { id: '3', title: 'Consistency King', desc: 'Maintain a 5-day perfect streak', icon: Flame, points: 300, unlocked: currentStreak >= 5, requirement: '5-Day Streak' },
    { id: '4', title: 'Focus Master', desc: 'Track 5 hours of total routine time', icon: Clock, points: 150, unlocked: totalFocusMin >= 300, requirement: '5 Hrs Focus' },
    { id: '5', title: 'Content Producer', desc: 'Log 5 content posts to tracker', icon: Video, points: 250, unlocked: contentPosts.length >= 5, requirement: '5 Posts Logged' },
    { id: '6', title: 'Point Millionaire', desc: 'Amass 500 lifetime engine points', icon: Award, points: 500, unlocked: points >= 500, requirement: '500 Points' },
    { id: '7', title: 'Cohort Top 3', desc: 'Secure a top 3 spot on the leaderboard', icon: Trophy, points: 400, unlocked: points >= 1100, requirement: 'Rank in Top 3' },
    { id: '8', title: 'Time Titan', desc: 'Track 20 hours of focused routine work', icon: Star, points: 500, unlocked: totalFocusMin >= 1200, requirement: '20 Hrs Focus' }
  ]

  // Leaderboard data
  const baseCohort = [
    { name: 'Marcus G. (Viper AI)', score: 1420, avatar: 'M' },
    { name: 'Sarah K. (ScaleSaaS)', score: 1280, avatar: 'S' },
    { name: 'You (Content Engine)', score: points, avatar: 'U', isUser: true },
    { name: 'Alex M. (ReelFlow)', score: 980, avatar: 'A' },
    { name: 'Elena R. (Ghostwriter)', score: 750, avatar: 'E' }
  ]
  const sortedLeaderboard = [...baseCohort].sort((a, b) => b.score - a.score)

  // Goal completion metrics
  const totalRevenue = 1500 // Simulating current income
  const revenueGoalPct = Math.min(100, Math.round((totalRevenue / 10000) * 100))
  const dmGoalPct = Math.min(100, Math.round((totalDMsTracked / 500) * 100))
  const focusGoalPct = Math.min(100, Math.round((totalFocusMin / 2400) * 100)) // Goal: 40 hours (2400 mins)

  // Performance analytics mock chart data (Outreach DMs vs Replies over 6 weeks)
  const outreachChartData = [
    { name: 'Week 1', DMs: 35, Replies: 8 },
    { name: 'Week 2', DMs: 45, Replies: 14 },
    { name: 'Week 3', DMs: 50, Replies: 19 },
    { name: 'Week 4', DMs: 60, Replies: 24 },
    { name: 'Week 5', DMs: 55, Replies: 20 },
    { name: 'Week 6', DMs: totalDMsTracked > 100 ? 70 : 65, Replies: totalDMsTracked > 100 ? 32 : 26 }
  ]

  // Time allocation chart data
  const timeAllocationData = [
    { name: 'Outreach', value: Math.round(totalFocusMin * 0.45) || 120 },
    { name: 'Content', value: Math.round(totalFocusMin * 0.35) || 90 },
    { name: 'Client Work', value: Math.round(totalFocusMin * 0.20) || 50 }
  ]
  const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b']

  // Views over time chart data
  const viewsChartData = contentPosts.slice().reverse().map((post, idx) => ({
    name: `Post ${idx + 1}`,
    views: post.views,
    engagement: Math.round((post.likes + post.comments + post.shares) / post.views * 1000) / 10
  }))

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    )
  }

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-muted hover:bg-muted/80'
      case 1: return 'bg-violet-500/20 hover:bg-violet-500/30'
      case 2: return 'bg-violet-500/40 hover:bg-violet-500/50'
      case 3: return 'bg-violet-500/70 hover:bg-violet-500/80'
      case 4: return 'bg-violet-500 hover:bg-violet-500/90'
      default: return 'bg-muted'
    }
  }

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-8 pt-4 md:pt-8 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-border/40">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" /> Stats & Gamification Hub
          </h1>
          <p className="text-muted-foreground mt-1">Track focus time, dynamic stats, streaks, unlock 3D-styled badges and climb the global cohort.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-secondary/20 p-2 rounded-xl border border-primary/10">
          {/* Start Date Selector Capsule */}
          <div className="flex items-center gap-2 bg-background border border-border px-2.5 py-1 rounded-lg shadow-sm">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-muted-foreground uppercase font-black tracking-wider leading-none">Start Date</span>
              <input
                type="date"
                className="bg-transparent text-[11px] font-bold text-foreground focus:outline-none focus:ring-0 w-24 cursor-pointer p-0 h-4 mt-0.5"
                value={startDateStr}
                onChange={handleStartDateChange}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-primary rounded-lg font-bold h-8 text-xs">
            <Zap className="h-4 w-4 fill-current animate-pulse" />
            {points} pts
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 text-amber-500 rounded-lg font-bold h-8 text-xs">
            <Flame className="h-4 w-4 fill-current text-amber-500" />
            {currentStreak} Day Streak
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs h-8 font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:text-destructive"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            Reset Progress
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart2 className="h-4 w-4" /> Performance & Analytics
        </button>
        <button
          onClick={() => setActiveTab('gamification')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'gamification'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Trophy className="h-4 w-4" /> Gamification & Cohort
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'content'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Video className="h-4 w-4" /> Content Performance Tracker
        </button>
      </div>

      {/* Analytics & Consistency Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Heatmap Section */}
          <Card className="border-border/60">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" /> 90-Day Challenge consistency Grid
                </CardTitle>
                <CardDescription>Click any day block below to pull complete consistency metrics and focus durations.</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 p-2 rounded-lg">
                <span>Less</span>
                <div className="h-3 w-3 rounded bg-muted" />
                <div className="h-3 w-3 rounded bg-violet-500/20" />
                <div className="h-3 w-3 rounded bg-violet-500/40" />
                <div className="h-3 w-3 rounded bg-violet-500/70" />
                <div className="h-3 w-3 rounded bg-violet-500" />
                <span>More</span>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Heatmap Grid */}
              <div className="lg:col-span-8 flex flex-col justify-center">
                <div className="grid grid-flow-col grid-rows-7 gap-1 md:gap-1.5 p-1 bg-secondary/10 rounded-xl border border-border/40 max-w-full overflow-x-auto scrollbar-thin">
                  {heatmapData.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDay(day)}
                      className={`h-4.5 w-4.5 md:h-6 md:w-6 rounded transition-all hover:scale-115 cursor-pointer relative ${getHeatmapColor(day.level)} ${
                        selectedDay?.dayNumber === day.dayNumber ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                      }`}
                      title={`Day ${day.dayNumber}: ${day.completedCount}/${day.totalCount} completed`}
                    />
                  ))}
                </div>
              </div>

              {/* Day Details Card */}
              <div className="lg:col-span-4 bg-muted/30 border border-border p-4 rounded-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b pb-2 border-border">
                    <div>
                      <h4 className="font-bold text-lg text-primary">Day {selectedDay?.dayNumber}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedDay?.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Badge variant={selectedDay?.level >= 3 ? 'default' : selectedDay?.level > 0 ? 'secondary' : 'destructive'}>
                      {selectedDay?.level === 4 ? 'Flawless (100%)' : selectedDay?.level === 3 ? 'Excellent (80%)' : selectedDay?.level === 2 ? 'Good (60%)' : selectedDay?.level === 1 ? 'Just Started' : 'No activity logged'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Habits Completed</span>
                      <span className="font-bold">{selectedDay?.completedCount} / {selectedDay?.totalCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-4 w-4 text-amber-500" /> Focus Time Tracked</span>
                      <span className="font-bold font-mono">{selectedDay?.focusTime} mins</span>
                    </div>
                    <div className="flex justify-between text-sm border-b pb-3 border-border/30">
                      <span className="text-muted-foreground flex items-center gap-1"><Zap className="h-4 w-4 text-violet-500" /> Points Accumulated</span>
                      <span className="font-bold">+{selectedDay?.completedCount * 10 + selectedDay?.focusTime} pts</span>
                    </div>
                    {selectedDay && (
                      <div className="pt-2 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor={`manual-toggle-${selectedDay.dayNumber}`} className="text-sm font-semibold text-foreground cursor-pointer flex items-center gap-1">
                            📅 Mark Day as Worked
                          </label>
                          <input
                            id={`manual-toggle-${selectedDay.dayNumber}`}
                            type="checkbox"
                            className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                            checked={!!manualDays[selectedDay.dayNumber]}
                            onChange={() => handleToggleManualDay(selectedDay.dayNumber)}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Denotes that you completed your daily routine and focus targets on this day manually. Toggling this automatically awards (+110) or deducts (-110) points!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg text-xs flex gap-2">
                  <div className="text-primary font-bold">💡 Tip:</div>
                  <div className="text-muted-foreground">Log more than 60 minutes of active focus stopwatch tracking tomorrow to trigger a streak multiplier!</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Completion Rate circular widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Revenue Goal Milestone</CardTitle>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-2xl font-bold">${totalRevenue}</span>
                  <span className="text-xs text-muted-foreground">Target: $10,000</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Goal Completion Rate</span>
                  <span className="text-primary">{revenueGoalPct}%</span>
                </div>
                <Progress value={revenueGoalPct} className="h-2" />
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Outreach Goal Milestone</CardTitle>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-2xl font-bold">{totalDMsTracked} DMs</span>
                  <span className="text-xs text-muted-foreground">Target: 500 DMs</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Goal Completion Rate</span>
                  <span className="text-violet-500">{dmGoalPct}%</span>
                </div>
                <Progress value={dmGoalPct} className="h-2 bg-secondary" />
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">Focus Session Milestone</CardTitle>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-2xl font-bold">{totalFocusHrs} hrs</span>
                  <span className="text-xs text-muted-foreground">Target: 40 hrs</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Goal Completion Rate</span>
                  <span className="text-emerald-500">{focusGoalPct}%</span>
                </div>
                <Progress value={focusGoalPct} className="h-2 bg-secondary" />
              </CardContent>
            </Card>
          </div>

          {/* Performance Recharts Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* DMs vs Replies */}
            <Card>
              <CardHeader>
                <CardTitle>Outreach Performance Charts</CardTitle>
                <CardDescription>Comparison of DMs Sent vs. Replies Received over the past 6 weeks</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outreachChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }} />
                    <Legend iconSize={8} iconType="circle" />
                    <Bar dataKey="DMs" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="DMs Sent" />
                    <Bar dataKey="Replies" fill="#10b981" radius={[4, 4, 0, 0]} name="Replies Received" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Time Allocation Distribution</CardTitle>
                <CardDescription>Visual summary of total focus minutes tracked via stopwatches</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {timeAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  {timeAllocationData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <span className="font-mono text-sm font-bold">{item.value} min</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Gamification & Leaderboard Tab */}
      {activeTab === 'gamification' && (
        <div className="space-y-8">
          {/* Cohort Leaderboard and Streak Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Leaderboard */}
            <Card className="lg:col-span-7">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> 90-Day Cohort Leaderboard
                </CardTitle>
                <CardDescription>Compete live with other content entrepreneurs in the cohort.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedLeaderboard.map((user, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      user.isUser
                        ? 'bg-primary/10 border-primary/30 font-bold scale-[1.01] ring-1 ring-primary/20 shadow-lg shadow-primary/5'
                        : 'bg-muted/40 border-transparent hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Placement crown / circle */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 
                          ? 'bg-amber-500 text-white fill-current' 
                          : idx === 1 
                            ? 'bg-slate-300 text-slate-800' 
                            : idx === 2 
                              ? 'bg-amber-700 text-amber-100' 
                              : 'bg-muted text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Avatar */}
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-white shadow-inner ${
                        user.isUser ? 'bg-gradient-to-tr from-primary to-violet-500' : 'bg-slate-500'
                      }`}>
                        {user.avatar}
                      </div>

                      <div>
                        <span className="text-sm font-semibold">{user.name}</span>
                        {user.isUser && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full uppercase font-black tracking-wide">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-foreground">{user.score} pts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Streak & Active challenges */}
            <div className="lg:col-span-5 space-y-6">
              {/* Daily & Weekly Challenges */}
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Active Cohort Challenges
                  </CardTitle>
                  <CardDescription>Perform outreach and track timers to complete bonuses.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Daily Challenge */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Daily Challenge</Badge>
                        <span className="text-xs text-muted-foreground font-mono">+50 points</span>
                      </div>
                      <h4 className="font-semibold text-sm">Engagement Sprint</h4>
                      <p className="text-xs text-muted-foreground">Track 30 minutes of Engage routine today.</p>
                    </div>
                    <Button
                      size="sm"
                      variant={dailyCompleted ? 'secondary' : 'default'}
                      onClick={handleCompleteDaily}
                      disabled={dailyCompleted}
                    >
                      {dailyCompleted ? 'Completed ✓' : 'Complete'}
                    </Button>
                  </div>

                  {/* Weekly Challenge */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-violet-500 border-violet-500/20 bg-violet-500/5">Weekly Challenge</Badge>
                        <span className="text-xs text-muted-foreground font-mono">+200 points</span>
                      </div>
                      <h4 className="font-semibold text-sm">Outreach Titan</h4>
                      <p className="text-xs text-muted-foreground">Send 50 outreach DMs this week.</p>
                    </div>
                    <Button
                      size="sm"
                      variant={weeklyCompleted ? 'secondary' : 'default'}
                      onClick={handleCompleteWeekly}
                      disabled={weeklyCompleted}
                    >
                      {weeklyCompleted ? 'Completed ✓' : 'Complete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Streak bonus multiplier summary */}
              <Card className="bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-orange-500 flex items-center gap-2">
                    <Flame className="h-5 w-5 fill-current" /> Streak Bonus Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">You are on a <strong>{currentStreak}-day</strong> consistency streak. Maintain active stopwatch logging to hit your next multiplier milestone!</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Next Milestone: 5 Days</span>
                      <span className="text-orange-500 font-bold">+100 Point Bonus</span>
                    </div>
                    <Progress value={60} className="h-2 bg-orange-500/10" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Achievements Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> Achievements & Badges
              </CardTitle>
              <CardDescription>Perform tasks, hit streaks and log focus time to unlock 3D-styled reward badges.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {badges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border flex flex-col items-center text-center justify-between space-y-3 transition-all group hover:shadow-md ${
                      badge.unlocked
                        ? 'bg-card border-border/80 hover:-translate-y-1'
                        : 'bg-muted/40 border-transparent opacity-60'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                      badge.unlocked
                        ? 'bg-gradient-to-tr from-primary to-violet-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {badge.unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm leading-tight">{badge.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-normal">{badge.desc}</p>
                    </div>

                    <div className="space-y-2 w-full">
                      <Badge variant={badge.unlocked ? 'secondary' : 'outline'} className="text-[10px] w-full justify-center">
                        {badge.requirement}
                      </Badge>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {badge.unlocked ? `Unlocked! +${badge.points} pts` : `Locked (${badge.points} pts)`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Performance Tracker Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Content summary header card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Logged Posts</p>
                    <p className="text-3xl font-extrabold font-mono">{contentPosts.length}</p>
                  </div>
                  <Video className="h-8 w-8 text-primary/45" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Total Views</p>
                    <p className="text-3xl font-extrabold font-mono">
                      {contentPosts.reduce((acc, cur) => acc + cur.views, 0).toLocaleString()}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-emerald-500/45" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Average Engagement</p>
                    <p className="text-3xl font-extrabold font-mono">
                      {(contentPosts.reduce((acc, cur) => {
                        const eng = (cur.likes + cur.comments + cur.shares) / cur.views || 0
                        return acc + eng
                      }, 0) / contentPosts.length * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-rose-500/45" />
                </div>
              </CardContent>
            </Card>

            {/* Log Post Button Dialog */}
            <div className="flex items-center justify-center">
              <Dialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen}>
                <DialogTrigger
                  render={
                    <Button className="w-full h-full min-h-[96px] text-base rounded-xl font-bold bg-primary hover:bg-primary/95 flex flex-col gap-1 shadow-lg shadow-primary/10">
                      <Plus className="h-6 w-6" /> Log New Post
                    </Button>
                  }
                />
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Log New Social Post</DialogTitle>
                    <DialogDescription>Track organic social performance. Logging awards <strong>+30 pts</strong>!</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="post-title">Post Title / Hook</Label>
                      <Input
                        id="post-title"
                        placeholder="e.g. Why I built a SaaS in 24 hours..."
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="post-platform">Platform</Label>
                        <Select
                          value={newPost.platform}
                          onValueChange={(val) => setNewPost({ ...newPost, platform: val || 'LinkedIn' })}
                        >
                          <SelectTrigger id="post-platform">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="Twitter/X">Twitter/X</SelectItem>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="post-date">Publish Date</Label>
                        <Input
                          id="post-date"
                          type="date"
                          value={newPost.date}
                          onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="post-views">Views / Impressions</Label>
                        <Input
                          id="post-views"
                          type="number"
                          value={newPost.views}
                          onChange={(e) => setNewPost({ ...newPost, views: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="post-likes">Likes</Label>
                        <Input
                          id="post-likes"
                          type="number"
                          value={newPost.likes}
                          onChange={(e) => setNewPost({ ...newPost, likes: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="post-comments">Comments</Label>
                        <Input
                          id="post-comments"
                          type="number"
                          value={newPost.comments}
                          onChange={(e) => setNewPost({ ...newPost, comments: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="post-shares">Shares / Retweets</Label>
                        <Input
                          id="post-shares"
                          type="number"
                          value={newPost.shares}
                          onChange={(e) => setNewPost({ ...newPost, shares: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsAddPostOpen(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={handleAddPost}>Log & Earn Points</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Organic views growth and post table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Views Growth AreaChart */}
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Views Growth Trend</CardTitle>
                <CardDescription>Overview of organic views and engagement rates</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px]">
                {viewsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }} />
                      <Area type="monotone" dataKey="views" stroke="#8b5cf6" fillOpacity={0.1} fill="url(#colorViews)" name="Views" />
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No content posts logged yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Post log table */}
            <Card className="lg:col-span-7 overflow-hidden">
              <CardHeader>
                <CardTitle>Organic Posts Ledger</CardTitle>
                <CardDescription>Chronological ledger of logged content engine posts</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Date</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Title / Hook</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right pr-4">Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contentPosts.length > 0 ? (
                      contentPosts.map((post) => {
                        const totalEng = post.likes + post.comments + post.shares
                        const engPct = ((totalEng / post.views) * 100).toFixed(1)
                        
                        return (
                          <TableRow key={post.id} className="hover:bg-muted/30">
                            <TableCell className="pl-4 font-mono text-xs text-muted-foreground">{post.date}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {post.platform}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold max-w-[200px] truncate" title={post.title}>
                              {post.title}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-xs">{post.views.toLocaleString()}</TableCell>
                            <TableCell className="text-right pr-4 font-mono font-bold text-xs text-emerald-500">{engPct}%</TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                          Click "Log New Post" to start tracking organic statistics.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-background border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-6 mx-4">
            <div className="flex items-center gap-4 text-destructive">
              <div className="bg-destructive/10 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl tracking-tight text-foreground">Reset Progress?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                Are you absolutely sure you want to reset all engine progress back to zero?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Points will be reset to 0</li>
                <li>Daily and weekly streaks will be cleared</li>
                <li>Routine progress logs for all 90 days will be wiped</li>
                <li>Organic content metric posts will be deleted</li>
                <li>Unlocked badges will be locked again</li>
              </ul>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                className="h-10 font-semibold px-4 text-xs md:text-sm"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                No, Keep My Progress
              </Button>
              <Button
                variant="destructive"
                className="h-10 font-semibold px-4 text-xs md:text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={confirmResetProgress}
              >
                Yes, Reset Everything
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-semibold py-3 px-5 rounded-xl shadow-2xl flex items-center gap-2.5 border border-emerald-400/20">
          <CheckCircle2 className="h-5 w-5 text-white" />
          <span>Progress has been successfully reset to 0!</span>
        </div>
      )}
    </main>
  )
}
