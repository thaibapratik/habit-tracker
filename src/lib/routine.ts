import routineData from '@/data/routine.json'

export interface TimeBlock {
  time: string
  activity: string
  category: string
  duration_min: number
}

export interface DayData {
  day: number
  weekday: string
  title: string
  time_blocks: TimeBlock[]
}

export interface WeekData {
  week_number: number
  phase: string
  theme: string
  weekly_goal: string
  kpi_targets: Record<string, any>
  days: DayData[]
}

export interface RoutineData {
  meta: {
    owner: string
    goal_90_day: string
    start_date: string
    total_days: number
  }
  weeks: WeekData[]
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getChallengeStartDate(): Date {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('challenge-start-date')
    if (saved) {
      try {
        return parseLocalDate(saved)
      } catch (e) {
        console.error(e)
      }
    }
  }
  return parseLocalDate('2026-05-16')
}

export function getCurrentDayNumber() {
  const now = new Date()
  const start = getChallengeStartDate()
  
  // Set both to midnight in the local timezone for accurate day counting
  now.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  
  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  return diffDays // Can be <= 0 if starting in future
}

export function getDayData(dayNumber: number): DayData | null {
  for (const week of (routineData as any).weeks) {
    const day = week.days.find((d: any) => d.day === dayNumber)
    if (day) {
      const start = getChallengeStartDate()
      const targetDate = new Date(start)
      targetDate.setDate(targetDate.getDate() + (dayNumber - 1))
      
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dynamicWeekday = weekdays[targetDate.getDay()]
      
      return {
        ...day,
        weekday: dynamicWeekday
      }
    }
  }
  return null
}

export function getWeekData(dayNumber: number): WeekData | null {
  return (routineData as any).weeks.find((w: any) => 
    w.days.some((d: any) => d.day === dayNumber)
  ) || null
}

export function getMeta() {
  return (routineData as any).meta
}
