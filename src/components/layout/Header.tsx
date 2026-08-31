'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useBooking } from '@/context/BookingContext';
import { MobileDrawer } from './MobileDrawer';

export function Header() {
    const pathname = usePathname();
    const { totalCount, openCart } = useCart();
    const { openBookingModal } = useBooking();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isHome = pathname === '/' || pathname === '';
    const isServices = pathname === '/agendar';
    const isProducts = pathname === '/produtos';

    return (
        <>
            <header className="header" id="header">
                <div className="container header-container">
                    <Link href="/#home" className="logo">
                        <img
                            src="/assets/images/logo-glamour-studio.jpg"
                            alt="Logo Glamour Studio"
                            className="logo-badge-img"
                        />
                        <div className="logo-text-box">
                            <span className="logo-main">GLAMOUR STUDIO</span>
                            <span className="logo-sub">GRAZIELE & LUCIANA BEZERRA</span>
                        </div>
                    </Link>

                    {/* Navegação Desktop */}
                    <nav className="nav-desktop" id="navDesktop" aria-label="Navegação Principal">
                        <Link href="/#home" className={`nav-link ${isHome ? 'active' : ''}`}>
                            Início
                        </Link>
                        <Link href="/agendar" className={`nav-link ${isServices ? 'active' : ''}`}>
                            Serviços
                        </Link>
                        <Link href="/produtos" className={`nav-link ${isProducts ? 'active' : ''}`}>
                            Produtos
                        </Link>
                        <Link href="/#sobre" className="nav-link">
                            O Salão
                        </Link>
                        <Link href="/#faq" className="nav-link">
                            Dúvidas
                        </Link>
                        <Link href="/#contato" className="nav-link">
                            Contato
                        </Link>
                    </nav>

                    {/* Ações do Header */}
                    <div className="header-actions">
                        {/* Botão Carrinho de Compras */}
                        <button
                            type="button"
                            className="header-cart-btn"
                            onClick={openCart}
                            title="Ver Sacola de Produtos"
                            aria-label="Carrinho de Compras"
                        >
                            <span className="cart-icon">🛒</span>
                            {totalCount > 0 && (
                                <span className="cart-count-badge">
                                    {totalCount}
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => openBookingModal()}
                            className="btn btn-primary btn-sm header-booking-btn"
                        >
                            <span>📅</span> Agendar Horário
                        </button>

                        <button
                            type="button"
                            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                            id="mobileMenuToggle"
                            aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
                            aria-expanded={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <svg
                                className="hamburger-icon"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line className="line line-1" x1="4" y1="6" x2="20" y2="6"></line>
                                <line className="line line-2" x1="4" y1="12" x2="20" y2="12"></line>
                                <line className="line line-3" x1="4" y1="18" x2="20" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <MobileDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
        </>
    );
}
