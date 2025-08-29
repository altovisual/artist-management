'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { DashboardLayout } from '@/components/dashboard-layout'

interface User {
  id: string;
  email: string | undefined;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.app_metadata?.role !== 'admin') {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setIsAdmin(true);

      const { data, error } = await supabase.rpc('get_all_users')

      if (error) {
        toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' })
      } else if (data) {
        setUsers(data)
      }
      setIsLoading(false)
    }

    checkAdminAndFetchUsers()
  }, [supabase, toast])

  const handleSetRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.functions.invoke('set-admin-role', {
        body: { userIdToUpdate: userId, newRole: newRole },
      })

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: 'Success!',
        description: `User role updated to ${newRole}.`,
      })

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))

    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const PageContent = () => {
    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!isAdmin) {
      return <div>You are not authorized to view this page.</div>
    }

    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="w-full bg-gray-100 text-left">
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role || 'user'}</td>
                  <td className="p-2">
                    {user.role !== 'admin' ? (
                      <button 
                        onClick={() => handleSetRole(user.id, 'admin')}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleSetRole(user.id, 'user')}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Revoke Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <PageContent />
    </DashboardLayout>
  )
}