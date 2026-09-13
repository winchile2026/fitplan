/**
 * ============================================
 * PORTAL PÚBLICO - FitPlan Pro
 * ============================================
 * Página de inicio pública con información del gimnasio.
 */

/*import { BASE_PLANES } from './data.js';
import { AuthService } from './services.js';
import { FIREBASE_CONFIG } from './config.js';
import { Utils } from './utils.js';*/

// ============================================
// INICIALIZAR FIREBASE
// ============================================
/*try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    console.log('✅ Portal: Firebase conectado');
} catch (e) {
    console.warn('⚠️ Portal: Firebase no disponible:', e);
}*/
//NUEVO
/**
 * ============================================
 * PORTAL PÚBLICO - FitPlan Pro
 * ============================================
 */

import { BASE_PLANES } from './data.js';
import { AuthService } from './services.js';
import { FIREBASE_CONFIG } from './config.js';
import { Utils } from './utils.js';

// ============================================
// INICIALIZAR FIREBASE + FIRESTORE
// ============================================
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
    }
    
    // ⚠️ CRÍTICO: Exponer db globalmente para que AuthService lo use
    window.db = firebase.firestore();
    
    console.log('✅ Portal: Firebase + Firestore conectados');
} catch (e) {
    console.warn('⚠️ Portal: Firebase no disponible:', e);
}


// ============================================
// CARGAR PLANES EN EL PORTAL
// ============================================
function cargarPlanes() {
    const grid = document.getElementById('planesGrid');
    if (!grid) return;

    const planesAMostrar = Object.values(BASE_PLANES).slice(0, 6);

    grid.innerHTML = planesAMostrar.map(plan => `
        <div class="plan-card-portal">
            <h3>${plan.nombre}</h3>
            <div class="precio">${Utils.formatoMoneda(plan.precio)}</div>
            <p style="color:#7f8c8d;margin-bottom:1rem;">
                ${plan.ejercicios.length} ejercicios · ${plan.comidas.length} comidas
            </p>
            <button class="btn-ingresar btn-quiero-plan" data-plan="${plan.id}">
                <i class="fas fa-user-plus"></i> Quiero este plan
            </button>
        </div>
    `).join('');

    // Conectar botones
    grid.querySelectorAll('.btn-quiero-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirLogin();
        });
    });
}

// ============================================
// CARGAR PROMOCIONES
// ============================================
function cargarPromociones() {
    const grid = document.getElementById('promocionesGrid');
    if (!grid) return;

    const promociones = [
        { 
            titulo: '🎉 Primera semana GRATIS', 
            descripcion: 'Prueba cualquier plan sin costo',
            color: '#27ae60'
        },
        { 
            titulo: '👥 Trae un amigo', 
            descripcion: '20% descuento para ambos',
            color: '#3498db'
        },
        { 
            titulo: '💳 Pago anual', 
            descripcion: '2 meses gratis al pagar 1 año',
            color: '#e67e22'
        }
    ];

    grid.innerHTML = promociones.map(p => `
        <div class="plan-card-portal" style="border-color:${p.color};">
            <h3>${p.titulo}</h3>
            <p style="color:#7f8c8d;margin:1rem 0;">${p.descripcion}</p>
        </div>
    `).join('');
}

