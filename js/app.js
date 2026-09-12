/**
 * ============================================
 * APP.JS - Punto de entrada
 * ============================================
 * Inicializa la aplicación, Firebase, Auth, y renderiza la UI según rol.
 */

import { ClienteService, PagoService, HistorialService, AuthService } from './services.js';
import { generarClientesPrueba, StorageService } from './data.js';
import { UIAdmin } from './ui-admin.js';
import { URecepcion } from './ui-recepcion.js';
import { UICliente } from './ui-cliente.js';
import { ROLES, STORAGE_KEYS, PAGO_CONFIG, FIREBASE_CONFIG } from './config.js';

// ============================================
// VARIABLES GLOBALES
// ============================================
let db = null;

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FitPlan Pro iniciando...');

    // 1. Inicializar Firebase
    inicializarFirebase();

    // 2. Inicializar AuthService
    AuthService.init();

    // 3. Cargar datos locales
    ClienteService.cargar();
    HistorialService.cargar();

    // 4. Sincronización en tiempo real con Firebase
    if (db) {
        iniciarSincronizacionTiempoReal();
    }

    // 5. Si no hay clientes, generar de prueba
    if (ClienteService.clientes.length === 0) {
        console.log('📋 Generando clientes de prueba...');
        ClienteService.clientes = generarClientesPrueba(200);
        ClienteService.guardar();
    }

    // 6. Contador de visitas
    let visitas = parseInt(StorageService.get(STORAGE_KEYS.VISITAS, 0)) + 1;
    StorageService.set(STORAGE_KEYS.VISITAS, visitas);

    // 7. Configurar login
    configurarLogin();

    // 8. Restaurar sesión
    restaurarSesion();

    console.log(`✅ App lista. ${ClienteService.clientes.length} clientes cargados.`);
});

// ============================================
// INICIALIZAR FIREBASE
// ============================================
function inicializarFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        db = firebase.firestore();
        window.db = db;
        console.log('✅ Firebase conectado');
        
        const estadoEl = document.getElementById('estadoSincronizacion');
        if (estadoEl) {
            estadoEl.textContent = 'Firebase ✓';
            estadoEl.style.color = '#27ae60';
        }
    } catch (e) {
        console.warn('⚠️ Firebase no disponible, usando solo localStorage:', e);
        const estadoEl = document.getElementById('estadoSincronizacion');
        if (estadoEl) {
            estadoEl.textContent = 'Local';
            estadoEl.style.color = '#f39c12';
        }
    }
}

// ============================================
// SINCRONIZACIÓN EN TIEMPO REAL
// ============================================
function iniciarSincronizacionTiempoReal() {
    if (!db) return;

    db.collection('gimnasio').doc('data').onSnapshot((doc) => {
        if (!doc.exists) return;

        const data = doc.data();
        let hayCambios = false;

        // Actualizar clientes
        if (data.clientes && JSON.stringify(data.clientes) !== JSON.stringify(ClienteService.clientes)) {
            ClienteService.clientes = data.clientes;
            StorageService.set(STORAGE_KEYS.CLIENTES, data.clientes);
            console.log('🔄 Clientes actualizados desde Firebase');
            hayCambios = true;
        }

        // Actualizar historial
        if (data.historial) {
            HistorialService.historial = data.historial;
            StorageService.set(STORAGE_KEYS.HISTORIAL, data.historial);
        }

        // Actualizar horario
        if (data.horario) {
            StorageService.set(STORAGE_KEYS.HORARIO, data.horario);
        }

        // Actualizar entrenadores
        if (data.entrenadores) {
            StorageService.set(STORAGE_KEYS.ENTRENADORES, data.entrenadores);
        }

        // Actualizar ofertas
        if (data.ofertas) {
            StorageService.set(STORAGE_KEYS.OFERTAS, data.ofertas);
        }

        // Refrescar UI si hay cambios y hay sesión activa
        if (hayCambios && AuthService.currentUser) {
            refrescarVistaActiva();
        }
    }, (error) => {
        console.error('❌ Error en tiempo real:', error);
    });
}

// ============================================
// REFRESCAR VISTA ACTIVA
// ============================================
function refrescarVistaActiva() {
    const tabActiva = document.querySelector('.tab-btn.active');
    if (!tabActiva) return;

    const rol = AuthService.currentUser?.rol;
    const tabId = tabActiva.dataset.tab;

    if (rol === ROLES.ADMIN) {
        UIAdmin.renderTab(tabId);
    } else if (rol === ROLES.RECEPCION) {
        URecepcion.renderTab(tabId);
    } else if (rol === ROLES.CLIENTE) {
        UICliente.renderTab(tabId, AuthService.clienteActualRut);
    }
}

