// Sistema POS - Aplicación completamente funcional
class POSSystem {
    // Eliminar producto
    deleteProduct(productId) {
        let productos = this.getData('productos');
        productos = productos.filter(p => p.id !== productId);
        this.setData('productos', productos);
        this.updateProductos();
        // Si está en el modal de categoría, actualizar también
        if (this._formType === null) {
            const categorias = this.getData('categorias');
            const categoria = categorias.find(c => c.id === (productos.find(p => p.id === productId)?.categoriaId));
            if (categoria) this.showCategoryProducts(categoria.id);
        }
    }
    constructor() {
        this.currentClient = null;
        this.isGuestMode = false;
        this.cart = [];
        this.currentCategory = null;
        this.currentPage = 0;
        this.itemsPerPage = 16;
        this.currentView = 'categories';
        this.editingItem = null;
        this.isBlocked = false;
        this.searchMode = false;
        this.confirmCallback = null;

        // Inicializar datos de ejemplo si no existen
        this.initializeDefaultData();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Mostrar modal RFID solo si la pestaña activa es POS
        setTimeout(() => {
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id === 'pos') {
                this.showRFIDModal();
            } else {
                this.hideRFIDModal();
            }
        }, 100);
        
        // Actualizar UI inicial
        this.updateUI();
    }

    // Editar producto
    editProduct(productId) {
        this.showProductForm(productId);
    }
    // Datos por defecto
    initializeDefaultData() {
    const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    // Solo inicializar si NUNCA se han guardado datos
    if (!localStorage.getItem('categorias') && !localStorage.getItem('productos')) {
        const defaultData = {
            categorias: [
                {"id": 1, "nombre": "Restaurante", "protegida": true},
                {"id": 2, "nombre": "Bebidas", "protegida": false},
                {"id": 3, "nombre": "Snacks", "protegida": false},
                {"id": 4, "nombre": "Lácteos", "protegida": false},
                {"id": 5, "nombre": "Panadería", "protegida": false}
            ],
            productos: [
                {"id": 1, "nombre": "Hamburguesa Clásica", "precio": 15000, "codigoBarras": "1234567890123", "categoriaId": 1, "favorito": true},
                {"id": 2, "nombre": "Pizza Margarita", "precio": 18000, "codigoBarras": "1234567890124", "categoriaId": 1, "favorito": false},
                {"id": 3, "nombre": "Coca Cola 350ml", "precio": 3000, "codigoBarras": "1234567890125", "categoriaId": 2, "favorito": true},
                {"id": 4, "nombre": "Agua 500ml", "precio": 2000, "codigoBarras": "1234567890126", "categoriaId": 2, "favorito": false},
                {"id": 5, "nombre": "Papas Fritas", "precio": 4500, "codigoBarras": "1234567890127", "categoriaId": 3, "favorito": true},
                {"id": 6, "nombre": "Chocolatina", "precio": 2500, "codigoBarras": "1234567890128", "categoriaId": 3, "favorito": false},
                {"id": 7, "nombre": "Leche 1L", "precio": 4000, "codigoBarras": "1234567890129", "categoriaId": 4, "favorito": false},
                {"id": 8, "nombre": "Yogurt Natural", "precio": 3500, "codigoBarras": "1234567890130", "categoriaId": 4, "favorito": true},
                {"id": 9, "nombre": "Pan Integral", "precio": 5000, "codigoBarras": "1234567890131", "categoriaId": 5, "favorito": false},
                {"id": 10, "nombre": "Croissant", "precio": 3000, "codigoBarras": "1234567890132", "categoriaId": 5, "favorito": false},
                {"id": 11, "nombre": "Jugo de Naranja", "precio": 3500, "codigoBarras": "1234567890133", "categoriaId": 2, "favorito": false},
                {"id": 12, "nombre": "Café Americano", "precio": 4000, "codigoBarras": "1234567890134", "categoriaId": 2, "favorito": false},
                {"id": 13, "nombre": "Sandwich Mixto", "precio": 8000, "codigoBarras": "1234567890135", "categoriaId": 1, "favorito": false},
                {"id": 14, "nombre": "Ensalada César", "precio": 12000, "codigoBarras": "1234567890136", "categoriaId": 1, "favorito": false},
                {"id": 15, "nombre": "Galletas Oreo", "precio": 3000, "codigoBarras": "1234567890137", "categoriaId": 3, "favorito": false},
                {"id": 16, "nombre": "Queso Campesino", "precio": 8000, "codigoBarras": "1234567890138", "categoriaId": 4, "favorito": false},
                {"id": 17, "nombre": "Empanada Pollo", "precio": 2500, "codigoBarras": "1234567890139", "categoriaId": 5, "favorito": false},
                {"id": 18, "nombre": "Té Verde", "precio": 2500, "codigoBarras": "1234567890140", "categoriaId": 2, "favorito": false},
                {"id": 19, "nombre": "Brownie", "precio": 4000, "codigoBarras": "1234567890141", "categoriaId": 5, "favorito": false},
                {"id": 20, "nombre": "Nachos con Queso", "precio": 6000, "codigoBarras": "1234567890142", "categoriaId": 3, "favorito": false}
            ],
            clientes: [
                {"id": 1, "nombre": "Juan Pérez", "identificacion": "12345678", "tarjetaRFID": "RF001", "saldo": 25000},
                {"id": 2, "nombre": "María García", "identificacion": "87654321", "tarjetaRFID": "RF002", "saldo": -15000},
                {"id": 3, "nombre": "Carlos López", "identificacion": "11223344", "tarjetaRFID": "RF003", "saldo": -60000},
                {"id": 4, "nombre": "Ana Martínez", "identificacion": "44332211", "tarjetaRFID": "RF004", "saldo": 50000},
                {"id": 5, "nombre": "Luis Rodríguez", "identificacion": "55667788", "tarjetaRFID": "RF005", "saldo": 0}
            ],
            ventas: [
                {
                    "id": 1,
                    "clienteId": 1,
                    "cliente": "Juan Pérez",
                    "fecha": "2025-08-13",
                    "hora": "14:30",
                    "productos": [
                        {"id": 1, "nombre": "Hamburguesa Clásica", "cantidad": 1, "precio": 15000, "categoriaId": 1},
                        {"id": 3, "nombre": "Coca Cola 350ml", "cantidad": 2, "precio": 3000, "categoriaId": 2}
                    ],
                    "total": 21000,
                    "tipoPago": "DC"
                },
                {
                    "id": 2,
                    "clienteId": 2,
                    "cliente": "María García", 
                    "fecha": "2025-08-13",
                    "hora": "15:45",
                    "productos": [
                        {"id": 5, "nombre": "Papas Fritas", "cantidad": 1, "precio": 4500, "categoriaId": 3},
                        {"id": 11, "nombre": "Jugo de Naranja", "cantidad": 1, "precio": 3500, "categoriaId": 2}
                    ],
                    "total": 8000,
                    "tipoPago": "DC"
                }
            ],
            comandas: [
                {
                    "id": 1,
                    "numero": 1,
                    "ventaId": 1,
                    "cliente": "Juan Pérez",
                    "fecha": "2025-08-13",
                    "hora": "14:30",
                    "productos": [
                        {"id": 1, "nombre": "Hamburguesa Clásica", "cantidad": 1}
                    ]
                }
            ],
            contadores: {
                "proximoIdProducto": 21,
                "proximoIdCategoria": 6,
                "proximoIdCliente": 6,
                "proximoIdVenta": 3,
                "proximoNumeroComanda": 2
            }
        };

        Object.keys(defaultData).forEach(key => {
            localStorage.setItem(key, JSON.stringify(defaultData[key]));
        });
    }
    }

    // Event Listeners - Mejorado para evitar errores
    setupEventListeners() {
        // Usar delegación de eventos para evitar problemas con elementos que no existen aún
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Modal RFID
            if (target.id === 'confirmRfidBtn') {
                e.preventDefault();
                this.handleRFIDConfirm();
            } else if (target.id === 'guestBtn') {
                e.preventDefault();
                this.handleGuestMode();
            } else if (target.id === 'cancelBtn') {
                e.preventDefault();
                this.handleRFIDCancel();
            }
            
            // Navegación
            else if (target.classList.contains('nav-btn') && target.dataset.tab) {
                e.preventDefault();
                this.switchTab(target.dataset.tab);
            }
            
            // POS
            else if (target.id === 'gridBackBtn') {
                e.preventDefault();
                this.goBackToCategories();
            } else if (target.id === 'prevPageBtn') {
                e.preventDefault();
                this.changePage(-1);
            } else if (target.id === 'nextPageBtn') {
                e.preventDefault();
                this.changePage(1);
            }
            
            // Pagos
            else if (target.id === 'payDCBtn') {
                e.preventDefault();
                this.handlePaymentDC();
            } else if (target.id === 'payGuestBtn') {
                e.preventDefault();
                this.handleGuestPayment();
            } else if (target.id === 'payDebtBtn') {
                e.preventDefault();
                this.showDebtPaymentModal();
            } else if (target.id === 'discardBtn') {
                e.preventDefault();
                this.clearCart();
            }
            
            // Modal pago deuda
            else if (target.id === 'confirmDebtBtn') {
                e.preventDefault();
                this.handleDebtPayment();
            } else if (target.id === 'cancelDebtBtn') {
                e.preventDefault();
                this.hideDebtPaymentModal();
            }
            
            // Modales
            else if (target.id === 'saveModalBtn') {
                e.preventDefault();
                this.saveModalForm();
            } else if (target.id === 'cancelModalBtn') {
                e.preventDefault();
                this.hideFormModal();
            } else if (target.id === 'closeSaleDetailBtn') {
                e.preventDefault();
                this.hideSaleDetailModal();
            } else if (target.id === 'closeComandaDetailBtn') {
                e.preventDefault();
                this.hideComandaDetailModal();
            } else if (target.id === 'reprintSaleBtn') {
                e.preventDefault();
                this.reprintSale();
            } else if (target.id === 'reprintComandaBtn') {
                e.preventDefault();
                this.reprintComanda();
            }
            
            // Confirmación
            else if (target.id === 'confirmOkBtn') {
                e.preventDefault();
                this.handleConfirm();
            } else if (target.id === 'confirmCancelBtn') {
                e.preventDefault();
                this.hideConfirmModal();
            }
            
            // CRUD
            else if (target.id === 'addProductBtn') {
                e.preventDefault();
                this.showProductForm();
            } else if (target.id === 'addClientBtn') {
                e.preventDefault();
                this.showClientForm();
            } else if (target.id === 'addCategoryBtn') {
                e.preventDefault();
                this.showCategoryForm();
            }
            
            // Import/Export
            else if (target.id === 'importProductsBtn') {
                e.preventDefault();
                this.selectFileForImport();
            } else if (target.id === 'downloadTemplateBtn') {
                e.preventDefault();
                this.downloadProductTemplate();
            }
            
            // Informes
            else if (target.id === 'generateRangeReportBtn') {
                e.preventDefault();
                this.generateRangeReport();
            } else if (target.id === 'generateClientReportBtn') {
                e.preventDefault();
                this.generateClientReport();
            } else if (target.id === 'exportRangeReportBtn') {
                e.preventDefault();
                this.exportRangeReport();
            } else if (target.id === 'exportClientReportBtn') {
                e.preventDefault();
                this.exportClientReport();
            }
            
            // Backup
            else if (target.id === 'exportDataBtn') {
                e.preventDefault();
                this.exportData();
            } else if (target.id === 'importDataBtn') {
                e.preventDefault();
                this.importData();
            }
            
            // Historial tabs
            else if (target.dataset.historyTab) {
                e.preventDefault();
                this.switchHistoryTab(target.dataset.historyTab);
            }
        });

        // Eventos de teclado
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'rfidInput' && e.key === 'Enter') {
                e.preventDefault();
                this.handleRFIDConfirm();
            }
        });

        // Eventos de input
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.handleSearch();
            }
        });

        // Evento especial para Enter en search input (códigos de barras)
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'searchInput' && e.key === 'Enter') {
                e.preventDefault();
                this.handleBarcodeSearch();
            }
        });

        // File input para importar productos
        document.addEventListener('change', (e) => {
            if (e.target.id === 'fileInput') {
                this.importProducts(e);
            }
        });

        // Fechas por defecto
        setTimeout(() => {
            const today = new Date().toISOString().split('T')[0];
            const fechaDesde = document.getElementById('fechaDesde');
            const fechaHasta = document.getElementById('fechaHasta');
            if (fechaDesde) fechaDesde.value = today;
            if (fechaHasta) fechaHasta.value = today;
        }, 500);
    }

    // Utilidades
    getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    getNextId(entity) {
        const contadores = this.getData('contadores');
        const nextId = contadores[`proximoId${entity}`];
        contadores[`proximoId${entity}`] = nextId + 1;
        this.setData('contadores', contadores);
        return nextId;
    }

    formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-CO');
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit' });
    }

    // Modal RFID
    showRFIDModal() {
        const modal = document.getElementById('rfidModal');
        const input = document.getElementById('rfidInput');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                if (input && !modal.classList.contains('hidden')) {
                    input.focus();
                }
            }, 100);
            if (input) input.value = '';
        }
    }

    hideRFIDModal() {
        const modal = document.getElementById('rfidModal');
        if (modal) modal.classList.add('hidden');
    }

    handleRFIDConfirm() {
        const rfidInput = document.getElementById('rfidInput');
        const rfid = rfidInput ? rfidInput.value.trim() : '';
        if (!rfid) return;

        const clientes = this.getData('clientes');
        const cliente = clientes.find(c => c.tarjetaRFID === rfid);

        const rfidError = document.getElementById('rfidError');

        if (cliente) {
            this.currentClient = cliente;
            this.isGuestMode = false;
            this.isBlocked = false;
            this.hideRFIDModal();
            this.updateClientInfo();
            this.updatePaymentButtons();
            if (rfidError) rfidError.classList.add('hidden');
            // Solo enfocar el campo de búsqueda si el modal RFID está oculto
            setTimeout(() => {
                const rfidModal = document.getElementById('rfidModal');
                if (rfidModal && rfidModal.classList.contains('hidden')) {
                    this.focusSearchInput();
                }
            }, 100);
        } else {
            if (rfidError) rfidError.classList.remove('hidden');
        }
    }

    handleGuestMode() {
        this.isGuestMode = true;
        this.currentClient = null;
        this.isBlocked = false;
        this.hideRFIDModal();
        this.updateClientInfo();
        this.updatePaymentButtons();
        this.focusSearchInput();
    }

    handleRFIDCancel() {
        this.isBlocked = true;
        this.hideRFIDModal();
        this.updateClientInfo();
        this.updatePaymentButtons();
    }

    focusSearchInput(force = false) {
        const rfidModal = document.getElementById('rfidModal');
        if (force || !rfidModal || rfidModal.classList.contains('hidden')) {
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            }, 100);
        }
    }

    // Cliente Info
    updateClientInfo() {
        const clientNameEl = document.getElementById('clientName');
        const clientBalanceEl = document.getElementById('clientBalance');

        if (!clientNameEl || !clientBalanceEl) return;

        if (this.isBlocked) {
            clientNameEl.textContent = 'ACCESO BLOQUEADO';
            clientBalanceEl.textContent = '';
            clientBalanceEl.classList.remove('negative');
        } else if (this.isGuestMode) {
            clientNameEl.textContent = 'MODO INVITADO';
            clientBalanceEl.textContent = '';
            clientBalanceEl.classList.remove('negative');
        } else if (this.currentClient) {
            clientNameEl.textContent = this.currentClient.nombre;
            clientBalanceEl.textContent = this.formatCurrency(this.currentClient.saldo);
            
            if (this.currentClient.saldo <= -50000) {
                clientBalanceEl.classList.add('negative');
            } else {
                clientBalanceEl.classList.remove('negative');
            }
        }
    }

    updatePaymentButtons() {
        const payDCBtn = document.getElementById('payDCBtn');
        const payDebtBtn = document.getElementById('payDebtBtn');
        const payGuestBtn = document.getElementById('payGuestBtn');

        if (this.isGuestMode) {
            if (payDCBtn) payDCBtn.classList.add('hidden');
            if (payDebtBtn) payDebtBtn.classList.add('hidden');
            if (payGuestBtn) payGuestBtn.classList.remove('hidden');
        } else {
            if (payDCBtn) payDCBtn.classList.remove('hidden');
            if (payDebtBtn) payDebtBtn.classList.remove('hidden');
            if (payGuestBtn) payGuestBtn.classList.add('hidden');
        }

        [payDCBtn, payDebtBtn, payGuestBtn].forEach(btn => {
            if (btn) btn.disabled = this.isBlocked;
        });
    }

    // Navegación
    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) selectedTab.classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        switch(tabName) {
            case 'pos':
                this.updatePOS();
                this.showRFIDModal();
                break;
            case 'historial':
                this.updateHistorial();
                this.hideRFIDModal();
                break;
            case 'productos':
                this.updateProductos();
                this.hideRFIDModal();
                break;
            case 'clientes':
                this.updateClientes();
                this.hideRFIDModal();
                break;
            case 'categorias':
                this.reloadDefaultCategories();
                this.updateCategorias(); // <-- Asegura renderizado SIEMPRE
                this.hideRFIDModal();
                break;
            case 'informes':
                this.updateInformes();
                this.hideRFIDModal();
                break;
        }
    }

    // POS
    updatePOS() {
        this.updatePopularProducts();
        this.updateFavoriteProducts();
        this.updateProductsGrid();
        this.updateCart();
        this.focusSearchInput();
    }
        // Historial
        updateHistorial() {
            // Renderizar historial de ventas
            const ventas = this.getData('ventas');
            const ventasTableBody = document.getElementById('ventasTableBody');
            if (ventasTableBody) {
                ventasTableBody.innerHTML = ventas.map(v => `
                    <tr>
                        <td>${v.id}</td>
                        <td>${v.cliente}</td>
                        <td>${v.fecha}</td>
                        <td>${v.hora}</td>
                        <td>${this.formatCurrency(v.total)}</td>
                        <td>
                            <button class="btn btn--sm btn--primary" onclick="window.posSystem.showSaleDetail(${v.id})">Ver</button>
                        </td>
                    </tr>
                `).join('');
            }
            // Renderizar historial de comandas
            const comandas = this.getData('comandas');
            const comandasTableBody = document.getElementById('comandasTableBody');
            if (comandasTableBody) {
                comandasTableBody.innerHTML = comandas.map(c => `
                    <tr>
                        <td>${c.numero}</td>
                        <td>${c.cliente}</td>
                        <td>${c.fecha}</td>
                        <td>${c.hora}</td>
                        <td>${c.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', ')}</td>
                        <td>
                            <button class="btn btn--sm btn--primary" onclick="window.posSystem.showComandaDetail(${c.id})">Ver</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
            // Cambiar entre historial de ventas y comandas
            switchHistoryTab(tabName) {
                // Actualizar botones activos
                document.querySelectorAll('[data-history-tab]').forEach(btn => {
                    btn.classList.remove('active');
                });
                const activeBtn = document.querySelector(`[data-history-tab="${tabName}"]`);
                if (activeBtn) activeBtn.classList.add('active');
                // Mostrar/ocultar contenido
                const ventasHistory = document.getElementById('ventasHistory');
                const comandasHistory = document.getElementById('comandasHistory');
                if (ventasHistory) ventasHistory.classList.toggle('hidden', tabName !== 'ventas');
                if (comandasHistory) comandasHistory.classList.toggle('hidden', tabName !== 'comandas');
            }

    updatePopularProducts() {
        const ventas = this.getData('ventas');
        const productos = this.getData('productos');
        
        const productSales = {};
        ventas.forEach(venta => {
            venta.productos.forEach(producto => {
                productSales[producto.id] = (productSales[producto.id] || 0) + producto.cantidad;
            });
        });

        let topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([id]) => productos.find(p => p.id === parseInt(id)))
            .filter(p => p);

        while (topProducts.length < 4 && topProducts.length < productos.length) {
            const randomProduct = productos[Math.floor(Math.random() * productos.length)];
            if (!topProducts.find(p => p.id === randomProduct.id)) {
                topProducts.push(randomProduct);
            }
        }

        const popularGrid = document.getElementById('popularGrid');
        if (popularGrid) {
            popularGrid.innerHTML = topProducts.map(producto => `
                <div class="product-item" onclick="window.posSystem.addToCart(${producto.id})">
                    <h4>${producto.nombre}</h4>
                    <div class="product-price">${this.formatCurrency(producto.precio)}</div>
                </div>
            `).join('');
        }
    }

    updateFavoriteProducts() {
        const productos = this.getData('productos');
        const favoritos = productos.filter(p => p.favorito).slice(0, 4);

        const favoritesList = document.getElementById('favoritesList');
        if (favoritesList) {
            favoritesList.innerHTML = favoritos.map(producto => `
                <div class="product-item" onclick="window.posSystem.addToCart(${producto.id})">
                    <h4>${producto.nombre}</h4>
                    <div class="product-price">${this.formatCurrency(producto.precio)}</div>
                </div>
            `).join('');
        }
    }

    updateProductsGrid() {
        if (this.searchMode) {
            return; // No actualizar si estamos en modo búsqueda
        }

        if (this.currentView === 'categories') {
            this.showCategories();
        } else {
            this.showCategoryProducts();
        }
    }

    showCategories() {
        const categorias = this.getData('categorias');
        const startIndex = this.currentPage * this.itemsPerPage;
        const pageCategories = categorias.slice(startIndex, startIndex + this.itemsPerPage);

        const gridTitle = document.getElementById('gridTitle');
        const gridBackBtn = document.getElementById('gridBackBtn');
        const productsGrid = document.getElementById('productsGrid');

        if (gridTitle) gridTitle.textContent = 'Categorías';
        if (gridBackBtn) gridBackBtn.classList.add('hidden');
        
        if (productsGrid) {
            productsGrid.innerHTML = pageCategories.map(categoria => `
                <div class="category-item" onclick="window.posSystem.selectCategory(${categoria.id})">
                    <h4>${categoria.nombre}</h4>
                </div>
            `).join('');
        }

        this.updatePagination(categorias.length);
        this.showPaginationControls();
    }

    selectCategory(categoriaId) {
    console.log('DEBUG selectCategory', { categoriaId });
    this.currentCategory = categoriaId;
    this.currentView = 'products';
    this.currentPage = 0;
    this.showCategoryProducts();
    }

    showCategoryProducts() {
        // Inicializar variables antes de los logs
        const productos = this.getData('productos');
        const categorias = this.getData('categorias');
        const categoriaId = Number(this.currentCategory);
        const categoria = categorias.find(c => Number(c.id) === categoriaId);
        const categoryProducts = productos.filter(p => Number(p.categoriaId) === categoriaId);
        const startIndex = this.currentPage * this.itemsPerPage;
        const pageProducts = categoryProducts.slice(startIndex, startIndex + this.itemsPerPage);
        const gridTitle = document.getElementById('gridTitle');
        const gridBackBtn = document.getElementById('gridBackBtn');
        const productsGrid = document.getElementById('productsGrid');
        if (gridTitle) gridTitle.textContent = categoria ? categoria.nombre : 'Productos';
        if (gridBackBtn) gridBackBtn.classList.remove('hidden');
        if (productsGrid) {
            if (pageProducts.length === 0) {
                productsGrid.innerHTML = '<div class="empty-state"><h4>Sin productos</h4><p>Esta categoría no tiene productos disponibles.</p></div>';
            } else {
                productsGrid.innerHTML = pageProducts.map(producto => `
                    <div class="product-item" onclick="window.posSystem.addToCart(${producto.id})">
                        <h4>${producto.nombre}</h4>
                        <div class="product-price">${this.formatCurrency(producto.precio)}</div>
                    </div>
                `).join('');
            }
        }

        this.updatePagination(categoryProducts.length);
        this.showPaginationControls();
        this.focusSearchInput();
    }

    goBackToCategories() {
        this.currentView = 'categories';
        this.currentCategory = null;
        this.currentPage = 0;
        this.searchMode = false;
        this.showCategories();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
    }

    changePage(direction = 1) {
    console.log('changePage called, direction:', direction);
    console.log('currentView:', this.currentView);
    console.log('currentCategory:', this.currentCategory);
        const newPage = this.currentPage + direction;
        let itemCount;
        if (this.currentView === 'categories') {
            itemCount = this.getData('categorias').length;
        } else {
            const categoriaId = Number(this.currentCategory);
            itemCount = this.getData('productos').filter(p => Number(p.categoriaId) === categoriaId).length;
        }
        const maxPage = Math.max(0, Math.ceil(itemCount / this.itemsPerPage) - 1);
        if (newPage >= 0 && newPage <= maxPage) {
            this.currentPage = newPage;
            this.updateProductsGrid();
        }
    }

    updatePagination(totalItems) {
        const totalPages = Math.max(1, Math.ceil(totalItems / this.itemsPerPage));
        const currentPageDisplay = totalItems === 0 ? 0 : this.currentPage + 1;
        
        const pageInfo = document.getElementById('pageInfo');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if (pageInfo) pageInfo.textContent = `${currentPageDisplay}/${totalPages}`;
        if (prevPageBtn) prevPageBtn.disabled = this.currentPage === 0;
        if (nextPageBtn) nextPageBtn.disabled = this.currentPage >= totalPages - 1 || totalItems === 0;
    }

    showPaginationControls() {
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        if (prevPageBtn) prevPageBtn.style.display = 'inline-block';
        if (nextPageBtn) nextPageBtn.style.display = 'inline-block';
    }

    hidePaginationControls() {
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        if (prevPageBtn) prevPageBtn.style.display = 'none';
        if (nextPageBtn) nextPageBtn.style.display = 'none';
    }

    // Búsqueda
    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        if (!searchTerm) {
            this.searchMode = false;
            this.updateProductsGrid();
            return;
        }

        this.searchMode = true;
        const productos = this.getData('productos');
        const filteredProducts = productos.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm)
        );

        const gridTitle = document.getElementById('gridTitle');
        const gridBackBtn = document.getElementById('gridBackBtn');
        const productsGrid = document.getElementById('productsGrid');
        const pageInfo = document.getElementById('pageInfo');

        if (gridTitle) gridTitle.textContent = `Resultados: "${searchTerm}"`;
        if (gridBackBtn) gridBackBtn.classList.remove('hidden');
        
        if (productsGrid) {
            if (filteredProducts.length === 0) {
                productsGrid.innerHTML = '<div class="empty-state"><h4>Sin resultados</h4><p>No se encontraron productos que coincidan con la búsqueda.</p></div>';
            } else {
                productsGrid.innerHTML = filteredProducts.map(producto => `
                    <div class="product-item" onclick="window.posSystem.addToCart(${producto.id})">
                        <h4>${producto.nombre}</h4>
                        <div class="product-price">${this.formatCurrency(producto.precio)}</div>
                    </div>
                `).join('');
            }
        }

        if (pageInfo) pageInfo.textContent = '';
        this.hidePaginationControls();
    }

    handleBarcodeSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.trim() : '';
        
        if (/^\d{13}$/.test(searchTerm)) {
            const productos = this.getData('productos');
            const producto = productos.find(p => p.codigoBarras === searchTerm);
            
            if (producto) {
                this.addToCart(producto.id);
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.focus();
                }
                this.searchMode = false;
                this.updateProductsGrid();
            } else {
                alert('Producto no encontrado');
            }
        }
    }

    // Carrito
    addToCart(productId) {
        if (this.isBlocked) {
            alert('Acceso bloqueado. Complete la identificación RFID.');
            return;
        }

        const productos = this.getData('productos');
        const producto = productos.find(p => p.id === productId);
        
        if (!producto) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.cantidad++;
        } else {
            this.cart.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                categoriaId: producto.categoriaId,
                cantidad: 1
            });
        }

        this.updateCart();
        this.focusSearchInput();
    }

    updateCart() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        if (!cartItems || !cartTotal) return;
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-state"><p>Carrito vacío</p></div>';
            cartTotal.textContent = '$0';
            return;
        }
        let html = '';
        html += this.cart.map(item => {
            return `<div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.nombre}</div>
                    <div class="cart-item-details">
                        ${item.cantidad} x ${this.formatCurrency(item.precio)} = ${this.formatCurrency(item.cantidad * item.precio)}
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="window.posSystem.decreaseQuantity(${item.id})">-</button>
                    <span>${item.cantidad}</span>
                    <button class="quantity-btn" onclick="window.posSystem.increaseQuantity(${item.id})">+</button>
                    <button class="remove-btn" onclick="window.posSystem.removeFromCart(${item.id})">✕</button>
                </div>
            </div>`;
        }).join('');
        cartItems.innerHTML = html;
        const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        cartTotal.textContent = this.formatCurrency(total);
    }

    toggleCartSelection(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.selected = !item.selected;
            this.updateCart();
        }
    }

    selectAllCartItems() {
        this.cart.forEach(item => item.selected = true);
        this.updateCart();
    }

    deselectAllCartItems() {
        this.cart.forEach(item => item.selected = false);
        this.updateCart();
    }

    removeSelectedFromCart() {
        this.cart = this.cart.filter(item => !item.selected);
        this.updateCart();
    }

    increaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.cantidad++;
            this.updateCart();
        }
    }

    decreaseQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.cantidad--;
            if (item.cantidad <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCart();
            }
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCart();
    }

    clearCart() {
        this.cart = [];
        this.updateCart();
        this.focusSearchInput();
        // Ajuste solicitado:
        // Deseleccionar cliente y mostrar modal de identificación
        this.currentClient = null;
        this.isGuestMode = false;
        this.isBlocked = false;
        this.updateClientInfo();
        this.updatePaymentButtons();
        this.showRFIDModal();
    }

    // Pagos
    handlePaymentDC() {
        if (this.isBlocked || this.cart.length === 0) return;
        
        const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        // Permitir pago aunque el saldo quede negativo
        // if (this.currentClient && this.currentClient.saldo < total) {
        //     alert('Saldo insuficiente');
        //     return;
        // }

        this.processPayment(total, 'DC');
        this.finalizeSaleFlow();
    }

    handleGuestPayment() {
        if (this.cart.length === 0) return;
        
        const total = this.cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        this.processPayment(total, 'INVITADO');
        this.finalizeSaleFlow();
    }

    processPayment(total, tipoPago, clienteId = null) {
        const ventaId = this.getNextId('Venta');
        const venta = {
            id: ventaId,
            clienteId: this.currentClient?.id || null,
            cliente: this.isGuestMode ? 'Invitado' : (this.currentClient?.nombre || 'Invitado'),
            fecha: this.getCurrentDate(),
            hora: this.getCurrentTime(),
            productos: [...this.cart],
            total: total,
            tipoPago: tipoPago
        };

        // Guardar venta
        const ventas = this.getData('ventas');
        ventas.push(venta);
        this.setData('ventas', ventas);

        // Actualizar saldo del cliente si aplica
        if (this.currentClient && !this.isGuestMode) {
            const clientes = this.getData('clientes');
            const clienteIndex = clientes.findIndex(c => c.id === this.currentClient.id);
            if (clienteIndex !== -1) {
                clientes[clienteIndex].saldo -= total;
                this.setData('clientes', clientes);
                this.currentClient.saldo -= total;
                this.updateClientInfo();
            }
        }

        // Generar comanda si hay productos de restaurante
        const productosRestaurante = this.cart.filter(item => item.categoriaId === 1);
        if (productosRestaurante.length > 0) {
            this.generateComanda(venta, productosRestaurante);
        }

        this.clearCart();
    }

    generateComanda(venta, productosRestaurante) {
        const comandas = this.getData('comandas');
        const contadores = this.getData('contadores');
        
        const comanda = {
            id: comandas.length + 1,
            numero: contadores.proximoNumeroComanda,
            ventaId: venta.id,
            cliente: venta.cliente,
            fecha: venta.fecha,
            hora: venta.hora,
            productos: productosRestaurante.map(p => ({
                id: p.id,
                nombre: p.nombre,
                cantidad: p.cantidad
            }))
        };

        comandas.push(comanda);
        this.setData('comandas', comandas);

        contadores.proximoNumeroComanda++;
        this.setData('contadores', contadores);

        // Imprimir comanda automáticamente
        this.printComanda(comanda);
    }

    printComanda(comanda) {
        // Imprime el recibo de la comanda en un modal y reinicia el POS automáticamente
        let html = `<div class='receipt'><h3>Comanda Restaurante</h3><p>Cliente: ${comanda.cliente}</p><p>Fecha: ${comanda.fecha} ${comanda.hora}</p><hr><ul>`;
        comanda.productos.forEach(p => {
            html += `<li>${p.nombre} x${p.cantidad}</li>`;
        });
        html += `</ul></div>`;
        // Imprimir automáticamente y cerrar el modal
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(`<html><head><title>Comanda</title><link rel='stylesheet' href='style.css'></head><body>${html}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        // Inicializar POS para nueva venta
        this.finalizeSaleFlow();
    }

    // Stub methods para otras funcionalidades (implementación básica)
    showDebtPaymentModal() {
        // Mostrar modal para ingresar monto a abonar a la deuda
        if (!this.currentClient) {
            alert('Debes identificar un cliente antes de realizar una recarga.');
            return;
        }
        const modal = document.getElementById('debtPaymentModal');
        const input = document.getElementById('debtPaymentInput');
        const clientInfo = document.getElementById('debtPaymentClientInfo');
        if (clientInfo) {
            // Si el cliente existe, mostrar nombre y saldo
            clientInfo.innerHTML = `<strong>Cliente:</strong> ${this.currentClient.nombre || '(Sin nombre)'}<br><strong>Saldo actual:</strong> ${this.currentClient.saldo !== undefined ? this.formatCurrency(this.currentClient.saldo) : '$0'}`;
        }
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                if (input && !modal.classList.contains('hidden')) {
                    input.focus();
                }
            }, 100);
            if (input) input.value = '';
        }
    }
    hideDebtPaymentModal() {
        const modal = document.getElementById('debtPaymentModal');
        if (modal) modal.classList.add('hidden');
    }
    handleDebtPayment() {
        const input = document.getElementById('debtAmountInput');
        const monto = input ? Number(input.value) : 0;
        if (this.currentClient) {
            this.currentClient.saldo = Number(this.currentClient.saldo) || 0;
            if (monto > 0) {
                if (!Array.isArray(this.currentClient.recargas)) this.currentClient.recargas = [];
                const recargas = this.currentClient.recargas;
                const recargaAnterior = recargas.length > 0 ? recargas[recargas.length - 1] : null;
                let nuevoSaldo = this.currentClient.saldo + monto;
                this.printRecargaReceipt(monto, recargaAnterior ? recargaAnterior.fecha : null);
                const fechaRecarga = new Date().toISOString();
                this.currentClient.recargas.push({ fecha: fechaRecarga, monto });
                this.currentClient.saldo = nuevoSaldo;
                let clientes = this.getData('clientes');
                clientes = clientes.map(c => c.id === this.currentClient.id ? { ...c, saldo: nuevoSaldo, recargas: this.currentClient.recargas } : c);
                this.setData('clientes', clientes);
                this.updateClientInfo();
            } else {
                alert('El monto debe ser mayor a cero.');
            }
        } else {
            alert('No se pudo realizar la recarga. Verifica el cliente.');
        }
        this.hideDebtPaymentModal();
        this.finalizeSaleFlow();
    }

    printRecargaReceipt(monto, fechaInicio) {
        const ventas = this.getData('ventas');
        const cliente = this.currentClient;
        const recargas = cliente.recargas || [];
        let fechaIni = null;
        let fechaIniStr = '';
        if (recargas.length > 1) {
            // Última recarga anterior
            fechaIniStr = recargas[recargas.length - 2].fecha;
            fechaIni = new Date(fechaIniStr);
        } else if (recargas.length === 1) {
            // Primera recarga, mostrar todas las ventas
            fechaIni = null;
        }
        // Filtrar ventas después de la última recarga anterior
        let ventasCliente = ventas.filter(v => {
            if (v.clienteId !== cliente.id) return false;
            // Unificar formato de fecha/hora
            let ventaDateStr = v.fecha + (v.hora ? 'T' + v.hora : 'T00:00');
            let ventaDate = new Date(ventaDateStr);
            return (!fechaIni || ventaDate > fechaIni);
        });
        let html = `<div class='receipt'><h3>Recibo de Recarga</h3><p>Cliente: ${cliente.nombre}</p><p>Monto recargado: ${this.formatCurrency(monto)}</p>`;
        if (fechaIniStr) html += `<p>Compras desde: ${new Date(fechaIniStr).toLocaleString()}</p>`;
        html += `<hr><h4>Compras desde última recarga:</h4>`;
        if (ventasCliente.length === 0) {
            html += `<div class='status status--info'>No hay compras desde la última recarga.</div>`;
        } else {
            ventasCliente.forEach(v => {
                html += `<div><strong>Venta #${v.id} (${v.fecha} ${v.hora})</strong><ul>`;
                v.productos.forEach(p => {
                    html += `<li>${p.nombre} x${p.cantidad} - ${this.formatCurrency(p.precio * p.cantidad)}</li>`;
                });
                html += `</ul></div>`;
            });
        }
        html += `<hr><p>Saldo actual: ${this.formatCurrency(cliente.saldo)}</p></div>`;
        this.showReceiptModal(html);
    }

    // --- INICIO: Métodos para gestión de productos desde categorías ---
    updateCategorias() {
        const categorias = this.getData('categorias');
        const productos = this.getData('productos');
        const tbody = document.getElementById('categoriasTableBody');
        if (!tbody) return;
        tbody.innerHTML = categorias.map(categoria => {
            return `
                <tr class="${categoria.protegida ? 'protected-category' : ''}">
                    <td>${categoria.id}</td>
                    <td>${categoria.nombre}</td>
                    <td class="action-buttons">
                        <button class="btn btn--sm btn--primary" onclick="window.posSystem.editCategory(${categoria.id})" ${categoria.protegida ? 'disabled' : ''}>Editar</button>
                        <button class="btn btn--sm btn--outline" onclick="window.posSystem.deleteCategory(${categoria.id})" ${categoria.protegida ? 'disabled' : ''}>Eliminar</button>
                        <button class="btn btn--sm btn--success" onclick="window.posSystem.showCategoryProducts(${categoria.id})">Ver Productos</button>
                        <button class="btn btn--sm btn--primary" onclick="window.posSystem.showProductForm(null, ${categoria.id})">Agregar Producto</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    showProductForm(productId = null, categoriaId = null) {
        let producto = null;
        if (productId) {
            const productos = this.getData('productos');
            producto = productos.find(p => p.id === productId);
        }
        const modal = document.getElementById('formModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        if (!modal || !body || !title) return;
        title.textContent = productId ? 'Editar Producto' : 'Agregar Producto';
        // Renderizar categorías en el select
        const categorias = this.getData('categorias');
        let options = categorias.map(c => `<option value="${c.id}" ${producto && producto.categoriaId === c.id ? 'selected' : (categoriaId === c.id ? 'selected' : '')}>${c.nombre}</option>`).join('');
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label">Nombre:</label>
                <input type="text" id="productNameInput" class="form-control" value="${producto ? producto.nombre : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Precio:</label>
                <input type="number" id="productPriceInput" class="form-control" value="${producto ? producto.precio : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Código de Barras (opcional):</label>
                <input type="text" id="productBarcodeInput" class="form-control" value="${producto ? producto.codigoBarras || '' : ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Categoría:</label>
                <select id="productCategoryInput" class="form-control" required>${options}</select>
            </div>
            <div class="form-group">
                <label class="form-label">Favorito:</label>
                <input type="checkbox" id="productFavoriteInput" ${producto && producto.favorito ? 'checked' : ''}>
            </div>
        `;
        modal.classList.remove('hidden');
        this.editingItem = productId;
        this._formType = 'producto';
    }

    // --- FIN: Métodos para gestión de productos desde categorías ---

    // CRUD Clientes
    updateClientes() {
        const clientes = this.getData('clientes');
        const tbody = document.getElementById('clientesTableBody');
        if (!tbody) return;
        tbody.innerHTML = clientes.map(cliente => `
            <tr>
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.identificacion}</td>
                <td>${cliente.tarjetaRFID}</td>
                <td>${this.formatCurrency(cliente.saldo)}</td>
                <td class="action-buttons">
                    <button class="btn btn--sm btn--primary" onclick="window.posSystem.editClient(${cliente.id})">Editar</button>
                    <button class="btn btn--sm btn--outline" onclick="window.posSystem.deleteClient(${cliente.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    editClient(clientId) {
        this.showClientForm(clientId);
    }

    deleteClient(clientId) {
        if (!confirm('¿Seguro que desea eliminar este cliente?')) return;
        let clientes = this.getData('clientes');
        clientes = clientes.filter(c => c.id !== clientId);
        this.setData('clientes', clientes);
        this.updateClientes();
    }

    // CRUD Categorías
    updateCategorias() {
        const categorias = this.getData('categorias');
        const productos = this.getData('productos');
        const tbody = document.getElementById('categoriasTableBody');
        if (!tbody) return;
        tbody.innerHTML = categorias.map(categoria => {
            return `
                <tr class="${categoria.protegida ? 'protected-category' : ''}">
                    <td>${categoria.id}</td>
                    <td>${categoria.nombre}</td>
                    <td class="action-buttons">
                        <button class="btn btn--sm btn--primary" onclick="window.posSystem.editCategory(${categoria.id})" ${categoria.protegida ? 'disabled' : ''}>Editar</button>
                        <button class="btn btn--sm btn--outline" onclick="window.posSystem.deleteCategory(${categoria.id})" ${categoria.protegida ? 'disabled' : ''}>Eliminar</button>
                        <button class="btn btn--sm btn--success" onclick="window.posSystem.showCategoryProducts(${categoria.id})">Ver Productos</button>
                        <button class="btn btn--sm btn--primary" onclick="window.posSystem.showProductForm(null, ${categoria.id})">Agregar Producto</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    showCategoryForm(categoryId = null) {
        let categoria = null;
        if (categoryId) {
            const categorias = this.getData('categorias');
            categoria = categorias.find(c => c.id === categoryId);
        }
        const modal = document.getElementById('formModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        if (!modal || !body || !title) return;
        title.textContent = categoryId ? 'Editar Categoría' : 'Agregar Categoría';
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label">Nombre:</label>
                <input type="text" id="categoryNameInput" class="form-control" value="${categoria ? categoria.nombre : ''}" required>
            </div>
        `;
        modal.classList.remove('hidden');
        this.editingItem = categoryId;
        this._formType = 'categoria';
    }

    editCategory(categoryId) {
        this.showCategoryForm(categoryId);
    }

    deleteCategory(categoryId) {
        const categorias = this.getData('categorias');
        const categoria = categorias.find(c => c.id === categoryId);
        if (categoria && categoria.protegida) {
            alert('La categoría "Restaurante" no puede ser modificada ni eliminada.');
            return;
        }
        if (!confirm('¿Seguro que desea eliminar esta categoría?')) return;
        const nuevasCategorias = categorias.filter(c => c.id !== categoryId);
        this.setData('categorias', nuevasCategorias);
        this.updateCategorias();
    }
    reloadDefaultCategories() {
        // Eliminar recarga automática de datos de ejemplo si no hay categorías
        // El usuario puede tener cero categorías y no debe reiniciarse
    }
    // Eliminar duplicado vacío de updateCategorias
    // Forzar recarga de datos de ejemplo si no hay categorías
    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) selectedTab.classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        switch(tabName) {
            case 'pos':
                this.updatePOS();
                break;
            case 'historial':
                this.updateHistorial();
                break;
            case 'productos':
                this.updateProductos();
                break;
            case 'clientes':
                this.updateClientes();
                break;
            case 'categorias':
                this.reloadDefaultCategories();
                this.updateCategorias(); // <-- Asegura renderizado SIEMPRE
                break;
            case 'informes':
                this.updateInformes();
                break;
            case 'dashboard':
                this.updateDashboard();
                break;
        }
    }

    // CRUD
    hideFormModal() {
        const modal = document.getElementById('formModal');
        if (modal) modal.classList.add('hidden');
        this.editingItem = null;
        this._formType = null;
    }

    saveModalForm() {
        if (this._formType === 'producto') {
            this.saveProduct();
        } else if (this._formType === 'cliente') {
            this.saveClient();
        } else if (this._formType === 'categoria') {
            this.saveCategory();
        }
    }

    saveProduct() {
        const nombre = document.getElementById('productNameInput').value.trim();
        const precio = parseFloat(document.getElementById('productPriceInput').value);
        const codigoBarras = document.getElementById('productBarcodeInput').value.trim(); // Puede estar vacío
        const categoriaId = parseInt(document.getElementById('productCategoryInput').value);
        const favorito = document.getElementById('productFavoriteInput').checked;
        let productos = this.getData('productos');
        // Validaciones
        if (!nombre) {
            alert('El nombre del producto es obligatorio.');
            return;
        }
        if (isNaN(precio) || precio <= 0) {
            alert('El precio debe ser mayor a 0.');
            return;
        }
        if (this.editingItem) {
            // Editar producto existente
            const idx = productos.findIndex(p => p.id === this.editingItem);
            if (idx !== -1) {
                productos[idx] = {
                    ...productos[idx],
                    nombre,
                    precio,
                    codigoBarras,
                    categoriaId,
                    favorito
                };
            }
        } else {
            // Crear nuevo producto
            const id = this.getNextId('Producto');
            productos.push({ id, nombre, precio, codigoBarras, categoriaId, favorito });
        }
        this.setData('productos', productos);
        this.hideFormModal();
        this.updateProductos();
    }

    saveClient() {
        const nombre = document.getElementById('clientNameInput').value.trim();
        const identificacion = document.getElementById('clientIdInput').value.trim();
        const tarjetaRFID = document.getElementById('clientRFIDInput').value.trim();
        const saldo = parseInt(document.getElementById('clientBalanceInput').value);
        let clientes = this.getData('clientes');
        // Validaciones
        if (!nombre || !identificacion || !tarjetaRFID || isNaN(saldo)) {
            alert('Todos los campos son obligatorios y válidos.');
            return;
        }
        // RFID único
        const existeRFID = clientes.some(c => c.tarjetaRFID === tarjetaRFID && c.id !== this.editingItem);
        if (existeRFID) {
            alert('El código RFID ya existe en otro cliente.');
            return;
        }
        if (this.editingItem) {
            // Editar
            const idx = clientes.findIndex(c => c.id === this.editingItem);
            if (idx !== -1) {
                // Conservar historial de recargas si existe
                const recargas = clientes[idx].recargas || [];
                clientes[idx] = { ...clientes[idx], nombre, identificacion, tarjetaRFID, saldo, recargas };
            }
        } else {
            // Crear
            const id = this.getNextId('Cliente');
            clientes.push({ id, nombre, identificacion, tarjetaRFID, saldo, recargas: [] });
        }
        this.setData('clientes', clientes);
        this.hideFormModal();
        this.updateClientes();
    }

    saveCategory() {
        const nombre = document.getElementById('categoryNameInput').value.trim();
        let categorias = this.getData('categorias');
        // Validaciones
        if (!nombre) {
            alert('El nombre de la categoría es obligatorio.');
            return;
        }
        // No permitir duplicados
        const existeNombre = categorias.some(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== this.editingItem);
        if (existeNombre) {
            alert('Ya existe una categoría con ese nombre.');
            return;
        }
        // No permitir modificar "Restaurante"
        if (this.editingItem) {
            const idx = categorias.findIndex(c => c.id === this.editingItem);
            if (idx !== -1 && categorias[idx].protegida) {
                alert('La categoría "Restaurante" no puede ser modificada.');
                return;
            }
            if (idx !== -1) {
                categorias[idx].nombre = nombre;
            }
        } else {
            // Crear
            const id = this.getNextId('Categoria');
            categorias.push({ id, nombre, protegida: false });
        }
        this.setData('categorias', categorias);
        this.hideFormModal();
        this.updateCategorias();
    }
    // Productos
    updateProductos() {
        const productos = this.getData('productos');
        const categorias = this.getData('categorias');
        const tbody = document.getElementById('productosTableBody');
        if (!tbody) return;
        tbody.innerHTML = productos.map(producto => {
            const categoria = categorias.find(c => c.id === producto.categoriaId);
            return `
                <tr>
                    <td><input type="checkbox" class="select-product" data-id="${producto.id}"></td>
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${this.formatCurrency(producto.precio)}</td>
                    <td>${producto.codigoBarras}</td>
                    <td>${categoria ? categoria.nombre : '-'}</td>
                    <td>${producto.favorito ? 'Sí' : 'No'}</td>
                    <td class="action-buttons">
                        <button class="btn btn--sm btn--primary" onclick="window.posSystem.editProduct(${producto.id})">Editar</button>
                        <button class="btn btn--sm btn--outline" onclick="window.posSystem.deleteProduct(${producto.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');
        // Lógica para select all
        const selectAll = document.getElementById('selectAllProducts');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.onclick = function() {
                document.querySelectorAll('.select-product').forEach(cb => {
                    cb.checked = selectAll.checked;
                });
            };
        }
        // Lógica para eliminar seleccionados
        const deleteBtn = document.getElementById('deleteSelectedProductsBtn');
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                const selected = Array.from(document.querySelectorAll('.select-product:checked')).map(cb => parseInt(cb.dataset.id));
                if (selected.length === 0) {
                    alert('Selecciona al menos un producto para eliminar.');
                    return;
                }
                if (!confirm('¿Seguro que deseas eliminar los productos seleccionados?')) return;
                let productos = this.getData('productos');
                productos = productos.filter(p => !selected.includes(p.id));
                this.setData('productos', productos);
                this.updateProductos();
            };
        }
    }

    // Import/Export
    selectFileForImport() {
        document.getElementById('fileInput').click();
    }
    downloadProductTemplate() {
        const headers = ["Nombre", "Precio", "Código de Barras", "Categoría", "Favorito"];
        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
        XLSX.writeFile(wb, 'plantilla_productos.xlsx');
    }
    importProducts(e) {
        const input = document.getElementById('fileInput');
        if (!input.files.length) {
            alert('Selecciona un archivo XLSX válido.');
            return;
        }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
                       const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            // Quitar encabezado
            const productosImportados = rows.slice(1);
            this.processImportedProducts(productosImportados);
        };
        reader.readAsArrayBuffer(file);
    }

    processImportedProducts(productosImportados) {
        let productos = this.getData('productos');
        const categorias = this.getData('categorias');
        productosImportados.forEach(p => {
            // Código de barras puede estar vacío
            const nombre = p[0]?.trim();
            const precio = parseFloat(p[1]);
            const codigoBarras = p[2] ? p[2].trim() : '';
            const categoriaNombre = p[3]?.trim();
            const favorito = p[4]?.toLowerCase() === 'sí' || p[4]?.toLowerCase() === 'si';
            if (!nombre || isNaN(precio) || precio <= 0 || !categoriaNombre) return;
            const categoria = categorias.find(c => c.nombre.toLowerCase() === categoriaNombre.toLowerCase());
            if (!categoria) return;
            productos.push({
                id: this.getNextId('Producto'),
                nombre,
                precio,
                codigoBarras,
                categoriaId: categoria.id,
                favorito
            });
        });
        this.setData('productos', productos);
        this.updateProductos();
        alert('Productos importados correctamente.');
    }
    showConfirmDialog() { }
    hideConfirmModal() { }
    handleConfirm() { }

    // Restaurar datos de ejemplo solo si no hay productos ni categorías
    restoreDefaultData() {
        const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        if (categorias.length === 0 && productos.length === 0) {
            this.initializeDefaultData();
            this.updateUI();
            alert('Datos de ejemplo restaurados.');
        } else {
            alert('No se restauraron los datos porque existen productos o categorías.');
        }
    }

    // Actualizar UI completa
    updateUI() {
        this.updateClientInfo();
        this.updatePaymentButtons();
        this.updatePOS();
    }

    // Muestra el formulario para editar/agregar cliente
    showClientForm(clientId = null) {
        const modal = document.getElementById('formModal');
        const body = document.getElementById('modalBody');
        const title = document.getElementById('modalTitle');
        if (!modal || !body || !title) return;
        let cliente = null;
        if ( clientId) {
            const clientes = this.getData('clientes');
            cliente = clientes.find(c => c.id === clientId);
        }
        title.textContent = clientId ? 'Editar Cliente' : 'Agregar Cliente';
        body.innerHTML = `
            <div class="form-group">
                <label class="form-label">Nombre:</label>
                <input type="text" id="clientNameInput" class="form-control" value="${cliente ? cliente.nombre : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Identificación:</label>
                <input type="text" id="clientIdInput" class="form-control" value="${cliente ? cliente.identificacion : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Tarjeta RFID:</label>
                <input type="text" id="clientRFIDInput" class="form-control" value="${cliente ? cliente.tarjetaRFID : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Saldo:</label>
                <input type="number" id="clientBalanceInput" class="form-control" value="${cliente ? cliente.saldo : 0}" required>
            </div>
        `;
        modal.classList.remove('hidden');
        this.editingItem = clientId;
        this._formType = 'cliente';
    }

    showRecargasHistory() {
        const clientes = this.getData('clientes');
        let html = `<h3>Historial de Recargas</h3><table class='table'><thead><tr><th>Fecha</th><th>Cliente</th><th>Valor</th><th>Nuevo Saldo</th></tr></thead><tbody>`;
        clientes.forEach(cliente => {
            if (Array.isArray(cliente.recargas)) {
                let saldo = 0;
                cliente.recargas.forEach((recarga, idx) => {
                    // Calcular saldo después de la recarga
                    saldo = idx === 0 ? (cliente.saldo - cliente.recargas.slice(1).reduce((a, r) => a + r.monto, 0)) : saldo + cliente.recargas[idx - 1].monto;
                    saldo += recarga.monto;
                    html += `<tr><td>${new Date(recarga.fecha).toLocaleString()}</td><td>${cliente.nombre}</td><td>${this.formatCurrency(recarga.monto)}</td><td>${this.formatCurrency(saldo)}</td></tr>`;
                });
            }
        });
        html += `</tbody></table>`;
        this.showReceiptModal(html);
    }
    showReceiptModal(html) {
        // Asegura que todos los otros modales estén ocultos
        const modals = document.querySelectorAll('.modal');
        modals.forEach(m => m.classList.add('hidden'));
        let modal = document.getElementById('receiptModal');
        let body = document.getElementById('receiptBody');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'receiptModal';
            modal.className = 'modal';
            modal.style.zIndex = '9999';
            modal.innerHTML = `<div class='modal__content'><h2>Recibo</h2><div id='receiptBody'></div><div class='modal__actions'><button id='printReceiptBtn' class='btn btn--primary'>Imprimir</button><button id='closeReceiptBtn' class='btn btn--outline'>Cerrar</button></div></div>`;
            document.body.appendChild(modal);
            body = document.getElementById('receiptBody');
        }
        if (body) body.innerHTML = html;
        modal.classList.remove('hidden');
        document.getElementById('closeReceiptBtn').onclick = () => modal.classList.add('hidden');
        document.getElementById('printReceiptBtn').onclick = () => {
            const printWindow = window.open('', '', 'width=400,height=600');
            printWindow.document.write(`<html><head><title>Recibo</title><link rel='stylesheet' href='style.css'></head><body>${html}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
                       printWindow.close();
        };
    }

    // Finaliza el flujo de venta: limpia carrito, actualiza UI y enfoca búsqueda
    finalizeSaleFlow() {
        this.clearCart();
        this.updateCart();
        this.updatePOS();
        this.focusSearchInput();
    }

    // Mostrar recibo de venta desde historial
    showSaleDetail(ventaId) {
        const ventas = this.getData('ventas');
        const venta = ventas.find(v => v.id === ventaId);
        if (!venta) return;
        let html = `<div class='receipt'><h3>Recibo de Venta</h3><p>Cliente: ${venta.cliente}</p><p>Fecha: ${venta.fecha} ${venta.hora}</p><hr><ul>`;
        venta.productos.forEach(p => {
            html += `<li>${p.nombre} x${p.cantidad} - ${this.formatCurrency(p.precio * p.cantidad)}</li>`;
        });
        html += `</ul><hr><p>Total: ${this.formatCurrency(venta.total)}</p></div>`;
        this.showReceiptModal(html);
    }

    // Mostrar recibo de comanda desde historial
    showComandaDetail(comandaId) {
        const comandas = this.getData('comandas');
        const comanda = comandas.find(c => c.id === comandaId);
        if (!comanda) return;
        let html = `<div class='receipt'><h3>Recibo de Comanda</h3><p>Cliente: ${comanda.cliente}</p><p>Fecha: ${comanda.fecha} ${comanda.hora}</p><hr><ul>`;
        comanda.productos.forEach(p => {
            html += `<li>${p.nombre} x${p.cantidad}</li>`;
        });
        html += `</ul></div>`;
        this.showReceiptModal(html);
    }

    updateInformes() {
        // Inicializa el filtro de clientes y la lista al mostrar la pestaña
        this.setupClientReportFilter();
    }

    setupClientReportFilter() {
        const searchInput = document.getElementById('clientSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.updateClientReportFilter();
            });
        }
        // Inicializar lista al cargar
        this.updateClientReportFilter();
    }

    generateRangeReport() {
        // Genera un resumen de ventas por día en pantalla, filtrando por fechas seleccionadas
        const ventas = this.getData('ventas');
        const fechaDesdeInput = document.getElementById('fechaDesde');
        const fechaHastaInput = document.getElementById('fechaHasta');
        const fechaDesde = fechaDesdeInput ? fechaDesdeInput.value : '';
        const fechaHasta = fechaHastaInput ? fechaHastaInput.value : '';
        // Filtrar ventas por rango de fechas
        const ventasFiltradas = ventas.filter(v => {
            return (!fechaDesde || v.fecha >= fechaDesde) && (!fechaHasta || v.fecha <= fechaHasta);
        });
        if (!ventasFiltradas || ventasFiltradas.length === 0) {
            this.showReceiptModal('<h3>No hay ventas en el rango seleccionado.</h3>');
            return;
        }
        // Agrupar ventas por fecha
        const resumen = {};
        ventasFiltradas.forEach(v => {
            if (!resumen[v.fecha]) resumen[v.fecha] = 0;
            resumen[v.fecha] += v.total;
        });
        let html = `<h3>Resumen de Ventas por Día</h3><table class='table'><thead><tr><th>Fecha</th><th>Total Ventas</th></tr></thead><tbody>`;
        Object.keys(resumen).forEach(fecha => {
            html += `<tr><td>${fecha}</td><td>${this.formatCurrency(resumen[fecha])}</td></tr>`;
        });
        html += `</tbody></table>`;
        this.showReceiptModal(html);
    }

    updateClientReportFilter() {
        // Actualiza la lista de coincidencias de clientes según el texto digitado
        if (!this.getData) return; // Evita error si el método no está disponible
        const clientes = this.getData('clientes');
        const searchInput = document.getElementById('clientSearchInput');
        const clientReportContent = document.getElementById('clientReportContent');
        const filtro = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let html = '';
        if (filtro.length > 0) {
            const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(filtro));
            if (clientesFiltrados.length > 0) {
                html += `<ul style='max-height:200px;overflow-y:auto;'>`;
                clientesFiltrados.forEach(c => {
                    html += `<li><button class='btn btn--sm btn--outline' onclick='window.posSystem.selectClientForReport(${c.id})'>${c.nombre}</button></li>`;
                });
                html += `</ul>`;
            } else {
                html = `<div class='status status--warning'>No hay coincidencias.</div>`;
            }
        } else {
            html = `<div class='status status--info'>Escribe para buscar clientes...</div>`;
        }
        if (clientReportContent) clientReportContent.innerHTML = html;
    }

    selectClientForReport(clientId) {
        this.selectedClientReportId = clientId;
        const clientes = this.getData('clientes');
        const cliente = clientes.find(c => c.id === clientId);
        const clientReportContent = document.getElementById('clientReportContent');
        if (clientReportContent && cliente) {
            clientReportContent.innerHTML = `<div class='status status--info'>Cliente seleccionado: <strong>${cliente.nombre}</strong></div>`;
        }
    }

    generateClientReport() {
        // Genera un resumen de ventas por cliente seleccionado en pantalla
        const ventas = this.getData('ventas');
        const clientes = this.getData('clientes');
        const clienteId = this.selectedClientReportId;
        if (!clienteId) {
            this.showReceiptModal('<h3>Selecciona un cliente para ver el informe.</h3>');
            return;
        }
        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) {
            this.showReceiptModal('<h3>Cliente no encontrado.</h3>');
            return;
        }
        // Filtrar ventas por cliente
        const ventasCliente = ventas.filter(v => v.clienteId === clienteId);
        if (!ventasCliente || ventasCliente.length === 0) {
            this.showReceiptModal(`<h3>No hay ventas para el cliente <strong>${cliente.nombre}</strong>.</h3>`);
            return;
        }
        let total = ventasCliente.reduce((sum, v) => sum + v.total, 0);
        let html = `<h3>Resumen de Ventas para ${cliente.nombre}</h3><table class='table'><thead><tr><th>Fecha</th><th>Total Venta</th></tr></thead><tbody>`;
        ventasCliente.forEach(v => {
            html += `<tr><td>${v.fecha}</td><td>${this.formatCurrency(v.total)}</td></tr>`;
        });
        html += `</tbody></table><hr><strong>Total vendido: ${this.formatCurrency(total)}</strong>`;
        this.showReceiptModal(html);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.posSystem = new POSSystem();
    // Métodos globales para botones
    // Solo asignar si existen en la instancia
    if (window.posSystem.showCategoryProducts) window.posSystem.showCategoryProducts = window.posSystem.showCategoryProducts.bind(window.posSystem);
    if (window.posSystem.showProductForm) window.posSystem.showProductForm = window.posSystem.showProductForm.bind(window.posSystem);
    if (window.posSystem.editProduct) window.posSystem.editProduct = window.posSystem.editProduct.bind(window.posSystem);
    if (window.posSystem.deleteProduct) window.posSystem.deleteProduct = window.posSystem.deleteProduct.bind(window.posSystem);

    // Botón para restaurar datos de ejemplo
    const restoreBtn = document.getElementById('restoreDataBtn');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            window.posSystem.restoreDefaultData();
        });
    }
});