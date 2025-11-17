import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AccessStatus {
  hasAccess: boolean;
  status: 'active' | 'expired' | 'no_access';
  packageName?: string;
  packageSlug?: string;
  isPilot?: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  message: string;
}

export const usePackageAccess = () => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccessStatus({
          hasAccess: false,
          status: 'no_access',
          message: 'Not authenticated'
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_user_access_status', {
        _user_id: user.id
      });

      if (error) throw error;
      
      const result = data as any;
      setAccessStatus({
        hasAccess: result.has_access,
        status: result.status,
        packageName: result.package_name,
        packageSlug: result.package_slug,
        isPilot: result.is_pilot,
        expiresAt: result.expires_at,
        daysRemaining: result.days_remaining,
        message: result.message
      });
    } catch (error) {
      console.error('Error checking access:', error);
      setAccessStatus({
        hasAccess: false,
        status: 'no_access',
        message: 'Error checking access'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  return { accessStatus, loading, refetch: checkAccess };
};
