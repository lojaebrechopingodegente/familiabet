import { useState } from 'react'
import { CalendarHeart, CalendarCheck, Users, Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useVisits } from '@/hooks/useVisits'
import type { ScheduledVisit, VisitStatus, VisitType } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusMap: Record<VisitStatus, { label: string; variant: 'success' | 'warning' | 'critical' | 'info' | 'neutral' }> = {
  scheduled: { label: 'Agendada', variant: 'info' },
  completed: { label: 'Realizada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
}

const typeMap: Record<VisitType, string> = {
  presencial: 'Visita Presencial',
  'acompanhamento-medico': 'Acompanhamento Médico',
  'almoço-jantar': 'Almoço/Jantar',
  outro: 'Outro',
}

const typeColors: Record<VisitType, { bg: string; text: string }> = {
  presencial: { bg: 'bg-health-light', text: 'text-health' },
  'acompanhamento-medico': { bg: 'bg-info-light', text: 'text-info' },
  'almoço-jantar': { bg: 'bg-warning-light', text: 'text-warning' },
  outro: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

export function Visitas() {
  const { data: visits, add, update, remove } = useVisits()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<ScheduledVisit | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    visitor_name: '', date: '', time: '', type: 'presencial' as VisitType, status: 'scheduled' as VisitStatus, notes: '',
  })

  const resetForm = () => setForm({ visitor_name: '', date: '', time: '', type: 'presencial', status: 'scheduled', notes: '' })

  const openAdd = () => { setEditing(false); resetForm(); setDialogOpen(true) }

  const openEdit = (v: ScheduledVisit) => {
    setEditing(true); setSelectedVisit(v)
    setForm({ visitor_name: v.visitor_name, date: v.date, time: v.time, type: v.type, status: v.status, notes: v.notes })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.visitor_name || !form.date) { addToast('warning', 'Preencha os campos obrigatórios'); return }
    if (editing && selectedVisit) { update(selectedVisit.id, form); addToast('success', 'Visita atualizada') }
    else { add({ ...form, created_by: 'João' }); addToast('success', 'Visita agendada') }
    setDialogOpen(false); resetForm()
  }

  const handleDelete = () => { if (selectedVisit) { remove(selectedVisit.id); addToast('success', 'Visita removida'); setConfirmOpen(false) } }

  const filtered = visits
    .filter((v) => { if (filterStatus !== 'all' && v.status !== filterStatus) return false; if (!search) return true; const q = search.toLowerCase(); return v.visitor_name.toLowerCase().includes(q) || v.notes.toLowerCase().includes(q) })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const upcoming = visits.filter((v) => v.status === 'scheduled').length
  const thisMonth = visits.filter((v) => { const d = parseISO(v.date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() }).length
  const completed = visits.filter((v) => v.status === 'completed').length

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <CalendarHeart className="w-6 h-6 text-health" />
            <h1 className="text-display text-navy">Visitas Programadas</h1>
          </div>
          <p className="text-slate-400 text-sm">Organize as visitas dos filhos aos pais</p>
        </div>
        <Button onClick={openAdd} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" /> Agendar Visita
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-info" /></div>
            <div><p className="text-data text-navy">{upcoming}</p><p className="text-xs text-slate-400">Próximas Visitas</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center"><Users className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">{thisMonth}</p><p className="text-xs text-slate-400">Este Mês</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">{completed}</p><p className="text-xs text-slate-400">Realizadas</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div>
            <div><p className="text-data text-navy">{upcoming > 0 ? `${Math.ceil((parseISO(visits.filter(v => v.status === 'scheduled').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0]?.date || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d` : '—'}</p><p className="text-xs text-slate-400">Próxima em</p></div>
          </div>
        </DataCard>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar visitas..." className="flex-1 max-w-md" />
        <div className="flex gap-2">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === 'all' ? 'Todas' : statusMap[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <DataCard title={`Visitas (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState icon={<CalendarHeart className="w-8 h-8 text-slate-300" />} title="Nenhuma visita agendada" description="Agende a primeira visita" action={<Button onClick={openAdd} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Agendar</Button>} />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((v) => {
              const status = statusMap[v.status]
              const date = parseISO(v.date)
              const tColors = typeMap[v.type] ? typeColors[v.type] : typeColors.outro
              return (
                <div key={v.id} className="flex items-center gap-4 py-4 px-2 hover:bg-slate-50 transition-colors group">
                  <div className="w-16 text-center shrink-0">
                    <p className="text-lg font-semibold text-navy">{format(date, 'dd')}</p>
                    <p className="text-caption text-slate-400">{format(date, 'MMM', { locale: ptBR })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-navy">{v.visitor_name}</p>
                      <StatusBadge variant={status.variant} label={status.label} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${tColors.bg} ${tColors.text}`}>{typeMap[v.type]}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{v.time}</span>
                    </div>
                    {v.notes && <p className="text-xs text-slate-400 mt-1 truncate">{v.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {v.status === 'scheduled' && (
                      <Button size="sm" variant="outline" className="text-health border-health hover:bg-health-light mr-2" onClick={() => { update(v.id, { status: 'completed' }); addToast('success', 'Visita marcada como realizada') }}>Marcar como Realizada</Button>
                    )}
                    <button onClick={() => openEdit(v)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedVisit(v); setConfirmOpen(true) }} className="w-8 h-8 rounded-lg hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="text-heading-1 text-navy">{editing ? 'Editar Visita' : 'Agendar Visita'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Quem vai visitar <span className="text-critical">*</span></Label><Input value={form.visitor_name} onChange={(e) => setForm({ ...form, visitor_name: e.target.value })} placeholder="Nome do filho/a" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data <span className="text-critical">*</span></Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Horário</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tipo de visita</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as VisitType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Visita Presencial</SelectItem>
                    <SelectItem value="acompanhamento-medico">Acompanhamento Médico</SelectItem>
                    <SelectItem value="almoço-jantar">Almoço/Jantar</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VisitStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="completed">Realizada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Detalhes da visita..." /></div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-navy hover:bg-navy-light text-white">Salvar Visita</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Excluir Visita" description="Tem certeza que deseja excluir esta visita?" onConfirm={handleDelete} confirmLabel="Excluir" variant="danger" />
    </div>
  )
}
