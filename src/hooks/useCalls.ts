import { useAppData } from './useAppData'
import type { CallLog } from '@/types/database'

const sampleCalls: CallLog[] = [
  {
    id: '1',
    date: '2026-06-28',
    time: '08:30',
    call_type: 'ligacao',
    direction: 'saida',
    duration_minutes: 15,
    notes: 'Mãe estava animada, contou sobre a novela',
    parent: 'mother',
    created_by: 'João',
    created_at: '2026-06-28T08:45:00Z',
  },
  {
    id: '2',
    date: '2026-06-27',
    time: '19:00',
    call_type: 'video',
    direction: 'saida',
    duration_minutes: 25,
    notes: 'Videochamada com os netos. Pai mostrou o jardim.',
    parent: 'both',
    created_by: 'Maria',
    created_at: '2026-06-27T19:30:00Z',
  },
  {
    id: '3',
    date: '2026-06-27',
    time: '14:00',
    call_type: 'whatsapp',
    direction: 'entrada',
    duration_minutes: 5,
    notes: 'Mãe mandou áudio pedindo para comprar leite',
    parent: 'mother',
    created_by: 'Pedro',
    created_at: '2026-06-27T14:05:00Z',
  },
  {
    id: '4',
    date: '2026-06-26',
    time: '20:00',
    call_type: 'ligacao',
    direction: 'saida',
    duration_minutes: 10,
    notes: 'Ligação rápida para saber se tomaram o remédio',
    parent: 'both',
    created_by: 'João',
    created_at: '2026-06-26T20:15:00Z',
  },
  {
    id: '5',
    date: '2026-06-25',
    time: '10:00',
    call_type: 'video',
    direction: 'entrada',
    duration_minutes: 12,
    notes: 'Pai ligou para mostrar a nova planta do jardim',
    parent: 'father',
    created_by: 'Maria',
    created_at: '2026-06-25T10:15:00Z',
  },
]

export function useCalls() {
  return useAppData<CallLog>({ key: 'call_logs', initialData: sampleCalls })
}
