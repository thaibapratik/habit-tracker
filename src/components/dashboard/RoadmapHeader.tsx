import { Badge } from '@/components/ui/badge'

interface RoadmapHeaderProps {
  dayCount: number
  phaseName: string
  phaseFocus: string
}

export default function RoadmapHeader({
  dayCount,
  phaseName,
  phaseFocus,
}: RoadmapHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Let's hit those numbers today.</p>
      </div>
      <div className="flex items-center gap-3 bg-secondary/50 p-3 rounded-xl border">
        <div className="text-right">
          <div className="text-sm font-medium">Day {dayCount} of 90</div>
          <div className="text-xs text-muted-foreground">Phase: {phaseName}</div>
        </div>
        <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1">
          {phaseFocus}
        </Badge>
      </div>
    </div>
  )
}
