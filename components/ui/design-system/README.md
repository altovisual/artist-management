# Design System

Sistema de diseño unificado para la aplicación de gestión de artistas, basado en el estilo del dashboard home.

## Componentes Principales

### 1. PageHeader
Encabezado de página con avatar, título, descripción y acciones.

```tsx
import { PageHeader } from '@/components/ui/design-system'

<PageHeader
  title="Artist Name"
  subtitle="Location"
  description="Artist biography..."
  badge={{
    text: "Hip Hop Artist",
    variant: 'secondary'
  }}
  avatar={{
    src: "/avatar.jpg",
    fallback: "AN"
  }}
  actions={[
    {
      label: "Edit Profile",
      href: "/edit",
      variant: 'default',
      icon: Edit
    }
  ]}
/>
```

### 2. StatsGrid
Grid de estadísticas usando StatsCard components.

```tsx
import { StatsGrid } from '@/components/ui/design-system'

const stats = [
  {
    title: "Total Artists",
    value: 25,
    icon: Users,
    description: "Active profiles"
  },
  {
    title: "Revenue",
    value: "$12,500",
    change: "+15%",
    changeType: 'positive',
    icon: DollarSign,
    description: "This month"
  }
]

<StatsGrid stats={stats} columns={4} />
```

### 3. ContentSection
Sección de contenido con header y acciones.

```tsx
import { ContentSection } from '@/components/ui/design-system'

<ContentSection
  title="Social Media"
  description="Manage social accounts"
  icon={Users}
  actions={[
    {
      label: "Add Account",
      onClick: () => {},
      icon: Plus
    }
  ]}
>
  {/* Content here */}
</ContentSection>
```

### 4. DataTable
Tabla de datos con acciones y estados vacíos.

```tsx
import { DataTable } from '@/components/ui/design-system'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' }
]

const actions = [
  {
    label: 'Edit',
    onClick: (item) => {},
    icon: Edit
  },
  {
    label: 'Delete',
    onClick: (item) => {},
    icon: Trash,
    variant: 'destructive'
  }
]

<DataTable
  title="Artists"
  data={artists}
  columns={columns}
  actions={actions}
  emptyState={{
    title: "No artists found",
    description: "Create your first artist to get started",
    icon: Users
  }}
/>
```

### 5. PageLayout
Layout wrapper con espaciado consistente.

```tsx
import { PageLayout } from '@/components/ui/design-system'

<PageLayout spacing="normal" maxWidth="full">
  {/* Page content */}
</PageLayout>
```

## Patrones de Uso

### Página Típica
```tsx
import { 
  PageHeader, 
  StatsGrid, 
  ContentSection, 
  PageLayout 
} from '@/components/ui/design-system'

export default function MyPage() {
  return (
    <DashboardLayout>
      <PageLayout>
        <PageHeader {...headerProps} />
        <StatsGrid stats={statsData} columns={4} />
        <ContentSection title="Main Content">
          {/* Content */}
        </ContentSection>
      </PageLayout>
    </DashboardLayout>
  )
}
```

## Principios del Sistema

### 1. Consistencia Visual
- Gradientes sutiles: `from-primary/10 via-primary/5 to-transparent`
- Bordes: `border-primary/20`
- Efectos blur: círculos con `blur-3xl`
- Glassmorphism: `backdrop-blur-sm`

### 2. Espaciado
- **Tight**: `space-y-4` - Para contenido denso
- **Normal**: `space-y-6` - Para uso general
- **Loose**: `space-y-8` - Para secciones amplias

### 3. Colores
- **Primary**: Para elementos principales y acciones
- **Secondary**: Para elementos de apoyo
- **Muted**: Para texto secundario y bordes
- **Card**: Para fondos de tarjetas

### 4. Responsive
- **Mobile First**: Diseño optimizado para móvil
- **Breakpoints**: sm, md, lg, xl siguiendo Tailwind
- **Grid Adaptativo**: Columnas que se ajustan automáticamente

## Migración

Para migrar páginas existentes:

1. Reemplazar headers custom con `PageHeader`
2. Convertir stats cards individuales a `StatsGrid`
3. Envolver contenido en `ContentSection`
4. Usar `PageLayout` como wrapper principal
5. Reemplazar tablas custom con `DataTable`

## Beneficios

- ✅ **Consistencia**: Mismo estilo en toda la app
- ✅ **Mantenibilidad**: Cambios centralizados
- ✅ **Performance**: Componentes optimizados
- ✅ **Accesibilidad**: Patrones accesibles por defecto
- ✅ **Responsive**: Funciona en todos los dispositivos
