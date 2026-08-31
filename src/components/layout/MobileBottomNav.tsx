'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useBooking } from '@/context/BookingContext';

export function MobileBottomNav() {
    const pathname = usePathname();
    const { totalCount, openCart } = useCart();
    const { openBookingModal } = useBooking();

    const isHome = pathname === '/' || pathname === '';
    const isServices = pathname === '/agendar';
    const isProducts = pathname === '/produtos';

    return (
        <nav className="mobile-bottom-nav" aria-label="Navegação Rápida Mobile">
            <Link
                href="/#home"
                className={`bottom-nav-item ${isHome ? 'active' : ''}`}
                aria-label="Ir para o Início"
            >
                <span className="bottom-nav-icon">🏠</span>
                <span className="bottom-nav-label">Início</span>
            </Link>

            <Link
                href="/agendar"
                className={`bottom-nav-item ${isServices ? 'active' : ''}`}
                aria-label="Ver Serviços e Procedimentos"
            >
                <span className="bottom-nav-icon">💇‍♀️</span>
                <span className="bottom-nav-label">Serviços</span>
            </Link>

            <Link
                href="/produtos"
                className={`bottom-nav-item bottom-nav-wepink ${isProducts ? 'active' : ''}`}
                aria-label="Ver Boutique de Produtos WePink"
            >
                <span className="bottom-nav-icon">🌸</span>
                <span className="bottom-nav-label">
                    Produtos
                    <span className="bottom-nav-badge-dot" title="Frete Grátis"></span>
                </span>
            </Link>

            <button
                type="button"
                className="bottom-nav-item bottom-nav-cart"
                onClick={openCart}
                aria-label="Abrir Sacola de Compras"
            >
                <div className="bottom-nav-icon-wrapper">
                    <span className="bottom-nav-icon">🛒</span>
                    {totalCount > 0 && (
                        <span className="bottom-nav-badge">{totalCount}</span>
                    )}
                </div>
                <span className="bottom-nav-label">Sacola</span>
            </button>

            <button
                type="button"
                className="bottom-nav-item bottom-nav-action"
                onClick={() => openBookingModal()}
                aria-label="Agendar Horário Online"
            >
                <div className="bottom-nav-action-circle">
                    <span>📅</span>
                </div>
                <span className="bottom-nav-label">Agendar</span>
            </button>
        </nav>
    );
}
