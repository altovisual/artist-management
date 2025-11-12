'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { User, Mail, Shield, Calendar, Loader2, Save } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  created_at: string
  role?: string
  full_name?: string
  avatar_url?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        router.push('/auth/login')
        return
      }

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError)
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        created_at: authUser.created_at || '',
        role: profile?.role || authUser.app_metadata?.role || 'user',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url || ''
      })

      setFullName(profile?.full_name || authUser.user_metadata?.full_name || '')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Update auth metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (updateError) throw updateError

      toast.success('Perfil actualizado exitosamente')
      fetchUserProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge variant="default" className="bg-purple-600">Admin</Badge>
    }
    return <Badge variant="secondary">Usuario</Badge>
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.full_name || '', user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user.full_name || 'Usuario'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <div className="mt-2">
                  {getRoleBadge(user.role || 'user')}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Actualiza tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar
              </p>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información de la Cuenta
            </CardTitle>
            <CardDescription>
              Detalles de tu cuenta en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">ID de Usuario</Label>
                <p className="text-sm font-mono mt-1 break-all">{user.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rol</Label>
                <p className="text-sm mt-1 capitalize">{user.role || 'Usuario'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Miembro desde
              </Label>
              <p className="text-sm mt-1">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/auth/reset-password`
                  })
                  if (error) throw error
                  toast.success('Email de recuperación enviado', {
                    description: 'Revisa tu correo para cambiar tu contraseña'
                  })
                } catch (error) {
                  toast.error('Error al enviar email de recuperación')
                }
              }}
            >
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
