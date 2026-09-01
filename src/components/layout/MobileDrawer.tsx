'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useBooking } from '@/context/BookingContext';

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
    const pathname = usePathname();
    const { openBookingModal } = useBooking();

    const isHome = pathname === '/' || pathname === '';
    const isServices = pathname === '/agendar';
    const isProducts = pathname === '/produtos';

    return (
        <>
            {/* BACKDROP DO MENU MOBILE */}
            <div
                className={`mobile-menu-backdrop ${isOpen ? 'open' : ''}`}
                id="mobileMenuBackdrop"
                aria-hidden={!isOpen}
                onClick={onClose}
            ></div>

            {/* DRAWER LATERAL DO MENU MOBILE */}
            <div
                className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`}
                id="mobileMenuDrawer"
                aria-hidden={!isOpen}
                role="dialog"
                aria-modal="true"
                aria-label="Menu de Navegação"
            >
                <div className="mobile-drawer-header">
                    <div className="mobile-drawer-brand">
                        <Image
                            src="/assets/images/logo-glamour-studio.jpg"
                            alt="Glamour Studio"
                            width={40}
                            height={40}
                            className="mobile-drawer-logo"
                        />
                        <div>
                            <span className="mobile-drawer-title">GLAMOUR STUDIO</span>
                            <span className="mobile-drawer-subtitle">Graziele & Luciana</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="mobile-drawer-close"
                        id="mobileDrawerClose"
                        aria-label="Fechar menu"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="mobile-drawer-body">
                    {/* Status do Salão no Menu */}
                    <div className="mobile-drawer-status">
                        <span className="status-dot"></span>
                        <span>Atendimento de Segunda a Sábado: 10h às 18h</span>
                    </div>

                    {/* Links de Navegação Mobile */}
                    <nav className="mobile-nav-list" aria-label="Links do Menu Mobile">
                        {/* DESTAQUE 1: SERVIÇOS & PROCEDIMENTOS */}
                        <Link
                            href="/agendar"
                            className={`mobile-nav-item ${isServices ? 'active' : ''}`}
                            onClick={onClose}
                            style={{
                                background: isServices ? 'var(--gold-100)' : 'rgba(218, 165, 32, 0.08)',
                                border: '1px solid rgba(218, 165, 32, 0.35)',
                                padding: '0.85rem',
                                borderRadius: '12px'
                            }}
                        >
                            <span className="mobile-nav-icon" style={{ fontSize: '1.4rem' }}>💇‍♀️</span>
                            <div className="mobile-nav-text">
                                <span className="mobile-nav-title" style={{ fontWeight: 700, color: 'var(--gold-800)' }}>
                                    Serviços & Procedimentos
                                    <span className="mobile-badge-tag" style={{ background: 'var(--gold-600)', color: '#FFFFFF' }}>Agendar</span>
                                </span>
                                <span className="mobile-nav-desc">Progressiva, sobrancelhas, unhas, botox e preços</span>
                            </div>
                            <span className="mobile-nav-arrow">→</span>
                        </Link>

                        {/* DESTAQUE 2: PRODUTOS WEPINK */}
                        <Link
                            href="/produtos"
                            className={`mobile-nav-item wepink-highlight ${isProducts ? 'active' : ''}`}
                            onClick={onClose}
                            style={{
                                background: isProducts ? 'rgba(214, 51, 108, 0.12)' : 'rgba(214, 51, 108, 0.06)',
                                border: '1px solid rgba(214, 51, 108, 0.35)',
                                padding: '0.85rem',
                                borderRadius: '12px'
                            }}
                        >
                            <span className="mobile-nav-icon" style={{ fontSize: '1.4rem' }}>🌸</span>
                            <div className="mobile-nav-text">
                                <span className="mobile-nav-title" style={{ fontWeight: 700, color: '#D6336C' }}>
                                    Boutique de Produtos WePink
                                    <span className="mobile-badge-tag">Frete Grátis</span>
                                </span>
                                <span className="mobile-nav-desc">Perfumes Virginia Fonseca, body splash & cosméticos</span>
                            </div>
                            <span className="mobile-nav-arrow">→</span>
                        </Link>

                        <div style={{ margin: '0.4rem 0', borderTop: '1px solid rgba(0,0,0,0.06)' }}></div>

                        <Link href="/#home" className={`mobile-nav-item ${isHome ? 'active' : ''}`} onClick={onClose}>
                            <span className="mobile-nav-icon">🏠</span>
                            <div className="mobile-nav-text">
                                <span className="mobile-nav-title">Início</span>
                                <span className="mobile-nav-desc">Página principal do salão</span>
                            </div>
                            <span className="mobile-nav-arrow">→</span>
                        </Link>

                        <Link href="/#sobre" className="mobile-nav-item" onClick={onClose}>
                            <span className="mobile-nav-icon">✨</span>
                            <div className="mobile-nav-text">
                                <span className="mobile-nav-title">O Salão</span>
                                <span className="mobile-nav-desc">Conforto, ambiente climatizado e biossegurança</span>
                            </div>
                            <span className="mobile-nav-arrow">→</span>
                        </Link>

                        <Link href="/#faq" className="mobile-nav-item" onClick={onClose}>
                            <span className="mobile-nav-icon">❓</span>
                            <div className="mobile-nav-text">
                                <span className="mobile-nav-title">Dúvidas</span>
                                <span className="mobile-nav-desc">Preços, horários e atendimento</span>
                            </div>
                            <span className="mobile-nav-arrow">→</span>
                        </Link>

                        <Link href="/#contato" className="mobile-nav-item" onClick={onClose}>
                            <span className="mobile-nav-icon">📍</span>
                            <div className="mobile-nav-text">
                                <span className="mobile-nav-title">Contato e Localização</span>
                                <span className="mobile-nav-desc">Av. Tuxaua Farias, 259, Bonfim - RR</span>
                            </div>
                            <span className="mobile-nav-arrow">→</span>
                        </Link>
                    </nav>

                    {/* Ações Principais no Mobile (Serviços e Produtos) */}
                    <div className="mobile-drawer-actions">
                        <button
                            type="button"
                            className="btn btn-primary mobile-action-btn"
                            onClick={() => {
                                onClose();
                                openBookingModal();
                            }}
                        >
                            <span>📅</span> Iniciar Agendamento Online
                        </button>
                    </div>

                    {/* Contatos Diretos via WhatsApp */}
                    <div className="mobile-drawer-contacts">
                        <div className="mobile-contacts-title">Fale Conosco no WhatsApp:</div>
                        <div className="mobile-contacts-grid">
                            <a
                                href="https://wa.me/5595984072160?text=Ol%C3%A1%20Luciana!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20no%20sal%C3%A3o."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-contact-pill"
                            >
                                <span>💇‍♀️</span>
                                <div>
                                    <strong>Luciana Bezerra</strong>
                                    <small>Salão & Cabelos</small>
                                </div>
                            </a>
                            <a
                                href="https://wa.me/5595984298305?text=Ol%C3%A1%20Graziele!%20Gostaria%20de%20comprar%20produtos%20WePink%20ou%20agendar%20sobrancelha."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mobile-contact-pill"
                            >
                                <span>🛍️</span>
                                <div>
                                    <strong>Graziele Bezerra</strong>
                                    <small>WePink & Depilação</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mobile-drawer-footer">
                    <span>📍 Av. Tuxaua Farias, 259, Bonfim - RR</span>
                    <span>•</span>
                    <a
                        href="https://www.instagram.com/glamourstudio_lg/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--gold-600)', textDecoration: 'none', fontWeight: 600 }}
                    >
                        @glamourstudio_lg
                    </a>
                </div>
            </div>
        </>
    );
}
