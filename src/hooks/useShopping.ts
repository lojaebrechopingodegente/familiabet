import { useAppData } from './useAppData'
import type { ShoppingItem, ShoppingTrip } from '@/types/database'

const sampleItems: ShoppingItem[] = [
  { id: '1', name: 'Banana', quantity: 2, unit: 'kg', category: 'hortifruti', priority: 'normal', is_checked: false, added_by: 'João', created_at: '2026-06-28T10:00:00Z' },
  { id: '2', name: 'Leite Integral', quantity: 6, unit: 'un', category: 'laticinios', priority: 'normal', is_checked: false, added_by: 'Maria', created_at: '2026-06-28T10:05:00Z' },
  { id: '3', name: 'Picanha', quantity: 1, unit: 'kg', category: 'acougue', priority: 'urgente', is_checked: false, added_by: 'Pedro', created_at: '2026-06-28T10:10:00Z' },
  { id: '4', name: 'Detergente', quantity: 3, unit: 'un', category: 'limpeza', priority: 'normal', is_checked: false, added_by: 'João', created_at: '2026-06-28T10:15:00Z' },
  { id: '5', name: 'Arroz', quantity: 5, unit: 'kg', category: 'graos', priority: 'muito-urgente', is_checked: false, added_by: 'Maria', created_at: '2026-06-28T10:20:00Z' },
  { id: '6', name: 'Pão Francês', quantity: 10, unit: 'un', category: 'padaria', priority: 'normal', is_checked: false, added_by: 'Pedro', created_at: '2026-06-28T10:25:00Z' },
  { id: '7', name: 'Iogurte Natural', quantity: 4, unit: 'un', category: 'laticinios', priority: 'normal', is_checked: true, added_by: 'João', created_at: '2026-06-27T09:00:00Z' },
  { id: '8', name: 'Maçã', quantity: 1, unit: 'kg', category: 'hortifruti', priority: 'normal', is_checked: true, added_by: 'Maria', created_at: '2026-06-27T09:05:00Z' },
]

const sampleTrips: ShoppingTrip[] = [
  { id: '1', responsible_user: 'João', items_bought: 12, completed_at: '2026-06-21T11:00:00Z' },
  { id: '2', responsible_user: 'Maria', items_bought: 18, completed_at: '2026-06-14T10:30:00Z' },
]

export function useShopping() {
  const items = useAppData<ShoppingItem>({ key: 'shopping_items', initialData: sampleItems })
  const trips = useAppData<ShoppingTrip>({ key: 'shopping_trips', initialData: sampleTrips })

  const toggleItem = (id: string) => {
    const item = items.data.find((i) => i.id === id)
    if (item) {
      items.update(id, { is_checked: !item.is_checked })
    }
  }

  const clearChecked = () => {
    const checkedItems = items.data.filter((i) => i.is_checked)
    if (checkedItems.length > 0) {
      trips.add({
        responsible_user: 'João',
        items_bought: checkedItems.length,
        completed_at: new Date().toISOString(),
      })
      items.setData((prev) => prev.filter((i) => !i.is_checked))
    }
  }

  return { items, trips, toggleItem, clearChecked }
}
