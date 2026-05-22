'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const milestones = [
  { label: '$100', target: 100 },
  { label: '$1,000', target: 1000 },
  { label: '$10,000', target: 10000 },
]

export default function RevenueMilestones({ currentRevenue = 0 }: { currentRevenue?: number }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Revenue Milestones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {milestones.map((milestone) => {
          const progress = Math.min((currentRevenue / milestone.target) * 100, 100)
          return (
            <div key={milestone.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{milestone.label} Milestone</span>
                <span className="text-muted-foreground">
                  ${currentRevenue.toLocaleString()} / ${milestone.target.toLocaleString()}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
