/** @author Harry Vasanth (harryvasanth.com) */
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import type { ToastEvent } from '../../lib/toast'

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastEvent[]>([])

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastEvent>
      const newToast = customEvent.detail

      // Add the toast to the list
      setToasts(prev => [...prev, newToast])

      // Auto remove after 4.5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id))
      }, 4500)
    }

    window.addEventListener('app-toast', handleToast)
    return () => window.removeEventListener('app-toast', handleToast)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          let Icon = Info
          let colorClass = 'text-blue-500 bg-blue-500/10 border-blue-500/20'

          if (toast.type === 'success') {
            Icon = CheckCircle
            colorClass =
              'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
          } else if (toast.type === 'error') {
            Icon = XCircle
            colorClass = 'text-brand-red bg-brand-red/10 border-brand-red/20'
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle
            colorClass = 'text-orange-500 bg-orange-500/10 border-orange-500/20'
          }

          const [textColor, bgColor, borderColor] = colorClass.split(' ')

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3 md:p-4 glass rounded-2xl shadow-2xl backdrop-blur-xl border ${borderColor}`}
            >
              <div
                className={`p-1.5 rounded-xl shrink-0 ${bgColor} ${textColor}`}
              >
                <Icon size={18} />
              </div>
              <p className="flex-1 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-brand-navy dark:text-white leading-tight">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 opacity-40 hover:opacity-100 transition-opacity shrink-0"
              >
                <X size={14} className="text-brand-navy dark:text-white" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
