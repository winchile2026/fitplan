/**
 * ============================================
 * SERVICIOS
 * ============================================
 * Toda la lógica de negocio: clientes, pagos, autenticación, historial.
 */

import { MESES, PAGOS, ESTADOS, USERS, ROLES, PAGO_CONFIG, STORAGE_KEYS } from './config.js';
import { StorageService, BASE_PLANES } from './data.js';
import { Utils } from './utils.js';

// ============================================
// SERVICIO DE CLIENTES
// ============================================
export const ClienteService = {
    clientes: [],

    /**
     * Carga los clientes desde localStorage
     */
    cargar() {
        const data = StorageService.get(STORAGE_KEYS.CLIENTES, []);
        // Normalizar: asegurar que todos tengan los campos
        this.clientes = data.map(c => ({
            ...c,
            plan: c.plan || null,
            planesComprados: c.planesComprados || [],
            pagosHistorial: c.pagosHistorial || [],
            diasCliente: c.diasCliente || []
        }));
        return this.clientes;
    },

    /**
     * Guarda los clientes en localStorage
     
    guardar() {
        StorageService.set(STORAGE_KEYS.CLIENTES, this.clientes);
    },*/

    //REEMPLA POR ESTO
    guardar() {
    // 1. Guardar localmente
    StorageService.set(STORAGE_KEYS.CLIENTES, this.clientes);
    
    // 2. Sincronizar con Firebase si está disponible
    if (window.db) {
        window.db.collection('gimnasio').doc('data').set({
            clientes: this.clientes,
            ultimaActualizacion: new Date().toISOString()
        }, { merge: true })
        .then(() => console.log('☁️ Clientes sincronizados con Firebase'))
        .catch(e => console.error('❌ Error sincronizando:', e));
    }
},







    /**
     * Busca un cliente por RUT
     */
    buscarPorRut(rut) {
        return this.clientes.find(c => c.rut === rut) || null;
    },

    /**
     * Crea un cliente SIN PLAN
     */
    crear(datos) {
        const nuevo = {
            rut: datos.rut,
            nombre: datos.nombre,
            telefono: datos.telefono || '',
            email: datos.email || '',
            edad: parseInt(datos.edad) || 30,
            problema: datos.problema || 'Ninguno',
            plan: null,                    // ⚠️ SIN PLAN al crear
            planesComprados: [],
            diasCliente: [],
            estado: ESTADOS.NUEVO,
            pago: datos.pago || PAGOS.PAGADO,
            ultimoPago: Utils.fechaHoy(),
            boleta: null,
            pagosHistorial: []
        };
        this.clientes.push(nuevo);
        this.guardar();
        return nuevo;
    },

    /**
     * Actualiza un cliente
     */
    actualizar(rut, cambios) {
        const cliente = this.buscarPorRut(rut);
        if (!cliente) return null;
        Object.assign(cliente, cambios);
        this.guardar();
        return cliente;
    },

    /**
     * Marca un cliente como eliminado
     */
    eliminar(rut) {
        const cliente = this.buscarPorRut(rut);
        if (!cliente) return null;
        cliente.estado = ESTADOS.ELIMINADO;
        this.guardar();
        return cliente;
    },

    /**
     * Recupera un cliente eliminado
     */
    recuperar(rut) {
        const cliente = this.buscarPorRut(rut);
        if (!cliente) return null;
        cliente.estado = ESTADOS.REINGRESADO;
        this.guardar();
        return cliente;
    },

    /**
     * Compra un plan: ASOCIA EL PLAN AL RUT
     * ⚠️ Este es el ÚNICO lugar donde se asigna plan a un cliente
     */
    comprarPlan(rut, planId) {
        const cliente = this.buscarPorRut(rut);
        if (!cliente) return null;
        const planBase = BASE_PLANES[planId];
        if (!planBase) return null;

        // Asociar plan al RUT
        cliente.plan = planId;

        // Agregar al historial sin duplicar
        const yaExiste = cliente.planesComprados.find(p => p.id === planId);
        if (!yaExiste) {
            cliente.planesComprados.push({
                id: planId,
                nombre: planBase.nombre,
                precio: planBase.precio,
                fecha: Utils.fechaHoy()
            });
        }

        this.guardar();
        return cliente;
    }
};

