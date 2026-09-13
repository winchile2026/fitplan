/**
 * ============================================
 * UI - RECEPCIÓN
 * ============================================
 * Vistas para el rol recepcionista.
 * Similar al admin pero con permisos limitados.
 */

import { ClienteService, PagoService, HistorialService } from './services.js';
import { BASE_PLANES, StorageService } from './data.js';
import { PAGOS, STORAGE_KEYS, METODOS_PAGO } from './config.js';
import { Utils } from './utils.js';
import { UIAdmin } from './ui-admin.js';

export const URecepcion = {
    // ============================================
    // TABS DE RECEPCIÓN
    // ============================================
    tabs: [
        { id: 'dashboard', icon: 'fa-chart-simple', label: 'Dashboard' },
        { id: 'recepcion', icon: 'fa-user-plus', label: 'Clientes' },
        { id: 'horarios', icon: 'fa-clock', label: 'Horarios' },
        { id: 'entrenadores', icon: 'fa-user-tie', label: 'Entrenadores' },
        { id: 'pagos', icon: 'fa-dollar-sign', label: 'Pagos' },
        { id: 'ofertas', icon: 'fa-tags', label: 'Ofertas' },
        { id: 'pagar', icon: 'fa-credit-card', label: 'Pagar' },
        { id: 'historial', icon: 'fa-history', label: 'Historial' }
    ],

    // ============================================
    // ROUTER DE TABS
    // ============================================
    renderTab(tabId) {
        switch (tabId) {
            case 'dashboard':    this.renderDashboard();     break;
            case 'recepcion':    this.renderClientes();      break;
            case 'horarios':     this.renderHorarios();      break;
            case 'entrenadores': this.renderEntrenadores();  break;
            case 'pagos':        this.renderPagos();         break;
            case 'ofertas':      this.renderOfertas();       break;
            case 'pagar':        this.renderPagar();         break;
            case 'historial':    this.renderHistorial();     break;
        }
    },

    // ============================================
    // 1. DASHBOARD (usa el del admin)
    // ============================================
    renderDashboard() {
        UIAdmin.renderDashboard();
    },

    renderDashboardDetalle(accion) {
        UIAdmin.renderDashboardDetalle(accion);
    },

    // ============================================
    // 2. CLIENTES (con buscador y EDICIÓN)
    // ============================================
    renderClientes() {
        const cont = document.getElementById('tabContentContainer');
        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-user-plus"></i> Registrar y buscar clientes</h2>
                <p style="color:#856404;background:#fff3cd;padding:0.8rem;border-radius:12px;margin-bottom:1rem;">
                    <i class="fas fa-info-circle"></i> Los clientes <strong>NO tienen plan</strong> hasta que lo compren.
                </p>

                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                    <input type="text" id="buscarClienteRecepcion" 
                        placeholder="🔍 Buscar por RUT o nombre..." 
                        style="flex:1;padding:0.6rem 1rem;border-radius:40px;border:2px solid #dce5ed;min-width:200px;">
                    <button class="btn btn-success" id="btnBuscarRecepcion">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                    <button class="btn btn-limpiar" id="btnLimpiarBusquedaRecepcion">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>

                <form id="formNuevoClienteRecepcion" style="margin-bottom:1.5rem;">
                    <h3 style="font-size:1rem;color:#1d5a7a;margin-bottom:0.5rem;">
                        ➕ Registrar nuevo cliente (sin plan)
                    </h3>
                    <div class="form-grid">
                        <label>RUT <input type="text" id="rutNuevoR" required></label>
                        <label>Nombre <input type="text" id="nombreNuevoR" required></label>
                        <label>Teléfono <input type="text" id="telefonoNuevoR"></label>
                        <label>Email <input type="email" id="emailNuevoR"></label>
                        <label>Edad <input type="number" id="edadNuevoR" value="30"></label>
                        <label>Problema <input type="text" id="problemaNuevoR"></label>
                    </div>
                    <button type="submit" class="btn btn-success" style="margin-top:0.8rem;">
                        <i class="fas fa-save"></i> Registrar
                    </button>
                </form>

                <div class="scroll-container">
                    <table class="tabla-clientes">
                        <thead>
                            <tr>
                                <th>RUT</th><th>Nombre</th><th>Teléfono</th>
                                <th>Plan</th><th>Pago</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyClientesRecepcion"></tbody>
                    </table>
                </div>
            </div>
        `;

        this.renderTablaClientes('tbodyClientesRecepcion');

        document.getElementById('btnBuscarRecepcion').addEventListener('click', () => {
            this.renderTablaClientes('tbodyClientesRecepcion', 
                document.getElementById('buscarClienteRecepcion').value);
        });
        document.getElementById('buscarClienteRecepcion').addEventListener('keyup', e => {
            if (e.key === 'Enter') {
                this.renderTablaClientes('tbodyClientesRecepcion', e.target.value);
            }
        });
        document.getElementById('btnLimpiarBusquedaRecepcion').addEventListener('click', () => {
            document.getElementById('buscarClienteRecepcion').value = '';
            this.renderTablaClientes('tbodyClientesRecepcion');
        });

        document.getElementById('formNuevoClienteRecepcion').addEventListener('submit', e => {
            e.preventDefault();
            const rut = document.getElementById('rutNuevoR').value.trim();
            if (ClienteService.buscarPorRut(rut)) {
                alert('RUT ya existe');
                return;
            }
            ClienteService.crear({
                rut,
                nombre: document.getElementById('nombreNuevoR').value,
                telefono: document.getElementById('telefonoNuevoR').value,
                email: document.getElementById('emailNuevoR').value,
                edad: document.getElementById('edadNuevoR').value,
                problema: document.getElementById('problemaNuevoR').value
            });
            HistorialService.agregar('Nuevo', rut, document.getElementById('nombreNuevoR').value);
            this.renderTablaClientes('tbodyClientesRecepcion');
            e.target.reset();
            alert('✅ Cliente registrado SIN PLAN.');
        });
    },

    renderTablaClientes(tbodyId, filtro = '') {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        let data = ClienteService.clientes;
        if (filtro) {
            const f = filtro.toLowerCase();
            data = data.filter(c => 
                c.rut.toLowerCase().includes(f) || 
                c.nombre.toLowerCase().includes(f)
            );
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#7f8c8d;">No se encontraron clientes</td></tr>';
            return;
        }

        tbody.innerHTML = data.slice(0, 50).map(c => {
            const planNombre = c.plan && BASE_PLANES[c.plan]
                ? BASE_PLANES[c.plan].nombre
                : '<span style="color:#e74c3c;font-weight:700;">⚠️ Sin plan</span>';

            const estadoPago = c.pago === PAGOS.PAGADO ? '✅ Pagado'
                : c.pago === PAGOS.ADEUDA_1 ? '⚠️ Debe 1 mes'
                : '🚨 Debe 2 meses';

            return `
                <tr>
                    <td><strong>${c.rut}</strong></td>
                    <td>${c.nombre}</td>
                    <td>${c.telefono || '-'}</td>
                    <td>${planNombre}</td>
                    <td>${estadoPago}</td>
                    <td class="acciones">
                        <i class="fas fa-eye" data-rut="${c.rut}" data-accion="ver" 
                           style="color:#3498db;cursor:pointer;margin:0 3px;" title="Ver"></i>
                        <i class="fas fa-edit" data-rut="${c.rut}" data-accion="editar" 
                           style="color:#f39c12;cursor:pointer;margin:0 3px;" title="Editar"></i>
                        <i class="fas fa-dollar-sign" data-rut="${c.rut}" data-accion="pagar" 
                           style="color:#27ae60;cursor:pointer;margin:0 3px;" title="Pagar"></i>
                    </td>
                </tr>
            `;
        }).join('');

        // Ver
        tbody.querySelectorAll('[data-accion="ver"]').forEach(el => {
            el.addEventListener('click', () => {
                const c = ClienteService.buscarPorRut(el.dataset.rut);
                if (c) UIAdmin.abrirModalDetalleCliente(c);
            });
        });

        // ✅ Editar (usa el método del admin)
        tbody.querySelectorAll('[data-accion="editar"]').forEach(el => {
            el.addEventListener('click', () => {
                UIAdmin.abrirModalEditarCliente(el.dataset.rut);
            });
        });

        // Pagar
        tbody.querySelectorAll('[data-accion="pagar"]').forEach(el => {
            el.addEventListener('click', () => {
                UIAdmin.abrirModalPagar(el.dataset.rut);
            });
        });
    },

    // ============================================
    // 3. HORARIOS (solo lectura)
    // ============================================
    renderHorarios() {
        const cont = document.getElementById('tabContentContainer');
        const horarios = StorageService.get(STORAGE_KEYS.HORARIO, [
            { dia: 'Lunes', apertura: '06:00', cierre: '22:00' },
            { dia: 'Martes', apertura: '06:00', cierre: '22:00' },
            { dia: 'Miércoles', apertura: '06:00', cierre: '22:00' },
            { dia: 'Jueves', apertura: '06:00', cierre: '22:00' },
            { dia: 'Viernes', apertura: '06:00', cierre: '22:00' },
            { dia: 'Sábado', apertura: '08:00', cierre: '20:00' },
            { dia: 'Domingo', apertura: '08:00', cierre: '18:00' }
        ]);

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-clock"></i> Horario del gimnasio</h2>
                <p style="color:#7f8c8d;font-size:0.9rem;margin-bottom:1rem;">
                    <i class="fas fa-lock"></i> Solo lectura
                </p>
                <div class="horario-gimnasio">
                    ${horarios.map(h => `
                        <div style="display:flex;justify-content:space-between;padding:0.6rem 1rem;border-bottom:1px solid #eef4f9;">
                            <span style="font-weight:700;width:100px;">${h.dia}</span>
                            <span style="flex:1;text-align:center;">${h.apertura} - ${h.cierre}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ============================================
    // 4. ENTRENADORES (solo lectura)
    // ============================================
    renderEntrenadores() {
        const cont = document.getElementById('tabContentContainer');
        const entrenadores = StorageService.get(STORAGE_KEYS.ENTRENADORES, [
            { id: 1, nombre: 'Pedro Ramírez', especialidad: 'Musculación', horario: '08:00-12:00', precio: 25000 },
            { id: 2, nombre: 'Ana Torres', especialidad: 'CrossFit', horario: '14:00-18:00', precio: 30000 },
            { id: 3, nombre: 'Luis Fernández', especialidad: 'Yoga', horario: '10:00-14:00', precio: 20000 }
        ]);

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-user-tie"></i> Entrenadores</h2>
                <p style="color:#7f8c8d;font-size:0.9rem;margin-bottom:1rem;">
                    <i class="fas fa-lock"></i> Solo lectura
                </p>
                <div class="scroll-container">
                    <table class="tabla-clientes">
                        <thead>
                            <tr>
                                <th>Nombre</th><th>Especialidad</th>
                                <th>Horario</th><th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${entrenadores.map(e => `
                                <tr>
                                    <td>${e.nombre}</td>
                                    <td>${e.especialidad}</td>
                                    <td>${e.horario}</td>
                                    <td>${Utils.formatoMoneda(e.precio)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    // ============================================
    // 5. PAGOS
    // ============================================
    renderPagos() {
        UIAdmin.renderPagos();
    },

    // ============================================
    // 6. OFERTAS (con ver detalle + pagar en mesón)
    // ============================================
    /*renderOfertas() {
        const cont = document.getElementById('tabContentContainer');
        const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-tags"></i> Planes y Ofertas</h2>
                <p style="color:#7f8c8d;font-size:0.9rem;margin-bottom:1rem;">
                    <i class="fas fa-info-circle"></i> 
                    Haz clic en "Ver detalles" para ver ejercicios y comidas. 
                    Usa "Pagar en mesón" para cobrar al cliente.
                </p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
                    ${ofertas.map((p, i) => `
                        <div class="oferta-card">
                            <div class="plan-nombre">${p.nombre}</div>
                            <div class="precio">${Utils.formatoMoneda(p.precio)}</div>
                            <div style="font-size:0.8rem;color:#7f8c8d;">
                                ${(p.ejercicios || []).length} ejercicios · ${(p.comidas || []).length} comidas
                            </div>
                            <button class="btn-ver-detalle" data-index="${i}" data-accion="ver-detalle">
                                <i class="fas fa-eye"></i> Ver detalles
                            </button>
                                <button class="btn-comprar-plan" data-index="${i}" data-accion="pagar-meson">
                                <i class="fas fa-cash-register"></i> Pagar en mesón
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        cont.querySelectorAll('[data-accion="ver-detalle"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                UIAdmin.abrirModalDetallePlan(ofertas[i]);
            });
        });

        cont.querySelectorAll('[data-accion="pagar-meson"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                this.abrirModalPagoMeson(ofertas[i]);
            });
        });
    },

    abrirModalPagoMeson(plan) {
        const clienteRut = prompt(
            `Plan: ${plan.nombre}\nPrecio: ${Utils.formatoMoneda(plan.precio)}\n\n` +
            `Ingresa el RUT del cliente:`
        );
        if (!clienteRut) return;

        const cliente = ClienteService.buscarPorRut(clienteRut);
        if (!cliente) {
            alert('Cliente no encontrado. Regístralo primero.');
            return;
        }

        const mes = prompt('Mes a pagar:', Utils.nombreMesActual());
        if (!mes) return;

        const confirmar = confirm(
            `Cliente: ${cliente.nombre}\n` +
            `Plan: ${plan.nombre}\n` +
            `Mes: ${mes}\n` +
            `Monto: ${Utils.formatoMoneda(plan.precio)}\n\n` +
            `¿Confirmar pago?`
        );
        if (!confirmar) return;

        // Asociar plan al RUT
        ClienteService.comprarPlan(cliente.rut, plan.id);

        // Registrar pago
        PagoService.registrarPagoMes(cliente.rut, mes, plan.precio, 'Efectivo');

        HistorialService.agregar('Pago en mesón', cliente.rut, cliente.nombre, 
            `${plan.nombre} - ${mes} - ${Utils.formatoMoneda(plan.precio)}`);

        alert(`✅ Pago registrado. Plan "${plan.nombre}" asociado a ${cliente.nombre}`);
        this.renderOfertas();
    },*/
    //NUEVO
    // ============================================
