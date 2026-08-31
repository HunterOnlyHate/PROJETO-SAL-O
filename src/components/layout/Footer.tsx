'use client';

import React from 'react';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';

export function Footer() {
    const { openBookingModal } = useBooking();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link href="/#home" className="logo">
                            <img src="/assets/images/logo-glamour-studio.jpg" alt="Glamour Studio" className="logo-badge-img" />
                            <div className="logo-text-box">
                                <span className="logo-main" style={{ color: '#FFFFFF' }}>GLAMOUR STUDIO</span>
                                <span className="logo-sub" style={{ color: 'var(--gold-400)' }}>GRAZIELE & LUCIANA</span>
                            </div>
                        </Link>
                        <p className="footer-description">
                            Salão de beleza conceito. Especializado em progressiva, realinhamento, botox capilar, banho de brilho, cronograma capilar, design de sobrancelhas com henna e manicure.
                        </p>
                        <div style={{ marginTop: '0.8rem' }}>
                            <a
                                href="https://www.instagram.com/glamourstudio_lg/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gold-400)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}
                            >
                                <span>📷</span> Siga @glamourstudio_lg no Instagram
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">Navegação</h4>
                        <ul className="footer-links">
                            <li><Link href="/#home">Início</Link></li>
                            <li><Link href="/agendar">Menu de Serviços</Link></li>
                            <li><Link href="/produtos">Boutique de Produtos</Link></li>
                            <li><Link href="/agendar">Agendamento Online</Link></li>
                            <li><Link href="/#sobre">Sobre o Salão</Link></li>
                            <li><Link href="/#faq">Dúvidas Frequentes</Link></li>
                            <li><Link href="/#contato">Localização & Contato</Link></li>
                            <li style={{ marginTop: '0.4rem' }}>
                                <Link href="/admin" style={{ color: 'var(--gold-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <span>👑</span> Painel Administrativo
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-heading">Procedimentos</h4>
                        <ul className="footer-links">
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('escova-progressiva'); }}>Escova Progressiva</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('realinhamento-capilar'); }}>Realinhamento Capilar</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('botox-capilar'); }}>Botox Capilar Disciplinante</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('banho-de-brilho'); }}>Banho de Brilho</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('cronograma-capilar'); }}>Cronograma Capilar</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('design-henna'); }}>Design de Sobrancelhas + Henna</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('manicure-mao'); }}>Manicure / Mão (R$ 30)</a></li>
                            <li><a href="/agendar" onClick={(e) => { e.preventDefault(); openBookingModal('pedicure-pe'); }}>Pedicure / Pé (R$ 30)</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="footer-heading">Crie seu Site ou Sistema</h4>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(250,247,248,0.75)', marginBottom: '1rem', lineHeight: '1.5' }}>
                            Quer um site moderno, sistema de agendamento online ou catálogo digital como este para o seu negócio? Fale direto com o desenvolvedor!
                        </p>
                        <a
                            href="https://wa.me/5595984012201?text=Ol%C3%A1!%20Vi%20o%20site%20do%20Glamour%20Studio%20e%20gostaria%20de%20fazer%20um%20or%C3%A7amento%20para%20um%20site%2Fsistema."
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#25D366',
                                color: '#FFFFFF',
                                padding: '0.65rem 1.1rem',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.838.5 3.633 1.453 5.211L2 22l4.906-1.422a10.02 10.02 0 0 0 5.125 1.453h.004c5.535 0 10.031-4.496 10.031-10.031C22.066 6.496 17.566 2 12.031 2zm0 18.344a8.315 8.315 0 0 1-4.242-1.156l-.305-.18-3.152.914.922-3.078-.2-.316A8.307 8.307 0 0 1 3.719 12.03c0-4.586 3.727-8.312 8.313-8.312 4.586 0 8.312 3.726 8.312 8.312 0 4.586-3.726 8.313-8.313 8.313zm4.551-6.223c-.25-.125-1.477-.73-1.707-.812-.23-.082-.398-.125-.566.125-.168.25-.652.812-.8 1-.148.188-.297.207-.547.082-.25-.125-1.055-.387-2.012-1.238-.742-.664-1.242-1.484-1.39-1.734-.145-.25-.016-.387.109-.512.113-.113.25-.293.375-.438.125-.148.168-.25.25-.418.082-.168.043-.316-.02-.441-.063-.125-.566-1.363-.777-1.867-.203-.492-.414-.422-.566-.43-.145-.008-.313-.008-.48-.008-.168 0-.441.063-.672.313-.23.25-.883.863-.883 2.105 0 1.242.906 2.441 1.031 2.61.125.168 1.785 2.726 4.324 3.824.605.262 1.078.418 1.449.535.61.195 1.164.168 1.602.102.488-.074 1.477-.605 1.684-1.191.207-.586.207-1.09.145-1.192-.063-.102-.23-.168-.48-.293z"/>
                            </svg>
                            <span>WhatsApp: (95) 98401-2201</span>
                        </a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div>
                        © {new Date().getFullYear()} Glamour Studio (Graziele Bezerra & Luciana Bezerra). Todos os direitos reservados.
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span>Av. Tuxaua Farias, 259, Bonfim - RR, 69380-000</span>
                        <span>•</span>
                        <a
                            href="https://wa.me/5595984012201?text=Ol%C3%A1!%20Vi%20o%20site%20do%20sal%C3%A3o%20e%20gostaria%20de%20um%20projeto."
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--gold-400)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                            Dev: (95) 98401-2201
                        </a>
                        <span>•</span>
                        <Link href="/admin" style={{ color: 'var(--gold-400)', textDecoration: 'none', fontSize: '0.82rem' }}>
                            Acesso Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
