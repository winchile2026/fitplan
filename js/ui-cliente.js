/**
 * ============================================
 * UI - CLIENTE
 * ============================================
 * Vistas para el cliente:
 * - Mi plan (con pagos 12 meses, mensaje animado, ejercicios YouTube, comidas)
 * - Horarios (solo lectura)
 * - Entrenadores (solo lectura)
 * - Ofertas (seleccionar plan + ver detalle)
 * - Pagar (asociar plan al RUT)
 */

import { ClienteService, PagoService, HistorialService } from './services.js';
import { BASE_PLANES, StorageService } from './data.js';
import { PAGOS, MESES, METODOS_PAGO, STORAGE_KEYS } from './config.js';
import { Utils } from './utils.js';

export const UICliente = {
    // ============================================
    // TABS DEL CLIENTE
    // ============================================
    tabs: [
        { id: 'cliente', icon: 'fa-user', label: 'Mi plan' },
        { id: 'horarios', icon: 'fa-clock', label: 'Horarios' },
        { id: 'entrenadores', icon: 'fa-user-tie', label: 'Entrenadores' },
        { id: 'ofertas', icon: 'fa-tags', label: 'Ofertas' },
        { id: 'pagar', icon: 'fa-credit-card', label: 'Pagar', clase: 'pagar-cliente' }
    ],

    ofertaSeleccionadaTemp: null,

    // ============================================
    // ROUTER DE TABS
    // ============================================
    renderTab(tabId, rut) {
        switch (tabId) {
            case 'cliente':      this.renderMiPlan(rut);      break;
            case 'horarios':     this.renderHorarios();       break;
            case 'entrenadores': this.renderEntrenadores();   break;
            case 'ofertas':      this.renderOfertas();        break;
            case 'pagar':        this.renderPagar(rut);       break;
        }
    },

    // ============================================
    // 1. MI PLAN (con ejercicios + YouTube + comidas)
    // ============================================
    renderMiPlan(rut) {
        const cont = document.getElementById('tabContentContainer');
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;

        const primerNombre = cliente.nombre.split(' ')[0];
        
        // Frases poderosas aleatorias
        const frasesPoderosas = [
            'El dolor que sientes hoy será la fuerza que sentirás mañana.',
            'No cuentes los días, haz que los días cuenten.',
            'La disciplina es el puente entre tus metas y tus logros.',
            'Cada repetición te acerca un paso más a tu mejor versión.',
            'Tu único límite eres tú mismo. ¡Rómpelo!',
            'El éxito no es casualidad, es constancia disfrazada de suerte.',
            'Hoy es un buen día para ser imparable.',
            'No te detengas hasta que estés orgulloso de ti.',
            'Los campeones se hacen cuando nadie está mirando.',
            'Suda ahora, brilla después.'
        ];
        
        const fraseAleatoria = frasesPoderosas[Math.floor(Math.random() * frasesPoderosas.length)];
        
        const mensajeAnimo = `
            <div class="mensaje-animo">
                <div class="particulas">
                    <span>✨</span>
                    <span>🔥</span>
                    <span>💪</span>
                    <span>⭐</span>
                    <span>🏆</span>
                </div>
                <span class="emoji">🔥</span>
                <h3>¡VAMOS ${primerNombre.toUpperCase()}! 💪</h3>
                <div class="frase-poderosa">${fraseAleatoria}</div>
                <p class="sub-frase">⚡ Hoy es el día perfecto para superarte. ¡Tú puedes, campeón! ⚡</p>
            </div>
        `;

        const pagosHtml = this.renderPagos12Meses(cliente);

        // ========================================
        // SIN PLAN
        // ========================================
        if (!cliente.plan) {
            cont.innerHTML = `
                ${mensajeAnimo}
                <div class="card">
                    <h2><i class="fas fa-user"></i> Mi plan</h2>
                    <div class="sin-plan-mensaje">
                        <h3><i class="fas fa-info-circle"></i> Aún no tienes un plan</h3>
                        <p>Ve a <strong>Ofertas</strong> y compra el plan que prefieras.</p>
                        <button class="btn btn-success" id="btnIrOfertas" style="margin-top:1rem;">
                            <i class="fas fa-tags"></i> Ver Ofertas
                        </button>
                    </div>
                    <div style="margin-top:1.5rem;">
                        <h3 style="color:#1d5a7a;margin-bottom:0.5rem;">
                            <i class="fas fa-dollar-sign"></i> Mis pagos (12 meses)
                        </h3>
                        ${pagosHtml}
                    </div>
                </div>
            `;
            document.getElementById('btnIrOfertas')?.addEventListener('click', () => {
                document.querySelector('.tab-btn[data-tab="ofertas"]')?.click();
            });
            this.conectarPagosCliente(rut);
            return;
        }

        // ========================================
        // CON PLAN
        // ========================================
        const plan = BASE_PLANES[cliente.plan] || 
                     StorageService.get(STORAGE_KEYS.OFERTAS, []).find(p => p.id === cliente.plan);
        if (!plan) {
            cont.innerHTML = `${mensajeAnimo}<div class="card"><p>Plan no encontrado</p></div>`;
            return;
        }

        // Ejercicios con repeticiones y link YouTube
        const ejerciciosHtml = (plan.ejercicios || []).map(ej => `
            <div class="ejercicio-item" 
                 onclick="window.open('${ej.youtube || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ej.nombre)}', '_blank')"
                 title="Clic para ver el ejercicio en YouTube">
                <img src="${ej.img}" alt="${ej.nombre}" onerror="this.src='https://via.placeholder.com/50'">
                <div class="ejercicio-info">
                    <strong>${ej.nombre}</strong>
                    <span class="detalle-ej">${ej.detalle}</span>
                </div>
                <span class="repeticion-grande">${ej.repeticiones}</span>
                <span class="btn-youtube-grande" title="Ver en YouTube">
                    <i class="fab fa-youtube"></i>
                </span>
            </div>
        `).join('');

        // Comidas con gramos
        const comidasHtml = (plan.comidas || []).map(c => `
            <div class="comida-cliente">
                <div class="nombre-comida">
                    <i class="fas fa-utensils"></i> ${c.nombre}
                </div>
                <div class="detalle-comida">${c.detalle}</div>
            </div>
        `).join('');

        cont.innerHTML = `
            ${mensajeAnimo}

            <div class="card">
                <h2>
                    <i class="fas fa-user"></i> Mi plan
                    <span style="background:#e67e22;color:white;padding:0.2rem 1rem;border-radius:60px;font-size:0.75rem;font-weight:700;margin-left:0.5rem;">
                        ${plan.nombre}
                    </span>
                </h2>

                <div style="background:#e8f5e9;padding:1rem;border-radius:12px;margin-bottom:1rem;border-left:4px solid #27ae60;">
                    <h3 style="color:#1e5a3a;">${plan.nombre}</h3>
                    <p style="color:#27ae60;font-weight:700;font-size:1.2rem;">
                        ${Utils.formatoMoneda(plan.precio)}/mes
                    </p>
                </div>

                <!-- PAGOS 12 MESES -->
                <div style="margin:1.5rem 0;">
                    <h3 style="color:#1d5a7a;margin-bottom:0.5rem;">
                        <i class="fas fa-dollar-sign"></i> Mis pagos (12 meses)
                        <span style="font-size:0.75rem;color:#7f8c8d;font-weight:400;">
                            - Haz clic en un mes rojo para pagar, verde para ver boleta
                        </span>
                    </h3>
                    ${pagosHtml}
                </div>

                <!-- EJERCICIOS -->
                <h3 style="color:#1d5a7a;margin-top:1.5rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <i class="fas fa-dumbbell"></i> Mis ejercicios
                    <span style="font-size:0.7rem;color:#7f8c8d;font-weight:400;">
                        (Clic en cualquier ejercicio para ver el video en YouTube)
                    </span>
                </h3>
                ${ejerciciosHtml || '<p style="color:#7f8c8d;">Sin ejercicios asignados</p>'}

                <!-- COMIDAS -->
                <h3 style="color:#1d5a7a;margin-top:1.5rem;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <i class="fas fa-utensils"></i> Mis comidas
                    <span style="font-size:0.7rem;color:#7f8c8d;font-weight:400;">
                        (Cantidades en gramos por comida)
                    </span>
                </h3>
                <div class="comidas-cliente-grid">
                    ${comidasHtml || '<p style="color:#7f8c8d;">Sin comidas asignadas</p>'}
                </div>
            </div>
        `;

        this.conectarPagosCliente(rut);
    },

    // ============================================
    // PAGOS 12 MESES
    // ============================================
    renderPagos12Meses(cliente) {
        const mesActual = Utils.mesActual();
        const mesesAdeudados = PagoService.obtenerMesesAdeudados(cliente);

        return `
            <div class="pagos-cliente">
                ${MESES.map((mes, index) => {
                    const pagoRegistrado = (cliente.pagosHistorial || [])
                        .find(p => p.mes === mes);
                    
                    let clase = '';
                    let estado = '';
                    let alerta = false;

                    if (pagoRegistrado) {
                        clase = 'pagado';
                        estado = '✅ Pagado';
                        if (pagoRegistrado.pagadoAtrasado) {
                            estado = '✅ Regularizado';
                        }
                    } else if (index > mesActual) {
                        clase = '';
                        estado = '⏳ Pendiente';
                    } else if (mesesAdeudados.includes(mes)) {
                        clase = 'no-pagado';
                        estado = '🔴 ATRASADO';
                        alerta = true;
                    } else {
                        clase = 'pagado';
                        estado = '✅ Pagado';
                    }

                    return `
                        <div class="pago-card ${clase}" 
                             data-mes="${mes}" 
                             data-pago="${pagoRegistrado ? 'si' : (alerta ? 'no' : 'si')}"
                             data-atrasado="${alerta}"
                             style="${alerta || pagoRegistrado ? 'cursor:pointer;' : ''}">
                            <div class="mes">${mes}</div>
                            <div class="estado-pago">${estado}</div>
                            ${alerta ? '<div style="color:#e74c3c;font-weight:700;font-size:0.7rem;">🔴 ¡Clic para pagar!</div>' : ''}
                            ${pagoRegistrado ? '<div style="color:#3498db;font-weight:700;font-size:0.7rem;">👁️ Ver boleta</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ============================================
    // CONECTAR CLICS DE PAGOS
    // ============================================
    conectarPagosCliente(rut) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;

        document.querySelectorAll('.pago-card').forEach(el => {
            el.addEventListener('click', () => {
                const mes = el.dataset.mes;
                const atrasado = el.dataset.atrasado === 'true';
                const clase = el.classList;

                // ✅ Si el mes está PAGADO (VERDE) → abrir boleta
                if (clase.contains('pagado')) {
                    this.abrirModalBoletaCliente(rut, mes);
                    return;
                }

                // ✅ Si el mes está ATRASADO (ROJO) → ir a pagar
                if (atrasado) {
                    document.querySelector('.tab-btn[data-tab="pagar"]')?.click();
                    setTimeout(() => {
                        const select = document.getElementById('mesPagar');
                        if (select) select.value = mes;
                        alert(`Mes "${mes}" seleccionado. Confirma el pago.`);
                    }, 200);
                }
            });
        });
    },

    // ============================================
    // MODAL BOLETA DEL CLIENTE
    // ============================================
    abrirModalBoletaCliente(rut, mes) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;

        const modal = document.getElementById('modalBoletaCliente');
        const cont = document.getElementById('modalBoletaClienteContenido');
        if (!modal || !cont) return;

        const pago = (cliente.pagosHistorial || []).find(p => p.mes === mes);
        if (!pago) {
            alert(`No se encontró el pago del mes "${mes}"`);
            return;
        }

        const planNombre = cliente.plan && BASE_PLANES[cliente.plan]
            ? BASE_PLANES[cliente.plan].nombre : 'Sin plan';

        cont.innerHTML = `
            <div class="boleta-header">
                <div class="icono-pago">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡PAGO CONFIRMADO!</h3>
                <p style="color:#7f8c8d;font-size:0.9rem;margin-top:0.3rem;">
                    Comprobante de pago FitPlan Pro
                </p>
            </div>

            <div class="boleta-info">
                <p><strong>Cliente:</strong> <span>${cliente.nombre}</span></p>
                <p><strong>RUT:</strong> <span>${cliente.rut}</span></p>
                <p><strong>Plan:</strong> <span>${planNombre}</span></p>
                <p><strong>Mes pagado:</strong> <span>${pago.mes}</span></p>
                <p><strong>Fecha de pago:</strong> <span>${pago.fecha || 'No registrada'}</span></p>
                <p><strong>Método:</strong> <span>${pago.metodo || 'Efectivo'}</span></p>
                ${pago.pagadoAtrasado ? 
                    '<p style="color:#27ae60;font-weight:700;"><strong>Estado:</strong> <span>✅ Regularizado</span></p>' : 
                    '<p style="color:#27ae60;font-weight:700;"><strong>Estado:</strong> <span>✅ Pagado al día</span></p>'}
            </div>

            <div class="boleta-total">
                💰 Total: ${Utils.formatoMoneda(pago.monto || 0)}
            </div>

            <div class="boleta-footer">
                <p>📄 Gracias por tu pago puntual</p>
                <p>FitPlan Pro · ${new Date().toLocaleString()}</p>
            </div>

            <div style="display:flex;gap:0.5rem;margin-top:1rem;flex-wrap:wrap;justify-content:center;">
                <button class="btn btn-success" onclick="window.print()">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn btn-limpiar" 
                        onclick="document.getElementById('modalBoletaCliente').classList.remove('active')">
                    <i class="fas fa-times"></i> Cerrar
                </button>
            </div>
        `;
        modal.classList.add('active');
    },

    // ============================================
    // 2. HORARIOS (solo lectura)
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
    // 3. ENTRENADORES (solo lectura)
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
                <div class="scroll-container">
                    <table class="tabla-clientes">
                        <thead>
                            <tr><th>Nombre</th><th>Especialidad</th><th>Horario</th><th>Precio</th></tr>
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
    // 4. OFERTAS (con ver detalle + comprar)
    // ============================================
    renderOfertas() {
        const cont = document.getElementById('tabContentContainer');
        const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-tags"></i> Ofertas</h2>
                <p>Selecciona un plan para ver sus detalles o comprarlo.</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
                    ${ofertas.map(p => `
                        <div class="oferta-card">
                            <div class="plan-nombre">${p.nombre}</div>
                            <div class="precio">${Utils.formatoMoneda(p.precio)}</div>
                            <div style="font-size:0.8rem;color:#7f8c8d;">
                                ${(p.ejercicios || []).length} ejercicios · ${(p.comidas || []).length} comidas
                            </div>
                            <button class="btn-ver-detalle" data-plan-id="${p.id}" data-accion="ver-detalle">
                                <i class="fas fa-eye"></i> Ver ejercicios y comidas
                            </button>
                            <button class="btn-comprar-plan" data-plan-id="${p.id}" data-accion="comprar">
                                <i class="fas fa-shopping-cart"></i> Comprar Plan
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        cont.querySelectorAll('[data-accion="ver-detalle"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const planId = btn.dataset.planId;
                const plan = ofertas.find(p => p.id === planId) || BASE_PLANES[planId];
                if (plan) this.abrirModalDetallePlanCliente(plan);
            });
        });

        cont.querySelectorAll('[data-accion="comprar"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.seleccionarPlan(btn.dataset.planId);
            });
        });
    },

    // ============================================
    // MODAL DETALLE PLAN (para cliente)
    // ============================================
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
                                <img src="${ej.img}" alt="${ej.nombre}" onerror="this.src='https://via.placeholder.com/50'">
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

            <button class="btn-comprar-plan" 
                    onclick="document.getElementById('modalPlan').classList.remove('active'); document.querySelector('[data-accion=\\'comprar\\'][data-plan-id=\\'${plan.id}\\']')?.click()"
                    style="margin-top:1.5rem;width:100%;padding:0.8rem;font-size:1rem;">
                <i class="fas fa-shopping-cart"></i> Comprar este plan
            </button>
        `;
        modal.classList.add('active');
    },

    // ============================================
    // SELECCIONAR PLAN
    // ============================================
    seleccionarPlan(planId) {
        const ofertas = StorageService.get(STORAGE_KEYS.OFERTAS, Object.values(BASE_PLANES));
        const plan = ofertas.find(p => p.id === planId) || BASE_PLANES[planId];
        if (!plan) { alert('Plan no encontrado'); return; }

        this.ofertaSeleccionadaTemp = {
            id: plan.id,
            nombre: plan.nombre,
            precio: plan.precio
        };

        document.querySelector('.tab-btn[data-tab="pagar"]')?.click();
        alert(`Plan "${plan.nombre}" seleccionado. Procede con el pago.`);
    },

    // ============================================
    // 5. PAGAR
    // ============================================
    renderPagar(rut) {
        const cont = document.getElementById('tabContentContainer');
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;

        const ofertaTemp = this.ofertaSeleccionadaTemp;

        const campoVerde = ofertaTemp ? `
            <div class="campo-plan-seleccionado visible">
                <div class="icono-plan"><i class="fas fa-clipboard-check"></i></div>
                <div class="info-plan">
                    <div class="label-plan">🎯 Plan seleccionado en Ofertas</div>
                    <div class="nombre-plan">${ofertaTemp.nombre}</div>
                    <div class="precio-plan">${Utils.formatoMoneda(ofertaTemp.precio)}</div>
                </div>
            </div>
        ` : '';

        const campoAzul = cliente.plan ? `
            <div class="campo-plan-actual visible">
                <div class="header-plan-actual">
                    <div class="icono-plan-actual"><i class="fas fa-list-check"></i></div>
                    <div class="titulo-plan-actual">📋 Plan Actual</div>
                </div>
                <div class="plan-item-cliente">
                    <div class="plan-numero">1</div>
                    <div class="plan-info-item">
                        <div class="plan-nombre-item">${BASE_PLANES[cliente.plan] ? BASE_PLANES[cliente.plan].nombre : cliente.plan} ⭐ ACTUAL</div>
                    </div>
                    <div class="plan-precio-item">${BASE_PLANES[cliente.plan] ? Utils.formatoMoneda(BASE_PLANES[cliente.plan].precio) : '-'}</div>
                </div>
            </div>
        ` : '';

        const mesesAdeudados = PagoService.obtenerMesesAdeudados(cliente);
        const mesesMostrar = mesesAdeudados.length ? mesesAdeudados : [Utils.nombreMesActual()];

        cont.innerHTML = `
            <div class="card">
                <h2><i class="fas fa-credit-card"></i> Realizar pago</h2>
                ${campoVerde}
                ${campoAzul}

                <div class="form-grid" style="margin-top:1rem;">
                    <label>Plan a comprar:
                        <input type="text" id="planAComprar" readonly 
                            value="${ofertaTemp ? ofertaTemp.nombre : 'Sin plan seleccionado'}" 
                            style="font-weight:700;">
                    </label>
                    <label>Mes a pagar:
                        <select id="mesPagar">
                            ${mesesMostrar.map(m => `<option value="${m}">${m}</option>`).join('')}
                        </select>
                    </label>
                    <label>Monto:
                        <input type="number" id="montoPagar" 
                            value="${ofertaTemp ? ofertaTemp.precio : 0}">
                    </label>
                </div>

                <div style="margin:1rem 0;">
                    <label style="font-weight:700;">Método de pago:</label>
                    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;" id="metodosPagoCliente">
                        ${Object.entries(METODOS_PAGO).map(([k, v]) => 
                            `<span class="metodo-pago" data-metodo="${k}">${v}</span>`
                        ).join('')}
                    </div>
                </div>

                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <button class="btn btn-success" id="btnConfirmarPagoCliente">
                        <i class="fas fa-check"></i> Confirmar pago
                    </button>
                    <button class="btn btn-limpiar" id="btnLimpiarPagoCliente">
                        <i class="fas fa-eraser"></i> Limpiar
                    </button>
                </div>
            </div>
        `;

        this.conectarPagar(rut);
    },

    // ============================================
    // CONECTAR EVENTOS PAGAR
    // ============================================
    conectarPagar(rut) {
        document.querySelectorAll('#metodosPagoCliente .metodo-pago').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('#metodosPagoCliente .metodo-pago').forEach(m => m.classList.remove('seleccionado'));
                el.classList.add('seleccionado');
            });
        });

        document.getElementById('btnConfirmarPagoCliente')?.addEventListener('click', () => {
            this.confirmarPago(rut);
        });

        document.getElementById('btnLimpiarPagoCliente')?.addEventListener('click', () => {
            this.limpiarPago(rut);
        });
    },

    // ============================================
    // CONFIRMAR PAGO
    // ============================================
    confirmarPago(rut) {
        const cliente = ClienteService.buscarPorRut(rut);
        if (!cliente) return;

        const monto = parseFloat(document.getElementById('montoPagar').value) || 0;
        if (monto <= 0) { alert('Monto inválido'); return; }

        const mes = document.getElementById('mesPagar').value;
        const metodoEl = document.querySelector('#metodosPagoCliente .metodo-pago.seleccionado');
        const metodo = metodoEl ? metodoEl.dataset.metodo : 'efectivo';

        // Asociar plan al RUT si hay oferta
        const teniaOferta = !!this.ofertaSeleccionadaTemp;
        if (this.ofertaSeleccionadaTemp) {
            ClienteService.comprarPlan(rut, this.ofertaSeleccionadaTemp.id);
            HistorialService.agregar('Plan comprado', rut, cliente.nombre, 
                `Plan: ${this.ofertaSeleccionadaTemp.nombre}`);
        }

        // Registrar pago
        const exitoso = PagoService.registrarPagoMes(rut, mes, monto, METODOS_PAGO[metodo]);
        
        if (!exitoso) {
            alert('⚠️ Este mes ya está pagado');
            return;
        }

        HistorialService.agregar('Pago realizado', rut, cliente.nombre, 
            `${Utils.formatoMoneda(monto)} - ${METODOS_PAGO[metodo]} - ${mes}`);

        this.ofertaSeleccionadaTemp = null;

        alert(`✅ Pago confirmado${teniaOferta ? '. Plan asociado a tu RUT.' : '.'}`);
        
        this.renderMiPlan(rut);
        document.querySelector('.tab-btn[data-tab="cliente"]')?.click();
    },

    // ============================================
    // LIMPIAR PAGO
    // ============================================
    limpiarPago(rut) {
        this.ofertaSeleccionadaTemp = null;
        this.renderPagar(rut);
    }
};
