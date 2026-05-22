'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, User, ExternalLink, RefreshCw, Settings2, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'replied', label: 'Replied' },
  { value: 'call_booked', label: 'Call Booked' },
  { value: 'audit_sold', label: 'Audit Sold' },
  { value: 'retainer', label: 'Retainer' },
  { value: 'lost', label: 'Lost' },
]

function useNotionSchema() {
  const [columns, setColumns] = useState<any[]>([])

  const fetchSchema = useCallback(async () => {
    try {
      const res = await fetch('/api/clients/schema')
      const data = await res.json()
      if (Array.isArray(data)) {
        const coreColumns = ['Name', 'Niche', 'Status', 'Priority', 'Notes']
        setColumns(data.filter(c => !coreColumns.includes(c.name)))
      }
    } catch (e) {
      console.error('Failed to fetch schema', e)
    }
  }, [])

  useEffect(() => {
    fetchSchema()
    const interval = setInterval(fetchSchema, 15000)
    return () => clearInterval(interval)
  }, [fetchSchema])

  const addColumn = async (name: string, type: string) => {
    await fetch('/api/clients/schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type })
    })
    await fetchSchema()
  }

  return { columns, addColumn, refresh: fetchSchema }
}

const EMPTY_CLIENT = {
  name: '',
  niche: '',
  priority: 'Low',
  status: 'prospect',
  notes: '',
  dynamicProps: {}
}

const STATUS_DOT: Record<string, string> = {
  prospect: 'bg-blue-500',
  replied: 'bg-orange-500',
  call_booked: 'bg-purple-500',
  audit_sold: 'bg-pink-500',
  retainer: 'bg-green-500',
  lost: 'bg-red-500',
}

function renderDynamicInput(col: any, state: any, setState: (v: any) => void) {
  const value = state.dynamicProps?.[col.name]?.value || ''
  const onChange = (val: any) => {
    setState({
      ...state,
      dynamicProps: {
        ...state.dynamicProps,
        [col.name]: { type: col.type, value: val }
      }
    })
  }

  if (col.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-2"
      />
    )
  }

  return (
    <Input
      id={`dyn-${col.name}`}
      placeholder={`Enter ${col.name}...`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
    />
  )
}

