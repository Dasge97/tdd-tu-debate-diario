# TDD — Tu Debate Diario

Plataforma web de debate diario sobre actualidad, centrada en conversación estructurada y comunidad con criterio.

## Qué es TDD

TDD publica **5 debates al día** y permite a la comunidad:

- elegir postura (`A favor`, `En contra`, `Neutral`)
- comentar en cada debate
- votar positivamente comentarios
- gestionar amistades
- chatear en privado en tiempo real
- recibir notificaciones en vivo (sin recargar)

La experiencia busca parecerse más a una plaza pública digital que a una red social de consumo rápido.

## Estado actual (implementado)

- Debates diarios dinámicos desde base de datos MySQL
- Vista de debate con comentarios y posiciones
- Búsqueda de debates
- Favoritos
- Tendencias
- Autenticación JWT (`login/register/logout`)
- Perfil público de usuario
- Comunidad (buscar usuarios + listado paginado)
- Sistema de amistades (solicitud, aceptar, rechazar, eliminar)
- Chat privado entre amigos (WebSocket)
- Presencia online/offline y estado `escribiendo...`
- Notificaciones reactivas en navbar (solicitudes de amistad, aceptación de amistad y votos en comentarios)

## Stack técnico

### Frontend

- Vue 3 (Composition API)
- Quasar Framework
- Pinia
- Vue Router
- Axios
- Vite

### Backend

- Node.js
- Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- WebSocket (`ws`)

### Infra

- Docker Compose para MySQL
- `init.sql` para esquema y datos de ejemplo

## Estructura del proyecto

```text
debates/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ middleware/
│  │  ├─ realtime/
│  │  ├─ database/
│  │  └─ server.js
│  ├─ init.sql
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ boot/
│  │  ├─ components/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  ├─ router/
│  │  ├─ services/
│  │  └─ stores/
│  └─ package.json
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Configuración rápida

### 1) Variables de entorno

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Revisa al menos estos valores en `.env`:

- `APP_PORT`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`

### 2) Levantar MySQL con Docker

```bash
docker compose up -d db
```

Nota: `backend/init.sql` se ejecuta automáticamente en el primer arranque del contenedor.

Si necesitas reinicializar completamente la base de datos:

```bash
docker compose down -v
docker compose up -d db
```

### 3) Backend

```bash
cd backend
npm install
npm run dev
```

Servidor en: `http://localhost:3000`

### 4) Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicación en: `http://localhost:5173`

## Endpoints principales

### Debates y contenido

- `GET /api/debates/today`
- `GET /api/debates/:id`
- `GET /api/debates/search`
- `GET /api/debates/trending`
- `GET /api/comments/:debateId`
- `POST /api/comments`
- `POST /api/comments/:commentId/vote`
- `POST /api/positions`

### Auth y usuarios

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/top`
- `GET /api/users/search`
- `GET /api/users/username/:username`

### Amigos

- `GET /api/friends`
- `GET /api/friends/requests`
- `GET /api/friends/status/:userId`
- `POST /api/friends/request`
- `POST /api/friends/:userId/accept`
- `POST /api/friends/:userId/reject`
- `DELETE /api/friends/:userId`

### Chat

- `GET /api/chat/conversations`
- `POST /api/chat/conversations`
- `GET /api/chat/conversations/:conversationId/messages`
- `POST /api/chat/messages`
- `POST /api/chat/conversations/:conversationId/read`

### Notificaciones

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `POST /api/notifications/read-all`

## Realtime (WebSocket)

Canal WebSocket: `/ws/chat`

Eventos activos:

- `new_message`
- `typing`
- `friend:presence`
- `notification:new`

## Calidad y mantenimiento

- Arquitectura modular por capas (routes/controllers/services)
- Estado frontend centralizado con Pinia
- `init.sql` como fuente única de esquema de datos
- Diseño orientado a evolución por fases (nuevas funcionalidades sociales)

## Roadmap sugerido

- Propuestas de debate por usuarios (con moderación)
- Sistema de reputación más granular
- Notificaciones por tipo y preferencias del usuario
- Adjuntos en chat
- Tests backend/frontend (unit + integración)
- Hardening de seguridad para despliegue productivo

## Licencia

Pendiente de definir.
