/** @author Harry Vasanth (harryvasanth.com) */
import type React from 'react'
import { useEffect } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { toast } from '../../lib/toast'

const NetworkMonitor: React.FC = () => {
  const { t } = useTranslation()

  useEffect(() => {
    const handleOffline = () => {
      toast.warning(t('toast.offline', 'You are offline. Showing cached data.'))
    }

    const handleOnline = () => {
      toast.success(t('toast.online', 'Back online. Syncing data...'))
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [t])

  return null // This component doesn't render anything visually
}

export default NetworkMonitor
