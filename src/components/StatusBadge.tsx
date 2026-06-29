import { cn } from '@/lib/utils'

type BadgeVariant = 'success' | 'warning' | 'critical' | 'info' | 'neutral'

interface StatusBadgeProps {
  variant: BadgeVariant
  label: string
  className?: string
  size?: 'sm' | 'default'
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#CCFBF1] text-[#0D9488] border-[#99F6E4]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  critical: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
  info: 'bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]',
  neutral: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
}

export function StatusBadge({ variant, label, className, size = 'default' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-md font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]',
        'tracking-wide uppercase',
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
