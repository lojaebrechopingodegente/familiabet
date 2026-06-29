import { useAppData } from './useAppData'
import type { Medication, MedicationLog } from '@/types/database'

const sampleMedications: Medication[] = [
  {
    id: '1',
    parent_id: 'mother',
    name: 'Metformina',
    dosage: '500mg',
    quantity_per_dose: 1,
    schedule: ['08:00', '20:00'],
    start_date: '2024-01-15',
    end_date: null,
    instructions: 'Tomar com água, após as refeições',
    stock_quantity: 24,
    alert_threshold: 5,
    is_active: true,
    created_by: 'João',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    parent_id: 'father',
    name: 'Losartana',
    dosage: '50mg',
    quantity_per_dose: 1,
    schedule: ['08:00'],
    start_date: '2023-06-10',
    end_date: null,
    instructions: 'Tomar em jejum',
    stock_quantity: 12,
    alert_threshold: 7,
    is_active: true,
    created_by: 'Maria',
    created_at: '2023-06-10T14:00:00Z',
  },
  {
    id: '3',
    parent_id: 'mother',
    name: 'Sinvastatina',
    dosage: '20mg',
    quantity_per_dose: 1,
    schedule: ['22:00'],
    start_date: '2024-03-20',
    end_date: null,
    instructions: 'Tomar antes de dormir',
    stock_quantity: 18,
    alert_threshold: 5,
    is_active: true,
    created_by: 'Pedro',
    created_at: '2024-03-20T09:00:00Z',
  },
  {
    id: '4',
    parent_id: 'father',
    name: 'AAS',
    dosage: '100mg',
    quantity_per_dose: 1,
    schedule: ['08:00'],
    start_date: '2023-01-01',
    end_date: null,
    instructions: 'Tomar após o café da manhã',
    stock_quantity: 45,
    alert_threshold: 10,
    is_active: true,
    created_by: 'João',
    created_at: '2023-01-01T08:00:00Z',
  },
]

const today = new Date().toISOString().split('T')[0]
const sampleLogs: MedicationLog[] = [
  // Today's logs
  { id: '1', medication_id: '2', scheduled_time: '08:00', scheduled_date: today, taken_at: `${today}T08:05:00Z`, status: 'taken', taken_by: 'João', notes: '', created_at: `${today}T08:05:00Z` },
  { id: '2', medication_id: '4', scheduled_time: '08:00', scheduled_date: today, taken_at: `${today}T08:10:00Z`, status: 'taken', taken_by: 'João', notes: '', created_at: `${today}T08:10:00Z` },
  { id: '3', medication_id: '1', scheduled_time: '08:00', scheduled_date: today, taken_at: `${today}T08:15:00Z`, status: 'taken', taken_by: 'Maria', notes: '', created_at: `${today}T08:15:00Z` },
  { id: '4', medication_id: '1', scheduled_time: '20:00', scheduled_date: today, taken_at: null, status: 'pending', taken_by: null, notes: '', created_at: `${today}T00:00:00Z` },
  { id: '5', medication_id: '3', scheduled_time: '22:00', scheduled_date: today, taken_at: null, status: 'pending', taken_by: null, notes: '', created_at: `${today}T00:00:00Z` },
]

export function useMedications() {
  const medications = useAppData<Medication>({ key: 'medications', initialData: sampleMedications })
  const logs = useAppData<MedicationLog>({ key: 'medication_logs', initialData: sampleLogs })

  const markAsTaken = (logId: string, userName: string) => {
    logs.update(logId, {
      status: 'taken',
      taken_at: new Date().toISOString(),
      taken_by: userName,
    })
  }

  const getTodayLogs = () => {
    return logs.data
      .filter((log) => log.scheduled_date === today)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
  }

  const getLogsForMedication = (medicationId: string) => {
    return logs.data
      .filter((log) => log.medication_id === medicationId)
      .sort((a, b) => `${b.scheduled_date}${b.scheduled_time}`.localeCompare(`${a.scheduled_date}${a.scheduled_time}`))
  }

  return { medications, logs, markAsTaken, getTodayLogs, getLogsForMedication }
}
