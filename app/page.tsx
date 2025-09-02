'use client' // Directiva para convertirlo en un Componente de Cliente

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// --- Componentes de UI (ejemplo, ajusta a los que uses) ---
// Si no usas una librería como shadcn/ui, puedes reemplazar estos
// con etiquetas HTML normales y darles estilo.
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Previene la recarga de la página
    setLoading(true)
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Error de autenticación:', error)
      setErrorMessage(error.message) // Muestra el error de Supabase (ej. "Invalid login credentials")
      setLoading(false)
      return
    }

    // ¡ÉXITO! Redirigir al usuario al panel principal
    // El router.refresh() es importante para que Next.js actualice la sesión
    router.push('/dashboard') // <-- CAMBIA '/dashboard' a tu ruta deseada
    router.refresh()
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Video de fondo en el lado izquierdo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute left-0 top-0 h-full w-1/2 object-cover z-0"
      >
        <source src="/intro-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Contenedor para el formulario de login en el lado derecho */}
      <div className="relative z-10 flex h-full w-1/2 items-center justify-center"> {/* New container for right side */}
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
          <div className="text-center">
            <AnimatedTitle text="Login" level={1} className="text-3xl font-bold tracking-tight" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Enter your email below to login to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email" // <-- Atributo `name` es CRUCIAL
                type="email"
                placeholder="m@example.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password" // <-- Atributo `name` es CRUCIAL
                type="password"
                required
                disabled={loading}
              />
            </div>

            {/* --- Zona para mostrar errores --- */}
            {errorMessage && (
              <p className="text-sm font-medium text-red-500">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="font-medium underline hover:text-gray-800 dark:hover:text-gray-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}