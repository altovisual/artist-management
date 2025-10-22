# Sistema de Onboarding

Sistema completo de onboarding para usuarios nuevos de la plataforma Artist Management.

## 🎯 Características

- **Detección Automática**: Identifica usuarios nuevos que necesitan onboarding
- **4 Pasos Guiados**: Bienvenida, Perfil, Primer Artista, Tour
- **Progreso Visual**: Barra de progreso y indicadores de pasos
- **Animaciones Suaves**: Transiciones con Framer Motion
- **Responsive**: Funciona perfectamente en móvil y desktop
- **Opcional**: Los usuarios pueden saltar el onboarding

## 📁 Estructura de Archivos

```
components/onboarding/
├── onboarding-wrapper.tsx      # Wrapper que detecta si se necesita onboarding
├── onboarding-flow.tsx          # Componente principal del flujo
├── steps/
│   ├── welcome-step.tsx         # Paso 1: Bienvenida
│   ├── profile-step.tsx         # Paso 2: Configurar perfil
│   ├── first-artist-step.tsx    # Paso 3: Crear primer artista
│   └── tour-step.tsx            # Paso 4: Tour de funcionalidades
├── index.ts                     # Exports
└── README.md                    # Esta documentación

hooks/
└── use-onboarding.ts            # Hook para gestión de estado

supabase/migrations/
└── 20251022000000_create_user_profiles_onboarding.sql
```

## 🚀 Uso

### Integración en el Dashboard

El onboarding ya está integrado en el dashboard principal:

```tsx
import { OnboardingWrapper } from "@/components/onboarding/onboarding-wrapper";

export default function DashboardPage() {
  return (
    <OnboardingWrapper>
      <DashboardLayout>
        <Dashboard />
      </DashboardLayout>
    </OnboardingWrapper>
  );
}
```

### Hook useOnboarding

```tsx
import { useOnboarding } from "@/hooks/use-onboarding";

function MyComponent() {
  const {
    isLoading,
    needsOnboarding,
    currentStep,
    steps,
    completeStep,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
  } = useOnboarding();

  // Tu lógica aquí
}
```

## 📊 Flujo de Onboarding

### 1. Bienvenida (Welcome)
- Presenta la plataforma
- Muestra características principales
- Grid de 4 features destacadas
- Botón para comenzar

### 2. Perfil (Profile)
- Configuración de información personal
- Nombre completo (requerido)
- Rol: Artista, Manager, Productor, Sello, Otro (requerido)
- Compañía/Sello (opcional)
- Bio (opcional)
- Avatar (opcional)

### 3. Primer Artista (First Artist)
- Crear el primer artista (opcional)
- Nombre del artista (requerido si se crea)
- Género musical (requerido si se crea)
- País (requerido si se crea)
- Opción de saltar este paso

### 4. Tour (Tour)
- Resumen de funcionalidades
- Grid con 6 secciones principales:
  - Gestión de Artistas
  - Analytics
  - Contratos
  - Participantes
  - Finanzas
  - Configuración
- Consejos rápidos
- Botón para ir al dashboard

## 🗄️ Base de Datos

### Tabla: user_profiles

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Políticas RLS

- **SELECT**: Los usuarios pueden ver su propio perfil
- **INSERT**: Los usuarios pueden crear su propio perfil
- **UPDATE**: Los usuarios pueden actualizar su propio perfil

## 🎨 Diseño

### Colores y Efectos

- **Background**: Gradiente sutil con efectos blur
- **Cards**: Glassmorphism con backdrop-blur
- **Iconos**: Contextuales para cada paso
- **Animaciones**: Transiciones suaves con Framer Motion

### Responsive

- **Mobile**: Stack vertical, botones full-width
- **Tablet**: Grid de 2 columnas
- **Desktop**: Grid de 2-3 columnas, layout horizontal

## 🔧 Configuración

### Personalizar Pasos

Edita el array de steps en `use-onboarding.ts`:

```tsx
const [steps, setSteps] = useState<OnboardingStep[]>([
  {
    id: "welcome",
    title: "Bienvenido",
    description: "Conoce la plataforma",
    completed: false,
  },
  // Agrega más pasos aquí
]);
```

### Personalizar Géneros y Países

Edita los arrays en `first-artist-step.tsx`:

```tsx
const GENRES = ["Pop", "Rock", "Hip Hop", ...];
const COUNTRIES = ["Argentina", "México", "Colombia", ...];
```

## 📝 Estados

### isLoading
- `true`: Verificando estado de onboarding
- `false`: Estado verificado

### needsOnboarding
- `true`: Usuario necesita completar onboarding
- `false`: Usuario ya completó onboarding

### currentStep
- Número del paso actual (0-3)

## 🎯 Funciones

### completeStep(stepId)
Marca un paso como completado

### nextStep()
Avanza al siguiente paso

### previousStep()
Retrocede al paso anterior

### skipOnboarding()
Marca el onboarding como completado sin terminar todos los pasos

### completeOnboarding()
Completa el onboarding y redirige al dashboard

## 🔒 Seguridad

- Autenticación requerida
- RLS policies en Supabase
- Validación de datos en frontend y backend
- Solo el usuario puede modificar su propio perfil

## 🚀 Migración

Para aplicar la migración en Supabase:

```bash
# Opción 1: Supabase CLI
supabase db push

# Opción 2: Supabase Dashboard
# Copia el contenido de la migración y ejecútalo en SQL Editor
```

## 📱 Testing

### Probar el Onboarding

1. Crear un nuevo usuario
2. Iniciar sesión
3. El onboarding debería aparecer automáticamente
4. Completar o saltar los pasos
5. Verificar que se guarda en la base de datos

### Resetear Onboarding

```sql
-- Para un usuario específico
UPDATE user_profiles 
SET onboarding_completed = false, 
    onboarding_completed_at = NULL 
WHERE user_id = 'USER_UUID';

-- O eliminar el registro
DELETE FROM user_profiles WHERE user_id = 'USER_UUID';
```

## 🎨 Personalización Visual

### Cambiar Colores

Edita las clases de Tailwind en cada componente:

```tsx
// Primary color
className="bg-primary/10 text-primary"

// Gradientes
className="bg-gradient-to-br from-primary to-purple-600"
```

### Cambiar Iconos

Importa diferentes iconos de `lucide-react`:

```tsx
import { Music, Star, Heart } from "lucide-react";
```

## 📊 Analytics (Futuro)

Considera agregar tracking de:
- Tiempo en cada paso
- Pasos completados vs saltados
- Tasa de completación
- Puntos de abandono

## 🐛 Troubleshooting

### El onboarding no aparece
- Verificar que el usuario está autenticado
- Verificar que la tabla user_profiles existe
- Verificar RLS policies

### Error al guardar datos
- Verificar conexión a Supabase
- Verificar permisos de la tabla
- Revisar console logs

### Animaciones no funcionan
- Verificar que framer-motion está instalado
- Verificar imports correctos

## 📚 Recursos

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [shadcn/ui Components](https://ui.shadcn.com/)

## ✅ Checklist de Implementación

- [x] Hook useOnboarding creado
- [x] Componente OnboardingFlow creado
- [x] 4 pasos implementados
- [x] OnboardingWrapper creado
- [x] Integrado en dashboard
- [x] Migración SQL creada
- [x] RLS policies configuradas
- [x] Documentación completa
- [ ] Testing en producción
- [ ] Analytics implementado (opcional)
