'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RevenueMilestones from '@/components/dashboard/RevenueMilestones'
import { PlusCircle, TrendingUp, Wallet, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const initialRevenueData: any[] = []

export default function RevenuePage() {
  const [revenueItems, setRevenueItems] = useState(initialRevenueData)
  const currentTotal = revenueItems.reduce((acc, item) => acc + item.amount, 0)
  const mrr = revenueItems.filter(item => item.isRecurring).reduce((acc, item) => acc + item.amount, 0)

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Dashboard</h1>
          <p className="text-muted-foreground">Track your progress toward financial freedom.</p>
        </div>
        <Dialog>
          <DialogTrigger
            className={cn(
              "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
              "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
              "gap-2 h-11 px-8 text-base" // size: lg equivalent
            )}
          >
            <PlusCircle className="h-5 w-5" />
            Add Income
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Income</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" type="number" placeholder="500" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client">Client Name</Label>
                <Input id="client" placeholder="Acme Corp" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" placeholder="Audit / Retainer" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="recurring" className="rounded border-gray-300" />
                <Label htmlFor="recurring">Is Recurring (MRR)</Label>
              </div>
              <Button className="w-full mt-4">Save Income</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium opacity-80 text-primary-foreground/80">Total Earned</p>
                <p className="text-3xl font-bold">${currentTotal.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">MRR</p>
                <p className="text-3xl font-bold text-primary">${mrr.toLocaleString()}</p>
              </div>
              <Repeat className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Lifetime</p>
                <p className="text-3xl font-bold">${currentTotal.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Income Log</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.receivedAt}</TableCell>
                      <TableCell className="font-medium">{item.clientName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.isRecurring ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.source}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold">${item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-4">
          <RevenueMilestones currentRevenue={currentTotal} />
        </div>
      </div>
    </main>
  )
}
