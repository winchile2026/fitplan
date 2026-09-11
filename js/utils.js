/**
 * ============================================
 * UTILIDADES
 * ============================================
 * Funciones auxiliares de formateo y validación.
 */

import { MESES } from './config.js';

export const Utils = {
    /**
     * Formatea RUT chileno: 12.345.678-9
     */
    formatearRut(rut) {
        if (!rut) return '';
        const value = rut.replace(/\./g, '').replace(/-/g, '');
        if (value.length <= 1) return value;
        const cuerpo = value.slice(0, -1);
        const dv = value.slice(-1);
        let formatted = '';
        let i = cuerpo.length, j = 0;
        while (i > 0) {
            if (j === 3 && i !== cuerpo.length) { formatted = '.' + formatted; j = 0; }
            formatted = cuerpo.charAt(i - 1) + formatted;
            i--; j++;
        }
        return formatted + '-' + dv;
    },

    /**
     * Fecha actual en formato YYYY-MM-DD
     */
    fechaHoy() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Fecha y hora actual legible
     */
    fechaHoraActual() {
        return new Date().toLocaleString();
    },

    /**
     * Obtiene el mes actual (0-11)
     */
    mesActual() {
        return new Date().getMonth();
    },

    /**
     * Obtiene el nombre del mes actual
     */
    nombreMesActual() {
        return MESES[this.mesActual()];
    },

    /**
     * Valida si un string es un número válido
     */
    esNumero(valor) {
        return !isNaN(parseFloat(valor)) && isFinite(valor);
    },

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(texto) {
        if (!texto) return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    },

    /**
     * Formatea número con separador de miles
     */
    formatoMoneda(numero) {
        return '$' + (numero || 0).toLocaleString('es-CL');
    },

    /**
     * Genera un ID único
     */
    generarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
