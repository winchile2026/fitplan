/**
 * ============================================
 * CONFIGURACIÓN GLOBAL
 * ============================================
 * Constantes, claves de storage, configuración de Firebase.
 */

// Meses del año
/*export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Roles de usuario
export const ROLES = {
    ADMIN: 'admin',
    RECEPCION: 'recepcion',
    CLIENTE: 'cliente'
};

// Estados de cliente
export const ESTADOS = {
    NUEVO: 'nuevo',
    ACTIVO: 'activo',
    MODIFICADO: 'modificado',
    ELIMINADO: 'eliminado',
    REINGRESADO: 'reingresado'
};

// Estados de pago
export const PAGOS = {
    PAGADO: 'si',
    ADEUDA_1: 'no',
    ADEUDA_2: 'adeuda2'
};

// Métodos de pago
export const METODOS_PAGO = {
    efectivo: 'Efectivo',
    debito: 'Débito',
    credito: 'Crédito',
    celular: 'Celular'
};

// Claves de localStorage
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

// Usuarios del sistema
export const USERS = {
    admin: { password: '1234', rol: ROLES.ADMIN, nombre: 'Administrador' },
    recepcion: { password: '1234', rol: ROLES.RECEPCION, nombre: 'Recepcionista' }
};

// Configuración de pago
export const PAGO_CONFIG = {
    PASSWORD_CLIENTE: '1234',
    MONTO_DEFAULT: 25000
};

// Firebase
/*export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyC7Qn7LfP8xJ5mZ9W3HkYqF3rT5yU7iK9l",
    authDomain: "fitplanpro-abc123.firebaseapp.com",
    projectId: "fitplanpro-abc123",
    storageBucket: "fitplanpro-abc123.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};*/


// Import the functions you need from the SDKs you need
//import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
/*const firebaseConfig = {
  apiKey: "AIzaSyDKGiEy5caX6yVT_-mTNvJCPs-LZV6xky0",
  authDomain: "fitplan-pro-chile.firebaseapp.com",
  projectId: "fitplan-pro-chile",
  storageBucket: "fitplan-pro-chile.firebasestorage.app",
  messagingSenderId: "538147870814",
  appId: "1:538147870814:web:1db481d80cf49c919b7ccf"
};*/

/*const firebaseConfig = {
  apiKey: "AIzaSyBBrM4T8D7sWsEcciMHiVKOLKm9M8XxYeQ",
  authDomain: "fitplan-pro-64b78.firebaseapp.com",
  projectId: "fitplan-pro-64b78",
  storageBucket: "fitplan-pro-64b78.firebasestorage.app",
  messagingSenderId: "285908919557",
  appId: "1:285908919557:web:2228fec38090151f52c36c"
};*/

//===========================================================================================================
//NUEVO ARCHIVO

/**
 * ============================================
 * CONFIGURACIÓN GLOBAL
 * ============================================
 * Constantes, claves de storage, configuración de Firebase.
 */

// Meses del año
export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Roles de usuario
export const ROLES = {
    ADMIN: 'admin',
    RECEPCION: 'recepcion',
    CLIENTE: 'cliente'
};

// Estados de cliente
export const ESTADOS = {
    NUEVO: 'nuevo',
    ACTIVO: 'activo',
    MODIFICADO: 'modificado',
    ELIMINADO: 'eliminado',
    REINGRESADO: 'reingresado'
};

// Estados de pago
export const PAGOS = {
    PAGADO: 'si',
    ADEUDA_1: 'no',
    ADEUDA_2: 'adeuda2'
};

// Métodos de pago
export const METODOS_PAGO = {
    efectivo: 'Efectivo',
    debito: 'Débito',
    credito: 'Crédito',
    celular: 'Celular'
};

// Claves de localStorage
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

// Usuarios del sistema (login LOCAL, no usa Firebase Auth)
export const USERS = {
    admin: { password: '1234', rol: ROLES.ADMIN, nombre: 'Administrador' },
    recepcion: { password: '1234', rol: ROLES.RECEPCION, nombre: 'Recepcionista' }
};

// Configuración de pago
export const PAGO_CONFIG = {
    PASSWORD_CLIENTE: '1234',
    MONTO_DEFAULT: 25000
};

// ============================================
// 🔥 FIREBASE CONFIG (TUS CREDENCIALES REALES)
// ============================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBrM4T8D7sWsEcciMHiVKOLKm9M8XxYeQ",
  authDomain: "fitplan-pro-64b78.firebaseapp.com",
  projectId: "fitplan-pro-64b78",
  storageBucket: "fitplan-pro-64b78.firebasestorage.app",
  messagingSenderId: "285908919557",
  appId: "1:285908919557:web:2228fec38090151f52c36c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
