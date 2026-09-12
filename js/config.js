/**
 * ============================================
 * CONFIGURACIÓN GLOBAL
 * ============================================
 * Constantes, claves de storage, configuración de Firebase.
 */

// ============================================
// MESES DEL AÑO
// ============================================
export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ============================================
// ROLES DE USUARIO
// ============================================
export const ROLES = {
    ADMIN: 'admin',
    RECEPCION: 'recepcion',
    CLIENTE: 'cliente'
};

// ============================================
// ESTADOS DE CLIENTE
// ============================================
export const ESTADOS = {
    NUEVO: 'nuevo',
    ACTIVO: 'activo',
    MODIFICADO: 'modificado',
    ELIMINADO: 'eliminado',
    REINGRESADO: 'reingresado'
};

// ============================================
// ESTADOS DE PAGO
// ============================================
export const PAGOS = {
    PAGADO: 'si',
    ADEUDA_1: 'no',
    ADEUDA_2: 'adeuda2'
};

// ============================================
// MÉTODOS DE PAGO
// ============================================
export const METODOS_PAGO = {
    efectivo: 'Efectivo',
    debito: 'Débito',
    credito: 'Crédito',
    celular: 'Celular'
};

// ============================================
// CLAVES DE LOCALSTORAGE
// ============================================
export const STORAGE_KEYS = {
    CLIENTES: 'fitClientes',
    HISTORIAL: 'fitHistorial',
    HORARIO: 'fitHorario',
    PERSONAL: 'fitPersonal',
    ENTRENADORES: 'fitEntrenadores',
    OFERTAS: 'fitOfertas',
    VISITAS: 'fitVisitas',
    SESSION: 'fitSession',
    ACTIVE_TAB: 'fitActiveTab'
};

// ============================================
// USUARIOS LEGACY (fallback si Firebase falla)
// ============================================
export const USERS = {
    admin: { password: '1234', rol: ROLES.ADMIN, nombre: 'Administrador' },
    recepcion: { password: '1234', rol: ROLES.RECEPCION, nombre: 'Recepcionista' }
};

// ============================================
// CONFIGURACIÓN DE PAGO
// ============================================
export const PAGO_CONFIG = {
    PASSWORD_CLIENTE: '1234',
    MONTO_DEFAULT: 25000
};

// ============================================
// 🔥 FIREBASE CONFIG - TUS CREDENCIALES REALES
// ============================================
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBBrM4T8D7sWsEcciMHiVKOLKm9M8XxYeQ",
    authDomain: "fitplan-pro-64b78.firebaseapp.com",
    projectId: "fitplan-pro-64b78",
    storageBucket: "fitplan-pro-64b78.firebasestorage.app",
    messagingSenderId: "285908919557",
    appId: "1:285908919557:web:2228fec38090151f52c36c"
};
