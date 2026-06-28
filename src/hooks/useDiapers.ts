import { useAppData } from './useAppData'
import type { DiaperStock } from '@/types/database'

const sampleDiapers: DiaperStock[] = [
  {
    id: '1',
    brand: 'Prevail',
    size: 'g',
    type: 'geriatrica',
    quantity_current: 18,
    quantity_total: 30,
    alert_threshold: 10,
    price_per_unit: 4.5,
    store: 'Drogaria São Paulo',
    last_purchase_date: '2026-06-15',
    created_by: 'João',
    created_at: '2026-06-15T10:00:00Z',
  },
  {
    id: '2',
    brand: 'Depend',
    size: 'g',
    type: 'noturna',
    quantity_current: 12,
    quantity_total: 20,
    alert_threshold: 5,
    price_per_unit: 6.2,
    store: 'Pague Menos',
    last_purchase_date: '2026-06-10',
    created_by: 'Maria',
    created_at: '2026-06-10T14:00:00Z',
  },
  {
    id: '3',
    brand: 'Prevail Premium',
    size: 'm',
    type: 'premium',
    quantity_current: 3,
    quantity_total: 15,
    alert_threshold: 5,
    price_per_unit: 5.8,
    store: 'Mercado Livre',
    last_purchase_date: '2026-05-28',
    created_by: 'Pedro',
    created_at: '2026-05-28T09:00:00Z',
  },
  {
    id: '4',
    brand: 'Bigfral',
    size: 'xg',
    type: 'economica',
    quantity_current: 22,
    quantity_total: 30,
    alert_threshold: 8,
    price_per_unit: 3.2,
    store: 'Atacadão',
    last_purchase_date: '2026-06-22',
    created_by: 'João',
    created_at: '2026-06-22T16:00:00Z',
  },
]

export function useDiapers() {
  return useAppData<DiaperStock>({ key: 'diaper_stock', initialData: sampleDiapers })
}
