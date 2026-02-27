// public/assets/js/app.js
const app = {
    currentModule: null,
    usuariosList: [],

    async navigateTo(module) {
        this.currentModule = module;
        const dashboard = document.querySelector('main > div:first-child');
        const contentArea = document.getElementById('contentArea');

        dashboard.style.display = 'none';
        contentArea.style.display = 'block';
        contentArea.innerHTML = '<div style="text-align:center; padding: 50px;">Cargando módulo ' + module + '...</div>';

        switch (module) {
            case 'ventas':
                this.renderVentas();
                break;
            case 'caja':
                this.renderCaja();
                break;
            case 'stock':
                this.renderStock();
                break;
            case 'reportes':
                this.renderReportes();
                break;
            case 'productos':
                this.renderProductos();
                break;
            case 'usuarios':
                this.renderUsuarios();
                break;
            case 'respaldo':
                this.renderRespaldo();
                break;
            default:
                dashboard.style.display = 'grid';
                contentArea.style.display = 'none';
        }
    },

    renderVentas() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="glass-card fade-in" style="padding: 30px;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2>🛒 Punto de Venta</h2>
                    <button onclick="app.navigateTo('home')" class="btn btn-primary" style="background: var(--secondary);">Volver</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
                    <div class="glass-card" style="padding: 20px; border-color: var(--primary);">
                        <div class="input-group">
                            <label>Buscar Producto (Nombre o Código)</label>
                            <input type="text" id="productSearch" placeholder="Presione Enter para buscar..." onkeypress="if(event.key === 'Enter') app.searchProduct()">
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                                    <th style="padding: 10px;">Producto</th>
                                    <th style="padding: 10px;">Cantidad</th>
                                    <th style="padding: 10px;">Precio</th>
                                    <th style="padding: 10px;">Subtotal</th>
                                    <th style="padding: 10px;"></th>
                                </tr>
                            </thead>
                            <tbody id="cartItems">
                                <!-- Items will be added here -->
                            </tbody>
                        </table>
                    </div>

                    <div class="glass-card" style="padding: 20px;">
                        <h3>Resumen</h3>
                        <div style="margin: 20px 0; font-size: 24px;">
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Subtotal:</span>
                                <span id="summarySubtotal">$0.00</span>
                            </div>
                            <div style="display:flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Descuento:</span>
                                <input type="number" id="discountInput" value="0" style="width: 80px; font-size: 18px; background: transparent; color: white; border: 1px solid var(--border); border-radius: 4px; text-align: right;" onchange="app.updateTotals()">
                            </div>
                            <hr style="border: 0; border-top: 1px solid var(--border); margin: 15px 0;">
                            <div style="display:flex; justify-content: space-between; color: var(--primary); font-weight: bold;">
                                <span>TOTAL:</span>
                                <span id="summaryTotal">$0.00</span>
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label>Medio de Pago</label>
                            <select id="paymentMethod" style="width:100%; padding:10px; background: var(--bg-card); color:white; border-radius:8px;">
                                <option value="efectivo">Efectivo</option>
                                <option value="debito">Débito</option>
                                <option value="credito">Crédito</option>
                                <option value="qr">QR</option>
                            </select>
                        </div>

                        <div class="input-group" style="margin-top: 20px;">
                            <label style="display: flex; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="afipCheckbox"> Solicitar Factura AFIP
                            </label>
                        </div>

                        <button onclick="app.finalizeSale()" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Finalizar Venta (F12)</button>
                    </div>
                </div>
            </div>
        `;
    },

    cart: [],

    async searchProduct() {
        const query = document.getElementById('productSearch').value;
        const response = await fetch(`api/productos.php?action=search&q=${query}`);
        const product = await response.json();

        if (product) {
            this.addToCart(product);
            document.getElementById('productSearch').value = '';
        } else {
            alert('Producto no encontrado');
        }
    },

    addToCart(product) {
        let precioUsar = 0;
        let factorStock = 1.0;
        let idPres = null;
        let presNombre = '';

        if (product.presentaciones && product.presentaciones.length > 0) {
            let opciones = "Seleccione presentación:\n0: Venta Directa\n";
            product.presentaciones.forEach((pr, i) => {
                opciones += `${i + 1}: ${pr.nombre} ($${parseFloat(pr.precio).toFixed(2)})\n`;
            });

            const eleccion = prompt(opciones, "0");
            if (eleccion === null || eleccion === "") return;

            const idx = parseInt(eleccion);
            if (idx > 0 && idx <= product.presentaciones.length) {
                const p = product.presentaciones[idx - 1];
                idPres = p.id_presentacion;
                precioUsar = parseFloat(p.precio);
                factorStock = parseFloat(p.factor_stock);
                presNombre = p.nombre;
            } else {
                // Venta directa (por kilo o unidad base)
                const esKilo = parseFloat(product.precio_kg) > 0;
                precioUsar = (parseFloat(product.precio_promo) > 0) ? parseFloat(product.precio_promo) : (esKilo ? parseFloat(product.precio_kg) : parseFloat(product.precio_unidad));
                factorStock = 1.0;
                presNombre = esKilo ? 'Kilo' : 'Unidad';
            }
        } else {
            const esKilo = parseFloat(product.precio_kg) > 0;
            precioUsar = (parseFloat(product.precio_promo) > 0) ? parseFloat(product.precio_promo) : (esKilo ? parseFloat(product.precio_kg) : parseFloat(product.precio_unidad));
            factorStock = 1.0;
            presNombre = esKilo ? 'Kilo' : 'Unidad';
        }

        const esKiloBase = parseFloat(product.precio_kg) > 0;
        const mensaje = (presNombre !== 'Kilo' && presNombre !== 'Unidad') ? `Ingrese cantidad de [${presNombre}]:` : (esKiloBase ? 'Ingrese el peso (Kilos):' : 'Ingrese la cantidad (Unidades):');
        const defaultVal = "1";

        let cantidad = prompt(mensaje, defaultVal);
        if (cantidad === null || cantidad === '' || isNaN(cantidad)) return;

        if (!product.id_producto) {
            console.error('Error: El producto no tiene ID', product);
            return alert('Error crítico: El producto seleccionado no tiene un identificador válido.');
        }

        const item = {
            id_producto: product.id_producto,
            id_presentacion: idPres,
            presentacion_nombre: presNombre,
            factor_stock: factorStock,
            nombre: product.nombre + (idPres ? ` (${presNombre})` : ''),
            precio: precioUsar,
            cantidad: parseFloat(cantidad),
            esKilo: esKiloBase
        };

        this.cart.push(item);
        this.renderCart();
    },

    updateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);
        const discount = parseFloat(document.getElementById('discountInput').value) || 0;
        const total = subtotal - discount;

        document.getElementById('summarySubtotal').innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById('summaryTotal').innerText = `$${total.toFixed(2)}`;
    },

    renderCart() {
        const tbody = document.getElementById('cartItems');
        tbody.innerHTML = this.cart.map((item, index) => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 10px;">${item.nombre}</td>
                <td style="padding: 10px;">${item.cantidad} ${item.esKilo ? 'Kg' : 'Un'}</td>
                <td style="padding: 10px;">$${parseFloat(item.precio).toFixed(2)}</td>
                <td style="padding: 10px;">$${(item.cantidad * item.precio).toFixed(2)}</td>
                <td style="padding: 10px;"><button onclick="app.removeCartItem(${index})" style="background: transparent; border: none; color: var(--accent); cursor: pointer;">❌</button></td>
            </tr>
        `).join('');
        this.updateTotals();
    },

    removeCartItem(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    async finalizeSale() {
        if (this.cart.length === 0) return alert('El carrito está vacío');

        const data = {
            items: this.cart,
            discount: parseFloat(document.getElementById('discountInput').value) || 0,
            paymentMethod: document.getElementById('paymentMethod').value,
            solicitarAfip: document.getElementById('afipCheckbox').checked
        };

        const response = await fetch('api/ventas.php?action=process', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            alert('Venta realizada con éxito');
            this.imprimirTicket(result.id_venta);
            this.cart = [];
            this.navigateTo('home');
        } else {
            alert('Error: ' + result.error);
        }
    },

    async renderCaja() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = '<div style="text-align:center; padding: 50px;">Verificando estado de caja...</div>';

        const response = await fetch('api/caja.php?action=resumen');
        const result = await response.json();

        if (result.success) {
            // CAJA ABIERTA -> Mostrar Resumen y Formulario de Cierre
            const r = result.resumen;
            contentArea.innerHTML = `
                <div class="glass-card fade-in" style="padding: 30px; max-width: 600px; margin: 0 auto;">
                    <h2>🏁 Cierre de Jornada</h2>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Caja abierta el ${new Date(r.fecha_apertura).toLocaleString()}</p>
                    
                    <div class="glass-card" style="padding: 20px; background: var(--glass); margin-bottom: 20px;">
                        <h4 style="margin-bottom: 15px;">Resumen de Movimientos</h4>
                        <div style="display:flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Monto Inicial:</span>
                            <span>$${parseFloat(r.monto_inicial).toFixed(2)}</span>
                        </div>
                        ${r.ventas_por_medio.map(v => `
                            <div style="display:flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>Ventas ${(v.medio_pago || 'Otro').toUpperCase()}:</span>
                                <span>$${parseFloat(v.total).toFixed(2)}</span>
                            </div>
                        `).join('')}
                        <hr style="border: 0; border-top: 1px solid var(--border); margin: 10px 0;">
                        <div style="display:flex; justify-content: space-between; color: var(--primary); font-weight: bold; font-size: 1.1em;">
                            <span>Efectivo Esperado:</span>
                            <span>$${parseFloat(r.efectivo_esperado).toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="input-group">
                        <label>Efectivo Real en Caja</label>
                        <input type="number" id="efectivoReal" placeholder="0.00" step="0.01">
                    </div>
                    
                    <button onclick="app.cerrarCaja()" class="btn btn-primary" style="width: 100%; height: 50px; font-size: 1.1em;">Finalizar Jornada (Cerrar Caja)</button>
                    <button onclick="app.navigateTo('home')" class="btn btn-primary" style="width: 100%; margin-top: 10px; background: var(--secondary);">Volver</button>
                </div>
            `;
        } else {
            // NO HAY CAJA -> Mostrar Apertura
            contentArea.innerHTML = `
                <div class="glass-card fade-in" style="padding: 30px; max-width: 600px; margin: 0 auto;">
                    <h2>📦 Inicio de Jornada</h2>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">Abra una nueva caja para comenzar a vender.</p>
                    <div style="margin-top: 30px;">
                        <div class="input-group">
                            <label>Monto Inicial (Efectivo)</label>
                            <input type="number" id="montoInicial" placeholder="0.00" step="0.01">
                        </div>
                        <button onclick="app.abrirCaja()" class="btn btn-primary" style="width: 100%; height: 50px; font-size: 1.1em;">Abrir Caja</button>
                        <button onclick="app.navigateTo('home')" class="btn btn-primary" style="width: 100%; margin-top: 10px; background: var(--secondary);">Volver</button>
                    </div>
                </div>
            `;
        }
    },

    async renderStock() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="glass-card fade-in" style="padding: 30px;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2>📦 Control de Stock</h2>
                    <button onclick="app.navigateTo('home')" class="btn btn-primary" style="background: var(--secondary);">Volver</button>
                </div>
                <div id="stockTableContainer">Cargando stock...</div>
            </div>
        `;
        const response = await fetch('api/productos.php?action=list');
        const productos = await response.json();

        document.getElementById('stockTableContainer').innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">Producto</th>
                        <th style="padding: 10px;">Stock Actual</th>
                        <th style="padding: 10px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${productos.map(p => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 10px;">${p.id_producto}</td>
                            <td style="padding: 10px;">${p.nombre}</td>
                            <td style="padding: 10px; font-weight: bold; color: ${(p.cantidad_actual || 0) < 5 ? 'var(--accent)' : 'var(--primary)'}">${parseFloat(p.cantidad_actual || 0).toFixed(3)} <small style="color: var(--text-muted); font-weight: normal;">${parseFloat(p.precio_kg) > 0 ? 'Kg' : 'Un'}</small></td>
                            <td style="padding: 10px;">
                                <button onclick="app.updateStockPrompt(${p.id_producto}, 'ingreso')" class="btn btn-primary" style="padding: 5px 10px; font-size: 10px;">+ Ingreso</button>
                                <button onclick="app.updateStockPrompt(${p.id_producto}, 'merma')" class="btn btn-primary" style="padding: 5px 10px; font-size: 10px; background: var(--accent);"> - Merma</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    async updateStockPrompt(id, tipo) {
        const cantidad = prompt(`Ingrese la cantidad para ${tipo}:`);
        if (cantidad === null || cantidad === '' || isNaN(cantidad)) return;

        let motivo = '';
        if (tipo === 'merma') {
            motivo = prompt('Motivo de la merma (opcional):', '');
            if (motivo === null) return; // Canceló en el segundo prompt
        }

        const response = await fetch('api/stock.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ id_producto: id, cantidad, tipo, motivo })
        });
        const result = await response.json();
        if (result.success) {
            alert('Stock actualizado');
            this.renderStock();
        } else {
            alert(result.error);
        }
    },

    async loadPresentaciones(id_producto) {
        const container = document.getElementById('presentacionesList');
        container.innerHTML = 'Cargando...';
        try {
            const res = await fetch(`api/presentaciones.php?action=list&id_producto=${id_producto}`);
            const data = await res.json();
            if (data.length === 0) {
                container.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">Sin presentaciones.</p>';
                return;
            }
            container.innerHTML = `
                <table style="width:100%; font-size:12px; border-collapse:collapse;">
                    <thead><tr style="border-bottom:1px solid var(--border);"><th>Nombre</th><th>Factor</th><th>Precio</th><th></th></tr></thead>
                    <tbody>
                        ${data.map(pr => `
                            <tr>
                                <td>${pr.nombre}</td>
                                <td>${parseFloat(pr.factor_stock).toFixed(3)}</td>
                                <td>$${parseFloat(pr.precio).toFixed(2)}</td>
                                <td><button type="button" onclick="app.deletePresentacion(${pr.id_presentacion}, ${id_producto})" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (e) {
            container.innerHTML = 'Error al cargar.';
        }
    },

    async addPresentacion() {
        const id_producto = document.getElementById('prodId').value;
        const nombre = document.getElementById('presNombre').value;
        const factor = document.getElementById('presFactor').value;
        const precio = document.getElementById('presPrecio').value;

        if (!nombre || !factor || !precio) {
            alert('Complete todos los campos de la presentación');
            return;
        }

        const res = await fetch('api/presentaciones.php?action=save', {
            method: 'POST',
            body: JSON.stringify({ id_producto, nombre, factor_stock: factor, precio })
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('presNombre').value = '';
            document.getElementById('presFactor').value = '';
            document.getElementById('presPrecio').value = '';
            this.loadPresentaciones(id_producto);
        } else {
            alert(result.error);
        }
    },

    async deletePresentacion(id, id_producto) {
        if (!confirm('¿Eliminar esta presentación?')) return;
        const res = await fetch(`api/presentaciones.php?action=delete&id=${id}`);
        const result = await res.json();
        if (result.success) {
            this.loadPresentaciones(id_producto);
        } else {
            alert('Error al eliminar');
        }
    },

    async renderReportes() {
        const contentArea = document.getElementById('contentArea');
        const now = new Date();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = now.getFullYear().toString();

        contentArea.innerHTML = `
            <div class="glass-card fade-in" style="padding: 30px;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2>📊 Centro de Reportes y Estadísticas</h2>
                    <button onclick="app.navigateTo('home')" class="btn btn-primary" style="background: var(--secondary);">Volver</button>
                </div>

                <!-- Filtros -->
                <div class="glass-card" style="padding: 15px; margin-bottom: 30px; display: flex; gap: 20px; align-items: flex-end;">
                    <div class="input-group" style="margin-bottom: 0;">
                        <label>Mes</label>
                        <select id="repoFilterMonth" style="padding: 8px; background: var(--glass); color: white; border: 1px solid var(--border); border-radius: 6px;">
                            <option value="01">Enero</option>
                            <option value="02">Febrero</option>
                            <option value="03">Marzo</option>
                            <option value="04">Abril</option>
                            <option value="05">Mayo</option>
                            <option value="06">Junio</option>
                            <option value="07">Julio</option>
                            <option value="08">Agosto</option>
                            <option value="09">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>
                    <div class="input-group" style="margin-bottom: 0;">
                        <label>Año</label>
                        <select id="repoFilterYear" style="padding: 8px; background: var(--glass); color: white; border: 1px solid var(--border); border-radius: 6px;">
                            ${[2024, 2025, 2026, 2027].map(y => `<option value="${y}">${y}</option>`).join('')}
                        </select>
                    </div>
                    <button onclick="app.refreshReportes()" class="btn btn-primary" style="height: 38px;">Actualizar</button>
                </div>
                
                <!-- KPIs -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div class="glass-card" style="padding: 20px; text-align: center; border-left: 4px solid var(--primary);">
                        <h4 style="color: var(--text-muted);">Ventas del Día (Hoy)</h4>
                        <div id="repoVentasDia" style="font-size: 28px; color: var(--primary); margin-top: 10px; font-weight: bold;">$0.00</div>
                    </div>
                    <div class="glass-card" style="padding: 20px; text-align: center; border-left: 4px solid #4ade80;">
                        <h4 id="repoVentasMesTitulo" style="color: var(--text-muted);">Ventas del Mes</h4>
                        <div id="repoVentasMes" style="font-size: 28px; color: #4ade80; margin-top: 10px; font-weight: bold;">$0.00</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <!-- Top Productos -->
                    <div class="glass-card" style="padding: 20px;">
                        <h3 style="margin-bottom: 15px;">🔥 Productos más Vendidos</h3>
                        <div id="popularProductsContainer" style="font-size: 13px;">Cargando ranking...</div>
                    </div>
                    
                    <!-- Ventas por Vendedor -->
                    <div class="glass-card" style="padding: 20px;">
                        <h3 style="margin-bottom: 15px;">👥 Ventas por Vendedor</h3>
                        <div id="sellerBreakdownContainer" style="font-size: 13px;">Cargando...</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <!-- Alert Stock -->
                    <div class="glass-card" style="padding: 20px;">
                        <h3 style="margin-bottom: 15px;">⚠️ Alertas de Stock Bajo</h3>
                        <div id="stockAlertsContainer" style="font-size: 13px;">Verificando inventario...</div>
                    </div>
                </div>

                <h3>📜 Historial de Ventas</h3>
                <div id="ventasListContainer" style="margin-top: 20px;">Cargando listado...</div>
            </div>
        `;

        document.getElementById('repoFilterMonth').value = currentMonth;
        document.getElementById('repoFilterYear').value = currentYear;

        await this.refreshReportes();
    },

    async refreshReportes() {
        const month = document.getElementById('repoFilterMonth').value;
        const year = document.getElementById('repoFilterYear').value;
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        document.getElementById('repoVentasMesTitulo').innerText = `Ventas de ${monthNames[parseInt(month) - 1]} ${year}`;
        document.getElementById('popularProductsContainer').innerHTML = 'Cargando...';
        document.getElementById('sellerBreakdownContainer').innerHTML = 'Cargando...';
        document.getElementById('ventasListContainer').innerHTML = 'Cargando...';

        try {
            const fetchRepo = async (action) => {
                const res = await fetch(`api/reportes.php?action=${action}&month=${month}&year=${year}`);
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Acción '${action}' falló (${res.status}): ${text.substring(0, 50)}...`);
                }
                return res.json();
            };

            const [daily, monthly, popular, stock, list, sellers] = await Promise.all([
                fetchRepo('daily'),
                fetchRepo('monthly'),
                fetchRepo('popular'),
                fetchRepo('stock'),
                fetchRepo('list'),
                fetchRepo('sellers')
            ]);

            document.getElementById('repoVentasDia').innerText = `$${parseFloat(daily.total || 0).toFixed(2)}`;
            document.getElementById('repoVentasMes').innerText = `$${parseFloat(monthly.total || 0).toFixed(2)}`;

            // Render Popular
            document.getElementById('popularProductsContainer').innerHTML = popular.length ? `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="border-bottom: 1px solid var(--border); text-align: left;"><th>Producto</th><th>Cant.</th><th>Total</th></tr></thead>
                    <tbody>
                        ${popular.map(p => `<tr><td style="padding:8px 0;">${p.nombre}</td><td>${parseFloat(p.cantidad_total).toFixed(2)}</td><td style="color:var(--primary);">$${parseFloat(p.monto_total).toFixed(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
            ` : 'No hay datos de ventas para este período.';

            // Render Sellers
            document.getElementById('sellerBreakdownContainer').innerHTML = sellers.length ? `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="border-bottom: 1px solid var(--border); text-align: left;"><th>Vendedor</th><th>Ventas</th><th>Total</th></tr></thead>
                    <tbody>
                        ${sellers.map(s => `<tr><td style="padding:8px 0;">${s.nombre}</td><td>${s.cant_ventas}</td><td style="color:var(--primary); font-weight:bold;">$${parseFloat(s.total_ventas || 0).toFixed(2)}</td></tr>`).join('')}
                    </tbody>
                </table>
            ` : 'No hay ventas para este período.';

            // Render Stock Alerts
            document.getElementById('stockAlertsContainer').innerHTML = stock.length ? `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="border-bottom: 1px solid var(--border); text-align: left;"><th>Producto</th><th>Stock Actual</th></tr></thead>
                    <tbody>
                        ${stock.map(s => `<tr><td style="padding:8px 0; color: #f87171;">${s.nombre}</td><td style="font-weight:bold;">${s.cantidad_actual}</td></tr>`).join('')}
                    </tbody>
                </table>
            ` : '<div style="color:#4ade80;">✅ Todo el stock está en niveles óptimos.</div>';

            // Render List
            document.getElementById('ventasListContainer').innerHTML = list.length ? `
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                            <th style="padding: 10px;">ID</th>
                            <th style="padding: 10px;">Fecha</th>
                            <th style="padding: 10px;">Vendedor</th>
                            <th style="padding: 10px;">Total</th>
                            <th style="padding: 10px;">Medio</th>
                            <th style="padding: 10px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.map(s => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">#${s.id_venta}</td>
                                <td style="padding: 10px;">${new Date(s.fecha).toLocaleString()}</td>
                                <td style="padding: 10px;">${s.vendedor}</td>
                                <td style="padding: 10px; font-weight: bold; color: var(--primary);">$${parseFloat(s.total).toFixed(2)}</td>
                                <td style="padding: 10px;"><span class="badge" style="background:var(--border); font-size:9px;">${(s.medio_pago || 'efectivo').toUpperCase()}</span></td>
                                <td style="padding: 10px;">
                                    <button onclick="app.imprimirTicket(${s.id_venta})" class="btn btn-primary" style="padding: 5px 10px; font-size: 10px;">Ticket</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No se encontraron ventas para este período.</div>';
        } catch (error) {
            console.error(error);
            document.getElementById('ventasListContainer').innerHTML = "Error al cargar los reportes: " + error.message;
        }
    },

    async renderProductos() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="glass-card fade-in" style="padding: 30px;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2>🏷️ Gestión de Productos</h2>
                    <div>
                        <button onclick="app.showProductoModal()" class="btn btn-primary">+ Nuevo Producto</button>
                        <button onclick="app.navigateTo('home')" class="btn btn-primary" style="background: var(--secondary); margin-left: 10px;">Volver</button>
                    </div>
                </div>
                <div id="productosTableContainer">Cargando productos...</div>
            </div>

            <!-- Modal -->
            <div id="productoModalOverlay" class="modal-overlay">
                <div id="productoModal" class="glass-card modal-content fade-in">
                    <div class="modal-header">
                        <h3 id="modalTitle" style="margin: 0; font-size: 1.1em;">Nuevo Producto</h3>
                    </div>
                    <form id="productoForm" style="display: contents;">
                        <div class="modal-body">
                            <input type="hidden" id="prodId">
                            <div class="input-group">
                                <label>Nombre</label>
                                <input type="text" id="prodNombre" required>
                            </div>
                            <div class="input-group">
                                <label>Categoría</label>
                                <div style="display: flex; gap: 5px;">
                                    <select id="prodCategoria" style="flex: 1; padding:8px; background: var(--glass); color:white; border: 1px solid var(--border); border-radius:6px;">
                                    </select>
                                    <button type="button" onclick="app.showCategoryModal()" class="btn btn-primary" style="padding: 5px; min-width: 35px;">+</button>
                                    <button type="button" onclick="app.showCategoryModal(true)" class="btn btn-primary" style="padding: 5px; min-width: 35px; background: var(--secondary);">✏️</button>
                                </div>
                            </div>
                            <div class="grid-2">
                                <div class="input-group">
                                    <label>Precio KG</label>
                                    <input type="number" step="0.01" id="prodPrecioKg" value="0">
                                </div>
                                <div class="input-group">
                                    <label>Precio Unitario</label>
                                    <input type="number" step="0.01" id="prodPrecioUnidad" value="0">
                                </div>
                            </div>
                            <div class="input-group">
                                <label>Código de Barras</label>
                                <input type="text" id="prodCodigo">
                            </div>

                            <div id="presentacionesSection" style="margin-top: 10px; border-top: 1px solid var(--border); padding-top: 10px; display: none;">
                                <h4 style="font-size: 0.9em; margin-bottom: 8px;">Presentaciones Adicionales</h4>
                                <div id="presentacionesList" style="margin-bottom: 10px;"></div>
                                <div style="display: flex; gap: 5px;">
                                    <input type="text" id="presNombre" placeholder="Nombre" style="flex:2; font-size: 12px;">
                                    <input type="number" step="0.001" id="presFactor" placeholder="Factor" style="flex:1; font-size: 12px;">
                                    <input type="number" step="0.01" id="presPrecio" placeholder="Precio" style="flex:1; font-size: 12px;">
                                    <button type="button" onclick="app.addPresentacion()" class="btn btn-primary" style="padding: 5px 10px;">+</button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div style="display:flex; gap: 10px;">
                                <button type="submit" class="btn btn-primary" style="flex:1;">GUARDAR</button>
                                <button type="button" onclick="app.hideProductoModal()" class="btn btn-primary" style="background: var(--accent); flex:1;">CANCELAR</button>
                            </div>
                        </div>
                    </form>
                </div>
        </div>

        <!-- Category Modal -->
        <div id="categoryModalOverlay" class="modal-overlay">
            <div id="categoryModal" class="glass-card modal-content fade-in" style="padding: 30px; max-width: 400px;">
                <h3 id="catModalTitle">Nueva Categoría</h3>
                <form id="categoryForm" style="margin-top: 20px;">
                    <input type="hidden" id="catId">
                    <div class="input-group">
                        <label>Nombre de la Categoría</label>
                        <input type="text" id="catNombre" required>
                    </div>
                    <div style="display:flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn btn-primary" style="flex:1;">Guardar</button>
                        <button type="button" onclick="app.hideCategoryModal()" class="btn btn-primary" style="background: var(--accent); flex:1;">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
        `;

        const [prodResponse, catResponse] = await Promise.all([
            fetch('api/productos.php?action=list'),
            fetch('api/productos.php?action=categories')
        ]);

        const productos = await prodResponse.json();
        const categorias = await catResponse.json();

        // Llenar select de categorías
        const catSelect = document.getElementById('prodCategoria');
        catSelect.innerHTML = categorias.map(c => `<option value="${c.id_categoria}">${c.nombre}</option>`).join('');

        document.getElementById('productosTableContainer').innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                        <th style="padding: 10px;">Nombre</th>
                        <th style="padding: 10px;">Categoría</th>
                        <th style="padding: 10px;">Precio KG</th>
                        <th style="padding: 10px;">Precio UNIDAD</th>
                        <th style="padding: 10px;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${productos.map(p => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 10px;">${p.nombre}</td>
                            <td style="padding: 10px;">${p.categoria_nombre || 'N/A'}</td>
                            <td style="padding: 10px;">$${parseFloat(p.precio_kg).toFixed(2)}</td>
                            <td style="padding: 10px; color: var(--primary); font-weight: bold;">${parseFloat(p.precio_unidad) > 0 ? '$' + parseFloat(p.precio_unidad).toFixed(2) : '-'}</td>
                            <td style="padding: 10px;">
                                <button onclick="app.showProductoModal(${JSON.stringify(p).replace(/"/g, '&quot;')})" class="btn btn-primary" style="padding: 5px 10px; font-size: 10px;">Editar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        document.getElementById('productoForm').onsubmit = (e) => {
            e.preventDefault();
            app.saveProducto();
        };

        document.getElementById('categoryForm').onsubmit = (e) => {
            e.preventDefault();
            app.saveCategory();
        };
    },

    showProductoModal(p = null) {
        document.getElementById('productoModalOverlay').style.display = 'flex';
        document.getElementById('productoModal').style.maxWidth = '600px'; // Un poco más ancho para presentaciones

        if (p) {
            document.getElementById('modalTitle').innerText = 'Editar Producto';
            document.getElementById('prodId').value = p.id_producto;
            document.getElementById('prodNombre').value = p.nombre;
            document.getElementById('prodCategoria').value = p.id_categoria;
            document.getElementById('prodPrecioKg').value = p.precio_kg;
            document.getElementById('prodPrecioUnidad').value = p.precio_unitario || p.precio_unidad || 0;
            document.getElementById('prodCodigo').value = p.codigo_barras || '';

            document.getElementById('presentacionesSection').style.display = 'block';
            this.loadPresentaciones(p.id_producto);
        } else {
            document.getElementById('modalTitle').innerText = 'Nuevo Producto';
            document.getElementById('productoForm').reset();
            document.getElementById('prodId').value = '';
            document.getElementById('presentacionesSection').style.display = 'none';
        }
    },

    hideProductoModal() {
        document.getElementById('productoModalOverlay').style.display = 'none';
    },

    async saveProducto() {
        const id = document.getElementById('prodId').value;
        const data = {
            id_producto: id,
            nombre: document.getElementById('prodNombre').value,
            id_categoria: document.getElementById('prodCategoria').value,
            precio_kg: document.getElementById('prodPrecioKg').value,
            precio_unidad: document.getElementById('prodPrecioUnidad').value,
            codigo_barras: document.getElementById('prodCodigo').value
        };

        const action = id ? 'update' : 'save';
        const response = await fetch(`api/productos.php?action=${action}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            alert('Producto guardado');
            this.hideProductoModal();
            this.renderProductos();
        } else {
            alert('Error: ' + result.error);
        }
    },

    async abrirCaja() {
        let monto = document.getElementById('montoInicial').value;
        if (monto === '') monto = 0;

        const response = await fetch('api/caja.php?action=abrir', {
            method: 'POST',
            body: JSON.stringify({ monto })
        });
        const result = await response.json();
        if (result.success) {
            alert('Caja abierta exitosamente');
            this.navigateTo('home');
        } else {
            alert(result.error);
        }
    },

    async cerrarCaja() {
        let efectivoReal = document.getElementById('efectivoReal').value;
        if (efectivoReal === '' || isNaN(efectivoReal)) return alert('Ingrese un monto válido para el efectivo real.');

        if (!confirm('¿Está seguro de cerrar la caja? Esta acción no se puede deshacer.')) return;

        const response = await fetch('api/caja.php?action=cerrar', {
            method: 'POST',
            body: JSON.stringify({ efectivo_real: efectivoReal })
        });
        const result = await response.json();
        if (result.success) {
            const res = result.resultado;
            alert(`Caja cerrada exitosamente.\n\nEfectivo Esperado: $${res.efectivo_esperado.toFixed(2)}\nEfectivo Real: $${parseFloat(efectivoReal).toFixed(2)}\nDiferencia: $${res.diferencia.toFixed(2)}`);
            this.navigateTo('home');
        } else {
            alert(result.error);
        }
    },

    async refreshCategories(selectedId = null) {
        const response = await fetch('api/productos.php?action=categories');
        const categorias = await response.json();
        const catSelect = document.getElementById('prodCategoria');
        catSelect.innerHTML = categorias.map(c => `<option value="${c.id_categoria}">${c.nombre}</option>`).join('');
        if (selectedId) catSelect.value = selectedId;
    },

    showCategoryModal(edit = false) {
        const catSelect = document.getElementById('prodCategoria');
        const modalOverlay = document.getElementById('categoryModalOverlay');
        const modalTitle = document.getElementById('catModalTitle');
        const catId = document.getElementById('catId');
        const catNombre = document.getElementById('catNombre');

        modalOverlay.style.display = 'flex';
        if (edit) {
            const id = catSelect.value;
            if (!id) return alert('Seleccione una categoría para editar');
            const nombre = catSelect.options[catSelect.selectedIndex].text;
            modalTitle.innerText = 'Editar Categoría';
            catId.value = id;
            catNombre.value = nombre;
        } else {
            modalTitle.innerText = 'Nueva Categoría';
            catId.value = '';
            catNombre.value = '';
        }
    },

    hideCategoryModal() {
        document.getElementById('categoryModalOverlay').style.display = 'none';
    },

    async saveCategory() {
        const id = document.getElementById('catId').value;
        const nombre = document.getElementById('catNombre').value;
        const action = id ? 'updateCategory' : 'saveCategory';

        const response = await fetch(`api/productos.php?action=${action}`, {
            method: 'POST',
            body: JSON.stringify({ id_categoria: id, nombre })
        });
        const result = await response.json();

        if (result.success) {
            alert('Categoría guardada');
            this.hideCategoryModal();
            await this.refreshCategories(result.id || id);
        } else {
            alert('Error: ' + result.error);
        }
    },

    async imprimirTicket(id) {
        const win = window.open('', '_blank', 'width=400,height=600');
        const response = await fetch(`api/ventas.php?action=get&id=${id}`);
        const venta = await response.json();

        win.document.write(`
            <html>
            <head>
                <title>Comprobante - Sistema de Gestión Comercial</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; width: 300px; padding: 20px; font-size: 14px; }
                    .center { text-align: center; }
                    .divider { border-top: 1px dashed #000; margin: 10px 0; }
                    .total { font-weight: bold; font-size: 18px; }
                    table { width: 100%; }
                    .footer { font-size: 10px; margin-top: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="center">
                    <h2 style="margin:0">ESTANCIA NILO</h2>
                    <p style="margin:5px 0">Carnicería & Familia</p>
                    <p>--- COMPROBANTE INTERNO ---</p>
                </div>
                <p>Nro: ${id.toString().padStart(8, '0')}</p>
                <p>Fecha: ${new Date().toLocaleString()}</p>
                <p>Vendedor: ${document.querySelector('nav strong').innerText}</p>
                <div class="divider"></div>
                <table>
                    ${venta.items.map(i => `
                        <tr><td colspan="2">${i.nombre} ${i.presentacion_nombre ? `<br><small>(${i.presentacion_nombre})</small>` : ''}</td></tr>
                        <tr>
                            <td>${parseFloat(i.cantidad).toFixed(3)} x $${parseFloat(i.precio_unitario).toFixed(2)}</td>
                            <td style="text-align:right">$${parseFloat(i.subtotal).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>
                <div class="divider"></div>
                ${venta.descuento_total > 0 ? `<p style="text-align:right">Desc: -$${parseFloat(venta.descuento_total).toFixed(2)}</p>` : ''}
                <p class="total" style="text-align:right">TOTAL: $${parseFloat(venta.total).toFixed(2)}</p>
                <div class="divider"></div>
                <div class="footer">
                    <p>Este comprobante no es válido como factura fiscal.</p>
                    <p>PRÓXIMAMENTE FACTURACIÓN ELECTRÓNICA AFIP</p>
                </div>
                <script>
                    window.onload = function() { 
                        setTimeout(() => {
                            window.print(); 
                            window.close(); 
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        win.document.close();
    },

    async renderUsuarios() {
        const contentArea = document.getElementById('contentArea');
        try {
            contentArea.innerHTML = `
                <div class="glass-card fade-in" style="padding: 30px;">
                    <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <h2>👥 Gestión de Usuarios y Permisos</h2>
                        <div>
                            <button onclick="app.showUsuarioModal()" class="btn btn-primary">+ Nuevo Usuario</button>
                            <button onclick="app.navigateTo('home')" class="btn btn-primary" style="background: var(--secondary); margin-left: 10px;">Volver</button>
                        </div>
                    </div>
                    <div id="usuariosTableContainer">Cargando usuarios...</div>
                </div>

                <!-- Modal Usuario -->
                <div id="usuarioModalOverlay" class="modal-overlay">
                    <div id="usuarioModal" class="glass-card modal-content fade-in" style="padding: 30px; max-width: 500px;">
                        <h3 id="userModalTitle">Nuevo Usuario</h3>
                        <form id="usuarioForm" style="margin-top: 20px;" onsubmit="event.preventDefault(); app.saveUsuario();">
                            <input type="hidden" id="userId">
                            <div class="input-group">
                                <label>Nombre Completo</label>
                                <input type="text" id="userName" required>
                            </div>
                            <div class="input-group">
                                <label>Usuario (Login)</label>
                                <input type="text" id="userLogin" required>
                            </div>
                            <div class="input-group">
                                <label>Contraseña (Dejar vacío para no cambiar en edición)</label>
                                <input type="password" id="userPass">
                            </div>
                            <div class="input-group">
                                <label>Rol</label>
                                <select id="userRol" style="width:100%; padding:10px; background:var(--glass); color:white; border:1px solid var(--border); border-radius:8px;">
                                    <option value="Administrador">Administrador</option>
                                    <option value="Encargado">Encargado</option>
                                    <option value="Empleado">Empleado</option>
                                </select>
                            </div>
                            
                            <div style="margin-top:20px;">
                                <h4 style="margin-bottom:10px;">Permisos Granulares</h4>
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <label style="display:flex; align-items:center; gap:10px;">
                                        <input type="checkbox" id="permVender" checked> Vender
                                    </label>
                                    <label style="display:flex; align-items:center; gap:10px;">
                                        <input type="checkbox" id="permPrecios"> Modificar Precios
                                    </label>
                                    <label style="display:flex; align-items:center; gap:10px;">
                                        <input type="checkbox" id="permReportes"> Ver Reportes
                                    </label>
                                </div>
                            </div>

                            <div style="display:flex; gap: 10px; margin-top: 30px;">
                                <button type="submit" class="btn btn-primary" style="flex:1;">Guardar Usuario</button>
                                <button type="button" onclick="app.hideUsuarioModal()" class="btn btn-primary" style="background: var(--accent); flex:1;">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            const response = await fetch('api/usuarios.php?action=list');
            const usuarios = await response.json();
            this.usuariosList = usuarios; // Guardar localmente para evitar JSON.stringify en HTML

            document.getElementById('usuariosTableContainer').innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border); text-align: left;">
                            <th style="padding: 10px;">Nombre</th>
                            <th style="padding: 10px;">Usuario</th>
                            <th style="padding: 10px;">Rol</th>
                            <th style="padding: 10px;">Permisos</th>
                            <th style="padding: 10px;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(u => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 10px;">${u.nombre}</td>
                                <td style="padding: 10px;">${u.usuario}</td>
                                <td style="padding: 10px;"><span class="badge" style="background: var(--primary); padding:2px 8px; border-radius:4px; font-size:10px;">${u.rol}</span></td>
                                <td style="padding: 10px; font-size: 11px; color: var(--text-muted);">
                                    ${u.permiso_vender == 1 ? '✅ Venta ' : ''}
                                    ${u.permiso_precios == 1 ? '✅ Precios ' : ''}
                                    ${u.permiso_reportes == 1 ? '✅ Reportes' : ''}
                                </td>
                                <td style="padding: 10px;">
                                    <button onclick="app.showUsuarioModal(${u.id_usuario})" class="btn btn-primary" style="padding: 5px 10px; font-size: 10px;">Editar</button>
                                    <button onclick="app.deleteUsuario(${u.id_usuario})" class="btn btn-primary" style="padding: 5px 10px; font-size: 10px; background: var(--accent); margin-left:5px;">Baja</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error(error);
            contentArea.innerHTML = `<div class="glass-card" style="padding:20px;">Error al cargar usuarios: ${error.message}</div>`;
        }
    },

    showUsuarioModal(id = null) {
        const overlay = document.getElementById('usuarioModalOverlay');
        const title = document.getElementById('userModalTitle');
        overlay.style.display = 'flex';

        if (id) {
            const u = this.usuariosList.find(x => x.id_usuario == id);
            title.innerText = 'Editar Usuario';
            document.getElementById('userId').value = u.id_usuario;
            document.getElementById('userName').value = u.nombre;
            document.getElementById('userLogin').value = u.usuario;
            document.getElementById('userPass').value = '';
            document.getElementById('userRol').value = u.rol;
            document.getElementById('permVender').checked = u.permiso_vender == 1;
            document.getElementById('permPrecios').checked = u.permiso_precios == 1;
            document.getElementById('permReportes').checked = u.permiso_reportes == 1;
        } else {
            title.innerText = 'Nuevo Usuario';
            document.getElementById('usuarioForm').reset();
            document.getElementById('userId').value = '';
            document.getElementById('permVender').checked = true;
            document.getElementById('permPrecios').checked = false;
            document.getElementById('permReportes').checked = false;
        }
    },

    hideUsuarioModal() {
        document.getElementById('usuarioModalOverlay').style.display = 'none';
    },

    async saveUsuario() {
        const data = {
            id_usuario: document.getElementById('userId').value,
            nombre: document.getElementById('userName').value,
            usuario: document.getElementById('userLogin').value,
            password: document.getElementById('userPass').value,
            rol: document.getElementById('userRol').value,
            permiso_vender: document.getElementById('permVender').checked,
            permiso_precios: document.getElementById('permPrecios').checked,
            permiso_reportes: document.getElementById('permReportes').checked
        };

        const action = data.id_usuario ? 'update' : 'save';
        const response = await fetch(`api/usuarios.php?action=${action}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            alert('Usuario gestionado correctamente');
            this.hideUsuarioModal();
            this.renderUsuarios();
        } else {
            alert('Error: ' + result.error);
        }
    },

    async deleteUsuario(id) {
        if (!confirm('¿Seguro que desea dar de baja a este usuario?')) return;
        const response = await fetch(`api/usuarios.php?action=delete&id=${id}`);
        const result = await response.json();
        if (result.success) {
            this.renderUsuarios();
        } else {
            alert(result.error);
        }
    },

    async renderRespaldo() {
        const contentArea = document.getElementById('contentArea');
        contentArea.innerHTML = `
            <div class="glass-card fade-in" style="padding: 30px;">
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2>💾 Respaldo y Exportación</h2>
                    <button onclick="app.navigateTo('home')" class="btn btn-primary" style="background: var(--secondary);">Volver</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div class="glass-card" style="padding: 20px;">
                        <h3>📦 Respaldo de Base de Datos (SQL)</h3>
                        <p style="color: var(--text-muted); margin: 15px 0;">Genera un archivo con toda la información del sistema (productos, ventas, usuarios).</p>
                        <button onclick="app.generateBackup()" class="btn btn-primary" id="btnGenBackup">Generar Backup Ahora</button>
                        
                        <div id="backupsListContainer" style="margin-top: 20px;">
                            <h4>Historial de Backups</h4>
                            <div id="listadoBackups" style="font-size: 13px; margin-top: 10px;">Cargando...</div>
                        </div>
                    </div>

                    <div class="glass-card" style="padding: 20px;">
                        <h3>📄 Exportar Reporte Ejecutivo (PDF)</h3>
                        <p style="color: var(--text-muted); margin: 15px 0;">Genera un documento PDF con el resumen de stock, ventas del mes y estado financiero.</p>
                        <button onclick="app.exportPDF()" class="btn btn-primary" style="background: #e11d48;">Exportar Resumen PDF</button>
                    </div>
                </div>
            </div>
        `;
        this.loadBackups();
    },

    async loadBackups() {
        const container = document.getElementById('listadoBackups');
        try {
            const response = await fetch('api/respaldo.php?action=list');
            const backups = await response.json();

            if (backups.length === 0) {
                container.innerHTML = '<p style="color: var(--text-muted);">No hay respaldos generados aún.</p>';
                return;
            }

            container.innerHTML = `
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="border-bottom: 1px solid var(--border); text-align: left;"><th>Fecha</th><th>Tamaño</th><th>Acción</th></tr></thead>
                    <tbody>
                        ${backups.map(b => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding:8px 0;">${b.date}</td>
                                <td>${b.size}</td>
                                <td>
                                    <a href="api/${b.url}" download class="btn btn-primary" style="padding: 2px 5px; font-size: 10px; text-decoration: none;">Descargar</a>
                                    <button onclick="app.deleteBackup('${b.filename}')" class="btn btn-primary" style="padding: 2px 5px; font-size: 10px; background: #ef4444; border-color: #ef4444;">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            container.innerHTML = 'Error al cargar historial.';
        }
    },

    async generateBackup() {
        const btn = document.getElementById('btnGenBackup');
        btn.disabled = true;
        btn.innerText = 'Generando...';

        try {
            const response = await fetch('api/respaldo.php?action=generate');
            const result = await response.json();
            if (result.success) {
                alert('Respaldo generado con éxito: ' + result.filename);
                this.loadBackups();
            } else {
                alert('Error: ' + result.error + '\n' + (result.details || ''));
            }
        } catch (error) {
            alert('Error de conexión al generar backup.');
        } finally {
            btn.disabled = false;
            btn.innerText = 'Generar Backup Ahora';
        }
    },

    async deleteBackup(filename) {
        if (!confirm('¿Seguro que desea eliminar este respaldo?')) return;
        try {
            const response = await fetch(`api/respaldo.php?action=delete&filename=${filename}`);
            const result = await response.json();
            if (result.success) {
                this.loadBackups();
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Error al eliminar respaldo.');
        }
    },

    async exportPDF() {
        // Obtenemos datos de reportes para el PDF
        const [daily, monthly, popular] = await Promise.all([
            fetch('api/reportes.php?action=daily').then(r => r.json()),
            fetch('api/reportes.php?action=monthly').then(r => r.json()),
            fetch('api/reportes.php?action=popular').then(r => r.json())
        ]);

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte Ejecutivo - Sistema de Gestión Comercial</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                        .kpi-container { display: flex; justify-content: space-around; margin-bottom: 40px; }
                        .kpi { text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; width: 45%; }
                        .kpi h4 { margin: 0; color: #666; text-transform: uppercase; font-size: 12px; }
                        .kpi div { font-size: 24px; font-weight: bold; margin-top: 10px; color: #1e40af; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border-bottom: 1px solid #eee; padding: 12px; text-align: left; }
                        th { background: #f9fafb; color: #374151; }
                        .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ESTANCIA NILO</h1>
                        <p>Reporte Ejecutivo de Ventas y Estado del Negocio</p>
                        <p>Fecha de Emisión: ${new Date().toLocaleString()}</p>
                    </div>

                    <div class="kpi-container">
                        <div class="kpi">
                            <h4>Ventas del Día</h4>
                            <div>$${parseFloat(daily.total || 0).toFixed(2)}</div>
                        </div>
                        <div class="kpi">
                            <h4>Ventas del Mes</h4>
                            <div>$${parseFloat(monthly.total || 0).toFixed(2)}</div>
                        </div>
                    </div>

                    <h3>🔥 Ranking de Productos más Vendidos</h3>
                    <table>
                        <thead>
                            <tr><th>Producto</th><th>Cant. Vendida</th><th>Total Generado</th></tr>
                        </thead>
                        <tbody>
                            ${popular.map(p => `
                                <tr>
                                    <td>${p.nombre}</td>
                                    <td>${parseFloat(p.cantidad_total).toFixed(2)}</td>
                                    <td>$${parseFloat(p.monto_total).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>Este documento es un resumen informativo generado por el Sistema de Gestión Comercial.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    },
}
console.log("Sistema de Gestión Comercial: Script app.js cargado correctamente.");
