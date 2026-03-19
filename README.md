# Biodanza Player 3.0

Una aplicación moderna para la gestión de sesiones de Biodanza con backend Node.js y frontend SPA.

## 🌟 Características

- **Backend Node.js/Express** con autenticación JWT
- **Frontend SPA** con JavaScript moderno 
- **Base de datos mock** (fácil migración a PostgreSQL/MySQL)
- **Panel de facilitador** con gestión avanzada
- **Responsive design** con Bootstrap 5
- **API REST** segura y documentada

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# El archivo .env ya tiene configuración por defecto
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo con auto-recarga
npm run dev

# O iniciar servidor normal
npm start

# El servidor estará disponible en:
# Frontend: http://localhost:3000
# API: http://localhost:3000/api
# Health check: http://localhost:3000/api/health
```

## 📁 Estructura del Proyecto

```
SPA_BPW3/
├── server/                 # Backend Node.js
│   ├── server.js          # Servidor principal
│   └── routes/            # Rutas de API
│       ├── auth.js        # Autenticación
│       └── data.js        # Datos de aplicación
├── public/                # Frontend estático
│   ├── index.html         # HTML principal
│   ├── app.js            # Lógica principal SPA
│   ├── router.js         # Router client-side
│   ├── api.js            # Cliente API
│   ├── styles.css        # Estilos personalizados
│   └── images/           # Recursos multimedia
├── package.json          # Dependencias y scripts
└── .env                  # Variables de entorno
```

## 🔐 Autenticación

### Usuarios por Defecto
- **Facilitador**: `user@example.com` / `password123`
- **Estudiante**: `student@example.com` / `password123`

### API Endpoints

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión  
- `GET /api/auth/me` - Información del usuario actual
- `POST /api/auth/register` - Registrar nuevo usuario

#### Datos
- `GET /api/data/homepage` - Datos del dashboard
- `GET /api/data/sessions` - Listar sesiones
- `GET /api/data/sessions/:id` - Sesión específica
- `POST /api/data/sessions` - Crear sesión (facilitadores)
- `PUT /api/data/sessions/:id/status` - Actualizar estado
- `GET /api/data/playlists` - Listar playlists
- `GET /api/data/playlists/:id` - Playlist específica

## 🛡️ Seguridad

- Autenticación JWT con tokens seguros
- Validación de entrada en todas las rutas
- Rate limiting para prevenir ataques
- Headers de seguridad con Helmet.js
- CORS configurado apropiadamente

## 📱 Uso de la Aplicación

1. **Login**: Accede con las credenciales por defecto
2. **Dashboard**: Ve el resumen de actividades y sesiones
3. **Sesiones**: Gestiona las sesiones de Biodanza  
4. **Playlists**: Organiza la música para las sesiones
5. **Facilitador**: Panel avanzado para instructores

## 🚧 Desarrollo Futuro

- [ ] Base de datos PostgreSQL/MySQL
- [ ] Sistema de archivos/uploads
- [ ] Notificaciones en tiempo real
- [ ] PWA (Progressive Web App)
- [ ] Tests unitarios e integración
- [ ] Dockerización

---

© 2026 Biodanza Player 3.0. Todos los derechos reservados.