// 6. OFERTAS (solo ver, sin editar)
// ============================================
renderOfertas() {
    const cont = document.getElementById('tabContentContainer');
    const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));

    cont.innerHTML = `
        <div class="card">
            <h2><i class="fas fa-tags"></i> Planes y Ofertas</h2>
            <p style="color:#7f8c8d;font-size:0.9rem;margin-bottom:1rem;">
                <i class="fas fa-lock"></i> Solo lectura · Los planes se cobran en el mesón
            </p>

            <!-- Aviso -->
            <div style="background:#e8f5e9;padding:1rem;border-radius:12px;border-left:4px solid #27ae60;margin-bottom:1rem;">
                <p style="color:#155724;font-size:0.9rem;">
                    <i class="fas fa-info-circle"></i>
                    <strong>Para cobrar a un cliente:</strong> Ingresa su RUT en la opción "Pagar" del menú lateral.
                </p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
                ${ofertas.map((p, i) => `
                    <div class="oferta-card">
                        <div class="plan-nombre">${p.nombre}</div>
                        <div class="precio">${Utils.formatoMoneda(p.precio)}</div>
                        <div style="font-size:0.8rem;color:#7f8c8d;">
                            ${(p.ejercicios || []).length} ejercicios · ${(p.comidas || []).length} comidas
                        </div>
                        <button class="btn-ver-detalle" data-index="${i}" data-accion="ver-detalle">
                            <i class="fas fa-eye"></i> Ver detalles
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    cont.querySelectorAll('[data-accion="ver-detalle"]').forEach(el => {
        el.addEventListener('click', () => {
            const i = parseInt(el.dataset.index);
            UIAdmin.abrirModalDetallePlan(ofertas[i]);
        });
    });
}

    // ============================================
    // 7. PAGAR
    // ============================================
    renderPagar() {
        UIAdmin.renderPagar();
    },

    // ============================================
    // 8. HISTORIAL
    // ============================================
    renderHistorial() {
        UIAdmin.renderHistorial();
    }
};
