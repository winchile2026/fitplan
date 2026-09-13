/**
 * ============================================
 * APP.JS - Punto de entrada
 * ============================================
 */

import { ClienteService, PagoService, HistorialService, AuthService } from './services.js';
import { generarClientesPrueba, StorageService } from './data.js';
import { UIAdmin } from './ui-admin.js';
import { URecepcion } from './ui-recepcion.js';
import { UICliente } from './ui-cliente.js';
import { ROLES, STORAGE_KEYS, PAGO_CONFIG, FIREBASE_CONFIG } from './config.js';

let db = null;
let syncIniciado = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FitPlan Pro iniciando...');

    inicializarFirebase();
    AuthService.init();
    ClienteService.cargar();
    HistorialService.cargar();

    if (ClienteService.clientes.length === 0) {
        ClienteService.clientes = generarClientesPrueba(200);
        ClienteService.guardar();
    }

    let visitas = parseInt(StorageService.get(STORAGE_KEYS.VISITAS, 0)) + 1;
    StorageService.set(STORAGE_KEYS.VISITAS, visitas);
    const contadorVisitas = document.getElementById('contadorVisitas');
    if (contadorVisitas) contadorVisitas.textContent = visitas;

    configurarLogin();
    configurarRegistro();
    configurarRecuperarPassword();
    restaurarSesion();

    console.log(`✅ App lista. ${ClienteService.clientes.length} clientes cargados.`);
});

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
        console.warn('⚠️ Firebase no disponible:', e);
        const estadoEl = document.getElementById('estadoSincronizacion');
        if (estadoEl) {
            estadoEl.textContent = 'Local';
            estadoEl.style.color = '#f39c12';
        }
    }
}

function iniciarSincronizacionTiempoReal() {
    if (!db || syncIniciado) return;
    syncIniciado = true;

    db.collection('gimnasio').doc('data').onSnapshot((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        let hayCambios = false;

        if (data.clientes && JSON.stringify(data.clientes) !== JSON.stringify(ClienteService.clientes)) {
            ClienteService.clientes = data.clientes;
            StorageService.set(STORAGE_KEYS.CLIENTES, data.clientes);
            console.log('🔄 Clientes actualizados');
            hayCambios = true;
        }

        if (data.historial) {
            HistorialService.historial = data.historial;
            StorageService.set(STORAGE_KEYS.HISTORIAL, data.historial);
        }

        if (data.horario) StorageService.set(STORAGE_KEYS.HORARIO, data.horario);
        if (data.entrenadores) StorageService.set(STORAGE_KEYS.ENTRENADORES, data.entrenadores);
        if (data.ofertas) StorageService.set(STORAGE_KEYS.OFERTAS, data.ofertas);

        if (hayCambios && AuthService.currentUser) {
            refrescarVistaActiva();
        }
    }, (error) => {
        console.error('❌ Error tiempo real:', error);
    });
}

function refrescarVistaActiva() {
    const tabActiva = document.querySelector('.tab-btn.active');
    if (!tabActiva) return;
    const rol = AuthService.currentUser?.rol;
    const tabId = tabActiva.dataset.tab;

    if (rol === ROLES.ADMIN) UIAdmin.renderTab(tabId);
    else if (rol === ROLES.RECEPCION) URecepcion.renderTab(tabId);
    else if (rol === ROLES.CLIENTE) UICliente.renderTab(tabId, AuthService.clienteActualRut);
}

function configurarLogin() {
    const btnLogin = document.getElementById('btnLogin');
    const inputEmail = document.getElementById('loginUser');
    const inputPass = document.getElementById('loginPass');
    const errorMsg = document.getElementById('loginError');

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
                if (db && !syncIniciado) iniciarSincronizacionTiempoReal();
            } else {
                errorMsg.textContent = 'Email o contraseña incorrectos';
                errorMsg.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Error login:', error);
            errorMsg.textContent = 'Error al iniciar sesión';
            errorMsg.style.display = 'block';
        }

        btnLogin.disabled = false;
        btnLogin.innerHTML = textoOriginal;
    });

    inputEmail?.addEventListener('keyup', e => { if (e.key === 'Enter') btnLogin.click(); });
    inputPass?.addEventListener('keyup', e => { if (e.key === 'Enter') btnLogin.click(); });

    /*document.getElementById('btnLogout')?.addEventListener('click', async () => {
        await AuthService.logout();
        location.reload();
    });*/
    //NUEVO
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
    await AuthService.logout();
    window.location.href = 'index.html';  // ← Volver al portal público
});
    
}

