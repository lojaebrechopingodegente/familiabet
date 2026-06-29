import { useAppData } from './useAppData'
import type { ScheduledVisit } from '@/types/database'

const sampleVisits: ScheduledVisit[] = [
  {
    id: '1',
    visitor_name: 'João',
    date: '2026-07-05',
    time: '10:00',
    type: 'presencial',
    status: 'scheduled',
    notes: 'Levar remédios novos e verificar pressão',
    created_by: 'Maria',
    created_at: '2026-06-28T10:00:00Z',
  },
  {
    id: '2',
    visitor_name: 'Maria',
    date: '2026-07-08',
    time: '14:00',
    type: 'acompanhamento-medico',
    status: 'scheduled',
    notes: 'Acompanhar mãe na consulta com o cardiologista',
    created_by: 'João',
    created_at: '2026-06-28T11:00:00Z',
  },
  {
    id: '3',
    visitor_name: 'Pedro',
    date: '2026-07-12',
    time: '12:00',
    type: 'almoço-jantar',
    status: 'scheduled',
    notes: 'Almoço em família no domingo',
    created_by: 'Maria',
    created_at: '2026-06-27T09:00:00Z',
  },
  {
    id: '4',
    visitor_name: 'João',
    date: '2026-06-25',
    time: '16:00',
    type: 'presencial',
    status: 'completed',
    notes: 'Visita de rotina. Pai está bem, fez os exercícios de fisioterapia.',
    created_by: 'João',
    created_at: '2026-06-20T08:00:00Z',
  },
  {
    id: '5',
    visitor_name: 'Maria',
    date: '2026-06-22',
    time: '09:30',
    type: 'presencial',
    status: 'completed',
    notes: 'Levou mãe para caminhada no parque.',
    created_by: 'Pedro',
    created_at: '2026-06-18T14:00:00Z',
  },
]

export function useVisits() {
  return useAppData<ScheduledVisit>({ key: 'scheduled_visits', initialData: sampleVisits })
}
