'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SignUpSuccessPage() {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = () => {
    // Note: Resend email functionality requires user email from query params or state
    // Implementation: await supabase.auth.resend({ type: 'signup', email: userEmail })
    setCooldown(30); // Set cooldown for 30 seconds
  };

  return (
    <main className="min-h-dvh w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 relative overflow-hidden">
      <BackgroundDecor />

      <section className="container mx-auto px-4 py-14 sm:py-24 grid place-items-center">
        <Card className="w-full max-w-xl border-neutral-200/60 dark:border-neutral-800/60 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-neutral-900/50 shadow-xl shadow-neutral-900/5 rounded-3xl">
          <CardHeader className="pt-8 pb-2">
            <LogoHeader />
          </CardHeader>

          <CardContent className="space-y-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CheckCircle2 aria-hidden className="size-11 sm:size-12 text-emerald-500" />
                <span className="pointer-events-none absolute inset-0 rounded-full ring-8 ring-emerald-400/10" />
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/15" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  ¡Bienvenido a la vanguardia!
                </h1>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
                  Gracias por unirte a esta nueva etapa.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 p-4 sm:p-5 bg-gradient-to-br from-neutral-50/70 to-white/40 dark:from-neutral-900/40 dark:to-neutral-900/20">
              <p className="text-sm sm:text-[15px] leading-relaxed">
                Hemos enviado un enlace de <span className="font-semibold">confirmación</span> a tu
                correo electrónico. Por favor, revísalo para activar tu cuenta.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <Mail className="size-4" aria-hidden />
                <span>¿No lo ves? Revisa SPAM o Promociones.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-12 flex-1 rounded-xl font-semibold">
                <Link href="/auth/login" aria-label="Ir a iniciar sesión">Ir a Iniciar Sesión</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={!!cooldown}
                onClick={handleResendEmail}
                className={cn(
                  "h-12 flex-1 rounded-xl border-neutral-300/70 dark:border-neutral-700/70",
                  cooldown && "opacity-70 cursor-not-allowed"
                )}
                aria-live="polite"
              >
                {cooldown ? `Reenviar en ${cooldown}s` : "Reenviar correo"}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pb-8">
            <div className="text-xs text-neutral-500">
              ¿Problemas? <a href="mailto:soporte@tuempresa.com" className="underline underline-offset-4 hover:no-underline">Contacta a soporte</a>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Mvpx Music. Todos los derechos reservados.
        </div>
      </section>

      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <Sparkles className="absolute -top-2 left-6 opacity-30 size-6" />
        <Sparkles className="absolute top-10 right-10 opacity-20 size-8" />
        <Sparkles className="absolute bottom-16 left-20 opacity-20 size-7" />
      </div>
    </main>
  );
}

function LogoHeader() {
  return (
    <div className="flex justify-center items-center w-full">
       <Image
          src="/mi-logo.svg"
          alt="Logo de la empresa"
          width={180}
          height={40}
          className="dark:invert" // Invert color in dark mode for visibility
        />
    </div>
  );
}

function BackgroundDecor() {
  return (
    <div aria-hidden className="absolute inset-0">
      {/* Main gradient */}
      <div className="absolute -inset-x-24 -top-32 h-[320px] blur-3xl opacity-60 dark:opacity-40"
           style={{
             background:
               "radial-gradient(40% 60% at 30% 30%, rgba(236,72,153,0.40) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)," +
               "radial-gradient(30% 50% at 70% 20%, rgba(147,51,234,0.35) 0%, rgba(147,51,234,0.06) 42%, transparent 72%)",
           }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Bottom gradient */}
      <div className="absolute -bottom-32 -inset-x-24 h-[340px] blur-3xl opacity-60 dark:opacity-40"
           style={{
             background:
               "radial-gradient(40% 60% at 70% 70%, rgba(14,165,233,0.35) 0%, rgba(14,165,233,0.06) 40%, transparent 70%)," +
               "radial-gradient(30% 50% at 30% 80%, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.06) 42%, transparent 72%)",
           }}
      />
    </div>
  );
}