function ClientForm({
  state,
  setState,
  dynamicColumns,
}: {
  state: any
  setState: (v: any) => void
  dynamicColumns: any[]
}) {
  return (
    <div className="space-y-4 py-2">
      {/* Name + Niche row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="form-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client Name</Label>
          <Input
            id="form-name"
            placeholder="e.g. Acme Corp"
            value={state.name}
            className="h-9"
            onChange={(e) => setState({ ...state, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="form-niche" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Niche</Label>
          <Input
            id="form-niche"
            placeholder="e.g. SaaS, eComm"
            value={state.niche}
            className="h-9"
            onChange={(e) => setState({ ...state, niche: e.target.value })}
          />
        </div>
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="form-status" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</Label>
          <Select value={state.status} onValueChange={(val) => setState({ ...state, status: val })}>
            <SelectTrigger id="form-status" className="h-9 w-full">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[state.status] || 'bg-slate-500')} />
                <SelectValue placeholder="Select status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[opt.value])} />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="form-priority" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</Label>
          <Select value={state.priority} onValueChange={(val) => setState({ ...state, priority: val })}>
            <SelectTrigger id="form-priority" className="h-9 w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-400" />Low</div>
              </SelectItem>
              <SelectItem value="Medium">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-400" />Medium</div>
              </SelectItem>
              <SelectItem value="High">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-400" />High</div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="form-notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</Label>
        <Input
          id="form-notes"
          placeholder="Any additional context..."
          value={state.notes}
          className="h-9"
          onChange={(e) => setState({ ...state, notes: e.target.value })}
        />
      </div>

      {/* Dynamic columns */}
      {dynamicColumns.length > 0 && (
        <div className="border-t pt-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom Fields</p>
          <div className="grid grid-cols-2 gap-3">
            {dynamicColumns.map(col => (
              <div key={col.name} className="space-y-1.5">
                <Label htmlFor={`dyn-${col.name}`} className="text-xs text-muted-foreground">{col.name}</Label>
                {renderDynamicInput(col, state, setState)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


export default function CRMPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const { columns: dynamicColumns, addColumn } = useNotionSchema()

  const [newClient, setNewClient] = useState<any>({ ...EMPTY_CLIENT })
  const [isAdding, setIsAdding] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const [editClient, setEditClient] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [newColName, setNewColName] = useState('')
  const [newColType, setNewColType] = useState('rich_text')
  const [isAddingCol, setIsAddingCol] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch clients', err)
    }
    setLoading(false)
  }

  async function syncWithNotion() {
    setSyncing(true)
    try {
      await fetch('/api/clients/sync', { method: 'POST' })
      await fetchClients()
    } catch (err) {
      console.error('Failed to sync', err)
    }
    setSyncing(false)
  }

  async function handleAddClient() {
    setIsAdding(true)
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })
      await fetchClients()
      setNewClient({ ...EMPTY_CLIENT })
      setAddOpen(false)
    } catch (err) {
      console.error('Failed to add client', err)
    }
    setIsAdding(false)
  }

  async function handleEditClient() {
    if (!editClient) return
    setIsEditing(true)
    try {
      await fetch(`/api/clients/${editClient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editClient)
      })
      await fetchClients()
      setEditOpen(false)
    } catch (err) {
      console.error('Failed to edit client', err)
    }
    setIsEditing(false)
  }

  async function handleDeleteClient(id: string) {
    if (!confirm('Delete this client?')) return
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      await fetchClients()
    } catch (err) {
      console.error('Failed to delete client', err)
    }
  }

  async function handleAddColumn() {
    setIsAddingCol(true)
    try {
      await addColumn(newColName, newColType)
      setNewColName('')
    } catch (err) {
      console.error('Failed to add column', err)
    }
    setIsAddingCol(false)
  }

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.niche.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospect': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'call_booked': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'audit_sold': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
      case 'retainer': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'replied': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'lost': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }


  return (
    <main className="min-h-screen bg-background p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM / Clients</h1>
          <p className="text-muted-foreground">Manage your prospects and clients with Notion sync.</p>
        </div>
        <div className="flex flex-wrap gap-2">

          {/* Add Column Dialog */}
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <Settings2 className="mr-2 h-4 w-4" />
              Add Column
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Column</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="colName">Column Name</Label>
                  <Input
                    id="colName"
                    placeholder="e.g. Company Size"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="colType">Column Type</Label>
                  <Select value={newColType} onValueChange={(v) => v && setNewColType(v)}>
                    <SelectTrigger id="colType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rich_text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleAddColumn}
                  disabled={isAddingCol || !newColName}
                >
                  {isAddingCol ? 'Adding...' : 'Add to Notion & App'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Sync Button */}
          <Button variant="outline" onClick={syncWithNotion} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Notion
          </Button>

          {/* Add Client Dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-base">New Client</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Add a new prospect or client to your CRM</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="border-t pt-4">
                <ClientForm state={newClient} setState={setNewClient} dynamicColumns={dynamicColumns} />
              </div>
              <div className="border-t pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  onClick={handleAddClient}
                  disabled={isAdding || !newClient.name}
                >
                  {isAdding ? 'Saving...' : 'Save Client'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pencil className="h-4 w-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">{editClient?.name || 'Edit Client'}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Update client details and sync to Notion</p>
              </div>
            </div>
          </DialogHeader>
          {editClient && (
            <>
              <div className="border-t pt-4">
                <ClientForm state={editClient} setState={setEditClient} dynamicColumns={dynamicColumns} />
              </div>
              <div className="border-t pt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  onClick={handleEditClient}
                  disabled={isEditing || !editClient.name}
                >
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients or niches..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left font-medium py-3 px-2 whitespace-nowrap">Client Name</th>
                  <th className="text-left font-medium py-3 px-2 whitespace-nowrap">Niche</th>
                  <th className="text-left font-medium py-3 px-2 whitespace-nowrap">Priority</th>
                  <th className="text-left font-medium py-3 px-2 whitespace-nowrap">Status</th>
                  {dynamicColumns.map(col => (
                    <th key={col.name} className="text-left font-medium py-3 px-2 whitespace-nowrap">{col.name}</th>
                  ))}
                  <th className="text-right font-medium py-3 px-2 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5 + dynamicColumns.length} className="text-center py-8 text-muted-foreground">Loading clients...</td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5 + dynamicColumns.length} className="text-center py-8 text-muted-foreground">No clients found.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const parsedDynProps = typeof client.dynamicProps === 'string'
                      ? JSON.parse(client.dynamicProps)
                      : (client.dynamicProps || {})

                    return (
                      <tr key={client.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-2 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                            {client.name}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-muted-foreground whitespace-nowrap">{client.niche}</td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <Badge variant="outline" className={
                            client.priority === 'High' ? 'text-red-500 border-red-500/20 bg-red-500/10' :
                            client.priority === 'Medium' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' :
                            'text-slate-500 border-slate-500/20 bg-slate-500/10'
                          }>
                            {client.priority}
                          </Badge>
                        </td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <Badge variant="outline" className={getStatusColor(client.status)}>
                            {client.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        {dynamicColumns.map(col => (
                          <td key={col.name} className="py-4 px-2 text-muted-foreground whitespace-nowrap">
                            {parsedDynProps[col.name] !== undefined
                              ? String(parsedDynProps[col.name])
                              : '--'}
                          </td>
                        ))}
                        <td className="py-4 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditClient({ ...client })
                                setEditOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {client.notionId && (
                              <a
                                href={`https://notion.so/${client.notionId.replace(/-/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
