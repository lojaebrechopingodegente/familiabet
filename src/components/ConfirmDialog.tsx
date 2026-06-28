import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="gap-4">
          <div className="flex justify-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                variant === 'danger' ? 'bg-critical-light' : 'bg-warning-light'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  variant === 'danger' ? 'text-critical' : 'text-warning'
                }`}
              />
            </div>
          </div>
          <DialogTitle className="text-center text-heading-1">{title}</DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
