// Sistema de Carrito de Compras
class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.wishlist = this.loadWishlistFromStorage();
        this.updateCartUI();
        this.updateWishlistUI();
    }

    // Agregar producto al carrito
    addItem(productId, quantity = 1) {
        const product = getProductById(productId);
        if (!product) {
            this.showToast('Producto no encontrado', 'error');
            return false;
        }

        if (!product.inStock || product.stock < quantity) {
            this.showToast('Producto fuera de stock', 'error');
            return false;
        }

        const existingItem = this.items.find(item => item.id === productId && item.deliveryOption === (arguments[2] || 'pickup'));

        const deliveryOption = arguments[2] || 'pickup'; // 'pickup' or 'delivery'

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: productId,
                quantity: quantity,
                deliveryOption: deliveryOption,
                addedAt: new Date().toISOString()
            });
        }

        this.saveToStorage();
        this.updateCartUI();
        this.showToast(`${product.name} agregado al carrito`, 'success');
        return true;
    }

    // Remover producto del carrito
    removeItem(productId) {
        const product = getProductById(productId);
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartUI();
        
        if (product) {
            this.showToast(`${product.name} eliminado del carrito`, 'success');
        }
    }

    // Actualizar cantidad de un producto
    updateQuantity(productId, quantity) {
        const product = getProductById(productId);
        if (!product) return false;

        if (quantity <= 0) {
            this.removeItem(productId);
            return true;
        }

        if (quantity > product.stock) {
            this.showToast(`Solo hay ${product.stock} unidades disponibles`, 'warning');
            return false;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveToStorage();
            this.updateCartUI();
        }
        return true;
    }

    // Vaciar carrito
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
        this.showToast('Carrito vaciado', 'success');
    }

    // Obtener items del carrito con datos completos
    getItems() {
        return this.items.map(item => {
            const product = getProductById(item.id);
            return {
                ...item,
                product: product
            };
        }).filter(item => item.product); // Filtrar productos que ya no existen
    }

    // Obtener total del carrito
    getTotal() {
        const DELIVERY_FEE = 15; // fixed fee per delivery item
        return this.getItems().reduce((total, item) => {
            const itemTotal = item.product.price * item.quantity;
            const deliveryCharge = (item.deliveryOption === 'delivery') ? DELIVERY_FEE : 0;
            return total + itemTotal + deliveryCharge;
        }, 0);
    }

    // Obtener cantidad total de items
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Funciones de Wishlist
    addToWishlist(productId) {
        const product = getProductById(productId);
        if (!product) return false;

        if (this.wishlist.includes(productId)) {
            this.showToast('El producto ya está en favoritos', 'warning');
            return false;
        }

        this.wishlist.push(productId);
        this.saveWishlistToStorage();
        this.updateWishlistUI();
        this.showToast(`${product.name} agregado a favoritos`, 'success');
        return true;
    }

    removeFromWishlist(productId) {
        const product = getProductById(productId);
        this.wishlist = this.wishlist.filter(id => id !== productId);
        this.saveWishlistToStorage();
        this.updateWishlistUI();
        
        if (product) {
            this.showToast(`${product.name} eliminado de favoritos`, 'success');
        }
    }

    isInWishlist(productId) {
        return this.wishlist.includes(productId);
    }

    getWishlistItems() {
        return this.wishlist.map(id => getProductById(id)).filter(product => product);
    }

    // Actualizar UI del carrito
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
            cartCount.style.display = this.getTotalItems() > 0 ? 'flex' : 'none';
        }

        if (cartTotal) {
            cartTotal.textContent = formatPrice(this.getTotal());
        }

        if (cartItems) {
            this.renderCartItems();
        }
    }

    // Actualizar UI de wishlist
    updateWishlistUI() {
        const wishlistCount = document.getElementById('wishlist-count');
        
        if (wishlistCount) {
            wishlistCount.textContent = this.wishlist.length;
            wishlistCount.style.display = this.wishlist.length > 0 ? 'flex' : 'none';
        }

        // Actualizar botones de wishlist en productos
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            if (this.isInWishlist(productId)) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
        });
        // Also update wishlist modal content if open
        this.renderWishlistModal();
    }

    // Renderizar items del carrito
    renderCartItems() {
        const cartItems = document.getElementById('cart-items');
        const items = this.getItems();

        if (items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">Tu carrito está vacío</p>
                    <button class="btn btn-primary" onclick="closeSidebar()">Seguir Comprando</button>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.product.image}" alt="${item.product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <i class="fas fa-laptop" style="display: none;"></i>
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">${formatPrice(item.product.price)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" onclick="cart.removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Renderizar modal de wishlist
    renderWishlistModal() {
        const modalBody = document.getElementById('wishlist-body');
        if (!modalBody) return;

        const items = this.getWishlistItems();
        if (!items || items.length === 0) {
            modalBody.innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <i class="fas fa-heart" style="font-size:3rem; color:var(--text-light); margin-bottom:1rem;"></i>
                    <p style="color:var(--text-secondary);">Aún no tienes favoritos</p>
                </div>`;
            return;
        }

        modalBody.innerHTML = items.map(product => `
            <div style="display:flex; gap:1rem; align-items:center; padding:1rem; border-bottom:1px solid var(--border-color);">
                <div style="width:80px; height:80px; overflow:hidden; border-radius:8px; background:var(--background-dark);">
                    <img src="${product.images && product.images[0] ? product.images[0] : (product.image||'')}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none';">
                </div>
                <div style="flex:1;">
                    <div style="font-weight:700;">${product.name}</div>
                    <div style="color:var(--primary-color); font-weight:700;">${formatPrice(product.price)}</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                    <button class="btn btn-primary" onclick="openProductModal(${product.id}); document.getElementById('wishlist-modal').classList.remove('show');">Ver</button>
                    <button class="btn btn-secondary" onclick="cart.removeFromWishlist(${product.id})">Quitar</button>
                </div>
            </div>
        `).join('');
    }

    // Guardar en localStorage
    saveToStorage() {
        localStorage.setItem('techstore_cart', JSON.stringify(this.items));
    }

    // Cargar desde localStorage
    loadFromStorage() {
        const saved = localStorage.getItem('techstore_cart');
        return saved ? JSON.parse(saved) : [];
    }

    // Guardar wishlist en localStorage
    saveWishlistToStorage() {
        localStorage.setItem('techstore_wishlist', JSON.stringify(this.wishlist));
    }

    // Cargar wishlist desde localStorage
    loadWishlistFromStorage() {
        const saved = localStorage.getItem('techstore_wishlist');
        return saved ? JSON.parse(saved) : [];
    }

    // Mostrar toast notification
    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 4000);
    }

    // Procesar checkout
    // Accept optional options: { shippingAmount }
    processCheckout(customerData, options = {}) {
        const items = this.getItems();
        if (items.length === 0) {
            this.showToast('El carrito está vacío', 'error');
            return false;
        }

        const shippingAmount = options.shippingAmount || 0;

        // Simular procesamiento de pago
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simular reducción de stock
                items.forEach(item => {
                    reduceStock(item.id, item.quantity);
                });

                // Calcular totals
                const subtotalAmount = items.reduce((s, item) => s + (item.product.price * item.quantity), 0);
                const totalAmount = subtotalAmount + shippingAmount;

                // Limpiar carrito
                this.clear();

                // Mostrar mensaje de éxito
                this.showToast('¡Pedido realizado con éxito!', 'success');
                
                resolve({
                    success: true,
                    orderId: 'ORD-' + Date.now(),
                    total: totalAmount,
                    subtotal: subtotalAmount,
                    shipping: shippingAmount,
                    items: items
                });
            }, 2000);
        });
    }
}

// Instancia global del carrito
let cart;

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    cart = new ShoppingCart();
});

// Funciones globales para usar en HTML
function addToCart(productId, quantity = 1) {
    // Add directly as pickup by default. The user will choose delivery in the checkout form.
    if (cart) cart.addItem(parseInt(productId), parseInt(quantity));
}

function removeFromCart(productId) {
    if (cart) {
        cart.removeItem(parseInt(productId));
    }
}

function toggleWishlist(productId) {
    if (!cart) return;
    
    const id = parseInt(productId);
    if (cart.isInWishlist(id)) {
        cart.removeFromWishlist(id);
    } else {
        cart.addToWishlist(id);
    }
}

function clearCart() {
    if (cart) {
        cart.clear();
    }
}

function openCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) {
        cartSidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Botón del carrito
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }

    // Botón cerrar carrito
    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeSidebar);
    }

    // Botón vaciar carrito
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Botón checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart && cart.getTotalItems() > 0) {
                openCheckoutModal();
            } else {
                cart.showToast('El carrito está vacío', 'warning');
            }
        });
    }
});

// Función para abrir modal de checkout
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const subtotal = document.getElementById('subtotal');
    const finalTotal = document.getElementById('final-total');
    
    if (modal && cart) {
        // Calculate subtotal only (shipping will be decided by the user on the form)
        const items = cart.getItems();
        const subtotalAmount = items.reduce((s, item) => s + (item.product.price * item.quantity), 0);
        const total = subtotalAmount; // initial value; shipping added after user selects option

        if (subtotal) subtotal.textContent = formatPrice(subtotalAmount);
        // Set shipping placeholder to $0.00 (will update after user chooses delivery option)
        const shippingDisplay = document.querySelector('#checkout-modal .summary-row span:nth-child(2)');
        if (shippingDisplay) shippingDisplay.textContent = '$0.00';
        if (finalTotal) finalTotal.textContent = formatPrice(total);
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Función para cerrar modal de checkout
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Event listener para el formulario de checkout
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!cart || cart.getTotalItems() === 0) {
                cart.showToast('El carrito está vacío', 'error');
                return;
            }

            // Recopilar datos del formulario
            const formData = new FormData(checkoutForm);
            const customerData = {
                name: formData.get('customer-name') || document.getElementById('customer-name').value,
                email: formData.get('customer-email') || document.getElementById('customer-email').value,
                phone: formData.get('customer-phone') || document.getElementById('customer-phone').value,
                address: formData.get('address') || document.getElementById('address').value,
                city: formData.get('city') || document.getElementById('city').value,
                postalCode: formData.get('postal-code') || document.getElementById('postal-code').value,
                paymentMethod: formData.get('payment') || 'card'
            };

            // Validar datos
            if (!customerData.name || !customerData.email || !customerData.address) {
                cart.showToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            // Leer elección de entrega del formulario
            const deliveryOption = checkoutForm.querySelector('input[name="delivery"]:checked') ? checkoutForm.querySelector('input[name="delivery"]:checked').value : 'pickup';

            // Si se eligió delivery, sumaremos el recargo y markearemos items como delivery for calculation
            const DELIVERY_FEE = 15;

            // Compute totals based on delivery selection
            const items = cart.getItems();
            const subtotalAmount = items.reduce((s, item) => s + (item.product.price * item.quantity), 0);
            const shippingAmount = deliveryOption === 'delivery' ? (DELIVERY_FEE * items.length) : 0;
            const totalAmount = subtotalAmount + shippingAmount;

            // Update summary display before processing
            const subtotalEl = document.getElementById('subtotal');
            const shippingDisplay = document.querySelector('#checkout-modal .summary-row span:nth-child(2)');
            const finalTotal = document.getElementById('final-total');
            if (subtotalEl) subtotalEl.textContent = formatPrice(subtotalAmount);
            if (shippingDisplay) shippingDisplay.textContent = shippingAmount > 0 ? formatPrice(shippingAmount) : '$0.00';
            if (finalTotal) finalTotal.textContent = formatPrice(totalAmount);

            // Deshabilitar botón de envío
            const submitBtn = checkoutForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Procesando...';
            submitBtn.disabled = true;

            try {
                // Attach delivery choice to customerData for processing if needed
                customerData.deliveryOption = deliveryOption;
                const result = await cart.processCheckout(customerData, { shippingAmount });
                
                if (result.success) {
                    closeCheckoutModal();
                    closeSidebar();
                    
                    // Mostrar modal de confirmación
                    showOrderConfirmation(result);
                }
            } catch (error) {
                cart.showToast('Error al procesar el pedido', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Cerrar modal de checkout
    const checkoutClose = document.getElementById('checkout-close');
    if (checkoutClose) {
        checkoutClose.addEventListener('click', closeCheckoutModal);
    }
});

// Función para mostrar confirmación de pedido
function showOrderConfirmation(orderData) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-body" style="text-align: center; padding: 3rem;">
                <div style="color: var(--success-color); font-size: 4rem; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2 style="color: var(--success-color); margin-bottom: 1rem;">¡Pedido Confirmado!</h2>
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">
                    Tu pedido <strong>#${orderData.orderId}</strong> ha sido procesado exitosamente.
                </p>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    Recibirás un email de confirmación en breve con los detalles de tu pedido.
                </p>
                <div style="background: var(--background-alt); padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 2rem;">
                    <h4 style="margin-bottom: 1rem;">Resumen del Pedido</h4>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Total de productos:</span>
                        <span>${formatPrice(orderData.total - 15)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Envío:</span>
                        <span>$15.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
                        <span>Total:</span>
                        <span>${formatPrice(orderData.total)}</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove(); location.reload();">
                    Continuar Comprando
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// (Shipping selection moved to checkout) promptAddToCart removed.