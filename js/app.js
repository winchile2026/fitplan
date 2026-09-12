/**
 * ============================================
 * APP.JS - Punto de entrada
 * ============================================
 * Conecta todo: login, render por rol, restauración de sesión.
 */

/*import { ClienteService, PagoService, HistorialService, AuthService } from './services.js';
import { generarClientesPrueba, StorageService } from './data.js';
import { UIAdmin } from './ui-admin.js';
import { URecepcion } from './ui-recepcion.js';
import { UICliente } from './ui-cliente.js';
import { ROLES, STORAGE_KEYS, PAGO_CONFIG } from './config.js';*/



//NUEVO DE FIREBASE
import { ClienteService, PagoService, HistorialService, AuthService } from './services.js';
import { generarClientesPrueba, StorageService } from './data.js';
import { UIAdmin } from './ui-admin.js';
import { URecepcion } from './ui-recepcion.js';
import { UICliente } from './ui-cliente.js';
import { ROLES, STORAGE_KEYS, PAGO_CONFIG, FIREBASE_CONFIG } from './config.js';

// ============================================
// 🔥 INICIALIZAR FIREBASE
// ============================================
let db = null;

try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    window.db = db;
    console.log('✅ Firebase conectado');
} catch (e) {
    console.warn('⚠️ Firebase no disponible, usando solo localStorage:', e);
}

// ============================================
// ESCUCHAR CAMBIOS EN TIEMPO REAL
// ============================================
function iniciarSincronizacionTiempoReal() {
    if (!db) return;
    
    db.collection('gimnasio').doc('data').onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            
            // Actualizar clientes
            if (data.clientes && JSON.stringify(data.clientes) !== JSON.stringify(ClienteService.clientes)) {
                ClienteService.clientes = data.clientes;
                StorageService.set(STORAGE_KEYS.CLIENTES, data.clientes);
                console.log('🔄 Clientes actualizados desde Firebase');
                
                // Recargar vista activa
                const tabActiva = document.querySelector('.tab-btn.active');
                if (tabActiva && AuthService.currentUser) {
                    const rol = AuthService.currentUser.rol;
                    if (rol === ROLES.ADMIN) UIAdmin.renderTab(tabActiva.dataset.tab);
                    else if (rol === ROLES.RECEPCION) URecepcion.renderTab(tabActiva.dataset.tab);
                    else if (rol === ROLES.CLIENTE) UICliente.renderTab(tabActiva.dataset.tab, AuthService.clienteActualRut);
                }
            }
            
            // Actualizar horarios
            if (data.horario) {
                StorageService.set(STORAGE_KEYS.HORARIO, data.horario);
            }
            
            // Actualizar entrenadores
            if (data.entrenadores) {
                StorageService.set(STORAGE_KEYS.ENTRENADORES, data.entrenadores);
            }
            
            // Actualizar historial
            if (data.historial) {
                HistorialService.historial = data.historial;
                StorageService.set(STORAGE_KEYS.HISTORIAL, data.historial);
            }
            
            // Actualizar ofertas
            if (data.ofertas) {
                StorageService.set(STORAGE_KEYS.OFERTAS, data.ofertas);
            }
        }
    }, (error) => {
        console.error('❌ Error en tiempo real:', error);
    });
}




















// ============================================
// INICIALIZACIÓN
// ============================================
/*document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FitPlan Pro iniciando...');

    ClienteService.cargar();
    HistorialService.cargar();

    if (ClienteService.clientes.length === 0) {
        console.log('📋 Generando clientes de prueba...');
        ClienteService.clientes = generarClientesPrueba(200);
        ClienteService.guardar();
    }

    configurarLogin();
    restaurarSesion();*/

    //NUEVO
    document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FitPlan Pro iniciando...');

    // Inicializar Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        window.db = firebase.firestore();
        console.log('✅ Firebase conectado');
    } catch (e) {
        console.warn('⚠️ Firebase no disponible:', e);
    }

    // Inicializar AuthService
    AuthService.init();

    // Cargar datos
    ClienteService.cargar();
    HistorialService.cargar();

    // Cargar datos desde Firebase
    if (window.db) {
        iniciarSincronizacionTiempoReal();
    }

    if (ClienteService.clientes.length === 0) {
        console.log('📋 Generando clientes de prueba...');
        ClienteService.clientes = generarClientesPrueba(200);
        ClienteService.guardar();
    }

    configurarLogin();
    restaurarSesion();
});







    //NUEVO: Iniciar sincronización
    iniciarSincronizacionTiempoReal();




);




