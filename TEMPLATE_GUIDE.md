# 📄 Guía Completa de Plantillas de Contratos

## 🎯 Cómo Funciona el Sistema

El sistema de plantillas usa **HTML + CSS** para crear PDFs profesionales. PDFShift convierte tu HTML en PDF manteniendo todos los estilos.

---

## 📋 Variables Disponibles

Puedes usar estas variables en tus plantillas con la sintaxis `{{variable}}`:

### Información del Contrato
```
{{contract.status}}                  - Estado del contrato (draft, sent, signed)
{{contract.internal_reference}}      - Referencia interna
{{contract.signing_location}}        - Lugar de firma
{{contract.additional_notes}}        - Notas adicionales
{{contract.publisher}}               - Editor principal
{{contract.publisher_percentage}}    - Porcentaje editorial
{{contract.co_publishers}}           - Co-editores
{{contract.publisher_admin}}         - Administrador editorial
{{contract.created_at}}              - Fecha de creación
```

### Variables de Auco (Firma Digital)

Cuando envías un documento a Auco, puedes usar estas propiedades adicionales:

```javascript
// Estructura del documento en Auco
{
  name: "Nombre del documento",           // Título que aparece en Auco
  file: "base64_pdf_string",              // PDF en base64
  email: "creador@email.com",             // Email del creador
  notification: true,                     // Enviar notificaciones por email
  signProfile: [                          // Array de firmantes
    {
      name: "Nombre del firmante",        // Nombre completo
      email: "firmante@email.com",        // Email del firmante
      phone: "+1234567890",               // Teléfono (opcional)
      label: true,                        // Auto-colocar firma
      // Validaciones opcionales:
      validation: {
        type: "id",                       // Tipo: id, selfie, video
        country: "CO",                    // País del documento
        documentType: "CC"                // Tipo de documento
      }
    }
  ]
}
```

### Propiedades Avanzadas de Auco

```javascript
// Configuración adicional del documento
{
  // Posicionamiento de firmas
  signatures: [
    {
      page: 1,                            // Número de página
      x: 100,                             // Posición X
      y: 200,                             // Posición Y
      width: 150,                         // Ancho
      height: 50                          // Alto
    }
  ],
  
  // Configuración de recordatorios
  reminders: {
    enabled: true,                        // Activar recordatorios
    frequency: "daily",                   // Frecuencia: daily, weekly
    maxReminders: 3                       // Máximo de recordatorios
  },
  
  // Configuración de expiración
  expiration: {
    enabled: true,                        // Activar expiración
    days: 30                              // Días hasta expirar
  },
  
  // Metadatos personalizados
  metadata: {
    contract_id: "123",                   // ID de tu sistema
    project_name: "Nombre del proyecto",  // Nombre del proyecto
    custom_field: "valor"                 // Campos personalizados
  }
}
```

### Información de la Obra Musical
```
{{work.name}}                        - Título de la obra
{{work.alternative_title}}           - Título alternativo
{{work.iswc}}                        - Código ISWC
{{work.type}}                        - Tipo de obra (single, album, etc)
{{work.status}}                      - Estado de la obra
{{work.release_date}}                - Fecha de lanzamiento
{{work.isrc}}                        - Código ISRC
{{work.upc}}                         - Código UPC
```

### Participantes (Loop)
```
{{#each participants}}
  {{name}}                           - Nombre del participante
  {{email}}                          - Email
  {{phone}}                          - Teléfono
  {{role}}                           - Rol (artist, producer, etc)
  {{percentage}}                     - Porcentaje de participación
{{/each}}
```

### Fechas
```
{{current_date}}                     - Fecha actual formateada
{{current_year}}                     - Año actual
```

---

## 🔧 Configuración Avanzada de Auco

### Validación de Identidad

Puedes requerir validación de identidad para cada firmante:

```javascript
// En tu código de backend (start-signature/route.ts)
signProfile: [
  {
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "+573001234567",
    validation: {
      type: "id",              // Validar con documento de identidad
      country: "CO",           // Colombia
      documentType: "CC"       // Cédula de ciudadanía
    }
  },
  {
    name: "María García",
    email: "maria@email.com",
    phone: "+573009876543",
    validation: {
      type: "selfie",          // Validar con selfie
      country: "CO"
    }
  }
]
```

### Tipos de Validación Disponibles

