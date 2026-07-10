# MediCare AI

Plataforma de gestión médica con inteligencia artificial para clínicas y hospitales. Permite a pacientes agendar citas, a doctores gestionar consultas e historial clínico, y a administradores monitorear operaciones en tiempo real.

Demo en producción: https://medicare-app-ai.vercel.app/

---
## Landing 
<img width="1838" height="902" alt="Captura de pantalla 2026-07-10 002837" src="https://github.com/user-attachments/assets/ef394927-44b4-46a9-a0d6-498513135e9e" />

## Paciente
<img width="1882" height="882" alt="Captura de pantalla 2026-07-10 003227" src="https://github.com/user-attachments/assets/2071569e-4113-463a-9f24-07c6ce58ccd1" />

## Doctor
<img width="1908" height="906" alt="Captura de pantalla 2026-07-10 003733" src="https://github.com/user-attachments/assets/2ad1b705-d6f4-4fee-b36b-4affba153bc6" />

## Administrador
<img width="1908" height="906" alt="Captura de pantalla 2026-07-10 003733" src="https://github.com/user-attachments/assets/ceb8fef4-2a5a-4e5a-902b-e0b3e3404904" />

## Asistente AI
<img width="1897" height="882" alt="Captura de pantalla 2026-07-10 005037" src="https://github.com/user-attachments/assets/eeb4673d-7038-4710-a233-5c11e7d5bc73" />

---
## Acceso Credenciales

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@medicare.com | Admin1234 |
| Doctor | doctor@medicare.com | doctor1234 |
| Paciente | luis@gmail.com | Luis_0402 |

> También puedes registrarte como nuevo paciente con **Continuar con Google**.

---
## Características principales

### Tres roles de usuario
- **Paciente** — Agenda citas, consulta historial clínico, recibe recetas y exámenes, chat con asistente IA
- **Doctor** — Gestiona agenda diaria, registra consultas, genera diagnósticos asistidos por IA
- **Administrador** — Dashboard con métricas en tiempo real, gestión de doctores, pacientes, especialidades y consultorios

### Asistente IA
- Chat médico conversacional impulsado por **Groq (Llama 3.3 70B)**
- Historial de conversaciones persistido por sesión
- Contexto médico especializado según el rol del usuario

### Autenticación
- Google OAuth y email/contraseña con NextAuth v5
- Sesiones JWT con roles, redirección automática por rol
- Registro de nuevos pacientes desde el flujo de OAuth

### Gestión de citas
- Creación, confirmación, cancelación y seguimiento de estado
- Filtros por estado (Pendiente, Confirmada, Completada, Cancelada)
- Vista diferenciada para cada rol

### Dashboard administrativo
- Gráficos de citas por mes (últimos 6 meses)
- Distribución de especialidades
- KPIs: tasa de asistencia, nuevos pacientes, citas del día

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| UI | React 19, Tailwind CSS v4 |
| Autenticación | NextAuth v5 (JWT, Google OAuth) |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma 7 con driver adapter PrismaPg |
| IA | Groq SDK — Llama 3.3 70B Versatile |
| Gráficos | Recharts |
| Animaciones | Framer Motion |
| Íconos | Lucide React |
| Deploy | Vercel |

---

## Decisiones técnicas destacadas

- **App Router con Server Components** — Las páginas de datos (dashboard, citas, historial) son Server Components que hacen queries directas a Prisma, sin API intermediaria, reduciendo latencia.
- **Streaming AI** — El chat usa `streamText` de Vercel AI SDK con transporte HTTP para respuestas en tiempo real sin bloquear el servidor.
- **Prisma 7 con driver adapter** — Se usa `@prisma/adapter-pg` directamente (sin Prisma Accelerate) para mayor control sobre el pool de conexiones en Vercel serverless.
- **JWT sin base de datos de sesiones** — Sesiones 100% stateless con JWT firmado, eliminando queries de sesión en cada request.
- **Responsive con drawer pattern** — Sidebar como drawer fijo en móvil con overlay, topbar fija, sin librerías de UI externas.

---