// ============================================
// LOGIN
// ============================================
/*function configurarLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const inputUser = document.getElementById('loginUser');
    const inputPass = document.getElementById('loginPass');

    btnLogin?.addEventListener('click', () => {
        const user = AuthService.login(inputUser.value, inputPass.value);
        if (user) {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
            renderUI(user);
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    });

    

    inputUser?.addEventListener('keyup', e => { if (e.key === 'Enter') btnLogin.click(); });
    inputPass?.addEventListener('keyup', e => { if (e.key === 'Enter') btnLogin.click(); });

    document.getElementById('btnLogout')?.addEventListener('click', () => {
        AuthService.logout();
        location.reload();
    });*/




//NUEVO
function configurarLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const inputEmail = document.getElementById('loginUser');  // Ahora es email
    const inputPass = document.getElementById('loginPass');
    const errorMsg = document.getElementById('loginError');

    // Cambiar placeholder a email
    if (inputEmail) {
        inputEmail.placeholder = 'tu-email@ejemplo.com';
        inputEmail.type = 'email';
    }

    btnLogin?.addEventListener('click', async () => {
        const email = inputEmail.value.trim();
        const password = inputPass.value;

        if (!email || !password) {
            errorMsg.textContent = 'Ingresa email y contraseña';
            errorMsg.style.display = 'block';
            return;
        }

        // Deshabilitar botón mientras carga
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

        const user = await AuthService.login(email, password);

        if (user) {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
            errorMsg.style.display = 'none';
            renderUI(user);
        } else {
            errorMsg.textContent = 'Email o contraseña incorrectos';
            errorMsg.style.display = 'block';
        }

        // Restaurar botón
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Ingresar';
    });

    // Permitir Enter
    inputEmail?.addEventListener('keyup', e => { 
        if (e.key === 'Enter') btnLogin.click(); 
    });
    inputPass?.addEventListener('keyup', e => { 
        if (e.key === 'Enter') btnLogin.click(); 
    });

    // Botón cerrar sesión
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        await AuthService.logout();
        location.reload();
    });
}







// ============================================
// RESTAURAR SESIÓN
// ============================================
/*function restaurarSesion() {
    const session = StorageService.get(STORAGE_KEYS.SESSION);
    if (session && session.username) {
        const user = AuthService.login(session.username, PAGO_CONFIG.PASSWORD_CLIENTE);
        if (user) {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
            renderUI(user);
        }
    }
}*/

//NUEVO
function restaurarSesion() {
    // Firebase Auth maneja la sesión automáticamente
    AuthService.observarEstado((user) => {
        if (user) {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
            renderUI(user);
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
    // Info usuario
    document.getElementById('userNameDisplay').textContent = user.nombre;
    const badge = document.getElementById('userRolBadge');
    badge.textContent = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);
    badge.className = 'rol-badge ' + user.rol;

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
    if (firstTab) activarTab(firstTab.id, user.rol, user.username);
}

// ============================================
// RENDERIZAR TABS
// ============================================
function renderTabs(tabs, rol) {
    const cont = document.getElementById('tabsContainer');
    cont.innerHTML = tabs.map(t => `
        <button class="tab-btn role-${rol} ${t.clase || ''}" data-tab="${t.id}">
            <i class="fas ${t.icon}"></i> ${t.label}
        </button>
    `).join('');

    cont.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cont.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activarTab(btn.dataset.tab, rol, AuthService.clienteActualRut);
        });
    });

    cont.querySelector('.tab-btn')?.classList.add('active');
}

// ============================================
// ACTIVAR TAB
// ============================================
function activarTab(tabId, rol, clienteRut) {
    if (rol === ROLES.ADMIN) {
        UIAdmin.renderTab(tabId);
    } else if (rol === ROLES.RECEPCION) {
        URecepcion.renderTab(tabId);
    } else if (rol === ROLES.CLIENTE && clienteRut) {
        UICliente.renderTab(tabId, clienteRut);
    }
}
