# Debts App

A full-stack web application for managing personal and shared debts between users. The app lets people register debts as either a creditor or a debtor, track payments, request liquidation, manage deletion approvals, and receive notifications related to debt activity.

This project is implemented as a monorepo with a React + TypeScript frontend and an Express + Prisma backend, backed by PostgreSQL.

---

## English

### 1. Project overview

Debts App is designed to help users keep track of money they are owed or money they owe to others. Instead of relying on spreadsheets or notes, the application provides a structured workflow for:

- creating debts with clear roles (creditor vs debtor)
- tracking the total amount, paid amount, remaining balance, and due date
- recording payments made toward a debt
- requesting liquidation when a debt is fully paid
- requesting deletion of debts when both sides agree or when the debt is a personal/solo case
- receiving notifications about important actions related to debts

The app is meant to be simple, practical, and useful for everyday personal finance management.

### 2. Main features

#### Authentication and account management
- Secure registration and login flow
- JWT-based access tokens and refresh tokens
- Refresh token stored in an HTTP-only cookie
- Protected routes for authenticated users
- Profile editing and password update

#### Debt management
- Create debts as either:
  - a creditor (you are lending money)
  - a debtor (you are borrowing money)
- Select a registered user as the counterpart or enter a name manually
- View debts grouped by role: “to collect” and “to pay”
- Track debt status:
  - ACTIVE
  - PENDING_LIQUIDATION
  - SETTLED
  - CANCELLED

#### Payments and balance tracking
- Register payments for an active or pending-liqudation debt
- Keep a history of payments with date, amount, note, and optional proof image URL
- Automatically update the paid amount and remaining balance

#### Debt lifecycle workflows
- Request liquidation when the debt has been fully paid
- Allow the creditor to settle a liquidation request
- Request deletion of a debt when it is no longer relevant
- Support approval/rejection of deletion requests between the two parties

#### Notifications
- Receive notifications for actions such as:
  - payment receipt
  - liquidation requests
  - settlement confirmation
  - deletion requests and approvals/rejections
- Mark notifications as read individually or all at once

### 3. Technologies used

#### Frontend
- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS
- Lucide React
- React Hook Form
- Zod
- Axios
- Sileo (toast notifications)

#### Backend
- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- Helmet
- CORS
- cookie-parser
- Zod

#### Tooling and infrastructure
- pnpm workspaces
- Docker Compose for PostgreSQL
- Vitest for testing

### 4. Architecture overview

The project is organized as a monorepo:

- client/: the React frontend application
- server/: the Express backend API and Prisma layer
- packages/: workspace package space for shared or future cross-package code
- docker-compose.yml: PostgreSQL container definition

The frontend communicates with the backend through the REST API, which is mounted under /api. Authentication is handled with JWTs and refresh-token cookies.

### 5. Project structure

```text
client/
  src/
    components/
    features/
    hooks/
    lib/
    routes/
    stores/
    types/

server/
  src/
    controllers/
    middleware/
    routes/
    services/
    utils/
  prisma/
    schema.prisma
    migrations/
```

### 6. Database schema

The server uses Prisma with PostgreSQL and defines these main models:

- User
  - id
  - username
  - name
  - email
  - password
  - avatar
  - createdAt / updatedAt

- Debt
  - id
  - amount
  - description
  - status
  - paidAmount
  - creditorId / debtorId
  - creditorName / debtorName
  - dueDate
  - deletionRequestedBy

- Payment
  - id
  - amount
  - debtId
  - userId
  - note
  - paymentDate
  - imageUrl / imageKey

- Notification
  - id
  - userId
  - type
  - title
  - message
  - debtId
  - read
  - createdAt

### 7. Prerequisites

Before starting, make sure you have:

- Node.js 20 or newer
- pnpm
- Docker Desktop or Docker Engine
- PostgreSQL (or use the provided Docker container)

### 8. Environment setup

1. Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

2. Update the values in .env with your own secrets and database URL.

Required environment variables:

- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: secret for access tokens
- JWT_REFRESH_SECRET: secret for refresh tokens
- PORT: backend port (default is 4000)
- CLIENT_URL: frontend origin (default is http://localhost:5173)

Example values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/debts_app?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 9. Installation and running the project

#### Install dependencies

```powershell
pnpm install
```

#### Start PostgreSQL with Docker Compose

```powershell
docker compose up -d db
```

#### Run Prisma migrations

```powershell
pnpm db:migrate
```

#### Start the development environment

Run both frontend and backend together:

```powershell
pnpm dev
```

Or run them separately:

```powershell
pnpm dev:server
pnpm dev:client
```

The default local URLs are:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### 10. Useful development commands

```powershell
pnpm build
pnpm --filter server run build
pnpm --filter client run build
pnpm --filter server run db:studio
```

### 11. API overview

The backend exposes a REST API under /api.

#### Authentication endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

#### Debt endpoints
- GET /api/debts
- POST /api/debts
- GET /api/debts/:id
- PUT /api/debts/:id
- POST /api/debts/:id/request-liquidation
- POST /api/debts/:id/settle
- POST /api/debts/:id/cancel
- POST /api/debts/:id/request-deletion
- POST /api/debts/:id/approve-deletion
- POST /api/debts/:id/reject-deletion
- GET /api/debts/:id/deletion-status

#### Payment endpoints
- GET /api/debts/:id/payments
- POST /api/debts/:id/payments

#### User endpoints
- GET /api/users/me
- PUT /api/users/me
- PUT /api/users/me/password
- GET /api/users/search

#### Notification endpoints
- GET /api/notifications
- GET /api/notifications/unread-count
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all

### 12. Notes about the current implementation

This is a functional MVP with the core pieces for debt management:

- authentication and user profiles
- debt creation and editing
- payment history and balance updates
- debt settlement and lifecycle flows
- notifications and deletion workflows

It is a solid foundation for future improvements such as:

- image upload for payment proofs
- richer dashboard analytics
- recurring debts
- reminders and email notifications
- mobile-friendly enhancements
- export/import tools

---

## Español

### 1. Resumen del proyecto

Debts App es una aplicación web full-stack para gestionar deudas personales o compartidas entre usuarios. Permite registrar deudas como acreedor o deudor, llevar el control de pagos, solicitar liquidación, gestionar aprobaciones de eliminación y recibir notificaciones sobre las acciones más importantes relacionadas con las deudas.

El proyecto está implementado como un monorepo con un frontend en React y TypeScript y un backend en Express y Prisma, respaldado por PostgreSQL.

### 2. Funcionalidades principales

#### Autenticación y administración de cuentas
- Flujo seguro de registro e inicio de sesión
- Autenticación basada en JWT para access tokens y refresh tokens
- Refresh token guardado en una cookie HTTP-only
- Rutas protegidas para usuarios autenticados
- Edición de perfil y cambio de contraseña

#### Gestión de deudas
- Crear deudas como:
  - acreedor (estás prestando dinero)
  - deudor (estás pidiendo prestado)
- Elegir un usuario registrado como contraparte o escribir un nombre manualmente
- Ver deudas agrupadas por rol: “por cobrar” y “por pagar”
- Controlar el estado de la deuda:
  - ACTIVE
  - PENDING_LIQUIDATION
  - SETTLED
  - CANCELLED

#### Pagos y seguimiento de saldos
- Registrar pagos para una deuda activa o pendiente de liquidación
- Mantener un historial de pagos con fecha, monto, nota y URL opcional de comprobante
- Actualizar automáticamente el monto pagado y el saldo restante

#### Flujos del ciclo de vida de las deudas
- Solicitar liquidación cuando una deuda ya fue pagada por completo
- Permitir que el acreedor confirme la liquidación
- Solicitar eliminación de una deuda cuando ya no sea relevante
- Soportar aprobación o rechazo de solicitudes de eliminación entre las dos partes

#### Notificaciones
- Recibir notificaciones para eventos como:
  - recepción de pagos
  - solicitudes de liquidación
  - confirmación de liquidación
  - solicitudes de eliminación y aprobaciones/rechazos
- Marcar notificaciones como leídas de forma individual o todas a la vez

### 3. Tecnologías utilizadas

#### Frontend
- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS
- Lucide React
- React Hook Form
- Zod
- Axios
- Sileo (notificaciones tipo toast)

#### Backend
- Node.js
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jsonwebtoken)
- bcryptjs
- Helmet
- CORS
- cookie-parser
- Zod

#### Herramientas e infraestructura
- espacios de trabajo con pnpm
- Docker Compose para PostgreSQL
- Vitest para pruebas

### 4. Visión general de la arquitectura

El proyecto está organizado como un monorepo:

