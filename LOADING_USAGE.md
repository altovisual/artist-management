# 🎨 LoadingScreen - Guía de Uso

## 📦 Componentes Creados

### 1. `LoadingScreen` Component
Pantalla de carga con logo animado, barra de progreso y efectos visuales.

**Ubicación:** `components/loading-screen.tsx`

### 2. `LoadingProvider` Context
Provider global que maneja el estado de carga en toda la aplicación.

**Ubicación:** `components/loading-provider.tsx`

---

## 🚀 Uso Automático

El `LoadingProvider` ya está integrado en `app/layout.tsx` y se activa automáticamente:

### ✅ Carga Inicial
- Se muestra al cargar la aplicación por primera vez
- Duración: 2 segundos
- Incluye animación completa del logo

### ✅ Cambios de Ruta
- Se muestra automáticamente al navegar entre páginas
- Duración: 800ms
- Transición suave

---

## 🎯 Uso Manual en Componentes

### Importar el Hook

```tsx
import { useLoading } from '@/components/loading-provider'
```

### Ejemplo Básico

```tsx
'use client'

import { useLoading } from '@/components/loading-provider'

export function MyComponent() {
  const { showLoading, hideLoading } = useLoading()

  const handleAction = async () => {
    showLoading()
    
    try {
      // Tu código asíncrono aquí
      await fetchData()
    } finally {
      hideLoading()
    }
  }

  return (
    <button onClick={handleAction}>
      Cargar Datos
    </button>
  )
}
```

### Ejemplo con Fetch

```tsx
'use client'

import { useLoading } from '@/components/loading-provider'
import { useEffect } from 'react'

export function DataComponent() {
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    const loadData = async () => {
      showLoading()
      
      try {
        const response = await fetch('/api/data')
        const data = await response.json()
        // Procesar datos
      } catch (error) {
        console.error(error)
      } finally {
        hideLoading()
      }
    }

    loadData()
  }, [])

  return <div>Contenido</div>
}
```

### Ejemplo con Form Submit

```tsx
'use client'

import { useLoading } from '@/components/loading-provider'

export function FormComponent() {
  const { showLoading, hideLoading } = useLoading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    showLoading()

    try {
      await submitForm()
      // Éxito
    } catch (error) {
      // Error
    } finally {
      hideLoading()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

---

## 🎨 Características del LoadingScreen

### Visual
- ✨ Logo animado con efecto de dibujo
- 📊 Barra de progreso con gradiente
- 💫 Efectos de blur animados
- 🔴 Dots animados con efecto de onda
- 🌈 Gradientes: primary → purple → pink

### Técnico
- ✅ Full screen overlay (z-index: 9999)
- ✅ Dark mode compatible
- ✅ Responsive
- ✅ Smooth animations con Framer Motion
- ✅ Exit animation al completar

---

## 🔧 API del Hook

```tsx
const {
  isLoading,      // boolean - Estado actual de carga
  setIsLoading,   // (loading: boolean) => void - Setter directo
  showLoading,    // () => void - Mostrar loading
  hideLoading,    // () => void - Ocultar loading
} = useLoading()
```

---

## 📝 Notas Importantes

1. **Solo en Client Components:** El hook solo funciona en componentes con `'use client'`

2. **Duración Automática:** 
   - Carga inicial: 2000ms
   - Cambio de ruta: 800ms
   - Manual: Hasta que llames a `hideLoading()`

3. **No Bloquea la UI:** El loading es visual, no bloquea interacciones

4. **Z-Index Alto:** El loading tiene z-index 9999 para estar sobre todo

---

## 🎯 Casos de Uso Recomendados

✅ **Usar el loading para:**
- Operaciones de base de datos
- Llamadas a APIs externas
- Procesamiento pesado
- Subida de archivos
- Navegación entre páginas

❌ **NO usar para:**
- Operaciones instantáneas
- Validaciones simples
- Cambios de estado locales
- Animaciones CSS

---

## 🚀 Integración Completada

El LoadingScreen ya está integrado en:
- ✅ `app/layout.tsx` - Provider global
- ✅ Carga inicial automática
- ✅ Cambios de ruta automáticos
- ✅ Hook disponible en toda la app

¡Listo para usar! 🎉
