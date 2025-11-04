import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, RefreshCw, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UserSummary {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  sport: string | null;
  team_id: string | null;
  team_name: string | null;
  role: string | null;
  roles?: string[]; // All roles for this user
  is_active: boolean;
  last_login_at: string | null;
  login_count: number;
  account_created_at: string;
  total_assessments: number;
  peer_assessments_given: number;
  peer_assessments_received: number;
  coach_assessments_given: number;
  growth_plans_count: number;
  date_of_birth: string | null;
  age: number | null;
}

export function UserManagementDashboard() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [firstAdminIds, setFirstAdminIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('user_activity_summary_rls');

      if (error) throw error;
      
      // Fetch all roles for each user
      if (data && data.length > 0) {
        const userIds = data.map(u => u.user_id);
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (rolesError) throw rolesError;

        // Fetch profiles with date_of_birth
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, date_of_birth')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Group roles by user_id
        const rolesByUser = rolesData?.reduce((acc, { user_id, role }) => {
          if (!acc[user_id]) acc[user_id] = [];
          acc[user_id].push(role);
          return acc;
        }, {} as Record<string, string[]>);

        // Map profiles with date_of_birth
        const profilesByUser = profilesData?.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

        // Add roles array and age to each user
        const usersWithRoles = data.map(user => {
          const profile = profilesByUser?.[user.user_id];
          let age = null;
          if (profile?.date_of_birth) {
            const birthDate = new Date(profile.date_of_birth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
          }
          
          return {
            ...user,
            roles: rolesByUser?.[user.user_id] || [user.role || 'student'],
            date_of_birth: profile?.date_of_birth || null,
            age,
          };
        });

        setUsers(usersWithRoles);
      } else {
        setUsers([]);
      }

      // Load first admin IDs
      const { data: firstAdmins } = await supabase
        .from('user_activity_log')
        .select('user_id')
        .eq('activity_type', 'first_admin_auto_approved');

      if (firstAdmins) {
        setFirstAdminIds(new Set(firstAdmins.map(fa => fa.user_id)));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      // Refresh the materialized view
      await supabase.rpc('refresh_user_activity_summary');
      await loadUsers();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((user) => user.is_active);
    } else if (statusFilter === "archived") {
      filtered = filtered.filter((user) => !user.is_active);
    }

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDrawerOpen(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'coach':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalCoaches = users.filter(u => u.role === 'coach').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {activeUsers} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Students</CardDescription>
            <CardTitle className="text-3xl">{totalStudents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Coaches</CardDescription>
            <CardTitle className="text-3xl">{totalCoaches}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Administrators</CardDescription>
            <CardTitle className="text-3xl">{totalAdmins}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="coach">Coaches</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="archived">Archived Only</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={refreshData} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-center">Assessments</TableHead>
              <TableHead className="text-center">Peer Reviews</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <Badge key={role} variant={getRoleBadgeVariant(role)}>
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role || 'student'}
                        </Badge>
                      )}
                      {firstAdminIds.has(user.user_id) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 gap-1">
                                <Trophy className="h-3 w-3" />
                                Founding
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>First Administrator - Auto-approved</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.team_name ? (
                      <span className="text-sm">{user.team_name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No team</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.age !== null ? (
                      <span className="text-sm">{user.age}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Archived"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login_at ? (
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{user.total_assessments}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">
                      {user.peer_assessments_given}/{user.peer_assessments_received}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(user.user_id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserDetailDrawer
        userId={selectedUserId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
