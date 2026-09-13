import { BASE_PLANES } from './data.js';
import { AuthService } from './services.js';
import { FIREBASE_CONFIG } from './config.js';
import { Utils } from './utils.js';

// Inicializar Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// ============================================
// CARGAR PLANES EN EL PORTAL
// ============================================
function cargarPlanes() {
    const grid = document.getElementById('planesGrid');
    if (!grid) return;

    grid.innerHTML = Object.values(BASE_PLANES).map(plan => `
        <div class="plan-card-portal">
            <h3>${plan.nombre}</h3>
            <div class="precio">${Utils.formatoMoneda(plan.precio)}</div>
            <p style="color:#7f8c8d;margin-bottom:1rem;">${plan.ejercicios.length} ejercicios · ${plan.comidas.length} comidas</p>
            <button class="btn-ingresar" onclick="abrirLogin()">
                <i class="fas fa-user-plus"></i> Quiero este plan
            </button>
        </div>
    `).join('');
}

// ============================================
// CARGAR PROMOCIONES (ejemplo)
// ============================================
function cargarPromociones() {
    const grid = document.getElementById('promocionesGrid');
    if (!grid) return;

    const promociones = [
        { titulo: '🎉 Primera semana GRATIS', descripcion: 'Prueba cualquier plan sin costo', color: '#27ae60' },
        { titulo: '👥 Trae un amigo', descripcion: '20% descuento para ambos', color: '#3498db' },
        { titulo: '💳 Pago anual', descripcion: '2 meses gratis al pagar 1 año', color: '#e67e22' }
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

    /*const programas = [
        { nombre: 'CrossFit', descripcion: 'Entrenamiento funcional intenso', profesor: 'Pedro Ramírez', foto: 'assets/profesor-1.jpg', img: 'assets/crossfit.jpg' },
        { nombre: 'Yoga', descripcion: 'Flexibilidad y relajación', profesor: 'Ana Torres', foto: 'assets/profesor-2.jpg', img: 'assets/yoga.jpg' },
        { nombre: 'Musculación', descripcion: 'Fuerza y volumen muscular', profesor: 'Luis Fernández', foto: 'assets/profesor-3.jpg', img: 'assets/musculacion.jpg' },
        { nombre: 'Zumba', descripcion: 'Cardio divertido con música', profesor: 'María González', foto: 'assets/profesor-4.jpg', img: 'assets/zumba.jpg' }
    ];*/

    //NUEVO
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
            <img src="${p.img}" alt="${p.nombre}">
            <div class="programa-info">
                <h3>${p.nombre}</h3>
                <p style="color:#7f8c8d;">${p.descripcion}</p>
                <div class="profesor">
                    <img src="${p.foto}" alt="${p.profesor}">
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

    /*const videos = [
        { nombre: 'Sentadillas', youtube: 'https://www.youtube.com/embed/1fbvlF2Rk5A', img: 'assets/sentadillas.jpg' },
        { nombre: 'Flexiones', youtube: 'https://www.youtube.com/embed/0pkjOk0EiAk', img: 'assets/flexiones.jpg' },
        { nombre: 'Plancha', youtube: 'https://www.youtube.com/embed/pSHjTRCQxIw', img: 'assets/plancha.jpg' },
        { nombre: 'Burpees', youtube: 'https://www.youtube.com/embed/dZgVxmf6jkA', img: 'assets/burpees.jpg' }
    ]; */

    //NUEVO
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
        <div class="video-card" onclick="window.open('${v.youtube}', '_blank')">
            <img src="${v.img}" alt="${v.nombre}">
            <div style="padding:1rem;">
                <h3 style="color:#0b2b44;font-size:1rem;">${v.nombre}</h3>
                <p style="color:#e74c3c;margin-top:0.5rem;">
                    <i class="fab fa-youtube"></i> Ver video
                </p>
            </div>
        </div>
    `).join('');
}

// ============================================
// MODAL LOGIN
// ============================================
window.abrirLogin = function() {
    document.getElementById('modalLogin').classList.add('active');
};

window.cerrarLogin = function() {
    document.getElementById('modalLogin').classList.remove('active');
};

window.loginPortal = async function() {
    const email = document.getElementById('portalEmail').value.trim();
    const password = document.getElementById('portalPass').value;
    const error = document.getElementById('portalError');

    if (!email || !password) {
        error.textContent = 'Ingresa email y contraseña';
        return;
    }

    try {
        const user = await AuthService.login(email, password);
        if (user) {
            // Redirigir al sistema según rol
            window.location.href = 'index.html';
        } else {
            error.textContent = 'Credenciales incorrectas';
        }
    } catch (e) {
        error.textContent = 'Error al iniciar sesión';
    }
};

window.scrollToPlanes = function() {
    document.getElementById('planes').scrollIntoView({ behavior: 'smooth' });
};

// ============================================
// INICIALIZAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarPlanes();
    cargarPromociones();
    cargarProgramas();
    cargarVideos();
});