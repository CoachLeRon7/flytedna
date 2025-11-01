import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type OrgRole = 'super_admin' | 'org_admin' | 'coach' | 'student';

interface Organization {
  id: string;
  name: string;
  institution: string | null;
  email_domain: string | null;
}

interface OrganizationMembership {
  organization_id: string;
  role: OrgRole;
  status: string;
  organization: Organization;
}

export const useUserOrganization = () => {
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [primaryOrg, setPrimaryOrg] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch user's organization memberships
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          status,
          organization:organizations(id, name, institution, email_domain)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;

      const memberships = (data || []).map(m => ({
        organization_id: m.organization_id,
        role: m.role as OrgRole,
        status: m.status,
        organization: Array.isArray(m.organization) ? m.organization[0] : m.organization
      })) as OrganizationMembership[];

      setOrganizations(memberships);

      // Check if super admin
      const superAdmin = memberships.some(m => m.role === 'super_admin');
      setIsSuperAdmin(superAdmin);

      // Set primary org (super_admin > org_admin > coach > student)
      const sorted = [...memberships].sort((a, b) => {
        const roleOrder = { super_admin: 0, org_admin: 1, coach: 2, student: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
      });
      
      if (sorted.length > 0) {
        setPrimaryOrg(sorted[0]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: OrgRole, orgId?: string) => {
    if (orgId) {
      return organizations.some(o => o.organization_id === orgId && o.role === role);
    }
    return organizations.some(o => o.role === role);
  };

  const isOrgAdmin = (orgId?: string) => {
    if (isSuperAdmin) return true;
    if (orgId) {
      return organizations.some(
        o => o.organization_id === orgId && (o.role === 'org_admin' || o.role === 'super_admin')
      );
    }
    return organizations.some(o => o.role === 'org_admin' || o.role === 'super_admin');
  };

  return {
    organizations,
    primaryOrg,
    isSuperAdmin,
    isOrgAdmin,
    hasRole,
    loading,
    refetch: fetchOrganizations,
  };
};
