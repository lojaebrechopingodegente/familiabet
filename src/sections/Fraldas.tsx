import { useState } from 'react'
import { Baby, Package, AlertTriangle, ShoppingBag, Plus, Pencil, Trash2, Minus, Plus as PlusIcon } from 'lucide-react'
import { parseISO, differenceInDays } from 'date-fns'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useDiapers } from '@/hooks/useDiapers'
import type { DiaperStock, DiaperSize, DiaperType } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const sizeLabels: Record<DiaperSize, string> = { p: 'P (Pequeno)', m: 'M (Médio)', g: 'G (Grande)', xg: 'XG (Extra G)', xxg: 'XXG (Extra Extra G)' }
const typeLabels: Record<DiaperType, string> = { geriatrica: 'Geriátrica', noturna: 'Noturna', premium: 'Premium', economica: 'Econômica' }

export function Fraldas() {
  const { data: diapers, add, update, remove } = useDiapers()
  const { addToast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedDiaper, setSelectedDiaper] = useState<DiaperStock | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    brand: '', size: 'g' as DiaperSize, type: 'geriatrica' as DiaperType,
    quantity_current: 0, quantity_total: 0, alert_threshold: 5,
    price_per_unit: 0, store: '', last_purchase_date: '',
  })

  const resetForm = () => setForm({ brand: '', size: 'g', type: 'geriatrica', quantity_current: 0, quantity_total: 0, alert_threshold: 5, price_per_unit: 0, store: '', last_purchase_date: '' })

  const openAdd = () => { setEditing(false); resetForm(); setDialogOpen(true) }
  const openEdit = (d: DiaperStock) => {
    setEditing(true); setSelectedDiaper(d)
    setForm({ brand: d.brand, size: d.size, type: d.type, quantity_current: d.quantity_current, quantity_total: d.quantity_total, alert_threshold: d.alert_threshold, price_per_unit: d.price_per_unit, store: d.store, last_purchase_date: d.last_purchase_date })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.brand) { addToast('warning', 'Marca é obrigatória'); return }
    if (editing && selectedDiaper) { update(selectedDiaper.id, form); addToast('success', 'Estoque atualizado') }
    else { add({ ...form, created_by: 'João' }); addToast('success', 'Fralda adicionada') }
    setDialogOpen(false); resetForm()
  }

  const handleDelete = () => { if (selectedDiaper) { remove(selectedDiaper.id); addToast('success', 'Registro removido'); setConfirmOpen(false) } }

  const adjustStock = (id: string, delta: number) => {
    const d = diapers.find((x) => x.id === id)
    if (!d) return
    const newQty = Math.max(0, d.quantity_current + delta)
    update(id, { quantity_current: newQty })
    if (delta < 0) addToast('success', `${Math.abs(delta)} fralda(s) usada(s)`)
    else addToast('success', `${delta} fralda(s) adicionada(s)`)
  }

  const totalInStock = diapers.reduce((s, d) => s + d.quantity_current, 0)
  const lowStock = diapers.filter((d) => d.quantity_current <= d.alert_threshold)
  const totalValue = diapers.reduce((s, d) => s + (d.quantity_current * d.price_per_unit), 0)

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Baby className="w-6 h-6 text-navy" />
            <h1 className="text-display text-navy">Controle de Fraldas</h1>
          </div>
          <p className="text-slate-400 text-sm">Gerencie estoque e compra de fraldas</p>
        </div>
        <Button onClick={openAdd} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" /> Adicionar Fralda
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center"><Package className="w-5 h-5 text-info" /></div>
            <div><p className="text-data text-navy">{totalInStock}</p><p className="text-xs text-slate-400">Unidades em Estoque</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning" /></div>
            <div><p className="text-data text-navy">{lowStock.length}</p><p className="text-xs text-slate-400">Estoque Baixo</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">R$ {totalValue.toFixed(2)}</p><p className="text-xs text-slate-400">Valor em Estoque</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center"><Package className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">{diapers.length}</p><p className="text-xs text-slate-400">Tipos Cadastrados</p></div>
          </div>
        </DataCard>
      </div>

      {/* Alert Banner */}
      {lowStock.length > 0 && (
        <div className="mb-6 bg-warning-light border border-warning/20 rounded-[10px] p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700">Atenção: Estoque baixo detectado</p>
            <p className="text-xs text-amber-600">{lowStock.map(d => `${d.brand} (${d.quantity_current} un)`).join(', ')}</p>
          </div>
        </div>
      )}

      <DataCard title={`Fraldas em Estoque (${diapers.length})`}>
        {diapers.length === 0 ? (
          <EmptyState icon={<Baby className="w-8 h-8 text-slate-300" />} title="Nenhuma fralda cadastrada" description="Adicione o primeiro registro" action={<Button onClick={openAdd} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Adicionar</Button>} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {diapers.map((d) => {
              const pct = Math.round((d.quantity_current / d.quantity_total) * 100)
              const isLow = d.quantity_current <= d.alert_threshold
              const daysSincePurchase = differenceInDays(new Date(), parseISO(d.last_purchase_date))
              return (
                <div key={d.id} className={`border rounded-[10px] p-5 transition-all hover:shadow-card-hover ${isLow ? 'border-warning bg-warning-light/20' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-navy">{d.brand}</p>
                        {isLow && <StatusBadge variant="warning" label="Estoque Baixo" size="sm" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{sizeLabels[d.size]}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{typeLabels[d.type]}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-navy">{d.quantity_current}<span className="text-xs text-slate-400 font-normal">/{d.quantity_total}</span></p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all ${isLow ? 'bg-warning' : 'bg-health'}`} style={{ width: `${Math.max(5, pct)}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>R$ {d.price_per_unit.toFixed(2)}/un • {d.store}</span>
                    <span>Última compra: {daysSincePurchase}d atrás</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => adjustStock(d.id, -1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-critical-light hover:text-critical hover:border-critical transition-all">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-navy w-8 text-center">{d.quantity_current}</span>
                    <button onClick={() => adjustStock(d.id, 1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-health-light hover:text-health hover:border-health transition-all">
                      <PlusIcon className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => openEdit(d)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedDiaper(d); setConfirmOpen(true) }} className="w-8 h-8 rounded-lg hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="text-heading-1 text-navy">{editing ? 'Editar Fralda' : 'Adicionar Fralda'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Marca <span className="text-critical">*</span></Label><Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ex: Prevail, Depend, Bigfral" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tamanho</Label>
                <Select value={form.size} onValueChange={(v) => setForm({ ...form, size: v as DiaperSize })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(sizeLabels).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as DiaperType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(typeLabels).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Estoque atual</Label><Input type="number" min={0} value={form.quantity_current} onChange={(e) => setForm({ ...form, quantity_current: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Estoque total</Label><Input type="number" min={0} value={form.quantity_total} onChange={(e) => setForm({ ...form, quantity_total: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Alerta em</Label><Input type="number" min={1} value={form.alert_threshold} onChange={(e) => setForm({ ...form, alert_threshold: parseInt(e.target.value) || 5 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Preço/un (R$)</Label><Input type="number" step={0.01} min={0} value={form.price_per_unit} onChange={(e) => setForm({ ...form, price_per_unit: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Loja</Label><Input value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} placeholder="Onde compra" /></div>
            </div>
            <div className="space-y-2"><Label>Última compra</Label><Input type="date" value={form.last_purchase_date} onChange={(e) => setForm({ ...form, last_purchase_date: e.target.value })} /></div>
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
