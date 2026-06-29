import { useState } from 'react'
import { Phone, PhoneCall, Video, MessageCircle, ArrowUpRight, ArrowDownLeft, Clock, Plus, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useCalls } from '@/hooks/useCalls'
import type { CallLog, CallType, CallDirection } from '@/types/database'
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

const callTypeIcons: Record<CallType, { Icon: typeof Phone; color: string; bg: string; label: string }> = {
  ligacao: { Icon: PhoneCall, color: 'text-health', bg: 'bg-health-light', label: 'Ligação' },
  video: { Icon: Video, color: 'text-info', bg: 'bg-info-light', label: 'Vídeo' },
  whatsapp: { Icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'WhatsApp' },
}

const parentLabels: Record<string, string> = { mother: 'Mãe', father: 'Pai', both: 'Ambos' }

export function Ligacoes() {
  const { data: calls, add, update, remove } = useCalls()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    date: '', time: '', call_type: 'ligacao' as CallType, direction: 'saida' as CallDirection,
    duration_minutes: 0, notes: '', parent: 'both' as 'mother' | 'father' | 'both',
  })

  const resetForm = () => setForm({ date: '', time: '', call_type: 'ligacao', direction: 'saida', duration_minutes: 0, notes: '', parent: 'both' })

  const openAdd = () => { setEditing(false); resetForm(); setDialogOpen(true) }
  const openEdit = (c: CallLog) => {
    setEditing(true); setSelectedCall(c)
    setForm({ date: c.date, time: c.time, call_type: c.call_type, direction: c.direction, duration_minutes: c.duration_minutes, notes: c.notes, parent: c.parent })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.date || !form.time) { addToast('warning', 'Preencha data e horário'); return }
    if (editing && selectedCall) { update(selectedCall.id, form); addToast('success', 'Registro atualizado') }
    else { add({ ...form, created_by: 'João' }); addToast('success', 'Ligação registrada') }
    setDialogOpen(false); resetForm()
  }

  const handleDelete = () => { if (selectedCall) { remove(selectedCall.id); addToast('success', 'Registro removido'); setConfirmOpen(false) } }

  const filtered = calls
    .filter((c) => { if (filterType !== 'all' && c.call_type !== filterType) return false; if (!search) return true; const q = search.toLowerCase(); return c.notes.toLowerCase().includes(q) })
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))

  const totalCalls = calls.length
  const totalDuration = calls.reduce((s, c) => s + c.duration_minutes, 0)
  const videoCalls = calls.filter((c) => c.call_type === 'video').length
  const today = new Date().toISOString().split('T')[0]
  const callsToday = calls.filter((c) => c.date === today).length

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Phone className="w-6 h-6 text-info" />
            <h1 className="text-display text-navy">Ligações e Videochamadas</h1>
          </div>
          <p className="text-slate-400 text-sm">Registro de contato com os pais</p>
        </div>
        <Button onClick={openAdd} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" /> Registrar Contato
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center"><PhoneCall className="w-5 h-5 text-info" /></div>
            <div><p className="text-data text-navy">{totalCalls}</p><p className="text-xs text-slate-400">Total de Contatos</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center"><Clock className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">{totalDuration}min</p><p className="text-xs text-slate-400">Tempo Total</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center"><Video className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">{videoCalls}</p><p className="text-xs text-slate-400">Videochamadas</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center"><Phone className="w-5 h-5 text-warning" /></div>
            <div><p className="text-data text-navy">{callsToday}</p><p className="text-xs text-slate-400">Hoje</p></div>
          </div>
        </DataCard>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar registros..." className="flex-1 max-w-md" />
        <div className="flex gap-2">
          {(['all', 'ligacao', 'video', 'whatsapp'] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === t ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {t === 'all' ? 'Todos' : callTypeIcons[t].label}
            </button>
          ))}
        </div>
      </div>

      <DataCard title={`Registros (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState icon={<Phone className="w-8 h-8 text-slate-300" />} title="Nenhum registro" description="Registre o primeiro contato" action={<Button onClick={openAdd} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Registrar</Button>} />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((c) => {
              const typeInfo = callTypeIcons[c.call_type]
              const TypeIcon = typeInfo.Icon
              const DirIcon = c.direction === 'saida' ? ArrowUpRight : ArrowDownLeft
              const dirColor = c.direction === 'saida' ? 'text-health' : 'text-info'
              return (
                <div key={c.id} className="flex items-center gap-4 py-4 px-2 hover:bg-slate-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-lg ${typeInfo.bg} flex items-center justify-center shrink-0`}>
                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-navy">{typeInfo.label}</span>
                      <DirIcon className={`w-3.5 h-3.5 ${dirColor}`} />
                      <StatusBadge variant="neutral" label={c.direction === 'saida' ? 'Saída' : 'Entrada'} size="sm" />
                      <StatusBadge variant="neutral" label={parentLabels[c.parent]} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{format(parseISO(c.date), 'dd/MM/yyyy')}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{c.time}</span>
                      <span className="text-xs text-slate-400">{c.duration_minutes} min</span>
                    </div>
                    {c.notes && <p className="text-xs text-slate-400 mt-1 truncate">{c.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedCall(c); setConfirmOpen(true) }} className="w-8 h-8 rounded-lg hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="text-heading-1 text-navy">{editing ? 'Editar Registro' : 'Registrar Contato'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data <span className="text-critical">*</span></Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Horário <span className="text-critical">*</span></Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={form.call_type} onValueChange={(v) => setForm({ ...form, call_type: v as CallType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ligacao">Ligação</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Direção</Label>
                <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v as CallDirection })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Duração (min)</Label><Input type="number" min={0} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Com quem falou</Label>
              <Select value={form.parent} onValueChange={(v) => setForm({ ...form, parent: v as 'mother' | 'father' | 'both' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mother">Mãe</SelectItem>
                  <SelectItem value="father">Pai</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Anotações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-navy hover:bg-navy-light text-white">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Excluir Registro" description="Tem certeza que deseja excluir este registro?" onConfirm={handleDelete} confirmLabel="Excluir" variant="danger" />
    </div>
  )
}
