/** @author Harry Vasanth (harryvasanth.com) */
import React, { useEffect } from 'react';
import { toast } from '../../lib/toast';
import { useTranslation } from '../../hooks/useTranslation';

const NetworkMonitor: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleOffline = () => {
      toast.warning(t("toast.offline", "You are offline. Showing cached data."));
    };

    const handleOnline = () => {
      toast.success(t("toast.online", "Back online. Syncing data..."));
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [t]);

  return null; // This component doesn't render anything visually
};

export default NetworkMonitor;