// ============================================
// CONFIGURAR LOGIN
// ============================================
function configurarLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const inputEmail = document.getElementById('loginUser');
    const inputPass = document.getElementById('loginPass');
    const errorMsg = document.getElementById('loginError');

    // Configurar input para email
    if (inputEmail) {
        inputEmail.placeholder = 'tu-email@ejemplo.com';
        inputEmail.type = 'email';
    }

    // Botón login
    btnLogin?.addEventListener('click', async () => {
        const email = inputEmail.value.trim();
        const password = inputPass.value;

        // Validaciones
        if (!email || !password) {
            errorMsg.textContent = 'Ingresa email y contraseña';
            errorMsg.style.display = 'block';
            return;
        }

        // Deshabilitar botón mientras carga
        btnLogin.disabled = true;
        const textoOriginal = btnLogin.innerHTML;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

        try {
            const user = await AuthService.login(email, password);

            if (user) {
                document.getElementById('loginContainer').classList.remove('active');
                document.getElementById('mainContent').style.display = 'block';
                errorMsg.style.display = 'none';
                renderUI(user);
                console.log('✅ Login exitoso como:', user.rol);
            } else {
                errorMsg.textContent = 'Email o contraseña incorrectos';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error login:', error);
            errorMsg.textContent = 'Error al iniciar sesión. Intenta de nuevo.';
            errorMsg.style.display = 'block';
        }

        // Restaurar botón
        btnLogin.disabled = false;
        btnLogin.innerHTML = textoOriginal;
    });

    // Enter en los inputs
    inputEmail?.addEventListener('keyup', e => {
        if (e.key === 'Enter') btnLogin.click();
    });
    inputPass?.addEventListener('keyup', e => {
        if (e.key === 'Enter') btnLogin.click();
    });

    // Botón logout
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        await AuthService.logout();
        location.reload();
    });
}

// ============================================
// RESTAURAR SESIÓN (Firebase Auth maneja esto)
// ============================================
function restaurarSesion() {
    AuthService.observarEstado((user) => {
        if (user) {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
            renderUI(user);
            console.log('✅ Sesión restaurada:', user.rol);
        } else {
            document.getElementById('loginContainer').classList.add('active');
            document.getElementById('mainContent').style.display = 'none';
        }
    });
}

// ============================================
// RENDERIZAR UI SEGÚN ROL
// ============================================
function renderUI(user) {
    // Info del usuario
    const nameEl = document.getElementById('userNameDisplay');
    if (nameEl) nameEl.textContent = user.nombre || user.email;

    const badge = document.getElementById('userRolBadge');
    if (badge) {
        badge.textContent = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);
        badge.className = 'rol-badge ' + user.rol;
    }

    // Tabs según rol
    let tabs = [];
    if (user.rol === ROLES.ADMIN) {
        tabs = UIAdmin.tabs;
    } else if (user.rol === ROLES.RECEPCION) {
        tabs = URecepcion.tabs;
    } else if (user.rol === ROLES.CLIENTE) {
        tabs = UICliente.tabs;
    }

    renderTabs(tabs, user.rol);

    // Activar primera tab
    const firstTab = tabs[0];
    if (firstTab) {
        activarTab(firstTab.id, user.rol, user.rut || AuthService.clienteActualRut);
    }
}

// ============================================
// RENDERIZAR TABS
// ============================================
function renderTabs(tabs, rol) {
    const cont = document.getElementById('tabsContainer');
    if (!cont) return;

    cont.innerHTML = tabs.map(t => `
        <button class="tab-btn role-${rol} ${t.clase || ''}" data-tab="${t.id}">
            <i class="fas ${t.icon}"></i> ${t.label}
        </button>
    `).join('');

    // Event listeners
    cont.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cont.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activarTab(btn.dataset.tab, rol, AuthService.clienteActualRut);
        });
    });

    // Activar primera
    cont.querySelector('.tab-btn')?.classList.add('active');
}

// ============================================
// ACTIVAR TAB
// ============================================
function activarTab(tabId, rol, clienteRut) {
    try {
        if (rol === ROLES.ADMIN) {
            UIAdmin.renderTab(tabId);
        } else if (rol === ROLES.RECEPCION) {
            URecepcion.renderTab(tabId);
        } else if (rol === ROLES.CLIENTE) {
            UICliente.renderTab(tabId, clienteRut || AuthService.clienteActualRut);
        }
    } catch (error) {
        console.error(`❌ Error al renderizar tab "${tabId}":`, error);
    }
}

// ============================================
// FUNCIONES AUXILIARES GLOBALES
// ============================================
window.activarTab = activarTab;
window.refrescarVistaActiva = refrescarVistaActiva;
