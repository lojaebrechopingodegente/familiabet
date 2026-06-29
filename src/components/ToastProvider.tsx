import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'warning' | 'critical'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

const toastStyles: Record<ToastType, { border: string; icon: string; Icon: typeof CheckCircle }> = {
  success: { border: 'border-l-health', icon: 'text-health', Icon: CheckCircle },
  warning: { border: 'border-l-warning', icon: 'text-warning', Icon: AlertTriangle },
  critical: { border: 'border-l-critical', icon: 'text-critical', Icon: XCircle },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, type, message }])
      timersRef.current[id] = setTimeout(() => removeToast(id), 4000)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => {
          const { border, icon, Icon } = toastStyles[toast.type]
          return (
            <div
              key={toast.id}
              className={cn(
                'bg-white rounded-[10px] shadow-dropdown border-l-4 px-4 py-3 flex items-center gap-3 min-w-[320px] max-w-[480px]',
                'animate-slide-in',
                border
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0', icon)} />
              <p className="text-sm text-slate-600 flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
