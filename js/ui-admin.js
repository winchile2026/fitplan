/**
 * ============================================
 * UI - ADMINISTRADOR
 * ============================================
 * Vistas completas para el rol administrador:
 * - Dashboard con tarjetas clicables
 * - Clientes con buscador y EDICIÓN
 * - Horarios con edición/eliminación
 * - Entrenadores con edición/eliminación
 * - Ofertas con edición/eliminación + detalle
 * - Pagos (ver todos con estadísticas)
 * - Pagar (como cliente)
 * - Historial
 */

import { ClienteService, PagoService, HistorialService, AuthService } from './services.js';
import { BASE_PLANES, StorageService } from './data.js';
import { ROLES, ESTADOS, PAGOS, MESES, STORAGE_KEYS, METODOS_PAGO } from './config.js';
import { Utils } from './utils.js';

export const UIAdmin = {
    // ============================================
    // TABS DEL ADMIN
    // ============================================
    tabs: [
        { id: 'dashboard', icon: 'fa-chart-simple', label: 'Dashboard' },
        { id: 'clientes', icon: 'fa-users', label: 'Clientes' },
        { id: 'historial', icon: 'fa-history', label: 'Historial' },
        { id: 'horarios', icon: 'fa-clock', label: 'Horarios' },
        { id: 'entrenadores', icon: 'fa-user-tie', label: 'Entrenadores' },
        { id: 'pagos', icon: 'fa-dollar-sign', label: 'Pagos' },
        { id: 'ofertas', icon: 'fa-tags', label: 'Ofertas' },
        { id: 'pagar', icon: 'fa-credit-card', label: 'Pagar' }
    ],

    // ============================================
    // ROUTER DE TABS
    // ============================================
    renderTab(tabId) {
        const cont = document.getElementById('tabContentContainer');
        if (!cont) return;

        switch (tabId) {
            case 'dashboard':    this.renderDashboard();      break;
            case 'clientes':     this.renderClientes();       break;
            case 'historial':    this.renderHistorial();      break;
            case 'horarios':     this.renderHorarios();       break;
            case 'entrenadores': this.renderEntrenadores();   break;
            case 'pagos':        this.renderPagos();          break;
            case 'ofertas':      this.renderOfertas();        break;
            case 'pagar':        this.renderPagar();          break;
            default:
                cont.innerHTML = `<div class="card"><h2>${tabId}</h2><p>En desarrollo...</p></div>`;
        }
    },

    // ============================================
    // 1. DASHBOARD
    // ============================================
    renderDashboard() {
        const cont = document.getElementById('tabContentContainer');
        const total = ClienteService.clientes.length;
        const sinPlan = ClienteService.clientes.filter(c => !c.plan).length;
        const conPlan = total - sinPlan;
        const pagados = ClienteService.clientes.filter(c => c.pago === PAGOS.PAGADO).length;
        const deudores = total - pagados;

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-chart-simple"></i> Dashboard</h2>
                <p style="margin-bottom:1rem;color:#7f8c8d;font-size:0.9rem;">
                    Haz clic en cualquier tarjeta para ver el detalle.
                </p>
                <div class="dashboard-grid">
                    <div class="dashboard-card" data-accion="todos">
                        <div class="icono"><i class="fas fa-users"></i></div>
                        <div class="numero">${total}</div>
                        <div class="label">Total clientes</div>
                    </div>
                    <div class="dashboard-card" data-accion="sin-plan" style="background:#fff3cd;border-color:#f39c12;">
                        <div class="icono" style="color:#f39c12;"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="numero" style="color:#856404;">${sinPlan}</div>
                        <div class="label" style="color:#856404;">Sin plan</div>
                    </div>
                    <div class="dashboard-card" data-accion="con-plan" style="background:#d4edda;border-color:#27ae60;">
                        <div class="icono" style="color:#27ae60;"><i class="fas fa-check-circle"></i></div>
                        <div class="numero" style="color:#155724;">${conPlan}</div>
                        <div class="label" style="color:#155724;">Con plan</div>
                    </div>
                    <div class="dashboard-card" data-accion="pagados">
                        <div class="icono"><i class="fas fa-dollar-sign"></i></div>
                        <div class="numero">${pagados}</div>
                        <div class="label">Pagados</div>
                    </div>
                    <div class="dashboard-card rojo" data-accion="deudores">
                        <div class="icono"><i class="fas fa-exclamation"></i></div>
                        <div class="numero">${deudores}</div>
                        <div class="label">Deudores</div>
                    </div>
                </div>
                <div id="dashboardDetalleContainer"></div>
            </div>
        `;

        cont.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('click', () => {
                this.renderDashboardDetalle(card.dataset.accion);
            });
        });
    },

    renderDashboardDetalle(accion) {
        const cont = document.getElementById('dashboardDetalleContainer');
        if (!cont) return;

        let clientesFiltrados = [];
        let titulo = '';

        switch (accion) {
            case 'sin-plan':
                clientesFiltrados = ClienteService.clientes.filter(c => !c.plan);
                titulo = '⚠️ Clientes SIN PLAN';
                break;
            case 'con-plan':
                clientesFiltrados = ClienteService.clientes.filter(c => c.plan);
                titulo = '✅ Clientes CON PLAN';
                break;
            case 'pagados':
                clientesFiltrados = ClienteService.clientes.filter(c => c.pago === PAGOS.PAGADO);
                titulo = '💰 Clientes PAGADOS';
                break;
            case 'deudores':
                clientesFiltrados = ClienteService.clientes.filter(c => 
                    PagoService.obtenerMesesAdeudados(c).length > 0
                );
                titulo = '🚨 Clientes DEUDORES';
                break;
            default:
                clientesFiltrados = ClienteService.clientes;
                titulo = '👥 Todos los clientes';
        }

        cont.innerHTML = `
            <hr style="margin:1.5rem 0;">
            <h3 style="color:#1d5a7a;margin-bottom:1rem;">${titulo} (${clientesFiltrados.length})</h3>
            <div class="scroll-container">
                <table class="tabla-clientes">
                    <thead>
                        <tr>
                            <th>RUT</th><th>Nombre</th><th>Teléfono</th>
                            <th>Plan</th><th>Estado pago</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clientesFiltrados.slice(0, 50).map(c => this.filaDashboard(c, accion)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.conectarAccionesDashboard(cont, accion);
    },

    filaDashboard(cliente, accion) {
        const planNombre = cliente.plan && BASE_PLANES[cliente.plan]
            ? BASE_PLANES[cliente.plan].nombre
            : '<span style="color:#e74c3c;font-weight:700;">⚠️ Sin plan</span>';

        let acciones = '';
        if (accion === 'sin-plan') {
            acciones = `
                <i class="fas fa-plus-circle" data-rut="${cliente.rut}" data-accion="agregar-plan" 
                   title="Agregar y pagar plan" style="color:#27ae60;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-edit" data-rut="${cliente.rut}" data-accion="editar" 
                   title="Editar cliente" style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-eye" data-rut="${cliente.rut}" data-accion="ver" 
                   title="Ver detalle" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
            `;
        } else if (accion === 'con-plan') {
            acciones = `
                <i class="fas fa-sync-alt" data-rut="${cliente.rut}" data-accion="actualizar" 
                   title="Actualizar plan" style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-edit" data-rut="${cliente.rut}" data-accion="editar" 
                   title="Editar cliente" style="color:#e67e22;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-trash" data-rut="${cliente.rut}" data-accion="eliminar" 
                   title="Eliminar" style="color:#e74c3c;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-eye" data-rut="${cliente.rut}" data-accion="ver" 
                   title="Ver detalle" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
            `;
        } else if (accion === 'pagados') {
            acciones = `
                <i class="fas fa-eye" data-rut="${cliente.rut}" data-accion="ver-boleta" 
                   title="Ver boleta" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-print" data-rut="${cliente.rut}" data-accion="imprimir" 
                   title="Imprimir" style="color:#9b59b6;cursor:pointer;margin:0 3px;"></i>
            `;
        } else if (accion === 'deudores') {
            const meses = PagoService.obtenerMesesAdeudados(cliente);
            acciones = `
                <i class="fas fa-dollar-sign" data-rut="${cliente.rut}" data-accion="pagar-meses" 
                   title="Pagar meses atrasados (${meses.length})" style="color:#27ae60;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-edit" data-rut="${cliente.rut}" data-accion="editar" 
                   title="Editar cliente" style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-eye" data-rut="${cliente.rut}" data-accion="ver" 
                   title="Ver detalle" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
            `;
        } else {
            acciones = `
                <i class="fas fa-edit" data-rut="${cliente.rut}" data-accion="editar" 
                   title="Editar cliente" style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                <i class="fas fa-eye" data-rut="${cliente.rut}" data-accion="ver" 
                   title="Ver detalle" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
            `;
        }

        const estadoPago = cliente.pago === PAGOS.PAGADO ? '✅ Pagado'
            : cliente.pago === PAGOS.ADEUDA_1 ? '⚠️ Debe 1 mes'
            : '🚨 Debe 2 meses';

        return `
            <tr>
                <td><strong>${cliente.rut}</strong></td>
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>${planNombre}</td>
                <td>${estadoPago}</td>
                <td class="acciones">${acciones}</td>
            </tr>
        `;
    },

    conectarAccionesDashboard(cont, accion) {
        cont.querySelectorAll('[data-accion="agregar-plan"]').forEach(el => {
            el.addEventListener('click', () => this.abrirModalAgregarPlan(el.dataset.rut));
        });
        cont.querySelectorAll('[data-accion="actualizar"]').forEach(el => {
            el.addEventListener('click', () => this.abrirModalActualizarPlan(el.dataset.rut));
        });
        cont.querySelectorAll('[data-accion="pagar-meses"]').forEach(el => {
            el.addEventListener('click', () => this.abrirModalPagarMeses(el.dataset.rut));
        });
        cont.querySelectorAll('[data-accion="ver"]').forEach(el => {
            el.addEventListener('click', () => {
                const c = ClienteService.buscarPorRut(el.dataset.rut);
                if (c) this.abrirModalDetalleCliente(c);
            });
        });
        cont.querySelectorAll('[data-accion="editar"]').forEach(el => {
            el.addEventListener('click', () => {
                this.abrirModalEditarCliente(el.dataset.rut);
            });
        });
        cont.querySelectorAll('[data-accion="ver-boleta"]').forEach(el => {
            el.addEventListener('click', () => this.verBoleta(el.dataset.rut));
        });
        cont.querySelectorAll('[data-accion="imprimir"]').forEach(el => {
            el.addEventListener('click', () => this.imprimirComprobante(el.dataset.rut));
        });
        cont.querySelectorAll('[data-accion="eliminar"]').forEach(el => {
            el.addEventListener('click', () => {
                if (!confirm('¿Eliminar cliente?')) return;
                const c = ClienteService.buscarPorRut(el.dataset.rut);
                ClienteService.eliminar(c.rut);
                HistorialService.agregar('Eliminado', c.rut, c.nombre);
                this.renderDashboardDetalle(accion);
            });
        });
    },

    // ============================================
    // 2. CLIENTES (con buscador y editar)
    // ============================================
    renderClientes() {
        const cont = document.getElementById('tabContentContainer');
        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-users"></i> Clientes</h2>
                <p style="color:#856404;background:#fff3cd;padding:0.8rem;border-radius:12px;margin-bottom:1rem;">
                    <i class="fas fa-info-circle"></i> Los clientes <strong>NO tienen plan</strong> hasta que lo compren.
                </p>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                    <input type="text" id="buscarClienteAdmin" placeholder="🔍 Buscar por RUT o nombre..." 
                        style="flex:1;padding:0.6rem 1rem;border-radius:40px;border:2px solid #dce5ed;min-width:200px;">
                    <button class="btn btn-success" id="btnBuscarAdmin"><i class="fas fa-search"></i> Buscar</button>
                    <button class="btn btn-limpiar" id="btnLimpiarBusquedaAdmin"><i class="fas fa-undo"></i></button>
                </div>
                <form id="formNuevoCliente" style="margin-bottom:1.5rem;">
                    <h3 style="font-size:1rem;color:#1d5a7a;margin-bottom:0.5rem;">➕ Registrar nuevo cliente (sin plan)</h3>
                    <div class="form-grid">
                        <label>RUT <input type="text" id="rutNuevo" required></label>
                        <label>Nombre <input type="text" id="nombreNuevo" required></label>
                        <label>Teléfono <input type="text" id="telefonoNuevo"></label>
                        <label>Email <input type="email" id="emailNuevo"></label>
                        <label>Edad <input type="number" id="edadNuevo" value="30"></label>
                        <label>Problema <input type="text" id="problemaNuevo"></label>
                    </div>
                    <button type="submit" class="btn btn-success" style="margin-top:0.8rem;">
                        <i class="fas fa-save"></i> Registrar
                    </button>
                </form>
                <div class="scroll-container">
                    <table class="tabla-clientes">
                        <thead>
                            <tr><th>RUT</th><th>Nombre</th><th>Teléfono</th><th>Plan</th><th>Pago</th><th>Acciones</th></tr>
                        </thead>
                        <tbody id="tbodyClientesAdmin"></tbody>
                    </table>
                </div>
            </div>
        `;

        this.renderTablaClientes('tbodyClientesAdmin');

        document.getElementById('btnBuscarAdmin').addEventListener('click', () => {
            this.renderTablaClientes('tbodyClientesAdmin', document.getElementById('buscarClienteAdmin').value);
        });
        document.getElementById('buscarClienteAdmin').addEventListener('keyup', e => {
            if (e.key === 'Enter') this.renderTablaClientes('tbodyClientesAdmin', e.target.value);
        });
        document.getElementById('btnLimpiarBusquedaAdmin').addEventListener('click', () => {
            document.getElementById('buscarClienteAdmin').value = '';
            this.renderTablaClientes('tbodyClientesAdmin');
        });

        document.getElementById('formNuevoCliente').addEventListener('submit', e => {
            e.preventDefault();
            const rut = document.getElementById('rutNuevo').value.trim();
            if (ClienteService.buscarPorRut(rut)) { alert('RUT ya existe'); return; }
            ClienteService.crear({
                rut,
                nombre: document.getElementById('nombreNuevo').value,
                telefono: document.getElementById('telefonoNuevo').value,
                email: document.getElementById('emailNuevo').value,
                edad: document.getElementById('edadNuevo').value,
                problema: document.getElementById('problemaNuevo').value
            });
            HistorialService.agregar('Nuevo', rut, document.getElementById('nombreNuevo').value);
            this.renderTablaClientes('tbodyClientesAdmin');
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
                c.rut.toLowerCase().includes(f) || c.nombre.toLowerCase().includes(f)
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
                           title="Ver" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
                        <i class="fas fa-edit" data-rut="${c.rut}" data-accion="editar" 
                           title="Editar" style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                        <i class="fas fa-dollar-sign" data-rut="${c.rut}" data-accion="pagar" 
                           title="Pagar" style="color:#27ae60;cursor:pointer;margin:0 3px;"></i>
                        <i class="fas fa-trash" data-rut="${c.rut}" data-accion="eliminar" 
                           title="Eliminar" style="color:#e74c3c;cursor:pointer;margin:0 3px;"></i>
                    </td>
                </tr>
            `;
        }).join('');

        this.conectarAccionesTablaClientes(tbody);
    },

    conectarAccionesTablaClientes(tbody) {
        tbody.querySelectorAll('[data-accion="ver"]').forEach(el => {
            el.addEventListener('click', () => {
                const c = ClienteService.buscarPorRut(el.dataset.rut);
                if (c) this.abrirModalDetalleCliente(c);
            });
        });
        tbody.querySelectorAll('[data-accion="editar"]').forEach(el => {
            el.addEventListener('click', () => {
                this.abrirModalEditarCliente(el.dataset.rut);
            });
        });
        tbody.querySelectorAll('[data-accion="pagar"]').forEach(el => {
            el.addEventListener('click', () => this.abrirModalPagar(el.dataset.rut));
        });
        tbody.querySelectorAll('[data-accion="eliminar"]').forEach(el => {
            el.addEventListener('click', () => {
                if (!confirm('¿Eliminar cliente?')) return;
                const c = ClienteService.buscarPorRut(el.dataset.rut);
                ClienteService.eliminar(c.rut);
                HistorialService.agregar('Eliminado', c.rut, c.nombre);
                this.renderTablaClientes('tbodyClientesAdmin');
            });
        });
    },

    // ============================================
    // 3. HISTORIAL
    // ============================================
    renderHistorial() {
        const cont = document.getElementById('tabContentContainer');
        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-history"></i> Historial de cambios</h2>
                <div class="scroll-container">
                    <table class="tabla-historial">
                        <thead>
                            <tr><th>Acción</th><th>RUT</th><th>Nombre</th><th>Detalle</th><th>Fecha</th></tr>
                        </thead>
                        <tbody id="tbodyHistorial"></tbody>
                    </table>
                </div>
            </div>
        `;
        const tbody = document.getElementById('tbodyHistorial');
        const data = HistorialService.historial.slice(-100).reverse();
        tbody.innerHTML = data.map(h => `
            <tr>
                <td><strong>${h.accion}</strong></td>
                <td>${h.rut}</td>
                <td>${h.nombre}</td>
                <td>${h.detalle || '-'}</td>
                <td style="font-size:0.8rem;color:#7f8c8d;">${h.fecha}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">Sin registros</td></tr>';
    },

    // ============================================
    // 4. HORARIOS
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
                <div class="horario-gimnasio">
                    ${horarios.map((h, i) => `
                        <div style="display:flex;justify-content:space-between;padding:0.6rem 1rem;border-bottom:1px solid #eef4f9;align-items:center;">
                            <span style="font-weight:700;width:100px;">${h.dia}</span>
                            <span style="flex:1;text-align:center;">${h.apertura} - ${h.cierre}</span>
                            <span>
                                <i class="fas fa-edit" data-index="${i}" data-accion="editar-horario" 
                                   style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                                <i class="fas fa-trash" data-index="${i}" data-accion="eliminar-horario" 
                                   style="color:#e74c3c;cursor:pointer;margin:0 3px;"></i>
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        /*cont.querySelectorAll('[data-accion="editar-horario"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                const h = horarios[i];
                const ap = prompt(`Apertura de ${h.dia}:`, h.apertura);
                if (!ap) return;
                const ci = prompt(`Cierre de ${h.dia}:`, h.cierre);
                if (!ci) return;
                horarios[i].apertura = ap;
                horarios[i].cierre = ci;
                StorageService.set(STORAGE_KEYS.HORARIO, horarios);
                this.renderHorarios();
                alert('✅ Actualizado');
            });
        });*/
        //NUEVO
        cont.querySelectorAll('[data-accion="editar-horario"]').forEach(el => {
    el.addEventListener('click', () => {
        const i = parseInt(el.dataset.index);
        const h = horarios[i];
        const ap = prompt(`Apertura de ${h.dia}:`, h.apertura);
        if (!ap) return;
        const ci = prompt(`Cierre de ${h.dia}:`, h.cierre);
        if (!ci) return;
        horarios[i].apertura = ap;
        horarios[i].cierre = ci;
        StorageService.setConSync(STORAGE_KEYS.HORARIO, horarios, 'horario');  // ← CAMBIAR
        this.renderHorarios();
        alert('✅ Actualizado');
    });
});

cont.querySelectorAll('[data-accion="eliminar-horario"]').forEach(el => {
    el.addEventListener('click', () => {
        const i = parseInt(el.dataset.index);
        if (!confirm(`¿Eliminar horario de ${horarios[i].dia}?`)) return;
        horarios.splice(i, 1);
        StorageService.setConSync(STORAGE_KEYS.HORARIO, horarios, 'horario');  // ← CAMBIAR
        this.renderHorarios();
        alert('✅ Eliminado');
    });
});














        cont.querySelectorAll('[data-accion="eliminar-horario"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                if (!confirm(`¿Eliminar horario de ${horarios[i].dia}?`)) return;
                horarios.splice(i, 1);
                StorageService.set(STORAGE_KEYS.HORARIO, horarios);
                this.renderHorarios();
                alert('✅ Eliminado');
            });
        });
    },

    // ============================================
    // 5. ENTRENADORES
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
                <button class="btn btn-success" id="btnAgregarEntrenador" style="margin-bottom:1rem;">
                    <i class="fas fa-plus"></i> Agregar entrenador
                </button>
                <div class="scroll-container">
                    <table class="tabla-clientes">
                        <thead>
                            <tr><th>Nombre</th><th>Especialidad</th><th>Horario</th><th>Precio</th><th>Acciones</th></tr>
                        </thead>
                        <tbody id="tbodyEntrenadores"></tbody>
                    </table>
                </div>
            </div>
        `;

        this.renderListaEntrenadores(entrenadores, true);

        document.getElementById('btnAgregarEntrenador').addEventListener('click', () => {
            const nombre = prompt('Nombre:'); if (!nombre) return;
            const esp = prompt('Especialidad:'); if (!esp) return;
            const hor = prompt('Horario (ej: 08:00-12:00):'); if (!hor) return;
            const pre = parseInt(prompt('Precio:')); if (!pre) return;
            const id = entrenadores.length > 0 ? Math.max(...entrenadores.map(e => e.id)) + 1 : 1;
            entrenadores.push({ id, nombre, especialidad: esp, horario: hor, precio: pre });
            //StorageService.set(STORAGE_KEYS.ENTRENADORES, entrenadores);//
            //NUEVO
            StorageService.setConSync(STORAGE_KEYS.ENTRENADORES, entrenadores, 'entrenadores');
            //NUEVO

            this.renderEntrenadores();
            alert('✅ Entrenador agregado');
        });
    },

    renderListaEntrenadores(entrenadores, editable) {
        const tbody = document.getElementById('tbodyEntrenadores');
        if (!tbody) return;

        tbody.innerHTML = entrenadores.map((e, i) => `
            <tr>
                <td>${e.nombre}</td>
                <td>${e.especialidad}</td>
                <td>${e.horario}</td>
                <td>${Utils.formatoMoneda(e.precio)}</td>
                <td class="acciones">
                    ${editable ? `
                        <i class="fas fa-edit" data-index="${i}" data-accion="editar-ent" 
                           style="color:#f39c12;cursor:pointer;margin:0 3px;"></i>
                        <i class="fas fa-trash" data-index="${i}" data-accion="eliminar-ent" 
                           style="color:#e74c3c;cursor:pointer;margin:0 3px;"></i>
                    ` : '<span style="color:#95a5a6;">Solo lectura</span>'}
                </td>
            </tr>
        `).join('');

        if (editable) {
            tbody.querySelectorAll('[data-accion="editar-ent"]').forEach(el => {
                el.addEventListener('click', () => {
                    const i = parseInt(el.dataset.index);
                    const e = entrenadores[i];
                    const n = prompt('Nombre:', e.nombre); if (n) e.nombre = n;
                    const es = prompt('Especialidad:', e.especialidad); if (es) e.especialidad = es;
                    const h = prompt('Horario:', e.horario); if (h) e.horario = h;
                    const p = prompt('Precio:', e.precio); if (p) e.precio = parseInt(p);
                    //StorageService.set(STORAGE_KEYS.ENTRENADORES, entrenadores);//
                    //NUEVO
                    StorageService.setConSync(STORAGE_KEYS.ENTRENADORES, entrenadores, 'entrenadores');
                    //NUEVO

                    this.renderEntrenadores();
                    alert('✅ Actualizado');
                });
            });
            tbody.querySelectorAll('[data-accion="eliminar-ent"]').forEach(el => {
                el.addEventListener('click', () => {
                    const i = parseInt(el.dataset.index);
                    if (!confirm(`¿Eliminar a ${entrenadores[i].nombre}?`)) return;
                    entrenadores.splice(i, 1);
                    //StorageService.set(STORAGE_KEYS.ENTRENADORES, entrenadores);//
                    //NUEVO
                    StorageService.setConSync(STORAGE_KEYS.ENTRENADORES, entrenadores, 'entrenadores');
                    //NUEVO
                    
                    this.renderEntrenadores();
                    alert('✅ Eliminado');
                });
            });
        }
    },

    // ============================================
    // 6. PAGOS
    // ============================================
    renderPagos() {
        const cont = document.getElementById('tabContentContainer');
        
        const todosLosPagos = [];
        ClienteService.clientes.forEach(c => {
            (c.pagosHistorial || []).forEach(p => {
                todosLosPagos.push({
                    fecha: p.fecha,
                    rut: c.rut,
                    nombre: c.nombre,
                    mes: p.mes,
                    monto: p.monto,
                    metodo: p.metodo
                });
            });
        });

        todosLosPagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const totalRecaudado = todosLosPagos.reduce((sum, p) => sum + (p.monto || 0), 0);
        const pagosHoy = todosLosPagos.filter(p => p.fecha === Utils.fechaHoy()).length;

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-dollar-sign"></i> Registro de pagos</h2>
                <p style="color:#7f8c8d;font-size:0.9rem;margin-bottom:1rem;">
                    <i class="fas fa-info-circle"></i> Pagos registrados en el momento y de clientes por internet.
                </p>

                <div class="dashboard-grid" style="margin-bottom:1.5rem;">
                    <div class="dashboard-card">
                        <div class="icono"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="numero" style="font-size:1.5rem;">${Utils.formatoMoneda(totalRecaudado)}</div>
                        <div class="label">Total recaudado</div>
                    </div>
                    <div class="dashboard-card">
                        <div class="icono"><i class="fas fa-calendar-day"></i></div>
                        <div class="numero">${pagosHoy}</div>
                        <div class="label">Pagos hoy</div>
                    </div>
                    <div class="dashboard-card">
                        <div class="icono"><i class="fas fa-list"></i></div>
                        <div class="numero">${todosLosPagos.length}</div>
                        <div class="label">Total transacciones</div>
                    </div>
                </div>

                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                    <input type="text" id="buscarPago" placeholder="🔍 Buscar por RUT o nombre..." 
                        style="flex:1;padding:0.6rem 1rem;border-radius:40px;border:2px solid #dce5ed;min-width:200px;">
                    <button class="btn btn-success" id="btnBuscarPago"><i class="fas fa-search"></i></button>
                    <button class="btn btn-limpiar" id="btnLimpiarPago"><i class="fas fa-undo"></i></button>
                </div>

                <div class="scroll-container">
                    <table class="tabla-clientes">
                        <thead>
                            <tr>
                                <th>Fecha</th><th>RUT</th><th>Cliente</th>
                                <th>Mes</th><th>Monto</th><th>Método</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbodyPagos"></tbody>
                    </table>
                </div>
            </div>
        `;

        this.renderTablaPagos(todosLosPagos);

        document.getElementById('btnBuscarPago').addEventListener('click', () => {
            this.renderTablaPagos(todosLosPagos, document.getElementById('buscarPago').value);
        });
        document.getElementById('buscarPago').addEventListener('keyup', e => {
            if (e.key === 'Enter') this.renderTablaPagos(todosLosPagos, e.target.value);
        });
        document.getElementById('btnLimpiarPago').addEventListener('click', () => {
            document.getElementById('buscarPago').value = '';
            this.renderTablaPagos(todosLosPagos);
        });
    },

    renderTablaPagos(pagos, filtro = '') {
        const tbody = document.getElementById('tbodyPagos');
        if (!tbody) return;

        let data = pagos;
        if (filtro) {
            const f = filtro.toLowerCase();
            data = data.filter(p => 
                p.rut.toLowerCase().includes(f) || p.nombre.toLowerCase().includes(f)
            );
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#7f8c8d;">No hay pagos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = data.slice(0, 100).map(p => `
            <tr>
                <td>${p.fecha}</td>
                <td><strong>${p.rut}</strong></td>
                <td>${p.nombre}</td>
                <td>${p.mes}</td>
                <td>${Utils.formatoMoneda(p.monto)}</td>
                <td>${p.metodo}</td>
                <td class="acciones">
                    <i class="fas fa-eye" data-rut="${p.rut}" data-accion="ver-boleta" 
                       title="Ver boleta" style="color:#3498db;cursor:pointer;margin:0 3px;"></i>
                    <i class="fas fa-print" data-rut="${p.rut}" data-accion="imprimir" 
                       title="Imprimir" style="color:#9b59b6;cursor:pointer;margin:0 3px;"></i>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('[data-accion="ver-boleta"]').forEach(el => {
            el.addEventListener('click', () => this.verBoleta(el.dataset.rut));
        });
        tbody.querySelectorAll('[data-accion="imprimir"]').forEach(el => {
            el.addEventListener('click', () => this.imprimirComprobante(el.dataset.rut));
        });
    },

    // ============================================
    // 7. OFERTAS (con editar/eliminar + ver detalle)
    // ============================================
    /*renderOfertas() {
        const cont = document.getElementById('tabContentContainer');
        const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-tags"></i> Planes y Ofertas</h2>
                <button class="btn btn-success" id="btnAgregarOferta" style="margin-bottom:1rem;">
                    <i class="fas fa-plus"></i> Agregar oferta
                </button>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
                    ${ofertas.map((p, i) => `
                        <div class="oferta-card">
                            <div class="plan-nombre">${p.nombre}</div>
                            <div class="precio">${Utils.formatoMoneda(p.precio)}</div>
                            <div style="font-size:0.8rem;color:#7f8c8d;">
                                ${(p.ejercicios || []).length} ejercicios · ${(p.comidas || []).length} comidas
                            </div>
                            <button class="btn-ver-detalle" data-index="${i}" data-accion="ver-detalle">
                                <i class="fas fa-eye"></i> Ver detalles completos
                            </button>
                            <div style="display:flex;gap:0.5rem;margin-top:0.5rem;justify-content:center;">
                                <i class="fas fa-sync-alt" data-index="${i}" data-accion="editar-oferta" 
                                   style="color:#f39c12;cursor:pointer;font-size:1.2rem;" title="Actualizar"></i>
                                <i class="fas fa-trash" data-index="${i}" data-accion="eliminar-oferta" 
                                   style="color:#e74c3c;cursor:pointer;font-size:1.2rem;" title="Eliminar"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('btnAgregarOferta')?.addEventListener('click', () => {
            const nombre = prompt('Nombre del plan:'); if (!nombre) return;
            const precio = parseInt(prompt('Precio:')); if (!precio) return;
            const nuevas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));
            nuevas.push({ 
                id: 'custom-' + Date.now(), 
                nombre, precio, 
                ejercicios: [], comidas: [] 
            });
            //StorageService.set(STORAGE_KEYS.OFERTAS, nuevas);
            //NUEVO
            StorageService.setConSync(STORAGE_KEYS.OFERTAS, nuevas, 'ofertas');
            //NUEVO

            this.renderOfertas();
            alert('✅ Oferta agregada');
        });

        cont.querySelectorAll('[data-accion="ver-detalle"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                this.abrirModalDetallePlan(ofertas[i]);
            });
        });

        cont.querySelectorAll('[data-accion="editar-oferta"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                const p = ofertas[i];
                const n = prompt('Nombre:', p.nombre); if (n) p.nombre = n;
                const pr = prompt('Precio:', p.precio); if (pr) p.precio = parseInt(pr);
                
                //StorageService.set(STORAGE_KEYS.OFERTAS, ofertas);
                //NUEVO
                StorageService.setConSync(STORAGE_KEYS.OFERTAS, ofertas, 'ofertas');
                //NUEVO

                this.renderOfertas();
                alert('✅ Oferta actualizada');
            });
        });

        cont.querySelectorAll('[data-accion="eliminar-oferta"]').forEach(el => {
            el.addEventListener('click', () => {
                const i = parseInt(el.dataset.index);
                if (!confirm(`¿Eliminar "${ofertas[i].nombre}"?`)) return;
                ofertas.splice(i, 1);
                
                //StorageService.set(STORAGE_KEYS.OFERTAS, ofertas);
                //NUEVO
                StorageService.setConSync(STORAGE_KEYS.OFERTAS, ofertas, 'ofertas');
                //NUEVO

                this.renderOfertas();
                alert('✅ Oferta eliminada');
            });
        });
    },*/
    //NUEVO
    // ============================================
// 7. OFERTAS (solo admin puede editar/eliminar)
// ============================================
renderOfertas() {
    const cont = document.getElementById('tabContentContainer');
    const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));

    cont.innerHTML = `
        <div class="card">
            <h2><i class="fas fa-tags"></i> Planes y Ofertas</h2>
            <p style="color:#7f8c8d;font-size:0.9rem;margin-bottom:1rem;">
                <i class="fas fa-info-circle"></i> Solo el administrador puede modificar las ofertas.
            </p>

            <button class="btn btn-success" id="btnAgregarOferta" style="margin-bottom:1rem;">
                <i class="fas fa-plus"></i> Agregar oferta
            </button>

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
                        <div style="display:flex;gap:0.5rem;margin-top:0.5rem;justify-content:center;">
                            <i class="fas fa-sync-alt" data-index="${i}" data-accion="editar-oferta" 
                               style="color:#f39c12;cursor:pointer;font-size:1.2rem;" title="Editar"></i>
                            <i class="fas fa-trash" data-index="${i}" data-accion="eliminar-oferta" 
                               style="color:#e74c3c;cursor:pointer;font-size:1.2rem;" title="Eliminar"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Agregar oferta
    document.getElementById('btnAgregarOferta')?.addEventListener('click', () => {
        const nombre = prompt('Nombre del plan:'); if (!nombre) return;
        const precio = parseInt(prompt('Precio:')); if (!precio) return;
        const nuevas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));
        nuevas.push({ 
            id: 'custom-' + Date.now(), 
            nombre, precio, 
            ejercicios: [], comidas: [] 
        });
        StorageService.set(STORAGE_KEYS.OFERTAS, nuevas);
        this.renderOfertas();
        alert('✅ Oferta agregada');
    });

    // Ver detalle
    cont.querySelectorAll('[data-accion="ver-detalle"]').forEach(el => {
        el.addEventListener('click', () => {
            const i = parseInt(el.dataset.index);
            this.abrirModalDetallePlan(ofertas[i]);
        });
    });

    // Editar
    cont.querySelectorAll('[data-accion="editar-oferta"]').forEach(el => {
        el.addEventListener('click', () => {
            const i = parseInt(el.dataset.index);
            const p = ofertas[i];
            const n = prompt('Nombre:', p.nombre); if (n) p.nombre = n;
            const pr = prompt('Precio:', p.precio); if (pr) p.precio = parseInt(pr);
            StorageService.set(STORAGE_KEYS.OFERTAS, ofertas);
            this.renderOfertas();
            alert('✅ Oferta actualizada');
        });
    });

    // Eliminar
    cont.querySelectorAll('[data-accion="eliminar-oferta"]').forEach(el => {
        el.addEventListener('click', () => {
            const i = parseInt(el.dataset.index);
            if (!confirm(`¿Eliminar "${ofertas[i].nombre}"?`)) return;
            ofertas.splice(i, 1);
            StorageService.set(STORAGE_KEYS.OFERTAS, ofertas);
            this.renderOfertas();
            alert('✅ Oferta eliminada');
        });
    });
}
    

    // ============================================
    // MODAL DETALLE DE PLAN (reutilizable)
    // ============================================
    /*abrirModalDetallePlan(plan) {
        const modal = document.getElementById('modalPlan');
        const cont = document.getElementById('modalPlanContenido');
        if (!modal || !cont) return;

        const ejercicios = plan.ejercicios || [];
        const comidas = plan.comidas || [];

        cont.innerHTML = `
            <div class="modal-header-plan">
                <div class="icono-plan-modal">
                    <i class="fas fa-dumbbell"></i>
                </div>
                <div>
                    <h3>${plan.nombre}</h3>
                    <div class="precio-modal">${Utils.formatoMoneda(plan.precio)}</div>
                </div>
            </div>

            <h4><i class="fas fa-dumbbell"></i> Ejercicios (${ejercicios.length})</h4>
            ${ejercicios.length === 0 
                ? '<p style="color:#7f8c8d;text-align:center;padding:1rem;">Este plan no tiene ejercicios asignados</p>'
                : `
                    <div class="lista-ejercicios-modal">
                        ${ejercicios.map(ej => `
                            <div class="ejercicio-modal">
                                <img src="${ej.img}" alt="${ej.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiNlZWY0ZjkiLz48dGV4dCB4PSIyNSIgeT0iMjUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjN2Y4YzhkIj7imIU8L3RleHQ+PC9zdmc+'">
                                <div class="info-ej-modal">
                                    <span class="nombre-ej">${ej.nombre}</span>
                                    <span class="detalle-ej">${ej.detalle}</span>
                                </div>
                                <span class="repeticiones-badge">${ej.repeticiones}</span>
                                <span class="btn-youtube-modal" 
                                      onclick="window.open('${ej.youtube || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ej.nombre)}', '_blank')"
                                      title="Ver video en YouTube">
                                    <i class="fab fa-youtube"></i>
                                </span>
                            </div>
                        `).join('')}
                    </div>
                `
            }

            <h4><i class="fas fa-utensils"></i> Comidas (${comidas.length})</h4>
            ${comidas.length === 0 
                ? '<p style="color:#7f8c8d;text-align:center;padding:1rem;">Este plan no tiene comidas asignadas</p>'
                : `
                    <div class="lista-comidas-modal">
                        ${comidas.map(c => `
                            <div class="comida-modal">
                                <span class="nombre-comida">
                                    <i class="fas fa-utensils"></i> ${c.nombre}
                                </span>
                                <div class="detalle-comida">${c.detalle}</div>
                            </div>
                        `).join('')}
                    </div>
                `
            }
        `;
        modal.classList.add('active');
    },*/
    //NUEVO
    abrirModalDetallePlanCliente(plan) {
    const modal = document.getElementById('modalPlan');
    const cont = document.getElementById('modalPlanContenido');
    if (!modal || !cont) return;

    const ejercicios = plan.ejercicios || [];
    const comidas = plan.comidas || [];

    cont.innerHTML = `
        <div class="modal-header-plan">
            <div class="icono-plan-modal">
                <i class="fas fa-dumbbell"></i>
            </div>
            <div>
                <h3>${plan.nombre}</h3>
                <div class="precio-modal">${Utils.formatoMoneda(plan.precio)}</div>
            </div>
        </div>

        <h4><i class="fas fa-dumbbell"></i> Ejercicios (${ejercicios.length})</h4>
        ${ejercicios.length === 0 
            ? '<p style="color:#7f8c8d;text-align:center;padding:1rem;">Sin ejercicios</p>'
            : `
                <div class="lista-ejercicios-modal">
                    ${ejercicios.map(ej => `
                        <div class="ejercicio-modal">
                            <img src="${ej.img}" alt="${ej.nombre}" onerror="this.style.display='none'">
                            <div class="info-ej-modal">
                                <span class="nombre-ej">${ej.nombre}</span>
                                <span class="detalle-ej">${ej.detalle}</span>
                            </div>
                            <span class="repeticiones-badge">${ej.repeticiones}</span>
                            <span class="btn-youtube-modal" 
                                  onclick="window.open('${ej.youtube || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ej.nombre)}', '_blank')"
                                  title="Ver en YouTube">
                                <i class="fab fa-youtube"></i>
                            </span>
                        </div>
                    `).join('')}
                </div>
            `
        }

        <h4><i class="fas fa-utensils"></i> Comidas (${comidas.length})</h4>
        ${comidas.length === 0 
            ? '<p style="color:#7f8c8d;text-align:center;padding:1rem;">Sin comidas</p>'
            : `
                <div class="lista-comidas-modal">
                    ${comidas.map(c => `
                        <div class="comida-modal">
                            <span class="nombre-comida">
                                <i class="fas fa-utensils"></i> ${c.nombre}
                            </span>
                            <div class="detalle-comida">${c.detalle}</div>
                        </div>
                    `).join('')}
                </div>
            `
        }

        <!-- Aviso de compra en sucursal -->
        <div style="background:#fff3cd;padding:1rem;border-radius:12px;margin-top:1.5rem;border-left:4px solid #f39c12;text-align:center;">
            <p style="color:#856404;font-weight:700;margin-bottom:0.3rem;">
                <i class="fas fa-store"></i> Compra este plan en recepción
            </p>
            <p style="color:#856404;font-size:0.85rem;">
                Av. Providencia 1234, Santiago · +56 9 1234 5678
            </p>
        </div>
    `;
    modal.classList.add('active');
}

    // ============================================
    // 8. PAGAR (como cliente)
    // ============================================
    renderPagar() {
        const cont = document.getElementById('tabContentContainer');
        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-credit-card"></i> Realizar pago</h2>
                <div class="form-grid">
                    <label>Cliente:
                        <select id="selectClientePagarAdmin">
                            <option value="">-- Seleccionar --</option>
                            ${ClienteService.clientes.map(c => `
                                <option value="${c.rut}">${c.nombre} (${c.rut})</option>
                            `).join('')}
                        </select>
                    </label>
                    <label>Mes a pagar:
                        <select id="mesPagarAdmin">
                            <option value="">-- Seleccionar cliente --</option>
                        </select>
                    </label>
                    <label>Monto:
                        <input type="number" id="montoPagarAdmin" value="0">
                    </label>
                </div>

                <div style="margin:1rem 0;">
                    <label style="font-weight:700;">Método de pago:</label>
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;" id="metodosPagoAdmin">
                        ${Object.entries(METODOS_PAGO).map(([k, v]) => 
                            `<span class="metodo-pago" data-metodo="${k}">${v}</span>`
                        ).join('')}
                    </div>
                </div>

                <div id="infoClientePagoAdmin" style="margin:1rem 0;"></div>

                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="btn btn-success" id="btnConfirmarPagoAdmin">
                        <i class="fas fa-check"></i> Confirmar pago
                    </button>
                </div>
            </div>
        `;

        const selectCliente = document.getElementById('selectClientePagarAdmin');
        const selectMes = document.getElementById('mesPagarAdmin');
        const montoInput = document.getElementById('montoPagarAdmin');

        selectCliente.addEventListener('change', () => {
            const c = ClienteService.buscarPorRut(selectCliente.value);
            if (!c) {
                selectMes.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
                return;
            }
            const meses = PagoService.obtenerMesesAdeudados(c);
            const mesesMostrar = meses.length ? meses : [Utils.nombreMesActual()];
            selectMes.innerHTML = mesesMostrar.map(m => `<option value="${m}">${m}</option>`).join('');
            const planPrecio = c.plan && BASE_PLANES[c.plan] ? BASE_PLANES[c.plan].precio : 25000;
            montoInput.value = planPrecio;
            document.getElementById('infoClientePagoAdmin').innerHTML = `
                <div style="background:#eef4f9;padding:1rem;border-radius:12px;">
                    <p><strong>${c.nombre}</strong> (${c.rut})</p>
                    <p>Plan: ${c.plan && BASE_PLANES[c.plan] ? BASE_PLANES[c.plan].nombre : '⚠️ Sin plan'}</p>
                    <p>Meses adeudados: ${meses.length || 0}</p>
                </div>
            `;
        });

        document.querySelectorAll('#metodosPagoAdmin .metodo-pago').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('#metodosPagoAdmin .metodo-pago').forEach(m => m.classList.remove('seleccionado'));
                el.classList.add('seleccionado');
            });
        });

        document.getElementById('btnConfirmarPagoAdmin').addEventListener('click', () => {
            const rut = selectCliente.value;
            if (!rut) { alert('Selecciona un cliente'); return; }
            const mes = selectMes.value;
            const monto = parseFloat(montoInput.value) || 0;
            const metodoEl = document.querySelector('#metodosPagoAdmin .metodo-pago.seleccionado');
            const metodo = metodoEl ? metodoEl.dataset.metodo : 'efectivo';

            if (PagoService.registrarPagoMes(rut, mes, monto, METODOS_PAGO[metodo])) {
                const c = ClienteService.buscarPorRut(rut);
                HistorialService.agregar('Pago realizado', rut, c.nombre, 
                    `${Utils.formatoMoneda(monto)} - ${METODOS_PAGO[metodo]} - ${mes}`);
                alert('✅ Pago registrado');
                this.renderPagar();
            } else {
                alert('⚠️ Este mes ya está pagado');
            }
        });
    },

    // ============================================
    // MODALES AUXILIARES
    // ============================================
    abrirModalDetalleCliente(cliente) {
        const modal = document.getElementById('modalDetalleCliente');
        const cont = document.getElementById('modalDetalleClienteContenido');
        if (!modal || !cont) return;

        let planInfo = !cliente.plan
            ? `<div class="sin-plan-mensaje"><i class="fas fa-exclamation-triangle"></i> Este cliente <strong>NO tiene plan</strong>.</div>`
            : `<div style="background:#e8f5e9;padding:1rem;border-radius:12px;margin-bottom:1rem;">
                 <p><strong>Plan:</strong> ${BASE_PLANES[cliente.plan]?.nombre || cliente.plan}</p>
                 <p><strong>Precio:</strong> ${Utils.formatoMoneda(BASE_PLANES[cliente.plan]?.precio || 0)}</p>
               </div>`;

        cont.innerHTML = `
            <div style="background:#f8fbfe;padding:1rem;border-radius:12px;">
                <p><strong>RUT:</strong> ${cliente.rut}</p>
                <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                <p><strong>Teléfono:</strong> ${cliente.telefono || '-'}</p>
                <p><strong>Email:</strong> ${cliente.email || '-'}</p>
                <p><strong>Edad:</strong> ${cliente.edad}</p>
                <p><strong>Problema:</strong> ${cliente.problema}</p>
                <p><strong>Estado:</strong> ${cliente.estado}</p>
            </div>
            ${planInfo}
        `;
        modal.classList.add('active');
    },

    // ============================================
    // ABRIR MODAL EDITAR CLIENTE
    // ============================================
    abrirModalEditarCliente(rut) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) { alert('Cliente no encontrado'); return; }

        const modal = document.getElementById('modalEditarCliente');
        const cont = document.getElementById('modalEditarClienteContenido');
        if (!modal || !cont) return;

        cont.innerHTML = `
            <form id="formEditarCliente">
                <div class="form-grid">
                    <label>RUT
                        <input type="text" id="editRut" value="${cliente.rut}" readonly 
                               style="background:#f0f5fa;font-weight:700;">
                    </label>
                    <label>Nombre
                        <input type="text" id="editNombre" value="${cliente.nombre || ''}" required>
                    </label>
                    <label>Teléfono
                        <input type="text" id="editTelefono" value="${cliente.telefono || ''}">
                    </label>
                    <label>Email
                        <input type="email" id="editEmail" value="${cliente.email || ''}">
                    </label>
                    <label>Edad
                        <input type="number" id="editEdad" value="${cliente.edad || 30}" min="10" max="100">
                    </label>
                    <label>Problema físico
                        <input type="text" id="editProblema" value="${cliente.problema || ''}">
                    </label>
                    <label>Estado
                        <select id="editEstado">
                            <option value="activo" ${cliente.estado === 'activo' ? 'selected' : ''}>Activo</option>
                            <option value="nuevo" ${cliente.estado === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                            <option value="modificado" ${cliente.estado === 'modificado' ? 'selected' : ''}>Modificado</option>
                            <option value="reingresado" ${cliente.estado === 'reingresado' ? 'selected' : ''}>Reingresado</option>
                        </select>
                    </label>
                    <label>Estado de pago
                        <select id="editPago">
                            <option value="si" ${cliente.pago === 'si' ? 'selected' : ''}>✅ Pagado</option>
                            <option value="no" ${cliente.pago === 'no' ? 'selected' : ''}>❌ Adeuda 1 mes</option>
                            <option value="adeuda2" ${cliente.pago === 'adeuda2' ? 'selected' : ''}>⚠️ Adeuda 2 meses</option>
                        </select>
                    </label>
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:1.2rem;flex-wrap:wrap;">
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> Guardar cambios
                    </button>
                    <button type="button" class="btn btn-limpiar" 
                            onclick="document.getElementById('modalEditarCliente').classList.remove('active')">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        `;

        document.getElementById('formEditarCliente').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const cambios = {
                nombre: document.getElementById('editNombre').value.trim(),
                telefono: document.getElementById('editTelefono').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                edad: parseInt(document.getElementById('editEdad').value) || 30,
                problema: document.getElementById('editProblema').value.trim() || 'Ninguno',
                estado: document.getElementById('editEstado').value,
                pago: document.getElementById('editPago').value
            };

            const datosAntiguos = `Nombre: ${cliente.nombre}, Teléfono: ${cliente.telefono || '-'}, Email: ${cliente.email || '-'}`;
            
            ClienteService.actualizar(rut, cambios);
            HistorialService.agregar('Editado', rut, cambios.nombre, 
                `Datos anteriores: ${datosAntiguos}`);

            modal.classList.remove('active');
            alert(`✅ Cliente ${cambios.nombre} actualizado correctamente`);

            const tabActiva = document.querySelector('.tab-btn.active');
            if (tabActiva) {
                const tabId = tabActiva.dataset.tab;
                if (tabId === 'clientes' || tabId === 'recepcion') {
                    this.renderTablaClientes('tbodyClientesAdmin');
                } else if (tabId === 'dashboard') {
                    this.renderDashboard();
                }
            }
        });

        modal.classList.add('active');
    },

    abrirModalAgregarPlan(rut) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;
        const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));
        const planId = prompt(
            `Plan para ${cliente.nombre}:\n\n` +
            ofertas.map((o, i) => `${i + 1}. ${o.nombre} - ${Utils.formatoMoneda(o.precio)}`).join('\n') +
            `\n\nEscribe el número:`,
            '1'
        );
        if (!planId) return;
        const index = parseInt(planId) - 1;
        if (index < 0 || index >= ofertas.length) { alert('Opción inválida'); return; }
        const p = ofertas[index];
        ClienteService.comprarPlan(rut, p.id);
        HistorialService.agregar('Plan agregado', rut, cliente.nombre, `Plan: ${p.nombre}`);
        alert(`✅ Plan "${p.nombre}" asociado a ${cliente.nombre}`);
        this.renderDashboard();
    },

    abrirModalActualizarPlan(rut) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;
        const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));
        const planId = prompt(
            `Plan actual: ${BASE_PLANES[cliente.plan]?.nombre || cliente.plan}\n\n` +
            `Nuevo plan:\n${ofertas.map((o, i) => `${i + 1}. ${o.nombre}`).join('\n')}\n\nEscribe el número:`,
            '1'
        );
        if (!planId) return;
        const index = parseInt(planId) - 1;
        if (index < 0 || index >= ofertas.length) { alert('Opción inválida'); return; }
        const p = ofertas[index];
        ClienteService.comprarPlan(rut, p.id);
        HistorialService.agregar('Plan actualizado', rut, cliente.nombre, `Nuevo plan: ${p.nombre}`);
        alert(`✅ Plan actualizado a "${p.nombre}"`);
        this.renderDashboard();
    },

    abrirModalPagarMeses(rut) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;
        const meses = PagoService.obtenerMesesAdeudados(cliente);
        if (meses.length === 0) { alert('Sin meses adeudados'); return; }
        const precio = cliente.plan && BASE_PLANES[cliente.plan] ? BASE_PLANES[cliente.plan].precio : 25000;
        if (!confirm(`Pagar ${meses.length} meses (${meses.join(', ')})\nTotal: ${Utils.formatoMoneda(meses.length * precio)}\n\n¿Confirmar?`)) return;
        meses.forEach(m => PagoService.registrarPagoMes(rut, m, precio, 'Efectivo'));
        HistorialService.agregar('Pago regularizado', rut, cliente.nombre, `${meses.length} meses`);
        alert(`✅ ${meses.length} meses pagados`);
        this.renderDashboard();
    },

    abrirModalPagar(rut) {
        document.querySelector('.tab-btn[data-tab="pagar"]')?.click();
        setTimeout(() => {
            const s = document.getElementById('selectClientePagarAdmin');
            if (s) { s.value = rut; s.dispatchEvent(new Event('change')); }
        }, 100);
    },

    verBoleta(rut) {
        const c = ClienteService.buscarPorRut(rut);
        if (!c) return;
        const modal = document.getElementById('modalBoleta');
        const cont = document.getElementById('boletaContenido');
        if (!modal || !cont) return;
        cont.innerHTML = `
            <div style="background:#f8fbfe;padding:1rem;border-radius:12px;">
                <p><strong>Cliente:</strong> ${c.nombre}</p>
                <p><strong>RUT:</strong> ${c.rut}</p>
                <p><strong>Último pago:</strong> ${c.ultimoPago || 'No registrado'}</p>
                <p><strong>Estado:</strong> ${c.pago}</p>
                <p><strong>Pagos realizados:</strong> ${(c.pagosHistorial || []).length}</p>
                <hr style="margin:0.5rem 0;">
                <h4>Historial de pagos:</h4>
                ${(c.pagosHistorial || []).map(p => `
                    <p style="font-size:0.85rem;">📅 ${p.mes} - ${Utils.formatoMoneda(p.monto)} - ${p.metodo}</p>
                `).join('') || '<p>Sin pagos</p>'}
            </div>
        `;
        modal.classList.add('active');
    },

    imprimirComprobante(rut) {
        const c = ClienteService.buscarPorRut(rut);
        if (!c) return;
        const planNombre = c.plan && BASE_PLANES[c.plan] ? BASE_PLANES[c.plan].nombre : 'Sin plan';
        const contenido = `
            <html>
            <head><title>Comprobante - ${c.nombre}</title>
            <style>
                body { font-family: Arial; padding: 2rem; }
                h1 { color: #1d5a7a; }
                .info { background: #f8fbfe; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
            </style>
            </head>
            <body>
                <h1>💪 FitPlan Pro</h1>
                <p>Comprobante - ${new Date().toLocaleString()}</p>
                <div class="info">
                    <p><strong>RUT:</strong> ${c.rut}</p>
                    <p><strong>Nombre:</strong> ${c.nombre}</p>
                    <p><strong>Plan:</strong> ${planNombre}</p>
                    <p><strong>Estado pago:</strong> ${c.pago}</p>
                    <p><strong>Último pago:</strong> ${c.ultimoPago || 'No registrado'}</p>
                </div>
            </body>
            </html>
        `;
        const v = window.open('', '_blank');
        v.document.write(contenido);
        v.document.close();
        v.onload = () => v.print();
    }
};
