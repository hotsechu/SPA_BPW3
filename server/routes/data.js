const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Mock data para Biodanza Player
const biodanzaData = {
  sessions: [
    {
      id: 1,
      title: 'Sesión de Vitalidad',
      date: '2026-03-20',
      duration: '90 minutos',
      description: 'Sesión enfocada en ejercicios de vitalidad y conexión',
      exercises: [
        'Caminata rítmica',
        'Danza de integración',
        'Ejercicios de fluidez'
      ],
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Sesión de Creatividad',
      date: '2026-03-22',
      duration: '75 minutos', 
      description: 'Explorando la expresión creativa a través del movimiento',
      exercises: [
        'Expresión libre',
        'Danza en parejas',
        'Movimientos de tierra'
      ],
      status: 'completed'
    },
    {
      id: 3,
      title: 'Sesión de Afectividad',
      date: '2026-03-25',
      duration: '85 minutos',
      description: 'Cultivando la conexión emocional y afectiva',
      exercises: [
        'Encuentro afectivo',
        'Danza de agua',
        'Ronda final'
      ],
      status: 'scheduled'
    }
  ],
  
  playlists: [
    {
      id: 1,
      name: 'Vitalidad Essential',
      genre: 'vitalidad',
      songs: [
        { title: 'Ritmo Vital', artist: 'Various Artists', duration: '4:30' },
        { title: 'Energía Pura', artist: 'Biodanza Music', duration: '5:15' },
        { title: 'Movimiento Natural', artist: 'Organic Sounds', duration: '4:45' }
      ]
    },
    {
      id: 2,
      name: 'Creatividad Flow',
      genre: 'creatividad',
      songs: [
        { title: 'Libre Expresión', artist: 'Creative Flow', duration: '6:20' },
        { title: 'Vuelo Interior', artist: 'Inner Wings', duration: '5:50' },
        { title: 'Danza Creativa', artist: 'Art in Motion', duration: '4:25' }
      ]
    }
  ],

  userActivity: [
    'Sesión de Vitalidad completada el 15 de Marzo', 
    'Nueva playlist "Creatividad Flow" añadida',
    'Próxima sesión programada para el 20 de Marzo'
  ]
};

// GET /api/data/homepage - Datos para la página principal
router.get('/homepage', authenticateToken, (req, res) => {
  try {
    const { role } = req.user;
    
    // Datos personalizados según el rol del usuario
    const responseData = {
      userActivity: biodanzaData.userActivity,
      upcomingSessions: biodanzaData.sessions.filter(s => s.status === 'scheduled').slice(0, 3),
      recentPlaylists: biodanzaData.playlists.slice(0, 2),
      stats: {
        totalSessions: biodanzaData.sessions.length,
        completedSessions: biodanzaData.sessions.filter(s => s.status === 'completed').length,
        totalPlaylists: biodanzaData.playlists.length
      }
    };

    // Si es facilitador, agregar datos adicionales
    if (role === 'facilitator') {
      responseData.facilitatorData = {
        pendingReviews: 3,
        activeStudents: 25,
        nextSessionPrep: 'Revisar música para sesión de Afectividad'
      };
    }

    res.json(responseData);

  } catch (error) {
    console.error('Error obteniendo datos homepage:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/data/sessions - Obtener todas las sesiones
router.get('/sessions', authenticateToken, (req, res) => {
  try {
    const { status } = req.query;
    
    let sessions = biodanzaData.sessions;
    
    // Filtrar por status si se proporciona
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }
    
    res.json(sessions);

  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/data/sessions/:id - Obtener sesión específica
router.get('/sessions/:id', authenticateToken, (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = biodanzaData.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    res.json(session);

  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/data/playlists - Obtener todas las playlists
router.get('/playlists', authenticateToken, (req, res) => {
  try {
    const { genre } = req.query;
    
    let playlists = biodanzaData.playlists;
    
    // Filtrar por género si se proporciona
    if (genre) {
      playlists = playlists.filter(p => p.genre === genre);
    }
    
    res.json(playlists);

  } catch (error) {
    console.error('Error obteniendo playlists:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/data/playlists/:id - Obtener playlist específica
router.get('/playlists/:id', authenticateToken, (req, res) => {
  try {
    const playlistId = parseInt(req.params.id);
    const playlist = biodanzaData.playlists.find(p => p.id === playlistId);
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist no encontrada' });
    }
    
    res.json(playlist);

  } catch (error) {
    console.error('Error obteniendo playlist:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/data/sessions - Crear nueva sesión (solo facilitadores)
router.post('/sessions', authenticateToken, (req, res) => {
  try {
    const { role } = req.user;
    
    // Verificar permisos
    if (role !== 'facilitator') {
      return res.status(403).json({ error: 'No tienes permisos para crear sesiones' });
    }
    
    const { title, date, duration, description, exercises } = req.body;
    
    // Validar datos requeridos
    if (!title || !date || !duration) {
      return res.status(400).json({ error: 'Título, fecha y duración son requeridos' });
    }
    
    // Crear nueva sesión
    const newSession = {
      id: biodanzaData.sessions.length + 1,
      title,
      date,
      duration,
      description: description || '',
      exercises: exercises || [],
      status: 'scheduled'
    };
    
    biodanzaData.sessions.push(newSession);
    
    res.status(201).json(newSession);

  } catch (error) {
    console.error('Error creando sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/data/sessions/:id/status - Actualizar status de sesión
router.put('/sessions/:id/status', authenticateToken, (req, res) => {
  try {
    const { role } = req.user;
    
    // Verificar permisos
    if (role !== 'facilitator') {
      return res.status(403).json({ error: 'No tienes permisos para modificar sesiones' });
    }
    
    const sessionId = parseInt(req.params.id);
    const { status } = req.body;
    
    // Validar status
    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    // Encontrar y actualizar sesión
    const sessionIndex = biodanzaData.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    biodanzaData.sessions[sessionIndex].status = status;
    
    res.json(biodanzaData.sessions[sessionIndex]);

  } catch (error) {
    console.error('Error actualizando sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;