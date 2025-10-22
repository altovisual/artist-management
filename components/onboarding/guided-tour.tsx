"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import { useRouter } from "next/navigation";
import "driver.js/dist/driver.css";
import "./guided-tour.css";

interface GuidedTourProps {
  onComplete?: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps = {}) {
  const router = useRouter();

  useEffect(() => {
    // Primero navegar al dashboard
    router.push("/dashboard");
    
    // Esperar a que cargue el dashboard antes de iniciar el tour
    const initTimer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Siguiente →",
        prevBtnText: "← Anterior",
        doneBtnText: "✓ Finalizar",
        progressText: "Paso {{current}} de {{total}}",
        popoverClass: "driverjs-theme",
        animate: true,
        smoothScroll: true,
        allowClose: true,
        stagePadding: 10,
        stageRadius: 8,
        onDestroyed: () => {
          // Volver al dashboard al finalizar
          router.push("/dashboard");
          if (onComplete) {
            setTimeout(() => onComplete(), 500);
          }
        },
        onPopoverRender: (popover) => {
          // Agregar estilos personalizados al popover
          const wrapper = popover.wrapper;
          wrapper.style.maxWidth = "400px";
        },
      steps: [
        {
          element: "#dashboard-header",
          popover: {
            title: "🎯 Dashboard Principal",
            description:
              "<strong>Bienvenido a tu centro de control.</strong><br><br>Aquí encontrarás:<br>• Resumen de todos tus artistas<br>• Métricas de rendimiento<br>• Proyectos activos<br>• Acceso rápido a todas las funciones",
            side: "bottom",
            align: "start",
            onNextClick: () => {
              driverObj.moveNext();
            },
          },
        },
        {
          element: "#artists-section",
          popover: {
            title: "🎵 Gestión de Artistas",
            description:
              "<strong>Administra tu roster completo.</strong><br><br>Desde aquí puedes:<br>• Ver perfiles detallados de artistas<br>• Acceder a métricas de streaming<br>• Gestionar proyectos y lanzamientos<br>• Agregar nuevos artistas",
            side: "top",
            align: "start",
            onNextClick: () => {
              // Navegar a Analytics
              router.push("/dashboard/analytics");
              setTimeout(() => {
                driverObj.moveNext();
              }, 500);
            },
          },
        },
        {
          element: "body",
          popover: {
            title: "📊 Analytics & Métricas",
            description:
              "<strong>Análisis profundo de rendimiento.</strong><br><br>Explora:<br>• Métricas de Spotify en tiempo real<br>• Datos de Muso.AI<br>• Top tracks y colaboradores<br>• Análisis de streaming<br>• Tendencias y crecimiento",
            side: "top",
            align: "center",
            onNextClick: () => {
              // Navegar a Finance
              router.push("/dashboard/finance");
              setTimeout(() => {
                driverObj.moveNext();
              }, 500);
            },
            onPrevClick: () => {
              // Volver al dashboard
              router.push("/dashboard");
              setTimeout(() => {
                driverObj.movePrevious();
              }, 600);
            },
          },
        },
        {
          element: "body",
          popover: {
            title: "💰 Gestión Financiera",
            description:
              "<strong>Control total de tus finanzas.</strong><br><br>Administra:<br>• Ingresos por artista<br>• Gastos y transacciones<br>• Reportes financieros<br>• Historial de pagos<br>• Proyecciones y análisis",
            side: "top",
            align: "center",
            onNextClick: () => {
              // Navegar a Team
              router.push("/team");
              setTimeout(() => {
                driverObj.moveNext();
              }, 500);
            },
            onPrevClick: () => {
              // Volver a Analytics
              router.push("/dashboard/analytics");
              setTimeout(() => {
                driverObj.movePrevious();
              }, 600);
            },
          },
        },
        {
          element: "body",
          popover: {
            title: "👥 Colaboración en Equipo",
            description:
              "<strong>Trabaja en equipo de forma eficiente.</strong><br><br>Funciones:<br>• Gestiona miembros del equipo<br>• Asigna proyectos y tareas<br>• Chat y notificaciones<br>• Workspace colaborativo<br>• Seguimiento de actividad",
            side: "top",
            align: "center",
            onNextClick: () => {
              // Navegar a Perfil
              router.push("/artists/my-profile");
              setTimeout(() => {
                driverObj.moveNext();
              }, 500);
            },
            onPrevClick: () => {
              // Volver a Finance
              router.push("/dashboard/finance");
              setTimeout(() => {
                driverObj.movePrevious();
              }, 500);
            },
          },
        },
        {
          element: "body",
          popover: {
            title: "⚙️ Configuración de Perfil",
            description:
              "<strong>Personaliza tu experiencia.</strong><br><br>Configura:<br>• Información personal<br>• Foto de perfil<br>• Preferencias de la plataforma<br>• Notificaciones<br>• Privacidad y seguridad",
            side: "top",
            align: "center",
            onPrevClick: () => {
              // Volver a Team
              router.push("/team");
              setTimeout(() => {
                driverObj.movePrevious();
              }, 500);
            },
          },
        },
        {
          popover: {
            title: "🎉 ¡Felicitaciones!",
            description:
              "<strong>Has completado el tour guiado.</strong><br><br>Ahora estás listo para:<br>• Gestionar tus artistas<br>• Analizar métricas de rendimiento<br>• Controlar tus finanzas<br>• Colaborar con tu equipo<br><br><em>Explora la plataforma y comienza a crear éxitos musicales.</em>",
          },
        },
      ],
    });

      // Start the tour
      driverObj.drive();

      return () => {
        driverObj.destroy();
      };
    }, 1000); // Esperar 1 segundo para que cargue el dashboard

    return () => {
      clearTimeout(initTimer);
    };
  }, [router, onComplete]);

  return null;
}
