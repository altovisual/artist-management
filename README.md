# Gestión de Artistas

![Banner del Proyecto](public/placeholder-logo.png)

## Tabla de Contenidos

- [Sistema de Gestión de Artistas](#sistema-de-gestión-de-artistas)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Descripción General del Proyecto](#descripción-general-del-proyecto)
  - [Características Clave](#características-clave)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación Local](#instalación-local)
  - [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
  - [Guía de Inicio Rápido para Usuarios (Onboarding)](#guía-de-inicio-rápido-para-usuarios-onboarding)
    - [Primeros Pasos: Registro e Inicio de Sesión](#primeros-pasos-registro-e-inicio-de-sesión)
    - [Navegación Principal](#navegación-principal)
    - [Gestión de Artistas](#gestión-de-artistas)
    - [Gestión Segura de Credenciales](#gestión-segura-de-credenciales)
    - [Funcionalidades de Administrador](#funcionalidades-de-administrador)
  - [Uso en Desarrollo](#uso-en-desarrollo)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Scripts Disponibles](#scripts-disponibles)
  - [Despliegue](#despliegue)
  - [Contribución](#contribución)
  - [Licencia](#licencia)
  - [Contacto](#contacto)

## Descripción General del Proyecto

Este proyecto es un **Sistema de Gestión de Artistas** integral, diseñado para simplificar y optimizar la administración de la información, proyectos y credenciales de artistas musicales. Desarrollado con la potencia de Next.js para una interfaz de usuario moderna y reactiva, y respaldado por Supabase para una gestión de bases de datos robusta y autenticación segura, esta aplicación es la herramienta perfecta para managers, sellos discográficos o los propios artistas que buscan una solución eficiente y escalable.

Su objetivo principal es proporcionar una plataforma centralizada donde se pueda:
- Mantener un registro detallado de cada artista.
- Gestionar sus proyectos musicales y lanzamientos.
- Almacenar de forma segura las credenciales de sus cuentas en redes sociales y plataformas de distribución.

La aplicación está diseñada para ser intuitiva y fácil de usar, ofreciendo una experiencia fluida tanto para usuarios regulares como para administradores.

## Características Clave

- **Gestión Completa de Artistas:** Añade, edita, visualiza y elimina perfiles de artistas, incluyendo detalles como nombre, género y contacto.
- **Gestión Segura de Credenciales:** Almacena y gestiona de forma encriptada las contraseñas de cuentas sociales y de distribución utilizando un sistema de clave de cifrado global para mayor seguridad y simplicidad.
- **Acceso de Administrador (RLS):** Los usuarios con rol de administrador tienen acceso completo (CRUD) a todos los datos de la plataforma (artistas, cuentas sociales, proyectos, etc.), facilitando la supervisión y gestión centralizada.
- **Autenticación Robusta:** Inicio de sesión y registro de usuarios gestionado por Supabase Auth, con soporte para roles de usuario (normal/admin).
- **Base de Datos en Tiempo Real:** Utiliza Supabase para una gestión de datos eficiente, escalable y en tiempo real.
- **Interfaz de Usuario Intuitiva y Moderna:** Desarrollada con componentes de UI accesibles y un diseño renovado, incluyendo:
    - Rediseño de las tarjetas de artista para una visualización más profesional.
    - Diseño mejorado de las páginas de autenticación con elementos visuales atractivos.
    - Barra de carga superior para una mejor retroalimentación visual.
    - **Modo Oscuro/Claro:** Interruptor de tema integrado en la barra superior para una experiencia visual personalizable.
- **Optimización de Rendimiento:** Beneficios inherentes de Next.js para aplicaciones web de alto rendimiento, SEO y experiencia de desarrollador.

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

## Instalación Local

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
    -   Ejecuta las migraciones SQL ubicadas en `scripts/` para configurar tu base de datos Supabase. Esto incluye scripts para añadir campos de contraseña y otros detalles a las tablas de cuentas sociales y de distribución. Puedes usar la interfaz de Supabase Studio o la CLI de Supabase.
        ```bash
        # Ejemplo con Supabase CLI (asegúrate de tenerla instalada y configurada)
        supabase db push
        ```

## Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=TU_URL_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_SUPABASE
NEXT_PUBLIC_ENCRYPTION_KEY=TU_CLAVE_DE_ENCRIPTACION_GLOBAL
```

Reemplaza `TU_URL_SUPABASE`, `TU_ANON_KEY_SUPABASE` y `TU_CLAVE_DE_ENCRIPTACION_GLOBAL` con los valores de tu proyecto Supabase y tu clave de cifrado. Asegúrate de que `TU_CLAVE_DE_ENCRIPTACION_GLOBAL` sea una cadena segura y única.

## Guía de Inicio Rápido para Usuarios (Onboarding)

Esta sección te guiará a través de las funcionalidades clave del Sistema de Gestión de Artistas, desde el registro hasta la gestión avanzada de credenciales.

### Primeros Pasos: Registro e Inicio de Sesión

1.  **Registro:** Si eres un nuevo usuario, navega a la página de registro (`/auth/sign-up`) o a la página de registro de artista (`/auth/artist-sign-up`) si deseas crear un perfil de artista directamente. Completa los campos requeridos (email, contraseña, y para artistas, nombre y género).
2.  **Inicio de Sesión:** Una vez registrado, dirígete a la página de inicio de sesión (`/auth/login`) e ingresa tus credenciales. Serás redirigido al Dashboard principal.

### Navegación Principal

El Dashboard es el centro de control de la aplicación. Desde aquí, puedes acceder a:

-   **Dashboard:** Vista general de tus artistas y proyectos.
-   **Releases:** Gestiona los lanzamientos musicales de tus artistas.
-   **Profile:** Accede a tu perfil de usuario o artista para editar información.
-   **Admin (solo para administradores):** Acceso a la gestión de usuarios y artistas de toda la plataforma.

### Gestión de Artistas

-   **Añadir Nuevo Artista:** Desde el Dashboard, busca la opción para añadir un nuevo artista. Podrás ingresar su nombre, género y otros detalles relevantes.
-   **Editar Perfil de Artista:** Haz clic en la tarjeta de un artista existente para acceder a su perfil. Aquí podrás actualizar su información, añadir proyectos y gestionar sus cuentas sociales y de distribución.

### Gestión Segura de Credenciales

Una de las características más importantes es la gestión segura de credenciales para las cuentas de redes sociales y distribución de los artistas. Estas contraseñas se almacenan encriptadas y solo pueden ser visualizadas temporalmente.

1.  **Acceso a Credenciales:** Dentro del perfil de un artista, en la sección de "Social Media Accounts" o "Distribution Accounts", encontrarás las credenciales asociadas.
2.  **Visualizar Contraseña:** Haz clic en el botón "View Saved Password" (o similar). La contraseña se desencriptará y se mostrará en un campo de texto. Por motivos de seguridad, esta contraseña se ocultará automáticamente después de unos segundos.
3.  **Copia y Uso:** Puedes copiar la contraseña mostrada para iniciar sesión en la plataforma correspondiente. Recuerda que no se almacena en texto plano en ningún momento.

### Funcionalidades de Administrador

Si tu cuenta tiene el rol de administrador, tendrás acceso a funcionalidades adicionales:

-   **Gestión de Usuarios:** Podrás ver y gestionar todos los usuarios registrados en la plataforma.
-   **Acceso a Todos los Artistas:** Tendrás la capacidad de ver y editar los perfiles de todos los artistas, independientemente de quién los haya creado.
-   **Control Total de Datos:** Las políticas de Row-Level Security (RLS) de Supabase te otorgan permisos completos (crear, leer, actualizar, eliminar) sobre todos los datos de la aplicación, lo que te permite una gestión centralizada y eficiente.

## Uso en Desarrollo

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

Este proyecto puede ser desplegado fácilmente en plataformas como [Vercel](https://vercel.com/), que es el creador de Next.js y ofrece una integración perfecta. Asegúrate de configurar todas las variables de entorno necesarias (incluyendo `NEXT_PUBLIC_ENCRYPTION_KEY`) en tu plataforma de despliegue.

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

Si tienes alguna pregunta o sugerencia, no dudes en contactarme a través de [altovisual.ba@gmail.com](mailto:altovisual.ba@gmail.com) o abriendo un issue en este repositorio.