| Tipo | Descripción | Países Soportados |
|------|-------------|-------------------|
| `id` | Documento de identidad | CO, MX, AR, CL, PE, etc. |
| `selfie` | Selfie con documento | Todos |
| `video` | Video liveness | Todos |
| `none` | Sin validación | Todos |

### Tipos de Documentos por País

**Colombia (CO):**
- `CC` - Cédula de ciudadanía
- `CE` - Cédula de extranjería
- `PA` - Pasaporte
- `TI` - Tarjeta de identidad

**México (MX):**
- `INE` - INE/IFE
- `PA` - Pasaporte
- `FM` - Forma migratoria

**Argentina (AR):**
- `DNI` - Documento Nacional de Identidad
- `PA` - Pasaporte

### Posicionamiento Manual de Firmas

Si quieres controlar exactamente dónde aparecen las firmas:

```javascript
// En el payload a Auco
{
  name: "Contrato Musical",
  file: pdfBase64,
  email: "admin@company.com",
  signProfile: [
    {
      name: "Firmante 1",
      email: "firmante1@email.com",
      phone: "+573001234567"
    }
  ],
  // Posiciones de firma
  signatures: [
    {
      page: 1,           // Primera página
      x: 50,             // 50px desde la izquierda
      y: 700,            // 700px desde arriba
      width: 200,        // 200px de ancho
      height: 80,        // 80px de alto
      signerIndex: 0     // Índice del firmante en signProfile
    },
    {
      page: 2,           // Segunda página
      x: 50,
      y: 100,
      width: 200,
      height: 80,
      signerIndex: 0
    }
  ]
}
```

### Webhooks de Auco

Auco enviará notificaciones a tu webhook cuando:

```javascript
// Eventos que recibirás en /api/auco/webhook
{
  event: "document.completed",    // Documento completado
  event: "document.signed",        // Documento firmado
  event: "signer.completed",       // Firmante completó su firma
  event: "document.expired",       // Documento expiró
  event: "document.rejected",      // Documento rechazado
  
  // Datos del evento
  data: {
    documentCode: "ABC123",
    signerEmail: "firmante@email.com",
    status: "completed",
    timestamp: "2025-01-01T00:00:00Z"
  }
}
```

---

