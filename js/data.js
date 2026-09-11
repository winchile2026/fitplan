/**
 * ============================================
 * BASE DE DATOS DE PLANES
 * ============================================
 * Define todos los planes disponibles con ejercicios y comidas.
 * ⚠️ IMPORTANTE: Los clientes NO tienen plan hasta que lo compren.
 */

import { STORAGE_KEYS } from './config.js';

export const BASE_PLANES = {
    'principiante-perdida': {
        id: 'principiante-perdida',
        nombre: '🌱 Principiante · pérdida',
        precio: 15000,
        ejercicios: [
            { nombre: 'Caminata rápida', img: 'https://img.icons8.com/fluency/96/000000/walking.png', detalle: '3x20 min · cardio', repeticiones: '3x20', youtube: 'https://www.youtube.com/results?search_query=caminata+rapida' },
            { nombre: 'Sentadillas asistidas', img: 'https://img.icons8.com/fluency/96/000000/squat.png', detalle: '3x10 · piernas', repeticiones: '3x10', youtube: 'https://www.youtube.com/results?search_query=sentadillas' },
            { nombre: 'Flexiones rodilla', img: 'https://img.icons8.com/fluency/96/000000/push-ups.png', detalle: '3x8 · pecho', repeticiones: '3x8', youtube: 'https://www.youtube.com/results?search_query=flexiones' },
            { nombre: 'Plancha rodillas', img: 'https://img.icons8.com/fluency/96/000000/plank.png', detalle: '3x20s · core', repeticiones: '3x20s', youtube: 'https://www.youtube.com/results?search_query=plancha' },
            { nombre: 'Estocadas cortas', img: 'https://img.icons8.com/fluency/96/000000/lunge.png', detalle: '3x8 c/pierna', repeticiones: '3x8', youtube: 'https://www.youtube.com/results?search_query=estocadas' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Avena 40g + leche 200ml + fruta 100g' },
            { nombre: 'Almuerzo', detalle: 'Pollo 150g + arroz 80g + ensalada 150g' },
            { nombre: 'Merienda', detalle: 'Yogur 150g + frutos secos 20g' },
            { nombre: 'Cena', detalle: 'Pescado 150g + verduras 200g' }
        ]
    },
    'principiante-mantener': {
        id: 'principiante-mantener',
        nombre: '🌱 Principiante · mantener',
        precio: 18000,
        ejercicios: [
            { nombre: 'Caminata+trote', img: 'https://img.icons8.com/fluency/96/000000/walking.png', detalle: '3x15 min', repeticiones: '3x15', youtube: 'https://www.youtube.com/results?search_query=caminata' },
            { nombre: 'Sentadillas', img: 'https://img.icons8.com/fluency/96/000000/squat.png', detalle: '3x12 · piernas', repeticiones: '3x12', youtube: 'https://www.youtube.com/results?search_query=sentadillas' },
            { nombre: 'Flexiones', img: 'https://img.icons8.com/fluency/96/000000/push-ups.png', detalle: '3x10 · pecho', repeticiones: '3x10', youtube: 'https://www.youtube.com/results?search_query=flexiones' },
            { nombre: 'Plancha', img: 'https://img.icons8.com/fluency/96/000000/plank.png', detalle: '3x25s · core', repeticiones: '3x25s', youtube: 'https://www.youtube.com/results?search_query=plancha' },
            { nombre: 'Zancadas', img: 'https://img.icons8.com/fluency/96/000000/lunge.png', detalle: '3x10 c/pierna', repeticiones: '3x10', youtube: 'https://www.youtube.com/results?search_query=zancadas' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Avena 50g + frutos rojos 80g + huevo 1' },
            { nombre: 'Almuerzo', detalle: 'Pollo 180g + arroz 90g + ensalada 150g' },
            { nombre: 'Merienda', detalle: 'Yogur 150g + nueces 20g' },
            { nombre: 'Cena', detalle: 'Pescado 180g + verduras 200g' }
        ]
    },
    'principiante-ganar': {
        id: 'principiante-ganar',
        nombre: '🌱 Principiante · ganar',
        precio: 20000,
        ejercicios: [
            { nombre: 'Sentadillas con peso', img: 'https://img.icons8.com/fluency/96/000000/squat.png', detalle: '4x10 · piernas', repeticiones: '4x10', youtube: 'https://www.youtube.com/results?search_query=sentadillas' },
            { nombre: 'Flexiones', img: 'https://img.icons8.com/fluency/96/000000/push-ups.png', detalle: '4x8 · pecho', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=flexiones' },
            { nombre: 'Remo con banda', img: 'https://img.icons8.com/fluency/96/000000/seated-row.png', detalle: '4x10 · espalda', repeticiones: '4x10', youtube: 'https://www.youtube.com/results?search_query=remo' },
            { nombre: 'Press hombro', img: 'https://img.icons8.com/fluency/96/000000/military-press.png', detalle: '3x10 · hombro', repeticiones: '3x10', youtube: 'https://www.youtube.com/results?search_query=press+hombro' },
            { nombre: 'Plancha', img: 'https://img.icons8.com/fluency/96/000000/plank.png', detalle: '3x30s · core', repeticiones: '3x30s', youtube: 'https://www.youtube.com/results?search_query=plancha' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Tortilla 2 huevos + tostadas 60g + aguacate 50g' },
            { nombre: 'Almuerzo', detalle: 'Carne 200g + pasta 100g + verduras 150g' },
            { nombre: 'Merienda', detalle: 'Batido proteico 30g + plátano 100g' },
            { nombre: 'Cena', detalle: 'Pollo 200g + arroz 90g + ensalada 150g' }
        ]
    },
    'avanzado-perdida': {
        id: 'avanzado-perdida',
        nombre: '🔥 Avanzado · pérdida',
        precio: 25000,
        ejercicios: [
            { nombre: 'Burpees', img: 'https://img.icons8.com/fluency/96/000000/burpee.png', detalle: '4x12 · full body', repeticiones: '4x12', youtube: 'https://www.youtube.com/results?search_query=burpees' },
            { nombre: 'Saltos tijera', img: 'https://img.icons8.com/fluency/96/000000/jumping-jack.png', detalle: '3x30 · cardio', repeticiones: '3x30', youtube: 'https://www.youtube.com/results?search_query=saltos' },
            { nombre: 'Escaladores', img: 'https://img.icons8.com/fluency/96/000000/mountain-climbing.png', detalle: '3x20 c/pierna', repeticiones: '3x20', youtube: 'https://www.youtube.com/results?search_query=escaladores' },
            { nombre: 'Sentadillas salto', img: 'https://img.icons8.com/fluency/96/000000/jump-squat.png', detalle: '3x12 · potencia', repeticiones: '3x12', youtube: 'https://www.youtube.com/results?search_query=sentadillas' },
            { nombre: 'Plancha dinámica', img: 'https://img.icons8.com/fluency/96/000000/planck.png', detalle: '3x20 toques', repeticiones: '3x20', youtube: 'https://www.youtube.com/results?search_query=plancha' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Claras 3 + espinacas 100g + café' },
            { nombre: 'Almuerzo', detalle: 'Pavo 180g + quinoa 80g + brócoli 150g' },
            { nombre: 'Merienda', detalle: 'Batido proteico 30g + fruta 80g' },
            { nombre: 'Cena', detalle: 'Salmón 180g + espárragos 150g' }
        ]
    },
    'avanzado-mantener': {
        id: 'avanzado-mantener',
        nombre: '🔥 Avanzado · mantener',
        precio: 28000,
        ejercicios: [
            { nombre: 'Flexiones diamante', img: 'https://img.icons8.com/fluency/96/000000/push-ups.png', detalle: '4x12 · tríceps', repeticiones: '4x12', youtube: 'https://www.youtube.com/results?search_query=flexiones' },
            { nombre: 'Sentadillas búlgaras', img: 'https://img.icons8.com/fluency/96/000000/squat.png', detalle: '3x12 c/pierna', repeticiones: '3x12', youtube: 'https://www.youtube.com/results?search_query=sentadillas' },
            { nombre: 'Dominadas asistidas', img: 'https://img.icons8.com/fluency/96/000000/pull-up.png', detalle: '3x8 · espalda', repeticiones: '3x8', youtube: 'https://www.youtube.com/results?search_query=dominadas' },
            { nombre: 'Press militar', img: 'https://img.icons8.com/fluency/96/000000/military-press.png', detalle: '4x10 · hombro', repeticiones: '4x10', youtube: 'https://www.youtube.com/results?search_query=press+militar' },
            { nombre: 'Plancha elevación', img: 'https://img.icons8.com/fluency/96/000000/plank.png', detalle: '3x12 · core', repeticiones: '3x12', youtube: 'https://www.youtube.com/results?search_query=plancha' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Avena 60g + clara 2 + fruta 100g' },
            { nombre: 'Almuerzo', detalle: 'Pollo 200g + arroz 100g + verduras 150g' },
            { nombre: 'Merienda', detalle: 'Yogur 150g + nueces 20g + miel 10g' },
            { nombre: 'Cena', detalle: 'Pescado 200g + patata 150g + ensalada 150g' }
        ]
    },
    'avanzado-ganar': {
        id: 'avanzado-ganar',
        nombre: '🔥 Avanzado · ganar',
        precio: 30000,
        ejercicios: [
            { nombre: 'Press banca', img: 'https://img.icons8.com/fluency/96/000000/bench-press.png', detalle: '4x8 · pecho', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=press+banca' },
            { nombre: 'Peso muerto', img: 'https://img.icons8.com/fluency/96/000000/deadlift.png', detalle: '4x6 · espalda', repeticiones: '4x6', youtube: 'https://www.youtube.com/results?search_query=peso+muerto' },
            { nombre: 'Sentadilla barra', img: 'https://img.icons8.com/fluency/96/000000/barbell-squat.png', detalle: '4x8 · piernas', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=sentadilla' },
            { nombre: 'Dominadas', img: 'https://img.icons8.com/fluency/96/000000/pull-up.png', detalle: '3x8 · espalda', repeticiones: '3x8', youtube: 'https://www.youtube.com/results?search_query=dominadas' },
            { nombre: 'Press militar', img: 'https://img.icons8.com/fluency/96/000000/military-press.png', detalle: '4x8 · hombro', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=press+militar' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Tortilla 3 huevos + tostadas 80g + aguacate 60g' },
            { nombre: 'Almuerzo', detalle: 'Carne 220g + pasta 120g + verduras 150g' },
            { nombre: 'Merienda', detalle: 'Batido proteico 40g + plátano 100g' },
            { nombre: 'Cena', detalle: 'Pollo 220g + arroz 100g + ensalada 150g' }
        ]
    },
    'experto-perdida': {
        id: 'experto-perdida',
        nombre: '💀 Experto · pérdida',
        precio: 35000,
        ejercicios: [
            { nombre: 'Burpees con peso', img: 'https://img.icons8.com/fluency/96/000000/burpee.png', detalle: '5x15 · full body', repeticiones: '5x15', youtube: 'https://www.youtube.com/results?search_query=burpees' },
            { nombre: 'Saltos cajón', img: 'https://img.icons8.com/fluency/96/000000/jumping-jack.png', detalle: '4x20 · potencia', repeticiones: '4x20', youtube: 'https://www.youtube.com/results?search_query=saltos' },
            { nombre: 'Escaladores rápidos', img: 'https://img.icons8.com/fluency/96/000000/mountain-climbing.png', detalle: '4x25 c/pierna', repeticiones: '4x25', youtube: 'https://www.youtube.com/results?search_query=escaladores' },
            { nombre: 'Sentadillas pistola', img: 'https://img.icons8.com/fluency/96/000000/squat.png', detalle: '3x10 c/pierna', repeticiones: '3x10', youtube: 'https://www.youtube.com/results?search_query=sentadillas' },
            { nombre: 'Plancha con peso', img: 'https://img.icons8.com/fluency/96/000000/plank.png', detalle: '4x45s · core', repeticiones: '4x45s', youtube: 'https://www.youtube.com/results?search_query=plancha' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Claras 4 + espinacas 120g + café' },
            { nombre: 'Almuerzo', detalle: 'Pavo 200g + quinoa 90g + brócoli 180g' },
            { nombre: 'Merienda', detalle: 'Batido proteico 30g (sin carbos)' },
            { nombre: 'Cena', detalle: 'Pescado 200g + espárragos 180g' }
        ]
    },
    'experto-mantener': {
        id: 'experto-mantener',
        nombre: '💀 Experto · mantener',
        precio: 38000,
        ejercicios: [
            { nombre: 'Dominadas con peso', img: 'https://img.icons8.com/fluency/96/000000/pull-up.png', detalle: '4x6 · espalda', repeticiones: '4x6', youtube: 'https://www.youtube.com/results?search_query=dominadas' },
            { nombre: 'Press banca inclinado', img: 'https://img.icons8.com/fluency/96/000000/bench-press.png', detalle: '4x8 · pecho', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=press+banca' },
            { nombre: 'Sentadilla frontal', img: 'https://img.icons8.com/fluency/96/000000/barbell-squat.png', detalle: '4x8 · piernas', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=sentadilla' },
            { nombre: 'Peso muerto rumano', img: 'https://img.icons8.com/fluency/96/000000/deadlift.png', detalle: '4x8 · isquios', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=peso+muerto' },
            { nombre: 'Press militar estricto', img: 'https://img.icons8.com/fluency/96/000000/military-press.png', detalle: '4x8 · hombro', repeticiones: '4x8', youtube: 'https://www.youtube.com/results?search_query=press+militar' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Tortilla 3 huevos + avena 50g + frutos secos 20g' },
            { nombre: 'Almuerzo', detalle: 'Carne 220g + pasta 120g + verduras 150g' },
            { nombre: 'Merienda', detalle: 'Batido proteico 40g + carbos 30g' },
            { nombre: 'Cena', detalle: 'Pescado 220g + arroz 100g + ensalada 150g' }
        ]
    },
    'experto-ganar': {
        id: 'experto-ganar',
        nombre: '💀 Experto · ganar',
        precio: 40000,
        ejercicios: [
            { nombre: 'Press banca pesado', img: 'https://img.icons8.com/fluency/96/000000/bench-press.png', detalle: '5x5 · pecho', repeticiones: '5x5', youtube: 'https://www.youtube.com/results?search_query=press+banca' },
            { nombre: 'Peso muerto', img: 'https://img.icons8.com/fluency/96/000000/deadlift.png', detalle: '5x5 · espalda', repeticiones: '5x5', youtube: 'https://www.youtube.com/results?search_query=peso+muerto' },
            { nombre: 'Sentadilla profunda', img: 'https://img.icons8.com/fluency/96/000000/barbell-squat.png', detalle: '5x5 · piernas', repeticiones: '5x5', youtube: 'https://www.youtube.com/results?search_query=sentadilla' },
            { nombre: 'Dominadas con lastre', img: 'https://img.icons8.com/fluency/96/000000/pull-up.png', detalle: '4x6 · espalda', repeticiones: '4x6', youtube: 'https://www.youtube.com/results?search_query=dominadas' },
            { nombre: 'Press militar sentado', img: 'https://img.icons8.com/fluency/96/000000/military-press.png', detalle: '5x5 · hombro', repeticiones: '5x5', youtube: 'https://www.youtube.com/results?search_query=press+militar' }
        ],
        comidas: [
            { nombre: 'Desayuno', detalle: 'Tortilla 4 huevos + tostadas 100g + aguacate 80g' },
            { nombre: 'Almuerzo', detalle: 'Carne 250g + pasta 150g + verduras 150g' },
            { nombre: 'Merienda', detalle: 'Batido proteico 50g + plátano 100g + avena 40g' },
            { nombre: 'Cena', detalle: 'Pollo 250g + arroz 120g + ensalada 150g' }
        ]
    }
};

/**
 * ============================================
 * STORAGE SERVICE
 * ============================================
 * Gestiona persistencia en localStorage.
 */
/*export const StorageService = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error guardando:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Error leyendo:', e);
            return defaultValue;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    }
};
*/

//NUEVO - REEMPLAZA por (con sincronización automática):
export const StorageService = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error guardando:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Error leyendo:', e);
            return defaultValue;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    // ✅ NUEVO: Guardar en localStorage Y sincronizar con Firebase
    async setConSync(key, value, campoFirebase) {
        // 1. Guardar localmente
        this.set(key, value);
        
        // 2. Sincronizar con Firebase
        if (window.db && campoFirebase) {
            try {
                await window.db.collection('gimnasio').doc('data').set({
                    [campoFirebase]: value,
                    ultimaActualizacion: new Date().toISOString()
                }, { merge: true });
                console.log(`☁️ ${campoFirebase} sincronizado con Firebase`);
                return true;
            } catch (e) {
                console.error(`❌ Error sincronizando ${campoFirebase}:`, e);
                return false;
            }
        }
        return true;
    }
};



















/**
 * ============================================
 * GENERADOR DE CLIENTES DE PRUEBA
 * ============================================
 * ⚠️ IMPORTANTE: Los clientes generados NO tienen plan.
 */
export function generarClientesPrueba(cantidad) {
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Francisca', 'Pedro', 'Pablo', 'Daniela', 'Jorge', 'Camila', 'Felipe', 'Valentina', 'Diego', 'Sofía', 'Cristian', 'Nicole', 'Matías', 'Antonia', 'Sebastián'];
    const apellidos = ['González', 'Pérez', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Morales', 'Ortiz', 'Cruz', 'Reyes', 'Gutiérrez', 'Mendoza', 'Herrera', 'Silva', 'Vargas', 'Rojas'];
    const problemas = ['Ninguno', 'Dolor lumbar', 'Dolor rodilla', 'Hombro', 'Tendinitis'];
    const estados = ['nuevo', 'activo', 'activo', 'activo'];
    const pagos = ['si', 'si', 'si', 'no', 'no', 'adeuda2'];

    const arr = [];
    for (let i = 0; i < cantidad; i++) {
        const n = nombres[Math.floor(Math.random() * nombres.length)];
        const a = apellidos[Math.floor(Math.random() * apellidos.length)];
        const rut = `${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(Math.random() * 10)}`;
        arr.push({
            rut,
            nombre: `${n} ${a}`,
            telefono: `+56 9 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
            email: `${n.toLowerCase()}.${a.toLowerCase()}${Math.floor(1 + Math.random() * 100)}@gmail.com`,
            edad: 18 + Math.floor(Math.random() * 42),
            problema: problemas[Math.floor(Math.random() * problemas.length)],
            plan: null,                    // ⚠️ SIN PLAN
            planesComprados: [],
            diasCliente: [],
            estado: estados[Math.floor(Math.random() * estados.length)],
            pago: pagos[Math.floor(Math.random() * pagos.length)],
            ultimoPago: new Date().toISOString().split('T')[0],
            boleta: null,
            pagosHistorial: []
        });
    }
    return arr;
}
