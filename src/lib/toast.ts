/** @author Harry Vasanth (harryvasanth.com) */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastEvent {
  id: string
  message: string
  type: ToastType
}

export const toast = {
  emit: (message: string, type: ToastType = 'info') => {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 9)

    const event = new CustomEvent<ToastEvent>('app-toast', {
      detail: { id, message, type },
    })
    window.dispatchEvent(event)
  },
  success: (message: string) => toast.emit(message, 'success'),
  error: (message: string) => toast.emit(message, 'error'),
  warning: (message: string) => toast.emit(message, 'warning'),
  info: (message: string) => toast.emit(message, 'info'),
}
