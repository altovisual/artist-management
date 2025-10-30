-- Script para saltar el onboarding manualmente
-- Ejecuta esto en el SQL Editor de Supabase si quieres saltar el onboarding

-- Opción 1: Marcar onboarding como completado para tu usuario actual
UPDATE public.user_profiles
SET 
  onboarding_completed = true,
  onboarding_completed_at = NOW()
WHERE user_id = auth.uid();

-- Opción 2: Si no existe el registro, créalo y márcalo como completado
INSERT INTO public.user_profiles (user_id, onboarding_completed, onboarding_completed_at)
VALUES (auth.uid(), true, NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  onboarding_completed = true,
  onboarding_completed_at = NOW();

-- Verificar el resultado
SELECT * FROM public.user_profiles WHERE user_id = auth.uid();
