/**
 * STUDIO LUMINA - SISTEMA DE CARRINHO DE COMPRAS & PRODUTOS HOME CARE
 * Gerenciamento de sacola, persistência em localStorage e checkout via WhatsApp.
 */

class ShoppingCart {
    constructor() {
        this.items = [];
        this.deliveryType = 'retirada'; // 'retirada' ou 'entrega'
        this.storageKey = 'studio_lumina_cart_v1';

        this.loadCart();
        this.initElements();
        this.bindEvents();
        this.render();
    }

    initElements() {
        this.drawerBackdrop = document.getElementById('cartDrawerBackdrop');
        this.drawerEl = document.getElementById('cartDrawer');
        this.closeBtn = document.getElementById('closeCartDrawer');
        this.cartItemsList = document.getElementById('cartItemsList');
        this.cartEmptyState = document.getElementById('cartEmptyState');
        this.cartFooter = document.getElementById('cartDrawerFooter');
        
        this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
        this.cartSubtotalEl = document.getElementById('cartSubtotal');
        this.cartTotalEl = document.getElementById('cartTotal');
        
        this.checkoutBtn = document.getElementById('cartCheckoutBtn');
        this.deliverySelect = document.getElementById('cartDeliveryOption');
        this.notesInput = document.getElementById('cartOrderNotes');
    }

    bindEvents() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeDrawer());
        }

        if (this.drawerBackdrop) {
            this.drawerBackdrop.addEventListener('click', (e) => {
                if (e.target === this.drawerBackdrop) this.closeDrawer();
            });
        }

        if (this.deliverySelect) {
            this.deliverySelect.addEventListener('change', (e) => {
                this.deliveryType = e.target.value;
            });
        }

        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => this.checkoutWhatsApp());
        }

        // Abrir carrinho por botões com data-action="open-cart"
        document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openDrawer();
            });
        });
    }

    loadCart() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            this.items = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.items = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (e) {
            console.error('Erro ao salvar carrinho:', e);
        }
    }

    addItem(productId) {
        const product = salonData.products.find(p => p.id === productId);
        if (!product) return;

        const existing = this.items.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                volume: product.volume,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.render();
        window.showToast?.(`🛍️ "${product.name}" adicionado à sacola!`);
        this.openDrawer();
    }

    updateQuantity(productId, delta) {
        const item = this.items.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.items = this.items.filter(i => i.id !== productId);
        }

        this.saveCart();
        this.render();
    }

    removeItem(productId) {
        this.items = this.items.filter(i => i.id !== productId);
        this.saveCart();
        this.render();
        window.showToast?.('Item removido da sacola.');
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.render();
    }

    getTotalCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    openDrawer() {
        if (this.drawerBackdrop) {
            this.drawerBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeDrawer() {
        if (this.drawerBackdrop) {
            this.drawerBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    render() {
        const totalCount = this.getTotalCount();
        const totalPrice = this.getTotalPrice();

        // Atualizar badges
        this.cartCountBadges.forEach(badge => {
            badge.innerText = totalCount;
            badge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
        });

        // Atualizar lista
        if (!this.cartItemsList) return;

        if (this.items.length === 0) {
            this.cartItemsList.style.display = 'none';
            if (this.cartEmptyState) this.cartEmptyState.style.display = 'flex';
            if (this.cartFooter) this.cartFooter.style.display = 'none';
        } else {
            this.cartItemsList.style.display = 'flex';
            if (this.cartEmptyState) this.cartEmptyState.style.display = 'none';
            if (this.cartFooter) this.cartFooter.style.display = 'block';

            this.cartItemsList.innerHTML = this.items.map(item => `
                <div class="cart-item-card">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <span class="cart-item-brand">${item.brand}</span>
                        <h5 class="cart-item-title">${item.name}</h5>
                        <div class="cart-item-volume">${item.volume}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                        
                        <div class="cart-item-actions">
                            <div class="cart-qty-control">
                                <button type="button" class="qty-btn" onclick="window.cartApp.updateQuantity('${item.id}', -1)">−</button>
                                <span class="qty-number">${item.quantity}</span>
                                <button type="button" class="qty-btn" onclick="window.cartApp.updateQuantity('${item.id}', 1)">+</button>
                            </div>
                            <button type="button" class="cart-remove-btn" onclick="window.cartApp.removeItem('${item.id}')" title="Remover item">
                                🗑️ Remover
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        if (this.cartSubtotalEl) this.cartSubtotalEl.innerText = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
        if (this.cartTotalEl) this.cartTotalEl.innerText = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
    }

    checkoutWhatsApp() {
        if (this.items.length === 0) {
            window.showToast?.('Sua sacola está vazia!');
            return;
        }

        const totalPrice = this.getTotalPrice();
        const deliveryLabel = this.deliveryType === 'entrega' 
            ? '🚚 Entrega / Delivery (GRÁTIS - Sem Taxa de Entrega 🎉)' 
            : '🏬 Retirada no Salão (Av. Tuxaua Farias, 259, Bonfim - RR)';
        
        const notes = this.notesInput ? this.notesInput.value.trim() : '';

        // Montar mensagem para o WhatsApp
        const message = 
`🛍️ *NOVO PEDIDO DE PRODUTOS - GLAMOUR STUDIO* 🛍️
━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *Itens Selecionados:*
${this.items.map(item => `• ${item.quantity}x ${item.name} (${item.volume}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`).join('\n')}

💰 *Total do Pedido:* R$ ${totalPrice.toFixed(2).replace('.', ',')}
📍 *Forma de Recebimento:* ${deliveryLabel}
${notes ? `📝 *Observações / Endereço de Entrega:* ${notes}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
_Pedido gerado pela Boutique Online do Glamour Studio (Entrega Gratuita)._`;

        const encodedMessage = encodeURIComponent(message);
        const targetWhatsapp = salonData.info.whatsappVendas || '5595984298305';
        const whatsappUrl = `https://wa.me/${targetWhatsapp}?text=${encodedMessage}`;

        window.showToast?.('Preparando seu pedido... Redirecionando para Graziele no WhatsApp!');

        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            this.closeDrawer();
        }, 800);
    }
}

// Instanciar globalmente
let cartApp;
document.addEventListener('DOMContentLoaded', () => {
    cartApp = new ShoppingCart();
    window.cartApp = cartApp;
});
