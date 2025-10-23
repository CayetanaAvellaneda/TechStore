// Funcionalidad principal de TechStore E-commerce
class TechStore {
    constructor() {
        this.currentProducts = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.currentView = 'grid';
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.initializeEventListeners();
        this.initializeSearch();
        this.initializeFilters();
        this.initializeNavigation();
    }

    // Cargar productos
    loadProducts() {
        this.showLoading(true);
        
        // Simular carga desde API
        setTimeout(() => {
            this.currentProducts = getAllProducts();
            this.filteredProducts = [...this.currentProducts];
            this.renderProducts();
            this.showLoading(false);
        }, 1000);
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        const loading = document.getElementById('loading');
        const productsGrid = document.getElementById('products-grid');
        
        if (loading && productsGrid) {
            this.isLoading = show;
            loading.classList.toggle('show', show);
            productsGrid.style.display = show ? 'none' : 'grid';
        }
    }

    // Renderizar productos
    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid || this.isLoading) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No se encontraron productos</h3>
                    <p style="color: var(--text-light);">Intenta con otros filtros o términos de búsqueda</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = this.filteredProducts.map(product => 
            this.createProductCard(product)
        ).join('');

        // Actualizar clase de vista
        productsGrid.className = `products-grid ${this.currentView}-view`;
    }

    // Crear tarjeta de producto
    createProductCard(product) {
        const discountBadge = product.discount > 0 ? 
            `<div class="discount">-${product.discount}%</div>` : '';
        
        const originalPriceDisplay = product.originalPrice && product.originalPrice > product.price ?
            `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : '';

        const stockStatus = product.inStock ? 
            `<button class="btn btn-primary" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i>
                Agregar al Carrito
            </button>` :
            `<button class="btn btn-secondary" disabled>
                <i class="fas fa-times"></i>
                Agotado
            </button>`;

        // Use first image as main thumb; if images array missing, fallback to empty string
        const mainImage = Array.isArray(product.images) && product.images.length ? product.images[0] : (product.image || '');
        // Build thumbnail HTML for small dots under the image (up to 3)
        const thumbnails = Array.isArray(product.images) ? product.images.slice(0,3).map((img, idx) => `
            <img src="${img}" class="product-thumb" data-product-id="${product.id}" data-thumb-index="${idx}" alt="${product.name} view ${idx+1}" onerror="this.style.display='none';">
        `).join('') : '';

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${mainImage}" alt="${product.name}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <i class="fas fa-laptop" style="display: none;"></i>
                    ${discountBadge}
                    <div class="product-actions">
                        <button class="action-btn wishlist-btn" data-product-id="${product.id}" 
                                onclick="toggleWishlist(${product.id})" title="Agregar a favoritos">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn" onclick="openProductModal(${product.id})" title="Vista rápida">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div class="product-thumbnails">
                        ${thumbnails}
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">
                            ${generateStars(product.rating)}
                        </div>
                        <span class="rating-text">(${product.reviews})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">${formatPrice(product.price)}</span>
                        ${originalPriceDisplay}
                        ${discountBadge}
                    </div>
                    <div class="product-actions-bottom">
                        ${stockStatus}
                    </div>
                </div>
            </div>
        `;
    }

    // Filtrar productos por categoría
    filterByCategory(category) {
        this.currentCategory = category;
        this.applyAllFilters();
        
        // Actualizar botones de categoría
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    // Buscar productos
    searchProducts(query) {
        if (!query.trim()) {
            this.applyAllFilters();
            return;
        }

        this.filteredProducts = searchProducts(query);
        this.renderProducts();
    }

    // Aplicar todos los filtros
    applyAllFilters() {
        let products = getProductsByCategory(this.currentCategory);
        
        // Filtro de precio
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter && priceFilter.value !== 'all') {
            products = filterProductsByPrice(products, priceFilter.value);
        }
        
        // Filtro de marca
        const brandFilter = document.getElementById('brand-filter');
        if (brandFilter && brandFilter.value !== 'all') {
            products = filterProductsByBrand(products, brandFilter.value);
        }
        
        // Ordenamiento
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            products = sortProducts(products, sortFilter.value);
        }
        
        this.filteredProducts = products;
        this.renderProducts();
    }

    // Limpiar todos los filtros
    clearAllFilters() {
        document.getElementById('price-filter').value = 'all';
        document.getElementById('brand-filter').value = 'all';
        document.getElementById('sort-filter').value = 'name';
        document.getElementById('search-input').value = '';
        
        this.currentCategory = 'all';
        this.applyAllFilters();
        
        // Resetear categorías
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
    }

    // Cambiar vista de productos
    changeView(view) {
        this.currentView = view;
        this.renderProducts();
        
        // Actualizar botones de vista
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Categorías
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterByCategory(btn.dataset.category);
            });
        });

        // Filtros
        const priceFilter = document.getElementById('price-filter');
        const brandFilter = document.getElementById('brand-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (priceFilter) priceFilter.addEventListener('change', () => this.applyAllFilters());
        if (brandFilter) brandFilter.addEventListener('change', () => this.applyAllFilters());
        if (sortFilter) sortFilter.addEventListener('change', () => this.applyAllFilters());

        // Limpiar filtros
        const clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Vista de productos
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.changeView(btn.dataset.view);
            });
        });

        // Newsletter
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this.handleNewsletterSubmit);
        }

        // Wishlist button (header)
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                const wishlistModal = document.getElementById('wishlist-modal');
                if (wishlistModal) {
                    wishlistModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }

    // Inicializar búsqueda
    initializeSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            // Búsqueda en tiempo real
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchProducts(e.target.value);
                }, 300);
            });

            // Búsqueda al presionar Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchProducts(e.target.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput ? searchInput.value : '';
                this.searchProducts(query);
            });
        }
    }

    // Inicializar filtros
    initializeFilters() {
        // Los filtros ya están inicializados en initializeEventListeners
        // Aquí podríamos agregar lógica adicional si fuera necesario
    }

    // Inicializar navegación
    initializeNavigation() {
        // Mobile hamburger removed per user request; no toggle behavior needed.

        // CTA button
        const ctaBtn = document.querySelector('.cta-btn');
        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                document.querySelector('.main-content').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    }

    // Manejar envío de newsletter
    handleNewsletterSubmit(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (email) {
            // Simular suscripción
            setTimeout(() => {
                if (cart) {
                    cart.showToast('¡Suscripción exitosa! Gracias por unirte.', 'success');
                }
                e.target.reset();
            }, 500);
        }
    }
}

