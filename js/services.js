/**
 * ============================================
 * SERVICIOS
 * ============================================
 * Toda la lógica de negocio: clientes, pagos, historial, autenticación.
 * Usa Firebase Auth versión COMPAT + Firestore.
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
     * Guarda los clientes en localStorage + Firebase
     */
    guardar() {
        // 1. Guardar localmente
        StorageService.set(STORAGE_KEYS.CLIENTES, this.clientes);

        // 2. Sincronizar con Firebase
        if (window.db) {
            window.db.collection('gimnasio').doc('data').set({
                clientes: this.clientes,
                ultimaActualizacion: new Date().toISOString()
            }, { merge: true })
            .then(() => console.log('☁️ Clientes sincronizados con Firebase'))
            .catch(e => console.error('❌ Error sincronizando clientes:', e));
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
            plan: null,
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
     */
    async comprarPlan(rut, planId) {
        const cliente = this.buscarPorRut(rut);
        if (!cliente) return null;
        const planBase = BASE_PLANES[planId];
        if (!planBase) return null;

        // Asociar plan al RUT
        cliente.plan = planId;

        // Agregar al historial sin duplicar
        if (!cliente.planesComprados) cliente.planesComprados = [];
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

        // Sincronizar con el usuario de Firebase Auth (si aplica)
        if (window.db && AuthService.currentUser && AuthService.currentUser.uid) {
            try {
                await window.db.collection('usuarios').doc(AuthService.currentUser.uid).set({
                    rut: rut,
                    plan: planId,
                    planNombre: planBase.nombre
                }, { merge: true });
            } catch (e) {
                console.warn('⚠️ No se pudo asociar plan al usuario:', e);
            }
        }

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
export const HistorialService = {
    historial: [],

    cargar() {
        this.historial = StorageService.get(STORAGE_KEYS.HISTORIAL, []);
        return this.historial;
    },

    /**
     * Guarda el historial en localStorage + Firebase
     */
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

    /**
     * Agrega una entrada al historial
     */
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
// SERVICIO DE AUTENTICACIÓN (Firebase Auth COMPAT)
// ============================================
export const AuthService = {
    currentUser: null,
    clienteActualRut: null,
    auth: null,

    /**
     * Inicializa el servicio de autenticación
     */
    init() {
        if (!window.firebase) {
            console.warn('⚠️ Firebase no inicializado');
            return;
        }
        this.auth = firebase.auth();
        console.log('✅ AuthService inicializado');
    },

    /**
     * Login con email y contraseña
     */
    async login(email, password) {
        try {
            if (!this.auth) {
                console.error('❌ Auth no inicializado');
                return null;
            }

            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Obtener rol desde Firestore
            const userDoc = await window.db.collection('usuarios').doc(user.uid).get();

            if (!userDoc.exists) {
                console.warn('⚠️ Usuario sin rol asignado en Firestore');
                // Si no existe el documento, crear uno básico como cliente
                await window.db.collection('usuarios').doc(user.uid).set({
                    email: user.email,
                    rol: 'cliente',
                    nombre: user.email.split('@')[0],
                    rut: null,
                    fechaRegistro: new Date().toISOString()
                });
                
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    rol: 'cliente',
                    nombre: user.email.split('@')[0],
                    rut: null
                };
                return this.currentUser;
            }

            const userData = userDoc.data();

            this.currentUser = {
                uid: user.uid,
                email: user.email,
                rol: userData.rol,
                nombre: userData.nombre || user.email,
                rut: userData.rut || null
            };

            // Si es cliente, guardar su RUT
            if (userData.rol === 'cliente' && userData.rut) {
                this.clienteActualRut = userData.rut;
            }

            console.log('✅ Login exitoso:', this.currentUser.rol);
            return this.currentUser;

        } catch (error) {
            console.error('❌ Error login:', error.code, error.message);
            return null;
        }
    },

    /**
     * Logout
     */
    async logout() {
        try {
            if (this.auth) {
                await this.auth.signOut();
            }
            this.currentUser = null;
            this.clienteActualRut = null;
            StorageService.remove(STORAGE_KEYS.SESSION);
            StorageService.remove(STORAGE_KEYS.ACTIVE_TAB);
            console.log('✅ Logout exitoso');
        } catch (error) {
            console.error('❌ Error logout:', error);
        }
    },

    /**
     * Registro de nuevo usuario (para clientes)
     */
    /**
     * 
     * Registro de nuevo usuario (para clientes)
     * Crea usuario en Auth + documento en Firestore con rol "cliente"
     */
    /*NUEVO*/
    async registro(email, password, datosAdicionales = {}) {
        try {
            if (!this.auth) {
                console.error('❌ Auth no inicializado');
                return { exito: false, error: 'Auth no inicializado' };
            }

            // 1. Crear usuario en Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // 2. Crear documento en Firestore con rol de cliente
            await window.db.collection('usuarios').doc(user.uid).set({
                email: user.email,
                rol: 'cliente',
                nombre: datosAdicionales.nombre || '',
                rut: datosAdicionales.rut || '',
                fechaRegistro: new Date().toISOString()
            });

            console.log('✅ Registro exitoso:', user.email);
            return { 
                exito: true, 
                user: user,
                mensaje: 'Cuenta creada correctamente'
            };

        } catch (error) {
            console.error('❌ Error registro:', error.code, error.message);
            
            // Mensajes personalizados
            let mensaje = 'Error al crear la cuenta';
            
            if (error.code === 'auth/email-already-in-use') {
                mensaje = 'Este email ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                mensaje = 'La contraseña debe tener al menos 6 caracteres';
            } else if (error.code === 'auth/invalid-email') {
                mensaje = 'El email no es válido';
            } else if (error.code === 'auth/operation-not-allowed') {
                mensaje = 'El registro está deshabilitado. Contacta al administrador.';
            }
            
            return { 
                exito: false, 
                error: mensaje,
                codigo: error.code
            };
        }
    },



    /**
     * Enviar email de recuperación de contraseña
     */
    async recuperarPassword(email) {
        try {
            if (!this.auth) return false;
            await this.auth.sendPasswordResetEmail(email);
            console.log('✅ Email de recuperación enviado');
            return true;
        } catch (error) {
            console.error('❌ Error recuperación:', error);
            return false;
        }
    },

    /**
     * Observador del estado de autenticación
     */
    observarEstado(callback) {
        if (!this.auth) {
            console.warn('⚠️ Auth no inicializado, callback con null');
            if (callback) callback(null);
            return;
        }

        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await window.db.collection('usuarios').doc(user.uid).get();
                    
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        this.currentUser = {
                            uid: user.uid,
                            email: user.email,
                            rol: userData.rol,
                            nombre: userData.nombre || user.email,
                            rut: userData.rut || null
                        };
                        if (userData.rol === 'cliente' && userData.rut) {
                            this.clienteActualRut = userData.rut;
                        }
                    } else {
                        // Usuario sin documento: tratar como cliente básico
                        this.currentUser = {
                            uid: user.uid,
                            email: user.email,
                            rol: 'cliente',
                            nombre: user.email.split('@')[0],
                            rut: null
                        };
                    }
                } catch (e) {
                    console.error('❌ Error obteniendo usuario:', e);
                    this.currentUser = null;
                }
            } else {
                this.currentUser = null;
                this.clienteActualRut = null;
            }

            if (callback) callback(this.currentUser);
        });
    },

    /**
     * Métodos auxiliares
     */
    esAdmin() { 
        return this.currentUser && this.currentUser.rol === ROLES.ADMIN; 
    },
    esRecepcion() { 
        return this.currentUser && this.currentUser.rol === ROLES.RECEPCION; 
    },
    esCliente() { 
        return this.currentUser && this.currentUser.rol === ROLES.CLIENTE; 
    }
};
