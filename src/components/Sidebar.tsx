import { Stethoscope, Pill, ShoppingCart, ChefHat, FolderOpen, CalendarHeart, Phone, DollarSign, Baby, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModuleId = 'consultas' | 'remedios' | 'compras' | 'marmitas' | 'documentos' | 'visitas' | 'ligacoes' | 'orcamentos' | 'fraldas'

const navItems = [
  { id: 'consultas' as ModuleId, label: 'Consultas Médicas', icon: Stethoscope, description: 'Agendamento de consultas e exames' },
  { id: 'remedios' as ModuleId, label: 'Remédios', icon: Pill, description: 'Controle de medicações e alarmes' },
  { id: 'compras' as ModuleId, label: 'Compras', icon: ShoppingCart, description: 'Lista de compras de mercado' },
  { id: 'marmitas' as ModuleId, label: 'Marmitas', icon: ChefHat, description: 'Cardápio e preparo de refeições' },
  { id: 'documentos' as ModuleId, label: 'Documentos', icon: FolderOpen, description: 'Repositório de documentos' },
  { id: 'visitas' as ModuleId, label: 'Visitas', icon: CalendarHeart, description: 'Visitas programadas dos filhos' },
  { id: 'ligacoes' as ModuleId, label: 'Ligações e Vídeo', icon: Phone, description: 'Registro de ligações e videochamadas' },
  { id: 'orcamentos' as ModuleId, label: 'Orçamentos', icon: DollarSign, description: 'Pesquisa e comparação de preços' },
  { id: 'fraldas' as ModuleId, label: 'Fraldas', icon: Baby, description: 'Controle de estoque de fraldas' },
]

interface SidebarProps {
  activeModule: ModuleId
  onModuleChange: (module: ModuleId) => void
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[260px] bg-navy flex flex-col z-30">
      {/* Parent Profile */}
      <div className="p-5">
        <div className="bg-navy-light/50 rounded-xl p-4 border border-navy-light">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-health/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-health" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Seus Pais</h3>
              <p className="text-slate-400 text-[11px]">Gerenciamento familiar</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-health animate-pulse" />
            <span className="text-health text-[11px] font-medium">Em acompanhamento</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-b border-navy-light" />

      {/* Section Label */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-caption text-slate-400">Módulos</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeModule === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-navy-light text-white border-l-[3px] border-health'
                  : 'text-slate-400 hover:bg-[#24354F] border-l-[3px] border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              <span className="text-sm font-medium text-left">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-light">
        <p className="text-slate-500 text-[11px] text-center">
          Sistema de Cuidado Familiar — 9 módulos
        </p>
      </div>
    </aside>
  )
}
