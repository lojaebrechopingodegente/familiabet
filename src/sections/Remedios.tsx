import { useState } from 'react'
import { Pill, Clock, CheckCircle, AlertTriangle, Plus, Pencil, Trash2 } from 'lucide-react'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useMedications } from '@/hooks/useMedications'
import type { Medication } from '@/types/database'
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
import { Switch } from '@/components/ui/switch'

export function Remedios() {
  const { medications, markAsTaken, getTodayLogs } = useMedications()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterParent, setFilterParent] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    parent_id: 'mother' as 'mother' | 'father',
    name: '',
    dosage: '',
    quantity_per_dose: 1,
    schedule: ['08:00'],
    start_date: '',
    end_date: '',
    instructions: '',
    stock_quantity: 0,
    alert_threshold: 5,
    is_active: true,
  })

  const resetForm = () => {
    setForm({
      parent_id: 'mother',
      name: '',
      dosage: '',
      quantity_per_dose: 1,
      schedule: ['08:00'],
      start_date: '',
      end_date: '',
      instructions: '',
      stock_quantity: 0,
      alert_threshold: 5,
      is_active: true,
    })
  }

  const openAdd = () => {
    setEditing(false)
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (med: Medication) => {
    setEditing(true)
    setSelectedMed(med)
    setForm({
      parent_id: med.parent_id,
      name: med.name,
      dosage: med.dosage,
      quantity_per_dose: med.quantity_per_dose,
      schedule: [...med.schedule],
      start_date: med.start_date,
      end_date: med.end_date || '',
      instructions: med.instructions,
      stock_quantity: med.stock_quantity,
      alert_threshold: med.alert_threshold,
      is_active: med.is_active,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.dosage || !form.start_date) {
      addToast('warning', 'Preencha os campos obrigatórios')
      return
    }
    if (editing && selectedMed) {
      medications.update(selectedMed.id, form)
      addToast('success', 'Remédio atualizado')
    } else {
      medications.add({ ...form, end_date: form.end_date || null, created_by: 'João' })
      addToast('success', 'Remédio cadastrado')
    }
    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = () => {
    if (selectedMed) {
      medications.remove(selectedMed.id)
      addToast('success', 'Remédio removido')
      setConfirmOpen(false)
    }
  }

  const todayLogs = getTodayLogs()
  const activeMeds = medications.data.filter((m) => m.is_active).length
  const takenToday = todayLogs.filter((l) => l.status === 'taken').length
  const totalToday = todayLogs.length
  const pendingAlerts = medications.data.filter((m) => m.is_active && m.stock_quantity <= m.alert_threshold).length

  const filteredMeds = medications.data
    .filter((m) => {
      if (filterParent !== 'all' && m.parent_id !== filterParent) return false
      if (!search) return true
      const q = search.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.dosage.toLowerCase().includes(q)
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Pill className="w-6 h-6 text-health" />
            <h1 className="text-display text-navy">Controle de Remédios</h1>
          </div>
          <p className="text-slate-400 text-sm">Acompanhamento de medicações e alarmes</p>
        </div>
        <Button onClick={openAdd} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" />
          Cadastrar Remédio
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center">
              <Pill className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{activeMeds}</p>
              <p className="text-xs text-slate-400">Remédios Ativos</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-data text-navy">{takenToday}/{totalToday}</p>
              <p className="text-xs text-slate-400">Doses Hoje</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{takenToday}</p>
              <p className="text-xs text-slate-400">Tomados Hoje</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-data text-navy">{pendingAlerts}</p>
              <p className="text-xs text-slate-400">Alertas de Estoque</p>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Today's Schedule */}
      <DataCard title="Horário de Medicações de Hoje" className="mb-8">
        {todayLogs.length === 0 ? (
          <EmptyState title="Sem medicações para hoje" description="Nenhum remédio agendado" icon={<Clock className="w-8 h-8 text-slate-300" />} />
        ) : (
          <div className="space-y-2">
            {todayLogs.map((log) => {
              const med = medications.data.find((m) => m.id === log.medication_id)
              if (!med) return null
              const isOverdue = log.status === 'pending' && log.scheduled_time < new Date().toTimeString().slice(0, 5)
              return (
                <div
                  key={log.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                    log.status === 'taken' ? 'border-l-health bg-health-light/30' :
                    isOverdue ? 'border-l-critical bg-critical-light/30' :
                    'border-l-warning bg-warning-light/30'
                  }`}
                >
                  <div className="w-14 text-center shrink-0">
                    <p className="text-data text-navy">{log.scheduled_time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy">{med.name}</p>
                    <p className="text-xs text-slate-400">{med.dosage} — {med.quantity_per_dose} comprimido(s)</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge variant="neutral" label={med.parent_id === 'mother' ? 'Mãe' : 'Pai'} size="sm" />
                      {med.instructions && <span className="text-[10px] text-slate-400">{med.instructions}</span>}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {log.status === 'taken' ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="success" label={`Tomado ${log.taken_at ? new Date(log.taken_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}`} />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant={isOverdue ? 'default' : 'outline'}
                        className={isOverdue ? 'bg-critical hover:bg-critical/90 text-white' : ''}
                        onClick={() => { markAsTaken(log.id, 'João'); addToast('success', `${med.name} marcado como tomado`) }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {isOverdue ? 'Atrasado - Marcar' : 'Marcar como Tomado'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataCard>

      {/* Medication List */}
      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar remédio..." className="flex-1 max-w-md" />
        <div className="flex gap-2">
          {(['all', 'mother', 'father'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFilterParent(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterParent === p ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p === 'all' ? 'Todos' : p === 'mother' ? 'Mãe' : 'Pai'}
            </button>
          ))}
        </div>
      </div>

      <DataCard title={`Todos os Remédios (${filteredMeds.length})`}>
        {filteredMeds.length === 0 ? (
          <EmptyState icon={<Pill className="w-8 h-8 text-slate-300" />} title="Nenhum remédio cadastrado" action={<Button onClick={openAdd} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Cadastrar</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-caption text-slate-400 py-3 px-2">Remédio</th>
                  <th className="text-left text-caption text-slate-400 py-3 px-2">Dosagem</th>
                  <th className="text-left text-caption text-slate-400 py-3 px-2">Horários</th>
                  <th className="text-left text-caption text-slate-400 py-3 px-2">Para</th>
                  <th className="text-left text-caption text-slate-400 py-3 px-2">Status</th>
                  <th className="text-right text-caption text-slate-400 py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-2">
                      <p className="text-sm font-medium text-navy">{med.name}</p>
                      {med.instructions && <p className="text-[11px] text-slate-400">{med.instructions}</p>}
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-600">{med.dosage} — {med.quantity_per_dose} comp.</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-1 flex-wrap">
                        {med.schedule.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-health-light text-health text-[11px] font-medium rounded-md">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2"><StatusBadge variant="neutral" label={med.parent_id === 'mother' ? 'Mãe' : 'Pai'} size="sm" /></td>
                    <td className="py-3 px-2"><StatusBadge variant={med.is_active ? 'success' : 'neutral'} label={med.is_active ? 'Ativo' : 'Inativo'} size="sm" /></td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(med)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedMed(med); setConfirmOpen(true) }} className="w-8 h-8 rounded-lg hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataCard>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-heading-1 text-navy">{editing ? 'Editar Remédio' : 'Cadastrar Remédio'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente <span className="text-critical">*</span></Label>
                <Select value={form.parent_id} onValueChange={(v) => setForm({ ...form, parent_id: v as 'mother' | 'father' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="mother">Mãe</SelectItem><SelectItem value="father">Pai</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade por dose</Label>
                <Input type="number" min={1} value={form.quantity_per_dose} onChange={(e) => setForm({ ...form, quantity_per_dose: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome <span className="text-critical">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Metformina" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dosagem <span className="text-critical">*</span></Label>
                <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="Ex: 500mg" />
              </div>
              <div className="space-y-2">
                <Label>Horários (separados por vírgula)</Label>
                <Input value={form.schedule.join(', ')} onChange={(e) => setForm({ ...form, schedule: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="08:00, 20:00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de início <span className="text-critical">*</span></Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data de término (opcional)</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estoque atual</Label>
                <Input type="number" min={0} value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Alerta quando atingir</Label>
                <Input type="number" min={1} value={form.alert_threshold} onChange={(e) => setForm({ ...form, alert_threshold: parseInt(e.target.value) || 5 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Instruções</Label>
              <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} placeholder="Tomar com água, após refeições..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Remédio ativo</Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-navy hover:bg-navy-light text-white">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Excluir Remédio" description="Tem certeza que deseja excluir este remédio?" onConfirm={handleDelete} confirmLabel="Excluir" variant="danger" />
    </div>
  )
}
