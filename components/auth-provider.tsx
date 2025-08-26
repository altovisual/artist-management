// Archivo: components/auth-provider.tsx

'use client'

import { useState, useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  // useEffect solo se ejecuta en el cliente, después del primer render.
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // **LA LÓGICA CLAVE ESTÁ AQUÍ**
  if (!isMounted) {
    // 1. En el servidor, se renderiza este "Loading...".
    // 2. En el primer render del cliente (hidratación), TAMBIÉN se renderiza este "Loading...".
    //    ¡COINCIDEN! No hay error de hidratación.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // 3. Inmediatamente después de la hidratación, useEffect se ejecuta,
  //    isMounted cambia a 'true', y el componente se vuelve a renderizar,
  //    ahora mostrando el contenido real de la aplicación ({children}).
  return <>{children}</>
}