import { useState } from 'react'
import { DollarSign, TrendingDown, Store, CheckCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DataCard } from '@/components/DataCard'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { SearchInput } from '@/components/SearchInput'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'
import { useQuotes } from '@/hooks/useQuotes'
import type { PriceQuote, QuoteCategory, QuoteStatus } from '@/types/database'
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

const statusMap: Record<QuoteStatus, { label: string; variant: 'success' | 'warning' | 'critical' | 'info' | 'neutral' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  aprovado: { label: 'Aprovado', variant: 'success' },
  rejeitado: { label: 'Rejeitado', variant: 'critical' },
}

const categoryLabels: Record<QuoteCategory, string> = {
  remedio: 'Remédio', fralda: 'Fralda', 'equipamento-medico': 'Equip. Médico', servico: 'Serviço', outro: 'Outro',
}

const categoryColors: Record<QuoteCategory, { bg: string; text: string }> = {
  remedio: { bg: 'bg-blue-100', text: 'text-blue-700' },
  fralda: { bg: 'bg-purple-100', text: 'text-purple-700' },
  'equipamento-medico': { bg: 'bg-amber-100', text: 'text-amber-700' },
  servico: { bg: 'bg-green-100', text: 'text-green-700' },
  outro: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

export function Orcamentos() {
  const { data: quotes, add, update, remove } = useQuotes()
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<PriceQuote | null>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    item_name: '', category: 'remedio' as QuoteCategory, store_name: '', price: 0,
    quantity: 1, unit: 'un', status: 'pendente' as QuoteStatus, notes: '', date: '',
  })

  const resetForm = () => setForm({ item_name: '', category: 'remedio', store_name: '', price: 0, quantity: 1, unit: 'un', status: 'pendente', notes: '', date: '' })

  const openAdd = () => { setEditing(false); resetForm(); setDialogOpen(true) }
  const openEdit = (q: PriceQuote) => { setEditing(true); setSelectedQuote(q); setForm({ item_name: q.item_name, category: q.category, store_name: q.store_name, price: q.price, quantity: q.quantity, unit: q.unit, status: q.status, notes: q.notes, date: q.date }); setDialogOpen(true) }

  const handleSave = () => {
    if (!form.item_name || !form.store_name) { addToast('warning', 'Preencha os campos obrigatórios'); return }
    if (editing && selectedQuote) { update(selectedQuote.id, form); addToast('success', 'Orçamento atualizado') }
    else { add({ ...form, created_by: 'João' }); addToast('success', 'Orçamento adicionado') }
    setDialogOpen(false); resetForm()
  }

  const handleDelete = () => { if (selectedQuote) { remove(selectedQuote.id); addToast('success', 'Orçamento removido'); setConfirmOpen(false) } }

  const filtered = quotes
    .filter((q) => { if (filterCategory !== 'all' && q.category !== filterCategory) return false; if (filterStatus !== 'all' && q.status !== filterStatus) return false; if (!search) return true; const s = search.toLowerCase(); return q.item_name.toLowerCase().includes(s) || q.store_name.toLowerCase().includes(s) })
    .sort((a, b) => b.price - a.price)

  const totalValue = quotes.filter(q => q.status === 'aprovado').reduce((s, q) => s + (q.price * q.quantity), 0)
  const approved = quotes.filter(q => q.status === 'aprovado').length
  const pending = quotes.filter(q => q.status === 'pendente').length

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <DollarSign className="w-6 h-6 text-warning" />
            <h1 className="text-display text-navy">Pesquisa e Orçamentos</h1>
          </div>
          <p className="text-slate-400 text-sm">Compare preços e organize compras</p>
        </div>
        <Button onClick={openAdd} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" /> Novo Orçamento
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center"><DollarSign className="w-5 h-5 text-warning" /></div>
            <div><p className="text-data text-navy">{quotes.length}</p><p className="text-xs text-slate-400">Orçamentos</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center"><TrendingDown className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">R$ {totalValue.toFixed(2)}</p><p className="text-xs text-slate-400">Valor Aprovado</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center"><CheckCircle className="w-5 h-5 text-health" /></div>
            <div><p className="text-data text-navy">{approved}</p><p className="text-xs text-slate-400">Aprovados</p></div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center"><Store className="w-5 h-5 text-info" /></div>
            <div><p className="text-data text-navy">{pending}</p><p className="text-xs text-slate-400">Pendentes</p></div>
          </div>
        </DataCard>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar orçamentos..." className="flex-1 max-w-md" />
        <div className="flex gap-2">
          {(['all', 'remedio', 'fralda', 'equipamento-medico', 'servico'] as const).map((c) => (
            <button key={c} onClick={() => setFilterCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCategory === c ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {c === 'all' ? 'Todos' : categoryLabels[c]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'pendente', 'aprovado'] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-health text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === 'all' ? 'Todos' : statusMap[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <DataCard title={`Orçamentos (${filtered.length})`}>
        {filtered.length === 0 ? (
          <EmptyState icon={<DollarSign className="w-8 h-8 text-slate-300" />} title="Nenhum orçamento" description="Adicione o primeiro orçamento" action={<Button onClick={openAdd} variant="outline" className="gap-2"><Plus className="w-4 h-4" />Novo</Button>} />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((q) => {
              const st = statusMap[q.status]
              const cat = categoryColors[q.category]
              return (
                <div key={q.id} className="flex items-center gap-4 py-4 px-2 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-navy">{q.item_name}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>{categoryLabels[q.category]}</span>
                      <StatusBadge variant={st.variant} label={st.label} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Store className="w-3 h-3" />{q.store_name}</span>
                      <span className="text-xs text-slate-400">{format(parseISO(q.date), 'dd/MM/yyyy')}</span>
                    </div>
                    {q.notes && <p className="text-xs text-slate-400 mt-1 truncate">{q.notes}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-navy">R$ {(q.price * q.quantity).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">R$ {q.price.toFixed(2)} x {q.quantity} {q.unit}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {q.status === 'pendente' && (
                      <Button size="sm" variant="outline" className="text-health border-health hover:bg-health-light mr-1" onClick={() => { update(q.id, { status: 'aprovado' as QuoteStatus }); addToast('success', 'Orçamento aprovado') }}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprovar
                      </Button>
                    )}
                    <button onClick={() => openEdit(q)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedQuote(q); setConfirmOpen(true) }} className="w-8 h-8 rounded-lg hover:bg-critical-light flex items-center justify-center text-slate-400 hover:text-critical"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader><DialogTitle className="text-heading-1 text-navy">{editing ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Item <span className="text-critical">*</span></Label><Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="Nome do item ou serviço" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as QuoteCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Loja/Fornecedor <span className="text-critical">*</span></Label><Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="Nome da loja" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Preço unitário (R$)</Label><Input type="number" step={0.01} min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Quantidade</Label><Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="un, caixa..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data da cotação</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as QuoteStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="aprovado">Aprovado</SelectItem><SelectItem value="rejeitado">Rejeitado</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-navy hover:bg-navy-light text-white">Salvar Orçamento</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Excluir Orçamento" description="Tem certeza que deseja excluir este orçamento?" onConfirm={handleDelete} confirmLabel="Excluir" variant="danger" />
    </div>
  )
}