function configurarRegistro() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.authTab;
            const panelId = 'auth' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
            document.getElementById(panelId)?.classList.add('active');
        });
    });

    document.getElementById('btnRegistrar')?.addEventListener('click', async () => {
        const nombre = document.getElementById('regNombre').value.trim();
        const rut = document.getElementById('regRut').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const password2 = document.getElementById('regPassword2').value;
        const errorMsg = document.getElementById('registroError');
        const exitoMsg = document.getElementById('registroExito');
        const btn = document.getElementById('btnRegistrar');

        errorMsg.style.display = 'none';
        exitoMsg.style.display = 'none';

        if (!nombre) { errorMsg.textContent = 'Ingresa tu nombre'; errorMsg.style.display = 'block'; return; }
        if (!rut) { errorMsg.textContent = 'Ingresa tu RUT'; errorMsg.style.display = 'block'; return; }
        if (!email) { errorMsg.textContent = 'Ingresa tu email'; errorMsg.style.display = 'block'; return; }
        if (password.length < 6) { errorMsg.textContent = 'Contraseña mínimo 6 caracteres'; errorMsg.style.display = 'block'; return; }
        if (password !== password2) { errorMsg.textContent = 'Contraseñas no coinciden'; errorMsg.style.display = 'block'; return; }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';

        const resultado = await AuthService.registro(email, password, { nombre, rut });

        if (resultado.exito) {
            exitoMsg.innerHTML = '<i class="fas fa-check-circle"></i> ¡Cuenta creada! Inicia sesión.';
            exitoMsg.style.display = 'block';

            if (!ClienteService.buscarPorRut(rut)) {
                ClienteService.crear({
                    rut: rut,
                    nombre: nombre,
                    telefono: '',
                    email: email,
                    edad: 30,
                    problema: 'Ninguno'
                });
                HistorialService.agregar('Cliente auto-registrado', rut, nombre, `Email: ${email}`);
            }

            document.getElementById('regNombre').value = '';
            document.getElementById('regRut').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regPassword2').value = '';

            setTimeout(() => {
                document.querySelector('.auth-tab[data-auth-tab="login"]')?.click();
                document.getElementById('loginUser').value = email;
                document.getElementById('loginPass').focus();
            }, 2000);

        } else {
            errorMsg.textContent = resultado.error;
            errorMsg.style.display = 'block';
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
    });
}

function configurarRecuperarPassword() {
    document.getElementById('btnOlvidePassword')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = prompt('Ingresa tu email para recuperar la contraseña:');
        if (!email) return;
        const resultado = await AuthService.recuperarPassword(email);
        if (resultado) {
            alert('✅ Te enviamos un email con instrucciones.\n\nRevisa tu bandeja de entrada.');
        } else {
            alert('❌ No pudimos enviar el email.');
        }
    });
}

function restaurarSesion() {
    AuthService.observarEstado((user) => {
        if (user) {
            document.getElementById('loginContainer').classList.remove('active');
            document.getElementById('mainContent').style.display = 'block';
            renderUI(user);
            console.log('✅ Sesión restaurada:', user.rol);
            if (db && !syncIniciado) iniciarSincronizacionTiempoReal();
        } else {
            document.getElementById('loginContainer').classList.add('active');
            document.getElementById('mainContent').style.display = 'none';
        }
    });
}

function renderUI(user) {
    const nameEl = document.getElementById('userNameDisplay');
    if (nameEl) nameEl.textContent = user.nombre || user.email;

    const badge = document.getElementById('userRolBadge');
    if (badge) {
        badge.textContent = user.rol.charAt(0).toUpperCase() + user.rol.slice(1);
        badge.className = 'rol-badge ' + user.rol;
    }

    let tabs = [];
    if (user.rol === ROLES.ADMIN) tabs = UIAdmin.tabs;
    else if (user.rol === ROLES.RECEPCION) tabs = URecepcion.tabs;
    else if (user.rol === ROLES.CLIENTE) tabs = UICliente.tabs;

    renderTabs(tabs, user.rol);

    const firstTab = tabs[0];
    if (firstTab) {
        activarTab(firstTab.id, user.rol, user.rut || AuthService.clienteActualRut);
    }
}

function renderTabs(tabs, rol) {
    const cont = document.getElementById('tabsContainer');
    if (!cont) return;

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

function activarTab(tabId, rol, clienteRut) {
    try {
        if (rol === ROLES.ADMIN) UIAdmin.renderTab(tabId);
        else if (rol === ROLES.RECEPCION) URecepcion.renderTab(tabId);
        else if (rol === ROLES.CLIENTE) UICliente.renderTab(tabId, clienteRut || AuthService.clienteActualRut);
    } catch (error) {
        console.error(`❌ Error renderizando tab "${tabId}":`, error);
    }
}

window.activarTab = activarTab;
window.refrescarVistaActiva = refrescarVistaActiva;