## 🎨 Plantilla Profesional - Contrato Musical

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato Musical - {{work.name}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      font-size: 11px;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 8px;
    }
    
    .contract-title {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .contract-subtitle {
      font-size: 14px;
      color: #6b7280;
      font-weight: 400;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 10px;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 12px;
      font-weight: 400;
      color: #1f2937;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    
    .participants-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 10px;
    }
    
    .participants-table th {
      background: #f3f4f6;
      color: #374151;
      font-weight: 600;
      padding: 12px 8px;
      text-align: left;
      border: 1px solid #d1d5db;
      font-size: 10px;
    }
    
    .participants-table td {
      padding: 10px 8px;
      border: 1px solid #e5e7eb;
      font-size: 10px;
    }
    
    .participants-table tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .signature-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
    }
    
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 40px;
      margin-top: 30px;
    }
    
    .signature-box {
      text-align: center;
      padding: 20px;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      background: #fafafa;
    }
    
    .signature-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 12px;
    }
    
    .signature-email {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 20px;
    }
    
    .signature-line {
      border-top: 1px solid #374151;
      margin: 20px 0 8px 0;
      position: relative;
    }
    
    .signature-label {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 9px;
      color: #6b7280;
    }
    
    .highlight {
      background: linear-gradient(120deg, #a7f3d0 0%, #a7f3d0 100%);
      background-repeat: no-repeat;
      background-size: 100% 0.2em;
      background-position: 0 88%;
      font-weight: 500;
    }
    
    @media print {
      .container {
        padding: 15mm;
      }
      
      .signature-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">MVP X MUSIC</div>
      <h1 class="contract-title">Contrato de Representación Musical</h1>
      <p class="contract-subtitle">{{work.name}}</p>
    </div>

    <!-- Información del Contrato -->
    <div class="section">
      <h2 class="section-title">Información del Contrato</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Referencia Interna</span>
          <span class="info-value">{{contract.internal_reference}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado</span>
          <span class="info-value">{{contract.status}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Lugar de Firma</span>
          <span class="info-value">{{contract.signing_location}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha de Creación</span>
          <span class="info-value">{{contract.created_at}}</span>
        </div>
      </div>
    </div>

    <!-- Información de la Obra -->
    <div class="section">
      <h2 class="section-title">Detalles de la Obra Musical</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Título Principal</span>
          <span class="info-value highlight">{{work.name}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Título Alternativo</span>
          <span class="info-value">{{work.alternative_title}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ISWC</span>
          <span class="info-value">{{work.iswc}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tipo de Obra</span>
          <span class="info-value">{{work.type}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Fecha de Lanzamiento</span>
          <span class="info-value">{{work.release_date}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">ISRC / UPC</span>
          <span class="info-value">{{work.isrc}} / {{work.upc}}</span>
        </div>
      </div>
    </div>

    <!-- Información Editorial -->
    <div class="section">
      <h2 class="section-title">Información Editorial</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Editor Principal</span>
          <span class="info-value">{{contract.publisher}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Porcentaje Editorial</span>
          <span class="info-value">{{contract.publisher_percentage}}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">Co-Editores</span>
          <span class="info-value">{{contract.co_publishers}}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Administrador Editorial</span>
          <span class="info-value">{{contract.publisher_admin}}</span>
        </div>
      </div>
    </div>

    <!-- Participantes -->
    <div class="section">
      <h2 class="section-title">Participantes del Contrato</h2>
      <table class="participants-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Participación</th>
          </tr>
        </thead>
        <tbody>
          {{#each participants}}
          <tr>
            <td><strong>{{name}}</strong></td>
            <td>{{role}}</td>
            <td>{{email}}</td>
            <td>{{phone}}</td>
            <td>{{percentage}}%</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <!-- Notas Adicionales -->
    {{#if contract.additional_notes}}
    <div class="section">
      <h2 class="section-title">Notas Adicionales</h2>
      <div class="info-value" style="grid-column: 1 / -1;">
        {{contract.additional_notes}}
      </div>
    </div>
    {{/if}}

    <!-- Sección de Firmas -->
    <div class="signature-section">
      <h2 class="section-title">Firmas Digitales</h2>
      <p style="color: #6b7280; font-size: 10px; margin-bottom: 20px;">
        Las siguientes personas deben firmar digitalmente este contrato para que entre en vigor:
      </p>
      
      <div class="signature-grid">
        {{#each participants}}
        <div class="signature-box">
          <div class="signature-name">{{name}}</div>
          <div class="signature-email">{{email}}</div>
          <div class="signature-line"></div>
          <div class="signature-label">Firma Digital</div>
        </div>
        {{/each}}
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Documento generado automáticamente el {{current_date}}</p>
      <p>MVP X MUSIC - Sistema de Gestión de Contratos Musicales</p>
      <p>Este documento ha sido creado digitalmente y es válido sin firma manuscrita</p>
    </div>
  </div>
</body>
</html>
```

---

## 🎨 Plantilla Minimalista

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Contrato - {{work.name}}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      font-size: 12px; 
      line-height: 1.6; 
      margin: 40px;
      color: #333;
    }
    h1 { 
      font-size: 20px; 
      color: #2563eb;
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    .section { 
      margin-bottom: 25px; 
      padding: 15px;
      border-left: 3px solid #2563eb;
      background: #f9fafb;
    }
    .section h2 {
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .label {
      font-weight: bold;
      min-width: 150px;
      color: #374151;
    }
    .value {
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: left;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .signatures {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #d1d5db;
    }
    .signature-box {
      display: inline-block;
      margin: 20px 20px 20px 0;
      padding: 15px;
      border: 1px dashed #9ca3af;
      text-align: center;
      min-width: 200px;
    }
  </style>
</head>
<body>
  <h1>Contrato Musical: {{work.name}}</h1>
  
  <div class="section">
    <h2>Información del Contrato</h2>
    <div class="info-row">
      <span class="label">Referencia:</span>
      <span class="value">{{contract.internal_reference}}</span>
    </div>
    <div class="info-row">
      <span class="label">Estado:</span>
      <span class="value">{{contract.status}}</span>
    </div>
    <div class="info-row">
      <span class="label">Lugar de firma:</span>
      <span class="value">{{contract.signing_location}}</span>
    </div>
  </div>

  <div class="section">
    <h2>Detalles de la Obra</h2>
    <div class="info-row">
      <span class="label">Título:</span>
      <span class="value">{{work.name}}</span>
    </div>
    <div class="info-row">
      <span class="label">ISWC:</span>
      <span class="value">{{work.iswc}}</span>
    </div>
    <div class="info-row">
      <span class="label">Tipo:</span>
      <span class="value">{{work.type}}</span>
    </div>
  </div>

  <div class="section">
    <h2>Participantes</h2>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Email</th>
          <th>Participación</th>
        </tr>
      </thead>
      <tbody>
        {{#each participants}}
        <tr>
          <td>{{name}}</td>
          <td>{{role}}</td>
          <td>{{email}}</td>
          <td>{{percentage}}%</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  {{#if contract.additional_notes}}
  <div class="section">
    <h2>Notas Adicionales</h2>
    <p>{{contract.additional_notes}}</p>
  </div>
  {{/if}}

  <div class="signatures">
    <h2>Firmas Requeridas</h2>
    {{#each participants}}
    <div class="signature-box">
      <strong>{{name}}</strong><br/>
      {{email}}<br/>
      <div style="margin-top: 30px; border-top: 1px solid #000; padding-top: 5px;">
        Firma Digital
      </div>
    </div>
    {{/each}}
  </div>

  <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #6b7280;">
    Generado automáticamente el {{current_date}} - MVP X MUSIC
  </div>
</body>
</html>
```

---

## 📝 Cómo Crear una Plantilla Nueva

### Paso 1: Ve a Templates
1. Navega a `/management/templates`
2. Click en **"Create Template"**

### Paso 2: Completa el Formulario
- **Type**: `contract`, `agreement`, `invoice`, etc.
- **Language**: `es`, `en`, `pt`, etc.
- **Version**: `1.0`, `2.0`, etc.
- **Template HTML**: Pega tu código HTML completo

### Paso 3: Prueba tu Plantilla
1. Crea un contrato de prueba
2. Usa tu nueva plantilla
3. Envía a firmar
4. Verifica que el PDF se vea bien

---

## 🎨 Mejores Prácticas

### ✅ DO
- Usa fuentes web (Google Fonts)
- Usa CSS Grid y Flexbox para layouts
- Mantén tamaños de fuente legibles (10px-14px)
- Usa colores con buen contraste
- Incluye márgenes y padding adecuados
- Usa `@media print` para optimizar impresión

### ❌ DON'T
- No uses JavaScript
- No uses imágenes externas (usa base64 si necesitas)
- No uses fuentes locales no disponibles
- No uses CSS muy complejo (puede fallar en PDF)
- No uses position: fixed (problemas en PDF)

---

## 🎯 Colores Recomendados

```css
/* Azul Profesional */
--primary: #3b82f6;
--primary-dark: #2563eb;
--primary-light: #60a5fa;

/* Grises */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-600: #6b7280;
--gray-900: #1f2937;

/* Verde (Success) */
--green: #10b981;
--green-light: #a7f3d0;

/* Rojo (Alert) */
--red: #ef4444;
--red-light: #fca5a5;
```

---

## 📚 Recursos Adicionales

### Fuentes Recomendadas
- **Inter**: Moderna y profesional
- **Roboto**: Limpia y legible
- **Open Sans**: Versátil
- **Lato**: Elegante

### Inspiración de Diseño
- https://dribbble.com/tags/contract
- https://www.behance.net/search/projects?search=contract%20design

---

## 🚀 Próximos Pasos

1. ✅ **Copia** una de las plantillas de ejemplo
2. ✅ **Personaliza** los colores y estilos
3. ✅ **Prueba** con datos reales
4. ✅ **Ajusta** según necesites
5. ✅ **Guarda** en la base de datos

---

## 💡 Tips Pro

### Agregar Logo
```html
<div class="logo">
  <img src="data:image/png;base64,TU_LOGO_EN_BASE64" alt="Logo" style="max-width: 150px;">
</div>
```

### Agregar Marca de Agua
```css
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 80px;
  color: rgba(0,0,0,0.05);
  z-index: -1;
}
```

### Agregar Numeración de Páginas
```css
@page {
  @bottom-right {
    content: "Página " counter(page) " de " counter(pages);
  }
}
```

---

¿Necesitas ayuda con algo específico? ¡Pregúntame! 🚀
