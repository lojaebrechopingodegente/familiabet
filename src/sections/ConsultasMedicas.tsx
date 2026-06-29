import { useState } from 'react'
import { Stethoscope, CalendarClock, CalendarDays, ClipboardList, CheckCircle, Plus, MapPin, Clock, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useAppointments } from '@/hooks/useAppointments'
import type { Appointment, AppointmentStatus, AppointmentType, ParentId } from '@/types/database'
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

const statusMap: Record<AppointmentStatus, { label: string; variant: 'success' | 'warning' | 'critical' | 'info' | 'neutral' }> = {
  scheduled: { label: 'Agendada', variant: 'info' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  completed: { label: 'Realizada', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
  'no-show': { label: 'Não Compareceu', variant: 'critical' },
}

const parentLabels: Record<ParentId, string> = {
  mother: 'Mãe',
  father: 'Pai',
  both: 'Ambos',
}

export function ConsultasMedicas() {
  const { data: appointments, add, update, remove } = useAppointments()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    parent_id: 'mother' as ParentId,
    doctor_name: '',
    specialty: '',
    location: '',
    date: '',
    time: '',
    type: 'consulta' as AppointmentType,
    status: 'scheduled' as AppointmentStatus,
    notes: '',
    reminder_days: 1,
  })

  const resetForm = () => {
    setForm({
      parent_id: 'mother',
      doctor_name: '',
      specialty: '',
      location: '',
      date: '',
      time: '',
      type: 'consulta',
      status: 'scheduled',
      notes: '',
      reminder_days: 1,
    })
  }

  const openAdd = () => {
    setEditing(false)
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (apt: Appointment) => {
    setEditing(true)
    setSelectedAppointment(apt)
    setForm({
      parent_id: apt.parent_id,
      doctor_name: apt.doctor_name,
      specialty: apt.specialty,
      location: apt.location,
      date: apt.date,
      time: apt.time,
      type: apt.type,
      status: apt.status,
      notes: apt.notes,
      reminder_days: apt.reminder_days,
    })
    setDialogOpen(true)
  }

  const openDetail = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setDetailOpen(true)
  }

  const handleSave = () => {
    if (!form.doctor_name || !form.date) {
      addToast('warning', 'Preencha os campos obrigatórios')
      return
    }
    if (editing && selectedAppointment) {
      update(selectedAppointment.id, { ...form, updated_at: new Date().toISOString() })
      addToast('success', 'Consulta atualizada com sucesso')
    } else {
      add({ ...form, created_by: 'João', updated_at: new Date().toISOString() })
      addToast('success', 'Consulta agendada com sucesso')
    }
    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = () => {
    if (selectedAppointment) {
      remove(selectedAppointment.id)
      addToast('success', 'Consulta removida')
      setConfirmOpen(false)
      setDetailOpen(false)
    }
  }

  const confirmDelete = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setConfirmOpen(true)
  }

  const filtered = appointments
    .filter((a) => {
      if (filterStatus !== 'all' && a.status !== filterStatus) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        a.doctor_name.toLowerCase().includes(q) ||
        a.specialty.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const upcoming = appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length
  const thisMonth = appointments.filter((a) => {
    const d = parseISO(a.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const completed = appointments.filter((a) => a.status === 'completed').length
  const examsPending = appointments.filter((a) => a.type === 'exame' && a.status !== 'completed').length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Stethoscope className="w-6 h-6 text-navy" />
            <h1 className="text-display text-navy">Consultas Médicas</h1>
          </div>
          <p className="text-slate-400 text-sm">Gerencie agendamentos de consultas e exames</p>
        </div>
        <Button onClick={openAdd} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-data text-navy">{upcoming}</p>
              <p className="text-xs text-slate-400">Próximas Consultas</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{thisMonth}</p>
              <p className="text-xs text-slate-400">Este Mês</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-data text-navy">{examsPending}</p>
              <p className="text-xs text-slate-400">Exames Pendentes</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{completed}</p>
              <p className="text-xs text-slate-400">Realizadas</p>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por médico, especialidade ou local" className="flex-1 max-w-md" />
        <div className="flex gap-2">
          {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterStatus === s ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Todas' : statusMap[s as AppointmentStatus]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <DataCard title={`Consultas (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="w-8 h-8 text-slate-300" />}
            title="Nenhuma consulta encontrada"
            description="Adicione a primeira consulta para começar"
            action={
              <Button onClick={openAdd} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Consulta
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((apt) => {
              const status = statusMap[apt.status]
              const date = parseISO(apt.date)
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 py-4 px-2 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => openDetail(apt)}
                >
                  {/* Date */}
                  <div className="w-16 text-center shrink-0">
                    <p className="text-lg font-semibold text-navy">{format(date, 'dd')}</p>
                    <p className="text-caption text-slate-400">{format(date, 'MMM', { locale: ptBR })}</p>
                    <p className="text-[10px] text-slate-400">{format(date, 'yyyy')}</p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-navy truncate">{apt.doctor_name}</p>
                      <StatusBadge variant={status.variant} label={status.label} />
                    </div>
                    <p className="text-xs text-slate-400">{apt.specialty}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {apt.location}
                      </span>
                      <StatusBadge variant="neutral" label={parentLabels[apt.parent_id]} size="sm" />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="text-right shrink-0">
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.time}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(apt) }}
                      className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirmDelete(apt) }}
                      className="w-8 h-8 rounded-lg hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataCard>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-heading-1 text-navy">
              {editing ? 'Editar Consulta' : 'Nova Consulta'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente <span className="text-critical">*</span></Label>
                <Select value={form.parent_id} onValueChange={(v) => setForm({ ...form, parent_id: v as ParentId })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mãe</SelectItem>
                    <SelectItem value="father">Pai</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AppointmentType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Médico / Local <span className="text-critical">*</span></Label>
              <Input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} placeholder="Nome do médico ou laboratório" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Ex: Cardiologia" />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hospital ou clínica" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data <span className="text-critical">*</span></Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Informações adicionais..." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-navy hover:bg-navy-light text-white">Salvar Consulta</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[520px]">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-display text-navy">
                    {format(parseISO(selectedAppointment.date), 'dd/MM/yyyy')}
                  </DialogTitle>
                  <StatusBadge variant={statusMap[selectedAppointment.status].variant} label={statusMap[selectedAppointment.status].label} />
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-caption text-slate-400 mb-1">Médico / Local</p>
                  <p className="text-sm font-medium text-navy">{selectedAppointment.doctor_name}</p>
                </div>
                <div>
                  <p className="text-caption text-slate-400 mb-1">Especialidade</p>
                  <p className="text-sm text-slate-600">{selectedAppointment.specialty}</p>
                </div>
                <div>
                  <p className="text-caption text-slate-400 mb-1">Local</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedAppointment.location}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-slate-400 mb-1">Horário</p>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-slate-400 mb-1">Paciente</p>
                  <StatusBadge variant="neutral" label={parentLabels[selectedAppointment.parent_id]} />
                </div>
                <div>
                  <p className="text-caption text-slate-400 mb-1">Tipo</p>
                  <p className="text-sm text-slate-600 capitalize">{selectedAppointment.type}</p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div className="mb-4">
                  <p className="text-caption text-slate-400 mb-1">Observações</p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{selectedAppointment.notes}</p>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setDetailOpen(false); openEdit(selectedAppointment) }}>
                  <Pencil className="w-4 h-4 mr-2" /> Editar
                </Button>
                {selectedAppointment.status !== 'completed' && (
                  <Button
                    className="bg-health hover:bg-health/90 text-white"
                    onClick={() => {
                      update(selectedAppointment.id, { status: 'completed' as AppointmentStatus })
                      setDetailOpen(false)
                      addToast('success', 'Consulta marcada como realizada')
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Marcar como Realizada
                  </Button>
                )}
                <Button variant="destructive" onClick={() => confirmDelete(selectedAppointment)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Excluir Consulta"
        description="Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}
