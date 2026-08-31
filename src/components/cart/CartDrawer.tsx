'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
    const {
        items,
        isOpen,
        closeCart,
        deliveryType,
        setDeliveryType,
        notes,
        setNotes,
        updateQuantity,
        removeItem,
        subtotal,
        checkoutWhatsApp,
        totalCount,
    } = useCart();

    return (
        <div
            className={`cart-drawer-backdrop ${isOpen ? 'active' : ''}`}
            id="cartDrawerBackdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Sacola de Compras"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeCart();
            }}
        >
            <div className="cart-drawer" id="cartDrawer">
                {/* Header da Sacola */}
                <div className="cart-drawer-header">
                    <div className="cart-header-title-box">
                        <h3 className="cart-drawer-title">
                            <span>🛍️</span>
                            <span>Sua Sacola</span>
                        </h3>
                        {totalCount > 0 && (
                            <span className="cart-header-count-badge">
                                {totalCount} {totalCount === 1 ? 'item' : 'itens'}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        className="cart-drawer-close-btn"
                        id="closeCartDrawer"
                        aria-label="Fechar Sacola"
                        onClick={closeCart}
                    >
                        ✕
                    </button>
                </div>

                {/* Banner de Frete Grátis */}
                <div className="cart-shipping-banner">
                    <span className="cart-shipping-icon">🚚</span>
                    <div className="cart-shipping-text">
                        <strong>Frete 100% Grátis</strong> em toda Bonfim - RR!
                    </div>
                </div>

                {/* Corpo com Itens ou Empty State */}
                <div className="cart-drawer-body">
                    {items.length === 0 ? (
                        <div className="cart-empty-state" id="cartEmptyState">
                            <div className="cart-empty-icon-wrapper">
                                <span className="cart-empty-icon">🛍️</span>
                            </div>
                            <h4 className="cart-empty-title">
                                Sua sacola está vazia
                            </h4>
                            <p className="cart-empty-desc">
                                Escolha perfumes Virginia Fonseca, body splashes e cosméticos de luxo com frete grátis para sua casa.
                            </p>
                            <Link href="/produtos" className="btn btn-primary btn-md cart-empty-btn" onClick={closeCart}>
                                <span>🌸</span> Explorar Boutique WePink
                            </Link>
                        </div>
                    ) : (
                        <div className="cart-items-list" id="cartItemsList">
                            {items.map((item) => (
                                <div key={item.id} className="cart-item-card">
                                    <div className="cart-item-img-wrapper">
                                        <img src={item.image} alt={item.name} className="cart-item-img" />
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-top">
                                            <span className="cart-item-brand">{item.brand || 'WEPINK'}</span>
                                            <button
                                                type="button"
                                                className="cart-item-remove"
                                                onClick={() => removeItem(item.id)}
                                                title="Remover produto"
                                                aria-label={`Remover ${item.name}`}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <h4 className="cart-item-title">{item.name}</h4>
                                        {item.volume && <span className="cart-item-volume">{item.volume}</span>}

                                        <div className="cart-item-bottom">
                                            <div className="cart-item-price">
                                                R$ {((item.price || 0) * item.quantity).toFixed(2).replace('.', ',')}
                                            </div>

                                            <div className="cart-qty-control">
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    aria-label="Diminuir quantidade"
                                                >
                                                    -
                                                </button>
                                                <span className="qty-number">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    className="qty-btn"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    aria-label="Aumentar quantidade"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé com Fechamento de Pedido */}
                {items.length > 0 && (
                    <div className="cart-drawer-footer" id="cartDrawerFooter">
                        {/* Opções de Recebimento Interativas (Segmentadas) */}
                        <div className="cart-delivery-selector">
                            <label className="cart-section-label">Como deseja receber?</label>
                            <div className="cart-delivery-cards">
                                <button
                                    type="button"
                                    className={`cart-delivery-card ${deliveryType === 'entrega' ? 'active' : ''}`}
                                    onClick={() => setDeliveryType('entrega')}
                                >
                                    <div className="delivery-card-icon">🚚</div>
                                    <div className="delivery-card-info">
                                        <span className="delivery-card-title">Entrega Grátis</span>
                                        <span className="delivery-card-desc">Delivery em Bonfim</span>
                                    </div>
                                    {deliveryType === 'entrega' && <span className="delivery-card-check">✓</span>}
                                </button>

                                <button
                                    type="button"
                                    className={`cart-delivery-card ${deliveryType === 'retirada' ? 'active' : ''}`}
                                    onClick={() => setDeliveryType('retirada')}
                                >
                                    <div className="delivery-card-icon">🏬</div>
                                    <div className="delivery-card-info">
                                        <span className="delivery-card-title">Retirar no Salão</span>
                                        <span className="delivery-card-desc">Av. Tuxaua Farias</span>
                                    </div>
                                    {deliveryType === 'retirada' && <span className="delivery-card-check">✓</span>}
                                </button>
                            </div>
                        </div>

                        {/* Campo de Endereço / Observação */}
                        <div className="cart-notes-group">
                            <div className="cart-input-wrapper">
                                <span className="cart-input-icon">📍</span>
                                <input
                                    type="text"
                                    id="cartOrderNotes"
                                    className="cart-form-input"
                                    placeholder={
                                        deliveryType === 'entrega'
                                            ? 'Endereço de entrega ou ponto de referência...'
                                            : 'Observações do pedido (opcional)...'
                                    }
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Resumo de Valores */}
                        <div className="cart-summary-box">
                            <div className="cart-summary-row">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="cart-summary-row shipping-row">
                                <span>Frete</span>
                                <span className="free-shipping-tag">GRÁTIS 🎉</span>
                            </div>
                            <div className="cart-summary-divider"></div>
                            <div className="cart-summary-row total-row">
                                <span>Total a Pagar</span>
                                <span className="cart-total-value">
                                    R$ {subtotal.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>

                        {/* Botão de Finalizar no WhatsApp */}
                        <button
                            type="button"
                            className="btn btn-whatsapp cart-checkout-btn"
                            id="cartCheckoutBtn"
                            onClick={checkoutWhatsApp}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.838.5 3.633 1.453 5.211L2 22l4.906-1.422a10.02 10.02 0 0 0 5.125 1.453h.004c5.535 0 10.031-4.496 10.031-10.031C22.066 6.496 17.566 2 12.031 2zm0 18.344a8.315 8.315 0 0 1-4.242-1.156l-.305-.18-3.152.914.922-3.078-.2-.316A8.307 8.307 0 0 1 3.719 12.03c0-4.586 3.727-8.312 8.313-8.312 4.586 0 8.312 3.726 8.312 8.312 0 4.586-3.726 8.313-8.313 8.313zm4.551-6.223c-.25-.125-1.477-.73-1.707-.812-.23-.082-.398-.125-.566.125-.168.25-.652.812-.8 1-.148.188-.297.207-.547.082-.25-.125-1.055-.387-2.012-1.238-.742-.664-1.242-1.484-1.39-1.734-.145-.25-.016-.387.109-.512.113-.113.25-.293.375-.438.125-.148.168-.25.25-.418.082-.168.043-.316-.02-.441-.063-.125-.566-1.363-.777-1.867-.203-.492-.414-.422-.566-.43-.145-.008-.313-.008-.48-.008-.168 0-.441.063-.672.313-.23.25-.883.863-.883 2.105 0 1.242.906 2.441 1.031 2.61.125.168 1.785 2.726 4.324 3.824.605.262 1.078.418 1.449.535.61.195 1.164.168 1.602.102.488-.074 1.477-.605 1.684-1.191.207-.586.207-1.09.145-1.192-.063-.102-.23-.168-.48-.293z"/>
                            </svg>
                            <span>Finalizar no WhatsApp • R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
