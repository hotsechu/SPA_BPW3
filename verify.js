#!/usr/bin/env node

/**
 * Script de verificación rápida para Biodanza Player 3.0
 * Verifica que todos los componentes principales estén funcionando
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Colores para la consola
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Verificar que los archivos principales existen
function checkFiles() {
    log('\n🔍 Verificando archivos...', 'blue');
    
    const requiredFiles = [
        'package.json',
        'server/server.js',
        'server/routes/auth.js',
        'server/routes/data.js',
        'public/index.html',
        'public/app.js',
        'public/api.js',
        'public/router.js',
        '.env'
    ];
    
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(path.join(__dirname, file))) {
            log(`  ✅ ${file}`, 'green');
        } else {
            log(`  ❌ ${file} - FALTA`, 'red');
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// Hacer una petición HTTP simple
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data, headers: res.headers });
            });
        });
        
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.abort();
            reject(new Error('Timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Verificar que el servidor responde
async function checkServer() {
    log('\n🌐 Verificando servidor...', 'blue');
    
    try {
        // Health check
        const health = await makeRequest(`${BASE_URL}/api/health`);
        if (health.status === 200) {
            log('  ✅ Health check OK', 'green');
            const healthData = JSON.parse(health.data);
            log(`     Status: ${healthData.status}`, 'green');
            log(`     Version: ${healthData.version}`, 'green');
        } else {
            log(`  ❌ Health check failed: ${health.status}`, 'red');
            return false;
        }
        
        // Frontend
        const frontend = await makeRequest(`${BASE_URL}/`);
        if (frontend.status === 200 && frontend.data.includes('Biodanza Player 3.0')) {
            log('  ✅ Frontend carga correctamente', 'green');
        } else {
            log(`  ❌ Frontend failed: ${frontend.status}`, 'red');
            return false;
        }
        
        return true;
        
    } catch (error) {
        log(`  ❌ Error conectando al servidor: ${error.message}`, 'red');
        log('     Asegúrate de que el servidor esté ejecutándose con: npm start', 'yellow');
        return false;
    }
}

// Verificar API endpoints principales
async function checkAPI() {
    log('\n🔗 Verificando API endpoints...', 'blue');
    
    try {
        // Test login endpoint (should fail without credentials)
        const loginOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        };
        
        const login = await makeRequest(`${BASE_URL}/api/auth/login`, loginOptions);
        if (login.status === 400) {
            log('  ✅ Login endpoint responde correctamente', 'green');
        } else {
            log(`  ❌ Login endpoint error: ${login.status}`, 'red');
        }
        
        // Test protected endpoint (should fail without auth)
        const protected = await makeRequest(`${BASE_URL}/api/data/homepage`);
        if (protected.status === 401) {
            log('  ✅ Endpoints protegidos funcionan correctamente', 'green');
        } else {
            log(`  ❌ Protected endpoint error: ${protected.status}`, 'red');
        }
        
        return true;
        
    } catch (error) {
        log(`  ❌ Error verificando API: ${error.message}`, 'red');
        return false;
    }
}

// Función principal
async function main() {
    log('🚀 Biodanza Player 3.0 - Verificación del Sistema\n', 'blue');
    
    const filesOK = checkFiles();
    
    if (!filesOK) {
        log('\n❌ Algunos archivos faltan. Por favor verifica la instalación.', 'red');
        process.exit(1);
    }
    
    const serverOK = await checkServer();
    
    if (!serverOK) {
        log('\n⚠️  Servidor no disponible. Inicia el servidor con:', 'yellow');
        log('   npm start', 'yellow');
        log('\n   Luego ejecuta este script nuevamente.', 'yellow');
        process.exit(1);
    }
    
    const apiOK = await checkAPI();
    
    if (filesOK && serverOK && apiOK) {
        log('\n🎉 ¡Todo está funcionando correctamente!', 'green');
        log('\nPuedes acceder a la aplicación en:', 'green');
        log(`   Frontend: ${BASE_URL}`, 'green');
        log(`   API: ${BASE_URL}/api`, 'green');
        log('\nCredenciales por defecto:', 'blue');
        log('   Facilitador: user@example.com / password123', 'blue');
        log('   Estudiante: student@example.com / password123', 'blue');
    } else {
        log('\n❌ Algunos componentes tienen problemas.', 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        log(`\n💥 Error inesperado: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { checkFiles, checkServer, checkAPI };