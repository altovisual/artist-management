# Gestión de Artistas

![Banner del Proyecto](public/placeholder-logo.png)

## Tabla de Contenidos

- [Gestión de Artistas](#gestión-de-artistas)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Descripción del Proyecto](#descripción-del-proyecto)
  - [Características](#características)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación](#instalación)
  - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
  - [Uso](#uso)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Scripts Disponibles](#scripts-disponibles)
  - [Despliegue](#despliegue)
  - [Contribución](#contribución)
  - [Licencia](#licencia)
  - [Contacto](#contacto)

## Descripción del Proyecto

Este proyecto es una aplicación web diseñada para la gestión integral de artistas, permitiendo llevar un control de su información, proyectos, y otros aspectos relevantes. Desarrollado con Next.js, ofrece una experiencia de usuario moderna y eficiente, respaldada por Supabase para la gestión de bases de datos y autenticación.

## Características

- **Gestión de Artistas:** Añade, edita y visualiza perfiles de artistas.
- **Autenticación Segura:** Inicio de sesión y registro de usuarios gestionado por Supabase Auth.
- **Base de Datos en Tiempo Real:** Utiliza Supabase para una gestión de datos eficiente y escalable.
- **Interfaz de Usuario Intuitiva:** Desarrollada con componentes de UI modernos y accesibles.
- **Optimización para SEO y Rendimiento:** Beneficios inherentes de Next.js para aplicaciones web de alto rendimiento.

## Tecnologías Utilizadas

- **[Next.js](https://nextjs.org/)**: Framework de React para aplicaciones web con renderizado del lado del servidor y generación de sitios estáticos.
- **[React](https://react.dev/)**: Biblioteca de JavaScript para construir interfaces de usuario.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset de JavaScript que añade tipado estático.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS de utilidad para un diseño rápido y personalizado.
- **[Supabase](https://supabase.com/)**: Alternativa de código abierto a Firebase para bases de datos, autenticación y más.
- **[pnpm](https://pnpm.io/)**: Gestor de paquetes rápido y eficiente.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js**: Versión 18.x o superior.
- **pnpm**: Puedes instalarlo globalmente con `npm install -g pnpm`.

## Instalación

Sigue estos pasos para configurar el proyecto localmente:

1.  Clona el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd artist-management
    ```
2.  Instala las dependencias del proyecto:
    ```bash
    pnpm install
    ```
3.  Configura Supabase:
    -   Crea un nuevo proyecto en [Supabase](https://supabase.com/).
    -   Obtén tu `URL` y `Anon Key` del proyecto en la sección de `Settings -> API`.
    -   Configura las variables de entorno como se describe en la siguiente sección.
    -   Ejecuta las migraciones SQL ubicadas en `scripts/` para configurar tu base de datos Supabase. Puedes usar la interfaz de Supabase Studio o la CLI de Supabase.
        ```bash
        # Ejemplo con Supabase CLI (asegúrate de tenerla instalada y configurada)
        supabase db push
        ```

## Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=TU_URL_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_SUPABASE
```

Reemplaza `TU_URL_SUPABASE` y `TU_ANON_KEY_SUPABASE` con los valores de tu proyecto Supabase.

## Uso

Para iniciar el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

La estructura principal del proyecto es la siguiente:

```
artist-management/
├── app/                  # Rutas y páginas de la aplicación Next.js
├── components/           # Componentes reutilizables de React (incluyendo componentes UI de Shadcn/ui)
├── lib/                  # Utilidades y configuraciones (ej. Supabase client/server)
├── public/               # Archivos estáticos (imágenes, etc.)
├── scripts/              # Scripts SQL para la base de datos (migraciones, seeds)
├── styles/               # Estilos globales y de Tailwind CSS
├── .env.local            # Variables de entorno locales
├── next.config.mjs       # Configuración de Next.js
├── package.json          # Dependencias y scripts del proyecto
└── tsconfig.json         # Configuración de TypeScript
```

## Scripts Disponibles

En el `package.json` encontrarás los siguientes scripts:

-   `pnpm dev`: Inicia el servidor de desarrollo de Next.js.
-   `pnpm build`: Compila la aplicación para producción.
-   `pnpm start`: Inicia el servidor de producción después de la compilación.
-   `pnpm lint`: Ejecuta ESLint para identificar y reportar patrones en el código.

## Despliegue

Este proyecto puede ser desplegado fácilmente en plataformas como [Vercel](https://vercel.com/), que es el creador de Next.js y ofrece una integración perfecta. Asegúrate de configurar las variables de entorno de Supabase en tu plataforma de despliegue.

## Contribución

¡Las contribuciones son bienvenidas! Si deseas contribuir, por favor, sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3.  Realiza tus cambios y asegúrate de que el código pase los tests y el linter.
4.  Haz commit de tus cambios (`git commit -am 'feat: Añade nueva característica'`).
5.  Sube tu rama (`git push origin feature/nueva-caracteristica`).
6.  Abre un Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Contacto

Si tienes alguna pregunta o sugerencia, no dudes en contactarme a través de [tu_email@example.com](mailto:altovisual.ba@gmail.com) o abriendo un issue en este repositorio.