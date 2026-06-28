import { Heart, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FamilyMember {
  id: string
  name: string
  initials: string
  color: string
}

const familyMembers: FamilyMember[] = [
  { id: '1', name: 'João', initials: 'JF', color: '#0D9488' },
  { id: '2', name: 'Maria', initials: 'MC', color: '#3B82F6' },
  { id: '3', name: 'Pedro', initials: 'PS', color: '#F59E0B' },
]

interface TopBarProps {
  activeUser: string
  onUserChange: (userId: string) => void
}

export function TopBar({ activeUser, onUserChange }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-navy-dark z-40 flex items-center justify-between px-6 shadow-sm border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-health/20 flex items-center justify-center">
          <Heart className="w-[18px] h-[18px] text-health" />
        </div>
        <span className="text-white font-semibold text-base">Cuidado Familiar</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs mr-2">Gerenciando como:</span>
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => onUserChange(member.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200',
                activeUser === member.id
                  ? 'bg-white/10 border-2'
                  : 'bg-transparent border-2 border-transparent hover:bg-white/5'
              )}
              style={
                activeUser === member.id
                  ? { borderColor: member.color }
                  : undefined
              }
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: member.color }}
              >
                {member.initials}
              </div>
              <span className="text-white text-sm font-medium">{member.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
          <button className="relative w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  )
}
