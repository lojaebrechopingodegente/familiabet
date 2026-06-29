import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface DataCardProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function DataCard({ title, action, children, className, noPadding }: DataCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-[10px] shadow-card transition-shadow duration-200 hover:shadow-card-hover',
        !noPadding && 'p-6',
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-heading-2 text-navy">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
