const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// JWT Secret (en producción usar una variable de entorno segura)
const JWT_SECRET = process.env.JWT_SECRET || 'biodanza-secret-key-2026';

// Mock de base de datos de usuarios (en producción usar una base de datos real)
const users = [
  {
    id: 1,
    name: 'Facilitador Biodanza',
    email: 'user@example.com',
    password: '$2a$10$hS.HfnRf8RDDtqvVX2ig1.LZBPq.5HgcpG7KS3M6Nz1Eh66skimr6', // password123
    role: 'facilitator'
  },
  {
    id: 2,
    name: 'Alumno Biodanza',
    email: 'student@example.com',
    password: '$2a$10$hS.HfnRf8RDDtqvVX2ig1.LZBPq.5HgcpG7KS3M6Nz1Eh66skimr6', // password123
    role: 'student'
  }
];

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta exitosa (no enviar password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // En una implementación real, aquí podrías invalidar el token
  // agregándolo a una lista negra en Redis o base de datos
  res.json({ message: 'Logout exitoso' });
});

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// POST /api/auth/register - Registrar nuevo usuario (opcional)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // Validar entrada
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role: ['facilitator', 'student'].includes(role) ? role : 'student'
    };

    users.push(newUser);

    // Generar JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respuesta exitosa
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exportar middleware de autenticación para uso en otras rutas
router.authenticateToken = authenticateToken;

module.exports = router;