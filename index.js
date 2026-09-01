require('./services/envSetup');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb } = require('./services/dbStore');

const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const routeRoutes = require('./routes/routes');
const aiRoutes = require('./routes/ai');
const configRoutes = require('./routes/config');
const sellersRoutes = require('./routes/sellers');
const packageRoutes = require('./routes/packages');
const planillasRoutes = require('./routes/planillas');

const app = express();
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 8080;

// Habilitar CORS total para preflights y peticiones entre dominios
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-admin-token']
}));
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos subidos (/uploads)
const uploadsPath = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Servir frontend si existe build
const clientBuildPath = path.join(__dirname, '..', 'Frontend', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

// Rutas de API (Soporta prefijo /api y rutas directas)
const apiRoutesMap = [
  ['/auth', authRoutes],
  ['/locations', locationRoutes],
  ['/routes', routeRoutes],
  ['/ai', aiRoutes],
  ['/config', configRoutes],
  ['/sellers', sellersRoutes],
  ['/packages', packageRoutes],
  ['/planillas', planillasRoutes]
];

apiRoutesMap.forEach(([prefix, router]) => {
  app.use(`/api${prefix}`, router);
  app.use(prefix, router);
});

// Fallback para React Frontend en caso de despliegue consolidado
app.all('*', (req, res, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/auth') || req.url.startsWith('/routes') || req.url.startsWith('/config') || req.url.startsWith('/locations') || req.url.startsWith('/ai') || req.url.startsWith('/sellers') || req.url.startsWith('/packages') || req.url.startsWith('/planillas')) {
    return res.status(404).json({ error: `Ruta de API ${req.method} ${req.url} no encontrada` });
  }
  if (req.method !== 'GET') {
    return res.status(404).json({ error: `Método ${req.method} no permitido para ${req.url}` });
  }
  if (fs.existsSync(path.join(clientBuildPath, 'index.html'))) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    res.status(200).send('Servidor Backend de Amairany Express corriendo correctamente.');
  }
});

// Iniciar servidor y DB
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Amairany Express corriendo en puerto ${PORT}`);
    console.log(`📍 Endpoint de API: http://localhost:${PORT}/api`);
  });
}

startServer();
