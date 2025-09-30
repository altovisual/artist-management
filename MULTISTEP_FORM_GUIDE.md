# MultiStepForm - Guía de Uso

## Modos Disponibles

El componente `MultiStepForm` soporta dos modos: **Create** y **Edit**.

### Modo CREATE (Crear Nuevo Artista)

**Características:**
- Navegación secuencial (Next/Back)
- Checkmarks (✓) en pasos completados
- Botón final: "Complete"
- No permite saltar pasos

**Uso:**
```tsx
<MultiStepForm
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  onComplete={handleCreate}
  canGoNext={canGoNext()}
  isLastStep={currentStep === steps.length - 1}
  mode="create"
  allowStepNavigation={false}
>
  {/* Contenido de los pasos */}
</MultiStepForm>
```

### Modo EDIT (Editar Artista Existente)

**Características:**
- Navegación libre (click en cualquier paso)
- Números en todos los pasos (1, 2, 3, 4, 5)
- Botón final: "Save Changes"
- Permite saltar directamente a cualquier paso

**Uso:**
```tsx
<MultiStepForm
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  onComplete={handleSave}
  canGoNext={true}
  canGoPrevious={true}
  isLastStep={currentStep === steps.length - 1}
  mode="edit"
  allowStepNavigation={true}
>
  {/* Contenido de los pasos */}
</MultiStepForm>
```

## Ejemplo Completo para Página de Edición

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MultiStepForm, FormFieldGroup, FormFieldItem } from '@/components/forms/multi-step-form'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function EditArtistPage() {
  const router = useRouter()
  const params = useParams()
  const [currentStep, setCurrentStep] = useState(0)
  
  // Estados del formulario...
  const [name, setName] = useState('')
  const [genre, setGenre] = useState('')
  // ... más estados

  // Cargar datos del artista
  useEffect(() => {
    async function loadArtist() {
      // Fetch artist data y llenar estados
    }
    loadArtist()
  }, [params.id])

  const steps = [
    { id: 'basic', title: 'Basic Info', description: 'Essential details' },
    { id: 'contact', title: 'Contact', description: 'Contact information' },
    { id: 'bio', title: 'Biography', description: 'Artist bio' },
    { id: 'social', title: 'Social Media', description: 'Social accounts' },
    { id: 'distribution', title: 'Distribution', description: 'Platforms' }
  ]

  const handleSave = async () => {
    // Guardar cambios
    console.log('Saving changes...')
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Edit Artist</h1>
            <p className="text-muted-foreground mt-2">
              Update artist information
            </p>
          </div>
        </div>

        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleSave}
          mode="edit"
          allowStepNavigation={true}
          canGoNext={true}
          canGoPrevious={true}
          isLastStep={currentStep === steps.length - 1}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <FormFieldGroup>
                <FormFieldItem label="Artist Name">
                  {/* Campos del formulario */}
                </FormFieldItem>
              </FormFieldGroup>
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Campos de contacto */}
            </div>
          )}

          {/* ... más pasos */}
        </MultiStepForm>
      </div>
    </DashboardLayout>
  )
}
```

## Interacciones en Modo Edit

### Click en Número de Paso
- Navega directamente a ese paso
- Animación de hover: escala 1.1
- Animación de tap: escala 0.95

### Click en Título de Paso (Desktop)
- También navega al paso
- Hover: cambia color del texto

### Botones Next/Back
- Funcionan normalmente
- Útil para navegación secuencial

## Ventajas del Modo Edit

✅ **Acceso Rápido**: Click directo en la sección a editar
✅ **UX Intuitiva**: No necesitas pasar por todos los pasos
✅ **Visual Claro**: Números en lugar de checkmarks
✅ **Feedback Visual**: Animaciones en hover y tap
✅ **Flexible**: Usa clicks o botones según prefieras

## Componentes Adicionales

### DateInput
Selector de fecha con 3 campos separados (DD/MM/YYYY)
```tsx
<DateInput
  value={dateOfBirth}
  onChange={setDateOfBirth}
/>
```

### CountrySelect
Selector de país con búsqueda
```tsx
<CountrySelect
  value={location}
  onChange={setLocation}
  placeholder="Select country"
/>
```

## Aplicar a Página de Edición Existente

Para aplicar el formulario multi-paso a `/app/artists/[id]/edit/page.tsx`:

1. Importar componentes necesarios
2. Definir los steps
3. Agregar estado `currentStep`
4. Envolver el contenido en `<MultiStepForm mode="edit" allowStepNavigation={true}>`
5. Organizar el contenido por pasos con condicionales `{currentStep === X && ...}`

La página actual tiene ~855 líneas, se puede migrar gradualmente.
