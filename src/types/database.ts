export type ParentId = 'mother' | 'father' | 'both'
export type AppointmentType = 'consulta' | 'exame' | 'retorno'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
export type MedicationStatus = 'taken' | 'missed' | 'pending'
export type ShoppingUnit = 'kg' | 'g' | 'un' | 'pacote' | 'litro' | 'caixa'
export type ShoppingCategory = 'hortifruti' | 'acougue' | 'laticinios' | 'limpeza' | 'graos' | 'bebidas' | 'padaria' | 'outros'
export type ShoppingPriority = 'normal' | 'urgente' | 'muito-urgente'
export type DocumentType = 'pdf' | 'image' | 'document'
export type DocumentCategory = 'plano-saude' | 'receitas' | 'exames' | 'pessoais' | 'legais' | 'comprovantes' | 'outros'
export type MealType = 'cafe' | 'almoco' | 'jantar'
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

// Visitas Programadas
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled'
export type VisitType = 'presencial' | 'acompanhamento-medico' | 'almoço-jantar' | 'outro'

// Ligações
export type CallType = 'ligacao' | 'video' | 'whatsapp'
export type CallDirection = 'entrada' | 'saida'

// Orçamentos
export type QuoteCategory = 'remedio' | 'fralda' | 'equipamento-medico' | 'servico' | 'outro'
export type QuoteStatus = 'pendente' | 'aprovado' | 'rejeitado'

// Fraldas
export type DiaperSize = 'p' | 'm' | 'g' | 'xg' | 'xxg'
export type DiaperType = 'geriatrica' | 'noturna' | 'premium' | 'economica'

export interface Appointment {
  id: string
  parent_id: ParentId
  doctor_name: string
  specialty: string
  location: string
  date: string
  time: string
  type: AppointmentType
  status: AppointmentStatus
  notes: string
  reminder_days: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  parent_id: 'mother' | 'father'
  name: string
  dosage: string
  quantity_per_dose: number
  schedule: string[]
  start_date: string
  end_date: string | null
  instructions: string
  stock_quantity: number
  alert_threshold: number
  is_active: boolean
  created_by: string
  created_at: string
}

export interface MedicationLog {
  id: string
  medication_id: string
  scheduled_time: string
  scheduled_date: string
  taken_at: string | null
  status: MedicationStatus
  taken_by: string | null
  notes: string
  created_at: string
  medication?: Medication
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: ShoppingUnit
  category: ShoppingCategory
  priority: ShoppingPriority
  is_checked: boolean
  added_by: string
  created_at: string
}

export interface ShoppingTrip {
  id: string
  responsible_user: string
  items_bought: number
  completed_at: string
}

export interface Recipe {
  id: string
  name: string
  categories: string[]
  dietary_tags: string[]
  prep_time_minutes: number
  ingredients: { name: string; quantity: string; unit: string }[]
  steps: string[]
  nutrition: { calories: number; protein: number; carbs: number; fat: number; sodium: number }
  created_by: string
  created_at: string
}

export interface MealPlan {
  id: string
  week_start: string
  meals: MealSlot[]
  created_by: string
  created_at: string
}

export interface MealSlot {
  day: WeekDay
  type: MealType
  recipe_id: string | null
  free_text: string | null
  assigned_to: string
  notes: string
}

export interface Document {
  id: string
  file_name: string
  file_type: DocumentType
  file_size: number
  file_url: string
  category: DocumentCategory
  parent_id: 'mother' | 'father' | 'general'
  expiry_date: string | null
  description: string
  uploaded_by: string
  uploaded_at: string
}

export interface ScheduledVisit {
  id: string
  visitor_name: string
  date: string
  time: string
  type: VisitType
  status: VisitStatus
  notes: string
  created_by: string
  created_at: string
}

export interface CallLog {
  id: string
  date: string
  time: string
  call_type: CallType
  direction: CallDirection
  duration_minutes: number
  notes: string
  parent: 'mother' | 'father' | 'both'
  created_by: string
  created_at: string
}

export interface PriceQuote {
  id: string
  item_name: string
  category: QuoteCategory
  store_name: string
  price: number
  quantity: number
  unit: string
  status: QuoteStatus
  notes: string
  date: string
  created_by: string
  created_at: string
}

export interface DiaperStock {
  id: string
  brand: string
  size: DiaperSize
  type: DiaperType
  quantity_current: number
  quantity_total: number
  alert_threshold: number
  price_per_unit: number
  store: string
  last_purchase_date: string
  created_by: string
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at'>>
      }
      medications: {
        Row: Medication
        Insert: Omit<Medication, 'id' | 'created_at'>
        Update: Partial<Omit<Medication, 'id' | 'created_at'>>
      }
      medication_logs: {
        Row: MedicationLog
        Insert: Omit<MedicationLog, 'id' | 'created_at'>
        Update: Partial<Omit<MedicationLog, 'id' | 'created_at'>>
      }
      shopping_items: {
        Row: ShoppingItem
        Insert: Omit<ShoppingItem, 'id' | 'created_at'>
        Update: Partial<Omit<ShoppingItem, 'id' | 'created_at'>>
      }
      shopping_trips: {
        Row: ShoppingTrip
        Insert: Omit<ShoppingTrip, 'id' | 'completed_at'>
        Update: Partial<Omit<ShoppingTrip, 'id' | 'completed_at'>>
      }
      recipes: {
        Row: Recipe
        Insert: Omit<Recipe, 'id' | 'created_at'>
        Update: Partial<Omit<Recipe, 'id' | 'created_at'>>
      }
      meal_plans: {
        Row: MealPlan
        Insert: Omit<MealPlan, 'id' | 'created_at'>
        Update: Partial<Omit<MealPlan, 'id' | 'created_at'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'uploaded_at'>
        Update: Partial<Omit<Document, 'id' | 'uploaded_at'>>
      }
      scheduled_visits: {
        Row: ScheduledVisit
        Insert: Omit<ScheduledVisit, 'id' | 'created_at'>
        Update: Partial<Omit<ScheduledVisit, 'id' | 'created_at'>>
      }
      call_logs: {
        Row: CallLog
        Insert: Omit<CallLog, 'id' | 'created_at'>
        Update: Partial<Omit<CallLog, 'id' | 'created_at'>>
      }
      price_quotes: {
        Row: PriceQuote
        Insert: Omit<PriceQuote, 'id' | 'created_at'>
        Update: Partial<Omit<PriceQuote, 'id' | 'created_at'>>
      }
      diaper_stock: {
        Row: DiaperStock
        Insert: Omit<DiaperStock, 'id' | 'created_at'>
        Update: Partial<Omit<DiaperStock, 'id' | 'created_at'>>
      }
    }
  }
}
