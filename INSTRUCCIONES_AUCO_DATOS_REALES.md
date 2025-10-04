# 🎯 Cómo Obtener Datos Reales de Auco (Ubicación y Tiempo de Lectura)

## 📋 PASO 1: Verificar Webhook en Auco

1. **Inicia sesión en Auco**: https://app.auco.ai
2. **Ve a Settings/Configuración**
3. **Busca la sección "Webhooks"**
4. **Verifica que esté configurado**:
   ```
   URL: https://artist-management-mvpx.vercel.app/api/auco/webhook
   Eventos: document.completed, document.signed, signer.completed
   ```
5. **Si NO está configurado**, agrégalo ahora

---

## 📋 PASO 2: Crear un Nuevo Contrato de Prueba

1. **Ve a**: http://localhost:3000/management/contracts
2. **Crea un nuevo contrato**:
   - Nombre: "Contrato Prueba Real"
   - Participante: Usa un email real que puedas acceder
   - Llena todos los campos requeridos
3. **Guarda el contrato**

---

## 📋 PASO 3: Enviar a Auco

1. **En la página de contratos**, busca el contrato que creaste
2. **Haz click en "Enviar a Auco"** o el botón de firma
3. **Espera confirmación** de que se envió correctamente
4. **Anota el código del documento** que Auco genera

---

## 📋 PASO 4: Firmar el Documento (IMPORTANTE)

**Opción A: Firmar desde el Email**
1. Revisa el email del participante
2. Abre el link de Auco que llegó
3. **LEE el documento** (Auco medirá el tiempo)
4. **Firma el documento** (Auco capturará la ubicación)

**Opción B: Firmar desde Auco Dashboard**
1. Inicia sesión en Auco
2. Ve a "Documentos"
3. Busca el documento que enviaste
4. Ábrelo y fírmalo

**⚠️ IMPORTANTE:**
- Debes **leer el documento** por al menos 30 segundos para que Auco mida el tiempo
- Debes **firmar desde un navegador** (no desde la vista previa del email)
- Auco capturará tu ubicación basándose en tu IP

---

## 📋 PASO 5: Esperar el Webhook

Después de firmar:

1. **Auco enviará un webhook** a tu app automáticamente
2. **Esto puede tardar** entre 5 segundos y 2 minutos
3. **El webhook actualizará** la base de datos con:
   - `signature_location`: Tu ubicación (ciudad, país)
   - `reading_time`: Tiempo que tardaste en leer (ej: "2m 30s")
   - `signed_at`: Fecha y hora exacta de la firma

---

## 📋 PASO 6: Verificar en tu App

1. **Ve a**: http://localhost:3000/management/signatures
2. **Haz click en "Refresh"** (🔄) para actualizar
3. **Busca el documento** que acabas de firmar
4. **Debería tener estado**: ✅ Completado (verde)
5. **Haz click en "Ver"** para abrir el modal
6. **Ahora SÍ deberías ver**:
   - ✅ Ubicación de firma: "Tu Ciudad, Tu País"
   - ✅ Tiempo de lectura: "Xm Ys"
   - ✅ Fecha de firma: Fecha/hora exacta

---

## 🔍 VERIFICAR EN BASE DE DATOS

Si quieres verificar directamente en Supabase:

```sql
SELECT 
  document_name,
  signer_email,
  status,
  signature_location,
  reading_time,
  signed_at,
  created_at
FROM public.signatures
WHERE document_name = 'Contrato Prueba Real'
ORDER BY created_at DESC;
```

Deberías ver:
- `signature_location`: NO NULL (con tu ubicación)
- `reading_time`: NO NULL (con el tiempo)
- `signed_at`: NO NULL (con la fecha)

---

## ⚠️ TROUBLESHOOTING

### Si NO aparecen los datos después de firmar:

**1. Verificar que el webhook se ejecutó:**
```sql
-- Ver logs del webhook (si tienes tabla de logs)
SELECT * FROM webhook_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**2. Verificar en Auco:**
- Ve a Auco Dashboard
- Busca el documento
- Verifica que esté marcado como "Completado"
- Verifica que tenga los datos de firma

**3. Sincronizar manualmente:**
- Ve a /management/signatures
- Haz click en "Refresh"
- Esto forzará una sincronización desde Auco

**4. Verificar endpoint del webhook:**
```bash
# Probar el webhook manualmente
curl -X POST https://artist-management-mvpx.vercel.app/api/auco/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_PRK_KEY" \
  -d '{
    "event": "document.completed",
    "document_code": "CODIGO_DEL_DOCUMENTO"
  }'
```

---

## 📊 RESUMEN DEL FLUJO COMPLETO

```
1. Crear Contrato
   ↓
2. Enviar a Auco
   ↓
3. Firmar Documento (leer + firmar)
   ↓
4. Auco captura datos:
   - Ubicación (IP geolocalización)
   - Tiempo de lectura (cronómetro interno)
   ↓
5. Auco envía Webhook a tu app
   ↓
6. Tu app actualiza base de datos
   ↓
7. Datos aparecen en el modal ✅
```

---

## ✅ CHECKLIST

Antes de empezar, verifica:
- [ ] Webhook configurado en Auco
- [ ] App desplegada en Vercel (para recibir webhooks)
- [ ] Email real para recibir notificación
- [ ] Acceso a ese email para firmar

Durante el proceso:
- [ ] Contrato creado
- [ ] Contrato enviado a Auco
- [ ] Email recibido con link de firma
- [ ] Documento leído (mínimo 30 segundos)
- [ ] Documento firmado
- [ ] Webhook recibido (verificar logs)
- [ ] Datos actualizados en DB
- [ ] Datos visibles en el modal

---

## 🎯 RESULTADO ESPERADO

Después de seguir todos los pasos, cuando hagas click en "Ver" en el documento firmado, deberías ver:

```
📍 Ubicación de firma
   Buenos Aires, Argentina

⏱️ Tiempo de lectura
   2m 45s

✅ Firmado exitosamente
   30/09/2025 14:30
```

---

## 💡 NOTAS IMPORTANTES

1. **Ubicación**: Auco usa geolocalización por IP, no GPS. La precisión puede variar.

2. **Tiempo de lectura**: Auco mide desde que abres el documento hasta que firmas. Si dejas la pestaña abierta sin leer, el tiempo será mayor.

3. **Webhook**: Debe estar configurado en producción (Vercel), no funciona en localhost.

4. **Datos históricos**: Los documentos firmados ANTES de configurar el webhook NO tendrán estos datos. Solo los nuevos.

5. **Testing**: Si quieres probar rápido, firma tú mismo el documento desde tu email.
