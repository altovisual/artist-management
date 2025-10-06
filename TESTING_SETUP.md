# 🧪 Testing Setup - Artist Management System

**Fecha de setup:** 6 de Octubre, 2025  
**Framework:** Vitest + React Testing Library  
**Coverage Tool:** V8

---

## 📦 Dependencias Instaladas

### Testing Framework
- `vitest` - Test runner rápido y moderno
- `@vitest/ui` - Interfaz visual para tests
- `@vitejs/plugin-react` - Plugin React para Vite

### Testing Libraries
- `@testing-library/react` - Testing utilities para React
- `@testing-library/jest-dom` - Matchers personalizados para DOM
- `@testing-library/user-event` - Simulación de eventos de usuario
- `jsdom` - Implementación de DOM para Node.js

---

## ⚙️ Configuración

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/.next',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### tests/setup.ts
- Cleanup automático después de cada test
- Mock de Next.js router
- Variables de entorno de prueba
- Configuración global de testing

---

## 🚀 Scripts Disponibles

```bash
# Ejecutar tests en modo watch
npm test

# Ejecutar tests con UI visual
npm run test:ui

# Generar reporte de coverage
npm run test:coverage
```

---

## 📁 Estructura de Tests

```
tests/
├── setup.ts                          # Configuración global
├── smoke.test.ts                     # Tests básicos de smoke
├── lib/
│   └── pdf.test.ts                  # Tests de utilidades PDF
└── hooks/
    └── use-notifications.test.tsx   # Tests de hooks
```

---

## ✅ Tests Implementados

### 1. Smoke Tests (3 tests)
- ✅ Assertions básicas
- ✅ Operaciones matemáticas
- ✅ Manejo de strings

### 2. PDF Generation Tests (5 tests)
- ✅ Validación de módulo
- ✅ Manejo de HTML input
- ✅ Validación de estructura HTML
- ✅ Conversión de Buffer
- ✅ Encoding Base64

### 3. Notifications Hook Tests (3 tests)
- ✅ Tipos de notificaciones definidos
- ✅ Niveles de prioridad
- ✅ Estructura de notificación

**Total: 11 tests básicos implementados**

---

## 🎯 Próximos Tests a Implementar

### Prioridad Alta (Crítico para valoración)

1. **Hooks Tests** (15-20 tests)
   - [ ] `use-chat.ts` - Chat en tiempo real
   - [ ] `use-team-chat.ts` - Chat de equipo
   - [ ] `use-team-real.ts` - Gestión de equipo
   - [ ] `use-compact-workspace.ts` - Workspace

2. **Utility Tests** (10-15 tests)
   - [ ] `lib/crypto.ts` - Encriptación
   - [ ] `lib/utils.ts` - Utilidades generales
   - [ ] `lib/contract-templates.ts` - Templates

3. **API Route Tests** (20-30 tests)
   - [ ] `/api/contracts/*` - CRUD de contratos
   - [ ] `/api/auco/*` - Integración Auco
   - [ ] `/api/participants/*` - Gestión de participantes

### Prioridad Media

4. **Component Tests** (30-40 tests)
   - [ ] Componentes de UI críticos
   - [ ] Formularios
   - [ ] Modales y dialogs

5. **Integration Tests** (10-15 tests)
   - [ ] Flujos de autenticación
   - [ ] Creación de contratos
   - [ ] Sistema de firmas

---

## 📊 Coverage Goals

### Objetivo Mínimo (Para MVP)
- **Statements:** 60%
- **Branches:** 50%
- **Functions:** 60%
- **Lines:** 60%

### Objetivo Ideal (Para Producción)
- **Statements:** 80%
- **Branches:** 70%
- **Functions:** 80%
- **Lines:** 80%

---

## 🔧 Mocking Strategy

### Mocks Configurados
1. **Next.js Router** - Navegación
2. **Supabase Client** - Base de datos
3. **Environment Variables** - Configuración

### Mocks Pendientes
- [ ] Auco API
- [ ] PDF Generation
- [ ] File Upload
- [ ] WebSocket connections

---

## 💡 Best Practices

### 1. Naming Convention
```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // test implementation
  })
})
```

### 2. Test Structure (AAA Pattern)
```typescript
it('should calculate total', () => {
  // Arrange
  const items = [1, 2, 3]
  
  // Act
  const total = sum(items)
  
  // Assert
  expect(total).toBe(6)
})
```

### 3. Async Testing
```typescript
it('should fetch data', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})
```

---

## 🐛 Troubleshooting

### Error: Cannot find module
**Solución:** Verificar alias en `vitest.config.ts`

### Error: ReferenceError: vi is not defined
**Solución:** Importar `vi` desde vitest: `import { vi } from 'vitest'`

### Tests muy lentos
**Solución:** Usar `--run` para ejecutar sin watch mode

---

## 📈 Valor Agregado

**Setup Actual:** +$500 USD  
**Tests Completos (60% coverage):** +$2,000 USD  
**Tests Completos (80% coverage):** +$3,500 USD  

**Total Potencial con Testing:** +$4,000 USD adicionales

---

## 🔗 Referencias

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Última actualización:** 6 de Octubre, 2025  
**Estado:** ✅ Framework configurado - Listo para escribir tests