// ============================================
// SERVICIO DE PAGOS
// ============================================
export const PagoService = {
    /**
     * Obtiene los meses adeudados de un cliente
     */
    obtenerMesesAdeudados(cliente) {
        if (!cliente) return [];
        const mesesAdeudados = [];
        const mesActual = Utils.mesActual();

        MESES.forEach((mes, index) => {
            if (index > mesActual) return;

            const pagoRegistrado = (cliente.pagosHistorial || [])
                .find(p => p.mes === mes);
            if (pagoRegistrado) return;

            if (cliente.pago === PAGOS.PAGADO) {
                if (index < mesActual) return;
            } else if (cliente.pago === PAGOS.ADEUDA_1) {
                if (index === mesActual) mesesAdeudados.push(mes);
            } else if (cliente.pago === PAGOS.ADEUDA_2) {
                if (index === mesActual || index === mesActual - 1) {
                    mesesAdeudados.push(mes);
                }
            }
        });

        return mesesAdeudados;
    },

    /**
     * Registra un pago de mes
     */
    registrarPagoMes(rut, mes, monto, metodo) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return false;

        if (!cliente.pagosHistorial) cliente.pagosHistorial = [];
        if (cliente.pagosHistorial.find(p => p.mes === mes)) return false;

        cliente.pagosHistorial.push({
            mes,
            fecha: Utils.fechaHoy(),
            monto,
            metodo
        });

        // Actualizar estado
        const mesesRestantes = this.obtenerMesesAdeudados(cliente);
        if (mesesRestantes.length === 0) cliente.pago = PAGOS.PAGADO;
        else if (mesesRestantes.length === 1) cliente.pago = PAGOS.ADEUDA_1;
        else cliente.pago = PAGOS.ADEUDA_2;

        cliente.ultimoPago = Utils.fechaHoy();
        ClienteService.guardar();
        return true;
    },

    /**
     * Marca un mes como pagado (desde recepción)
     */
    marcarMesPagado(rut, mes) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return false;
        const planPrecio = cliente.plan && BASE_PLANES[cliente.plan]
            ? BASE_PLANES[cliente.plan].precio
            : PAGO_CONFIG.MONTO_DEFAULT;
        return this.registrarPagoMes(rut, mes, planPrecio, 'Recepción');
    }
};

// ============================================
// SERVICIO DE HISTORIAL
// ============================================
/*export const HistorialService = {
    historial: [],

    cargar() {
        this.historial = StorageService.get(STORAGE_KEYS.HISTORIAL, []);
        return this.historial;
    },

    guardar() {
        StorageService.set(STORAGE_KEYS.HISTORIAL, this.historial);
    },

    /**
     * Agrega una entrada al historial
     */
    /*agregar(accion, rut, nombre, detalle = '') {
        this.historial.push({
            fecha: Utils.fechaHoraActual(),
            accion,
            rut,
            nombre,
            detalle
        });
        if (this.historial.length > 500) this.historial.shift();
        this.guardar();
    }
};*/

//NUEVO GUARDAR
export const HistorialService = {
    historial: [],

    cargar() {
        this.historial = StorageService.get(STORAGE_KEYS.HISTORIAL, []);
        return this.historial;
    },

    // ✅ ACTUALIZADO: Sincroniza con Firebase
    guardar() {
        // 1. Guardar localmente
        StorageService.set(STORAGE_KEYS.HISTORIAL, this.historial);
        
        // 2. Sincronizar con Firebase
        if (window.db) {
            window.db.collection('gimnasio').doc('data').set({
                historial: this.historial,
                ultimaActualizacion: new Date().toISOString()
            }, { merge: true })
            .then(() => console.log('☁️ Historial sincronizado con Firebase'))
            .catch(e => console.error('❌ Error sincronizando historial:', e));
        }
    },

    agregar(accion, rut, nombre, detalle = '') {
        this.historial.push({
            fecha: Utils.fechaHoraActual(),
            accion,
            rut,
            nombre,
            detalle
        });
        if (this.historial.length > 500) this.historial.shift();
        this.guardar();
    }
};

















// ============================================
// SERVICIO DE AUTENTICACIÓN
// ============================================
/*export const AuthService = {
    currentUser: null,
    clienteActualRut: null,

    /**
     * Intenta iniciar sesión
     */
   /* login(username, password) {
        // Admin o Recepción
        if (USERS[username] && USERS[username].password === password) {
            this.currentUser = { username, ...USERS[username] };
            this.clienteActualRut = null;
            StorageService.set(STORAGE_KEYS.SESSION, { username });
            return this.currentUser;
        }

        // Cliente
        const cliente = ClienteService.buscarPorRut(username);
        if (cliente && password === PAGO_CONFIG.PASSWORD_CLIENTE) {
            this.currentUser = {
                username: cliente.rut,
                rol: ROLES.CLIENTE,
                nombre: cliente.nombre
            };
            this.clienteActualRut = cliente.rut;
            StorageService.set(STORAGE_KEYS.SESSION, { username });
            return this.currentUser;
        }

        return null;
    },

    logout() {
        this.currentUser = null;
        this.clienteActualRut = null;
        StorageService.remove(STORAGE_KEYS.SESSION);
        StorageService.remove(STORAGE_KEYS.ACTIVE_TAB);
    },

    esAdmin() { return this.currentUser && this.currentUser.rol === ROLES.ADMIN; },
    esRecepcion() { return this.currentUser && this.currentUser.rol === ROLES.RECEPCION; },
    esCliente() { return this.currentUser && this.currentUser.rol === ROLES.CLIENTE; }
};

*/

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

export const AuthService = {
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Obtener rol desde Firestore
            const userDoc = await window.db.collection('usuarios').doc(user.uid).get();
            const userData = userDoc.data();
            
            this.currentUser = {
                uid: user.uid,
                email: user.email,
                rol: userData.rol,  // 'admin', 'recepcion', 'cliente'
                nombre: userData.nombre,
                rut: userData.rut
            };
            
            return this.currentUser;
        } catch (error) {
            console.error('Error login:', error);
            return null;
        }
    },
    
    async logout() {
        await auth.signOut();
        this.currentUser = null;
    }
};