// ============================================
// CARGAR PROGRAMAS CON PROFESORES
// ============================================
function cargarProgramas() {
    const grid = document.getElementById('programasGrid');
    if (!grid) return;

    const programas = [
        { 
            nombre: 'CrossFit', 
            descripcion: 'Entrenamiento funcional intenso',
            profesor: 'Pedro Ramírez',
            foto: 'assets/profesores/profesor-1.jpg',
            img: 'assets/programas/crossfit.jpg'
        },
        { 
            nombre: 'Yoga', 
            descripcion: 'Flexibilidad y relajación',
            profesor: 'Ana Torres',
            foto: 'assets/profesores/profesor-2.jpg',
            img: 'assets/programas/yoga.jpg'
        },
        { 
            nombre: 'Musculación', 
            descripcion: 'Fuerza y volumen muscular',
            profesor: 'Luis Fernández',
            foto: 'assets/profesores/profesor-3.jpg',
            img: 'assets/programas/musculacion.jpg'
        },
        { 
            nombre: 'Zumba', 
            descripcion: 'Cardio divertido con música',
            profesor: 'María González',
            foto: 'assets/profesores/profesor-4.jpg',
            img: 'assets/programas/zumba.jpg'
        }
    ];

    grid.innerHTML = programas.map(p => `
        <div class="programa-card">
            <img src="${p.img}" alt="${p.nombre}" onerror="this.src='https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?w=400'">
            <div class="programa-info">
                <h3>${p.nombre}</h3>
                <p style="color:#7f8c8d;">${p.descripcion}</p>
                <div class="profesor">
                    <img src="${p.foto}" alt="${p.profesor}" onerror="this.src='https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?w=100'">
                    <div>
                        <p style="font-weight:700;color:#0b2b44;">${p.profesor}</p>
                        <p style="font-size:0.8rem;color:#7f8c8d;">Profesor</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// CARGAR VIDEOS DE EJERCICIOS
// ============================================
function cargarVideos() {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;

    const videos = [
        { 
            nombre: 'Sentadillas', 
            youtube: 'https://www.youtube.com/embed/1fbvlF2Rk5A',
            img: 'assets/ejercicios/sentadillas.jpg'
        },
        { 
            nombre: 'Flexiones', 
            youtube: 'https://www.youtube.com/embed/0pkjOk0EiAk',
            img: 'assets/ejercicios/flexiones.jpg'
        },
        { 
            nombre: 'Plancha', 
            youtube: 'https://www.youtube.com/embed/pSHjTRCQxIw',
            img: 'assets/ejercicios/plancha.jpg'
        },
        { 
            nombre: 'Burpees', 
            youtube: 'https://www.youtube.com/embed/dZgVxmf6jkA',
            img: 'assets/ejercicios/burpees.jpg'
        }
    ];

    grid.innerHTML = videos.map(v => `
        <div class="video-card" data-video="${v.youtube}">
            <img src="${v.img}" alt="${v.nombre}" onerror="this.src='https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?w=400'">
            <div style="padding:1rem;">
                <h3 style="color:#0b2b44;font-size:1rem;">${v.nombre}</h3>
                <p style="color:#e74c3c;margin-top:0.5rem;">
                    <i class="fab fa-youtube"></i> Ver video
                </p>
            </div>
        </div>
    `).join('');

    // Conectar clics
    grid.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            window.open(card.dataset.video, '_blank');
        });
    });
}

// ============================================
// MODAL LOGIN
// ============================================
function abrirLogin() {
    document.getElementById('modalLogin').classList.add('active');
}

function cerrarLogin() {
    document.getElementById('modalLogin').classList.remove('active');
}

async function loginPortal() {
    const email = document.getElementById('portalEmail').value.trim();
    const password = document.getElementById('portalPass').value;
    const error = document.getElementById('portalError');

    error.textContent = '';

    if (!email || !password) {
        error.textContent = 'Ingresa email y contraseña';
        return;
    }

    try {
        const user = await AuthService.login(email, password);
        if (user) {
            // Redirigir a la app principal
            window.location.href = 'app.html';
        } else {
            error.textContent = 'Email o contraseña incorrectos';
        }
    } catch (e) {
        console.error('Error login:', e);
        error.textContent = 'Error al iniciar sesión';
    }
}

function scrollToPlanes() {
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// CONFIGURAR EVENTOS
// ============================================
function configurarEventos() {
    // Botones de login
    document.getElementById('btnIngresarNav')?.addEventListener('click', abrirLogin);
    document.getElementById('btnIngresarGrande')?.addEventListener('click', abrirLogin);
    
    // Cerrar modal
    document.getElementById('btnCerrarModal')?.addEventListener('click', cerrarLogin);
    
    // Login
    document.getElementById('btnLoginPortal')?.addEventListener('click', loginPortal);
    
    // Enter en el login
    document.getElementById('portalEmail')?.addEventListener('keyup', e => {
        if (e.key === 'Enter') loginPortal();
    });
    document.getElementById('portalPass')?.addEventListener('keyup', e => {
        if (e.key === 'Enter') loginPortal();
    });
    
    // Botón "Ver planes"
    document.getElementById('btnVerPlanes')?.addEventListener('click', scrollToPlanes);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('modalLogin')?.addEventListener('click', e => {
        if (e.target.id === 'modalLogin') cerrarLogin();
    });
}

// ============================================
// INICIALIZAR
// ============================================
/*document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portal iniciando...');
    
    cargarPlanes();
    cargarPromociones();
    cargarProgramas();
    cargarVideos();
    configurarEventos();
    
    console.log('✅ Portal listo');
});*/
//NUEVO
// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portal iniciando...');
    
    // ✅ 1. Inicializar Firebase (ya está arriba en el archivo)
    // ✅ 2. Inicializar AuthService
    AuthService.init();
    
    // ✅ 3. Cargar contenido
    cargarPlanes();
    cargarPromociones();
    cargarProgramas();
    cargarVideos();
    
    // ✅ 4. Configurar eventos
    configurarEventos();
    
    console.log('✅ Portal listo');
});