// Modal de producto
function openProductModal(productId) {
    const product = getProductById(productId);
    if (!product) return;

    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) return;

    const relatedProducts = getRelatedProducts(productId, 3);
    
    // Prepare gallery images
    const gallery = Array.isArray(product.images) && product.images.length ? product.images : (product.image ? [product.image] : []);

    const galleryMain = gallery.length ? gallery[0] : '';

    modalBody.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div class="product-modal-image">
                    <div class="gallery">
                        <button class="gallery-prev" aria-label="Anterior">&larr;</button>
                        <div class="gallery-main-wrap">
                            <img id="gallery-main-img" src="${galleryMain}" alt="${product.name}" style="width:100%; max-height:500px; object-fit:contain;">
                        </div>
                        <button class="gallery-next" aria-label="Siguiente">&rarr;</button>
                        <div class="gallery-thumbs" style="display:flex; gap:0.5rem; margin-top:0.75rem;">
                            ${gallery.map((img, idx) => `
                                <img src="${img}" class="modal-thumb" data-index="${idx}" alt="thumb-${idx}" style="width:60px; height:60px; object-fit:cover; cursor:pointer; border:2px solid transparent;" ${idx===0? 'style="width:60px; height:60px; object-fit:cover; cursor:pointer; border:2px solid var(--primary-color);"':''} onerror="this.style.display='none';">
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="product-modal-info">
                    <div class="product-brand" style="color: var(--text-light); margin-bottom: 0.5rem;">${product.brand}</div>
                    <h2 style="margin-bottom: 1rem;">${product.name}</h2>
                    <div class="product-rating" style="margin-bottom: 1rem;">
                        <div class="stars">${generateStars(product.rating)}</div>
                        <span class="rating-text">(${product.reviews} reseñas)</span>
                    </div>
                    <div class="product-price" style="margin-bottom: 1.5rem;">
                        <span class="current-price" style="font-size: 2rem;">${formatPrice(product.price)}</span>
                        ${product.originalPrice > product.price ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                        ${product.discount > 0 ? `<span class="discount">-${product.discount}%</span>` : ''}
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">${product.description}</p>
                    <div class="stock-status" style="margin-bottom: 1.5rem;">
                        ${product.inStock ? 
                            `<span style="color: var(--success-color);"><i class="fas fa-check"></i> En stock (${product.stock} disponibles)</span>` :
                            `<span style="color: var(--error-color);"><i class="fas fa-times"></i> Agotado</span>`
                        }
                    </div>
                    <div class="product-actions" style="display: flex; gap: 1rem; align-items: center;">
                        <div class="quantity-selector" style="display:flex; align-items:center; gap:0.5rem;">
                            <label style="margin-right:0.25rem;">Cantidad</label>
                            <div class="qty-controls" style="display:flex; align-items:center; gap:0.25rem;">
                                <button class="qty-btn" id="qty-decrease" aria-label="Disminuir cantidad">-</button>
                                <input id="qty-input" type="number" value="1" min="1" max="${product.stock}" style="width:60px; text-align:center;">
                                <button class="qty-btn" id="qty-increase" aria-label="Aumentar cantidad">+</button>
                            </div>
                        </div>
                        ${product.inStock ? 
                            `<button class="btn btn-primary" id="modal-add-to-cart">
                                <i class="fas fa-shopping-cart"></i>
                                Agregar al Carrito
                            </button>` :
                            `<button class="btn btn-secondary" disabled>
                                <i class="fas fa-times"></i>
                                Agotado
                            </button>`
                        }
                        <button class="btn btn-secondary" id="modal-wishlist-btn">
                            <i class="fas fa-heart"></i>
                            ${cart && cart.isInWishlist(product.id) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                        </button>
                    </div>
                    
                    <div class="modal-price-summary" style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
                        <div style="color:var(--text-secondary); font-weight:600;">Total:</div>
                        <div id="modal-total" style="font-size:1.5rem; font-weight:800; color:var(--primary-color);">${formatPrice(product.price)}</div>
                    </div>
                </div>
            </div>
            
            <div class="product-modal-details" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Características</h3>
                <ul style="list-style: none; padding: 0;">
                    ${product.features.map(feature => `
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-check" style="color: var(--success-color);"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            ${relatedProducts.length > 0 ? `
                <div class="related-products" style="margin-top: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Productos Relacionados</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        ${relatedProducts.map(related => `
                            <div class="related-product" style="border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 1rem; text-align: center;">
                                <img src="${related.image}" alt="${related.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: 0.5rem;" 
                                     onerror="this.style.display='none';">
                                <h4 style="font-size: 0.9rem; margin-bottom: 0.5rem;">${related.name}</h4>
                                <div style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.5rem;">${formatPrice(related.price)}</div>
                                <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.5rem 1rem;" onclick="openProductModal(${related.id})">
                                    Ver Detalles
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Gallery behavior: prev/next and thumbnail click
    (function initGallery() {
        const thumbs = modalBody.querySelectorAll('.modal-thumb');
        const mainImg = modalBody.querySelector('#gallery-main-img');
        const prevBtn = modalBody.querySelector('.gallery-prev');
        const nextBtn = modalBody.querySelector('.gallery-next');
        let current = 0;

        function setImage(index) {
            if (!gallery[index]) return;
            current = index;
            if (mainImg) mainImg.src = gallery[index];
            thumbs.forEach(t => t.style.border = '2px solid transparent');
            if (thumbs[current]) thumbs[current].style.border = '2px solid var(--primary-color)';
        }

        thumbs.forEach(t => t.addEventListener('click', function() {
            const idx = parseInt(this.dataset.index, 10);
            setImage(idx);
        }));

        if (prevBtn) prevBtn.addEventListener('click', () => setImage((current - 1 + gallery.length) % gallery.length));
        if (nextBtn) nextBtn.addEventListener('click', () => setImage((current + 1) % gallery.length));
    })();

    // Quantity controls and add-button wiring
    (function initQuantityAndAdd() {
        const qtyInput = modalBody.querySelector('#qty-input');
        const dec = modalBody.querySelector('#qty-decrease');
        const inc = modalBody.querySelector('#qty-increase');
        const addBtn = modalBody.querySelector('#modal-add-to-cart');
        const wishlistBtn = modalBody.querySelector('#modal-wishlist-btn');


        const modalTotal = modalBody.querySelector('#modal-total');

        function updateModalTotal() {
            const quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
            const total = product.price * quantity;
            if (modalTotal) modalTotal.textContent = formatPrice(total);
        }

        if (dec) dec.addEventListener('click', () => {
            if (!qtyInput) return;
            let v = parseInt(qtyInput.value, 10) || 1;
            if (v > 1) qtyInput.value = v - 1;
            updateModalTotal();
        });

        if (inc) inc.addEventListener('click', () => {
            if (!qtyInput) return;
            let v = parseInt(qtyInput.value, 10) || 1;
            if (v < product.stock) qtyInput.value = v + 1;
            updateModalTotal();
        });

        if (qtyInput) {
            qtyInput.addEventListener('input', () => {
                let v = parseInt(qtyInput.value, 10) || 1;
                if (v < 1) v = 1;
                if (v > product.stock) v = product.stock;
                qtyInput.value = v;
                updateModalTotal();
            });
        }

        // Initialize displayed total
        updateModalTotal();

        if (addBtn) addBtn.addEventListener('click', () => {
            const quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
            closeProductModalAndAdd(product.id, quantity);
        });

        if (wishlistBtn) wishlistBtn.addEventListener('click', () => {
            toggleWishlist(product.id);
            // Update button text
            if (wishlistBtn) {
                wishlistBtn.innerHTML = cart && cart.isInWishlist(product.id) ? '<i class="fas fa-heart"></i> Quitar de Favoritos' : '<i class="fas fa-heart"></i> Agregar a Favoritos';
            }
        });
    })();

    // Create sticky footer for small screens with total + add button
    (function createStickyFooterIfMobile() {
        function removeSticky() {
            const existing = document.querySelectorAll('.modal-sticky-footer');
            existing.forEach(e => e.remove());
        }

        function buildSticky() {
            removeSticky();
            const footer = document.createElement('div');
            footer.className = 'modal-sticky-footer';

            const left = document.createElement('div');
            left.className = 'sticky-left';
            left.innerHTML = `<div style="font-size:0.9rem; color:var(--text-secondary)">Total</div><div class="sticky-total" id="sticky-modal-total">${formatPrice(product.price)}</div>`;

            const right = document.createElement('div');
            right.className = 'sticky-actions';
            right.innerHTML = `<button class="btn btn-secondary" id="sticky-view-details">Ver detalles</button><button class="btn btn-primary" id="sticky-add-btn">Agregar</button>`;

            footer.appendChild(left);
            footer.appendChild(right);

            document.body.appendChild(footer);

            // Wire actions
            const stickyAdd = document.getElementById('sticky-add-btn');
            const stickyView = document.getElementById('sticky-view-details');
            const stickyTotal = document.getElementById('sticky-modal-total');

            if (stickyView) stickyView.addEventListener('click', () => {
                // Scroll modal body to details section
                const details = modalBody.querySelector('.product-modal-details');
                if (details) details.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            if (stickyAdd) stickyAdd.addEventListener('click', () => {
                const quantity = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
                // Use same flow as normal add button (close modal then add)
                closeProductModalAndAdd(product.id, quantity);
                removeSticky();
            });

            // update sticky total when qty changes
            function updateSticky() {
                const q = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
                if (stickyTotal) stickyTotal.textContent = formatPrice(product.price * q);
            }

            if (qtyInput) qtyInput.addEventListener('input', updateSticky);
            if (inc) inc.addEventListener('click', updateSticky);
            if (dec) dec.addEventListener('click', updateSticky);

        }

        if (window.innerWidth <= 768) {
            buildSticky();
        }

        // Remove sticky footer when modal closes via closeModal()
        // closeModal will remove any elements with class 'modal-sticky-footer' (see below adjustment)
    })();
}

// Cerrar modal
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
    // Remove any sticky footers created for mobile modals
    document.querySelectorAll('.modal-sticky-footer').forEach(el => el.remove());
}

// Event listeners para modales
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modales con el botón X
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Cerrar modal al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });

    // Tecla Escape para cerrar modales
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeSidebar();
        }
    });
    // Close wishlist modal button
    const wishlistClose = document.getElementById('wishlist-close');
    if (wishlistClose) {
        wishlistClose.addEventListener('click', function() {
            const m = document.getElementById('wishlist-modal');
            if (m) m.classList.remove('show');
            document.body.style.overflow = '';
        });
    }

    // Close wishlist when clicking outside
    const wishlistModal = document.getElementById('wishlist-modal');
    if (wishlistModal) {
        wishlistModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // (Previously handled add-option modal; shipping selection now in checkout form)

    // Wire info modal close buttons
    const shippingClose = document.getElementById('shipping-close');
    if (shippingClose) shippingClose.addEventListener('click', () => { document.getElementById('shipping-modal').classList.remove('show'); document.body.style.overflow = ''; });
    const returnsClose = document.getElementById('returns-close');
    if (returnsClose) returnsClose.addEventListener('click', () => { document.getElementById('returns-modal').classList.remove('show'); document.body.style.overflow = ''; });
    const warrantyClose = document.getElementById('warranty-close');
    if (warrantyClose) warrantyClose.addEventListener('click', () => { document.getElementById('warranty-modal').classList.remove('show'); document.body.style.overflow = ''; });
});

