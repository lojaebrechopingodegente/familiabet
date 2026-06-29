import { useState } from 'react'
import { ShoppingCart, List, CheckCircle, Calendar, User, Plus, Trash2, X } from 'lucide-react'
import { DataCard } from '@/components/DataCard'
import { EmptyState } from '@/components/EmptyState'
import { useToast } from '@/components/ToastProvider'
import { useShopping } from '@/hooks/useShopping'
import type { ShoppingCategory, ShoppingPriority, ShoppingUnit } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const categoryColors: Record<ShoppingCategory, { bg: string; text: string; label: string }> = {
  hortifruti: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hortifruti' },
  acougue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Açougue' },
  laticinios: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Laticínios' },
  limpeza: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Limpeza' },
  graos: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Grãos' },
  bebidas: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Bebidas' },
  padaria: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Padaria' },
  outros: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Outros' },
}

const priorityColors: Record<ShoppingPriority, string> = {
  normal: 'bg-slate-200',
  urgente: 'bg-warning',
  'muito-urgente': 'bg-critical',
}

export function Compras() {
  const { items, trips, toggleItem, clearChecked } = useShopping()
  const { addToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'un' as ShoppingUnit,
    category: 'hortifruti' as ShoppingCategory,
    priority: 'normal' as ShoppingPriority,
  })

  const uncheckedItems = items.data.filter((i) => !i.is_checked)
  const checkedItems = items.data.filter((i) => i.is_checked)

  const handleAdd = () => {
    if (!newItem.name.trim()) {
      addToast('warning', 'Digite o nome do item')
      return
    }
    items.add({ ...newItem, name: newItem.name.trim(), is_checked: false, added_by: 'João' })
    addToast('success', 'Item adicionado')
    setNewItem({ name: '', quantity: 1, unit: 'un', category: 'hortifruti', priority: 'normal' })
    setShowAdd(false)
  }

  const handleClear = () => {
    clearChecked()
    addToast('success', 'Itens comprados movidos para histórico')
  }

  // Group by category
  const grouped = uncheckedItems.reduce<Record<string, typeof uncheckedItems>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  const checkedToday = checkedItems.length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShoppingCart className="w-6 h-6 text-navy" />
            <h1 className="text-display text-navy">Lista de Compras</h1>
          </div>
          <p className="text-slate-400 text-sm">Organização de compras de mercado</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-navy hover:bg-navy-light text-white gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Item
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <List className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-data text-navy">{uncheckedItems.length}</p>
              <p className="text-xs text-slate-400">Itens na Lista</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{checkedToday}</p>
              <p className="text-xs text-slate-400">Comprados Hoje</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-health-light flex items-center justify-center">
              <Calendar className="w-5 h-5 text-health" />
            </div>
            <div>
              <p className="text-data text-navy">{formatDateBR(new Date())}</p>
              <p className="text-xs text-slate-400">Próxima Compra</p>
            </div>
          </div>
        </DataCard>
        <DataCard noPadding className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <User className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-data text-navy">João</p>
              <p className="text-xs text-slate-400">Responsável</p>
            </div>
          </div>
        </DataCard>
      </div>

      {/* Add Item Inline Form */}
      {showAdd && (
        <DataCard className="mb-6">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label>Item</Label>
              <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Nome do item" />
            </div>
            <div className="w-20 space-y-2">
              <Label>Qtd</Label>
              <Input type="number" min={0.1} step={0.1} value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })} />
            </div>
            <div className="w-28 space-y-2">
              <Label>Unidade</Label>
              <Select value={newItem.unit} onValueChange={(v) => setNewItem({ ...newItem, unit: v as ShoppingUnit })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="un">un</SelectItem>
                  <SelectItem value="pacote">pacote</SelectItem>
                  <SelectItem value="litro">litro</SelectItem>
                  <SelectItem value="caixa">caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-36 space-y-2">
              <Label>Categoria</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v as ShoppingCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryColors).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-36 space-y-2">
              <Label>Prioridade</Label>
              <Select value={newItem.priority} onValueChange={(v) => setNewItem({ ...newItem, priority: v as ShoppingPriority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="muito-urgente">Muito Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}><X className="w-4 h-4" /></Button>
              <Button size="sm" className="bg-navy hover:bg-navy-light text-white" onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
            </div>
          </div>
        </DataCard>
      )}

      {/* Shopping List */}
      <DataCard
        title={`Itens para Comprar (${uncheckedItems.length})`}
        action={checkedItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear}>
            <CheckCircle className="w-4 h-4 mr-1" /> Limpar Comprados ({checkedItems.length})
          </Button>
        )}
      >
        {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
          <EmptyState icon={<ShoppingCart className="w-8 h-8 text-slate-300" />} title="Lista vazia" description="Adicione itens para a próxima compra" />
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, catItems]) => {
              const catStyle = categoryColors[cat as ShoppingCategory]
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${catStyle.bg} ${catStyle.text}`}>
                      {catStyle.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{catItems.length} item(s)</span>
                  </div>
                  <div className="space-y-1">
                    {catItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center transition-colors hover:border-health"
                        >
                          {item.is_checked && <CheckCircle className="w-4 h-4 text-health" />}
                        </button>
                        <div className={`w-2.5 h-2.5 rounded-full ${priorityColors[item.priority]} shrink-0`} />
                        <span className="text-sm text-slate-700 flex-1">{item.name}</span>
                        <span className="text-xs text-slate-400">{item.quantity} {item.unit}</span>
                        <span className="text-[10px] text-slate-400">{item.added_by}</span>
                        <button onClick={() => { items.remove(item.id); addToast('success', 'Item removido') }} className="w-7 h-7 rounded hover:bg-critical-light flex items-center justify-center text-slate-300 hover:text-critical opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Checked items section */}
            {checkedItems.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-caption text-slate-400 mb-2">Comprados</p>
                <div className="space-y-1 opacity-60">
                  {checkedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2 px-3">
                      <button onClick={() => toggleItem(item.id)} className="w-5 h-5 rounded bg-health flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-sm text-slate-400 line-through flex-1">{item.name}</span>
                      <span className="text-xs text-slate-400">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DataCard>

      {/* Shopping History */}
      {trips.data.length > 0 && (
        <DataCard title="Histórico de Compras" className="mt-8">
          <div className="space-y-2">
            {trips.data.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-light flex items-center justify-center text-white text-[10px] font-bold">
                    {trip.responsible_user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{trip.responsible_user}</p>
                    <p className="text-[10px] text-slate-400">{formatDateBR(new Date(trip.completed_at))}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{trip.items_bought} itens</p>
              </div>
            ))}
          </div>
        </DataCard>
      )}
    </div>
  )
}

function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
