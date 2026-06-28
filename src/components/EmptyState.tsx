import { FileX } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'Nenhum item encontrado',
  description = 'Comece adicionando o primeiro item.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        {icon || <FileX className="w-8 h-8 text-slate-300" />}
      </div>
      <h3 className="text-heading-2 text-slate-400 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
