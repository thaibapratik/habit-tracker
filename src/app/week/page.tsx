'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const routines = ['10 DMs', 'Post', 'Engage', 'Follow-ups', 'Client Work']

// Mock data: true/false for each day and routine
const weeklyData = [
  [true, true, true, true, false], // Mon
  [true, true, true, true, true],  // Tue
  [true, true, true, true, true],  // Wed
  [true, true, true, true, true],  // Thu
  [true, true, true, false, false], // Fri
  [false, false, false, false, false], // Sat
  [false, false, false, false, false], // Sun
]

export default function WeeklyPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly View</h1>
        <p className="text-muted-foreground">Monitor your performance across the week.</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>7-Day Performance Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 font-semibold border-b">Routine</th>
                  {daysOfWeek.map(day => (
                    <th key={day} className="p-4 font-semibold border-b text-center">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routines.map((routine, routineIdx) => (
                  <tr key={routine} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium border-b">{routine}</td>
                    {weeklyData.map((dayData, dayIdx) => (
                      <td key={dayIdx} className="p-4 border-b text-center">
                        <div className={`mx-auto h-8 w-8 flex items-center justify-center rounded-lg ${
                          dayData[routineIdx] 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {dayData[routineIdx] ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30">
                  <td className="p-4 font-bold">Daily Completion</td>
                  {weeklyData.map((dayData, i) => {
                    const pct = Math.round((dayData.filter(Boolean).length / routines.length) * 100)
                    return (
                      <td key={i} className="p-4 text-center">
                        <span className={`font-bold ${
                          pct === 100 ? 'text-green-600' : pct > 50 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Week vs Last Week</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
            Chart Placeholder (Recharts)
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</div>
                <span>Close 2 more audits for the $1,000 milestone.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</div>
                <span>Batch content for next week (5 posts).</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