- client/: la aplicación frontend en React
- server/: la API backend en Express y la capa de Prisma
- packages/: espacio para paquetes compartidos o futuras extensiones
- docker-compose.yml: definición del contenedor de PostgreSQL

El frontend se comunica con el backend a través de una API REST montada en /api. La autenticación se maneja con JWT y cookies de refresh token.

### 5. Estructura del proyecto

```text
client/
  src/
    components/
    features/
    hooks/
    lib/
    routes/
    stores/
    types/

server/
  src/
    controllers/
    middleware/
    routes/
    services/
    utils/
  prisma/
    schema.prisma
    migrations/
```

### 6. Esquema de base de datos

El backend usa Prisma con PostgreSQL y define estos modelos principales:

- User
  - id
  - username
  - name
  - email
  - password
  - avatar
  - createdAt / updatedAt

- Debt
  - id
  - amount
  - description
  - status
  - paidAmount
  - creditorId / debtorId
  - creditorName / debtorName
  - dueDate
  - deletionRequestedBy

- Payment
  - id
  - amount
  - debtId
  - userId
  - note
  - paymentDate
  - imageUrl / imageKey

- Notification
  - id
  - userId
  - type
  - title
  - message
  - debtId
  - read
  - createdAt

### 7. Requisitos previos

Antes de empezar, asegúrate de tener:

- Node.js 20 o superior
- pnpm
- Docker Desktop o Docker Engine
- PostgreSQL (o usa el contenedor Docker incluido)

### 8. Configuración de variables de entorno

1. Copia el archivo de ejemplo:

```powershell
Copy-Item .env.example .env
```

2. Ajusta los valores en .env con tus propios secretos y la URL de la base de datos.

Variables necesarias:

- DATABASE_URL: cadena de conexión de PostgreSQL
- JWT_SECRET: secreto para los access tokens
- JWT_REFRESH_SECRET: secreto para los refresh tokens
- PORT: puerto del backend (por defecto 4000)
- CLIENT_URL: origen del frontend (por defecto http://localhost:5173)

Ejemplo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/debts_app?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 9. Instalación y ejecución del proyecto

#### Instalar dependencias

```powershell
pnpm install
```

#### Iniciar PostgreSQL con Docker Compose

```powershell
docker compose up -d db
```

#### Ejecutar migraciones de Prisma

```powershell
pnpm db:migrate
```

#### Iniciar el entorno de desarrollo

Ejecuta frontend y backend juntos:

```powershell
pnpm dev
```

O ejecútalos por separado:

```powershell
pnpm dev:server
pnpm dev:client
```

Las URLs locales por defecto son:

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### 10. Comandos útiles para desarrollo

```powershell
pnpm build
pnpm --filter server run build
pnpm --filter client run build
pnpm --filter server run db:studio
```

### 11. Resumen de la API

El backend expone una API REST bajo /api.

#### Endpoints de autenticación
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

#### Endpoints de deudas
- GET /api/debts
- POST /api/debts
- GET /api/debts/:id
- PUT /api/debts/:id
- POST /api/debts/:id/request-liquidation
- POST /api/debts/:id/settle
- POST /api/debts/:id/cancel
- POST /api/debts/:id/request-deletion
- POST /api/debts/:id/approve-deletion
- POST /api/debts/:id/reject-deletion
- GET /api/debts/:id/deletion-status

#### Endpoints de pagos
- GET /api/debts/:id/payments
- POST /api/debts/:id/payments

#### Endpoints de usuarios
- GET /api/users/me
- PUT /api/users/me
- PUT /api/users/me/password
- GET /api/users/search

#### Endpoints de notificaciones
- GET /api/notifications
- GET /api/notifications/unread-count
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all

### 12. Notas sobre la implementación actual

Este proyecto ya funciona como un MVP con las piezas principales para la gestión de deudas:

- autenticación y perfiles de usuario
- creación y edición de deudas
- historial de pagos y actualización de saldos
- liquidación y flujos de vida de las deudas
- notificaciones y workflows de eliminación

Es una base sólida para futuras mejoras como:

- subida de imágenes para comprobantes de pago
- dashboards analíticos más completos
- deudas recurrentes
- recordatorios y notificaciones por correo
- mejoras para dispositivos móviles
- herramientas de exportación e importación

---

## Notes

This README was written to reflect the current state of the repository as it exists in this workspace. If the project evolves, the documentation should be updated to match new features, endpoints, or architecture changes.
