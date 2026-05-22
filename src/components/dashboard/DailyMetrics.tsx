'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'

export default function DailyMetrics({ kpiTargets }: { kpiTargets?: any }) {
  const [metrics, setMetrics] = useState({
    dms: 0,
    replies: 0,
    calls: 0,
    audits: 0,
    retainers: 0,
  })

  const updateMetric = (id: keyof typeof metrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [id]: Math.max(0, value) }))
  }

  const adjustMetric = (id: keyof typeof metrics, delta: number) => {
    updateMetric(id, metrics[id] + delta)
  }

  const metricFields = [
    { id: 'dms', label: 'DMs Sent', key: 'dms' as const },
    { id: 'replies', label: 'Replies', key: 'replies' as const },
    { id: 'calls', label: 'Calls Booked', key: 'calls' as const },
    { id: 'audits', label: 'Audits Sold', key: 'audits' as const },
    { id: 'retainers', label: 'Retainers Signed', key: 'retainers' as const },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Daily Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id}>{field.label}</Label>
              {kpiTargets && (
                <span className="text-xs text-muted-foreground">
                  Weekly Target: {kpiTargets[field.id] || 0}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustMetric(field.key, -1)}
                className="h-9 w-9"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id={field.id}
                type="number"
                value={metrics[field.key]}
                onChange={(e) => updateMetric(field.key, parseInt(e.target.value) || 0)}
                className="text-center text-lg font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustMetric(field.key, 1)}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