// Scroll to a page section by id
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Footer category filter helper
function filterFooterCategory(category) {
    // Activate category button and filter products
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    if (store) {
        store.filterByCategory(category);
        // Scroll to products
        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    }
}

// Open info modals
function openShipping() {
    const m = document.getElementById('shipping-modal');
    if (m) {
        m.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function openReturns() {
    const m = document.getElementById('returns-modal');
    if (m) {
        m.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function openWarranty() {
    const m = document.getElementById('warranty-modal');
    if (m) {
        m.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close product modal and open add-option modal to add product
function closeProductModalAndAdd(productId, quantity = 1) {
    // Close only the product modal
    const productModal = document.getElementById('product-modal');
    if (productModal) productModal.classList.remove('show');
    document.body.style.overflow = '';

    // Directly add to cart (no shipping option here). Shipping/delivery
    // will be chosen during checkout when user enters shipping data.
    addToCart(productId, quantity);
}

// Instancia global de la tienda
let store;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    store = new TechStore();
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Efecto parallax suave en el hero
    const hero = document.querySelector('.hero-banner');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.1;
            hero.style.transform = `translateY(${parallax}px)`;
        });
    }

    // Animaciones de entrada
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animaciones
    document.querySelectorAll('.product-card, .footer-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

console.log('TechStore E-commerce iniciado correctamente! 🛒✨');