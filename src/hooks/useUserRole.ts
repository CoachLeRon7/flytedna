import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'coach' | 'student';

export const useUserRole = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = (data?.map(r => r.role) || []) as UserRole[];
      setRoles(userRoles);

      // Determine primary role (admin > coach > student)
      if (userRoles.includes('admin')) {
        setPrimaryRole('admin');
      } else if (userRoles.includes('coach')) {
        setPrimaryRole('coach');
      } else if (userRoles.includes('student')) {
        setPrimaryRole('student');
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole) => roles.includes(role);

  return {
    roles,
    primaryRole,
    hasRole,
    isAdmin: roles.includes('admin'),
    isCoach: roles.includes('coach'),
    isStudent: roles.includes('student'),
    isCoachAndAdmin: roles.includes('coach') && roles.includes('admin'),
    loading,
    refetch: fetchRoles,
  };
};
