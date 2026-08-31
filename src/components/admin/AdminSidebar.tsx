'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdminAction } from '@/actions/adminAuthActions';
import { useAdminLayout } from '@/context/AdminLayoutContext';

interface AdminSidebarProps {
    user?: {
        name: string;
        email: string;
        role: string;
    } | null;
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export function AdminSidebar({
    user,
    isMobileOpen: propIsMobileOpen,
    onCloseMobile: propOnCloseMobile,
}: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const context = useAdminLayout();

    // Prioriza context se disponível, senão usa props
    const isMobileOpen = propIsMobileOpen !== undefined ? propIsMobileOpen : context.mobileOpen;
    const onCloseMobile = propOnCloseMobile || context.closeMobileMenu;

    const handleLogout = async () => {
        if (confirm('Tem certeza que deseja sair do painel administrativo?')) {
            onCloseMobile();
            await logoutAdminAction();
            router.push('/admin/login');
            router.refresh();
        }
    };

    const navItems = [
        {
            href: '/admin',
            label: 'Dashboard & Métricas',
            icon: '📊',
            badge: 'Executivo',
            exact: true,
        },
        {
            href: '/admin/agendamentos',
            label: 'Agendamentos',
            icon: '📅',
            badge: 'Agenda',
        },
        {
            href: '/admin/horarios',
            label: 'Horários & Escalas',
            icon: '⏰',
            badge: 'Turnos',
        },
        {
            href: '/admin/servicos',
            label: 'Gerenciar Serviços',
            icon: '💇‍♀️',
            badge: 'Salão',
        },
        {
            href: '/admin/produtos',
            label: 'Gerenciar Produtos',
            icon: '🛍️',
            badge: 'WePink',
        },
    ];

    return (
        <>
            {/* Overlay para Mobile com Fade */}
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 9998,
                        animation: 'fadeIn 0.2s ease-out',
                    }}
                    aria-hidden="true"
                />
            )}

            <aside
                style={{
                    width: '280px',
                    maxWidth: '85vw',
                    backgroundColor: '#161318',
                    borderRight: '1px solid rgba(235, 100, 150, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    zIndex: 9999,
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                }}
                className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
            >
                {/* Header da Sidebar */}
                <div
                    style={{
                        padding: '1.25rem 1.25rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '70px',
                    }}
                >
                    <Link
                        href="/admin"
                        onClick={onCloseMobile}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            textDecoration: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #d6336c, #f783ac)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                                boxShadow: '0 4px 12px rgba(214, 51, 108, 0.35)',
                                flexShrink: 0,
                            }}
                        >
                            👑
                        </div>
                        <div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    letterSpacing: '0.3px',
                                    lineHeight: 1.2,
                                }}
                            >
                                Glamour Admin
                            </div>
                            <span
                                style={{
                                    fontSize: '0.7rem',
                                    color: '#f783ac',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 600,
                                }}
                            >
                                Painel de Controle
                            </span>
                        </div>
                    </Link>

                    {/* Botão de Fechar Mobile */}
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="admin-mobile-toggle"
                        aria-label="Fechar menu"
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            color: '#fff',
                            width: '38px',
                            height: '38px',
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Menu de Navegação com rolagem suave */}
                <div
                    className="no-scrollbar"
                    style={{
                        flex: 1,
                        padding: '1.25rem 0.85rem',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <div
                        style={{
                            fontSize: '0.7rem',
                            color: '#8b8491',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                            fontWeight: 700,
                            padding: '0 0.6rem 0.6rem',
                        }}
                    >
                        Gerenciamento
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {navItems.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onCloseMobile}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.85rem 1rem',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '0.92rem',
                                        color: isActive ? '#fff' : '#c3bcc9',
                                        background: isActive
                                            ? 'linear-gradient(90deg, rgba(214, 51, 108, 0.28) 0%, rgba(214, 51, 108, 0.1) 100%)'
                                            : 'transparent',
                                        borderLeft: isActive ? '3px solid #d6336c' : '3px solid transparent',
                                        transition: 'all 0.2s ease',
                                        minHeight: '44px',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                background: isActive
                                                    ? 'rgba(214, 51, 108, 0.4)'
                                                    : 'rgba(255, 255, 255, 0.08)',
                                                color: isActive ? '#ffdeeb' : '#a89fad',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div
                        style={{
                            fontSize: '0.7rem',
                            color: '#8b8491',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                            fontWeight: 700,
                            padding: '1.5rem 0.6rem 0.6rem',
                        }}
                    >
                        Loja & Salão Público
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.8rem 1rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontSize: '0.88rem',
                                color: '#a89fad',
                                transition: 'all 0.2s ease',
                                minHeight: '44px',
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>🌐</span>
                            <span>Ver Site Público</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>↗</span>
                        </a>

                        <a
                            href="/produtos"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.8rem 1rem',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                fontSize: '0.88rem',
                                color: '#a89fad',
                                transition: 'all 0.2s ease',
                                minHeight: '44px',
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>🛍️</span>
                            <span>Ver Vitrine WePink</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>↗</span>
                        </a>
                    </nav>
                </div>

                {/* Footer do Usuário & Logout com Safe Area Bottom */}
                <div
                    style={{
                        padding: '1.1rem 1.25rem',
                        paddingBottom: 'max(1.1rem, env(safe-area-inset-bottom, 1.1rem))',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: '#120f14',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.75rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #495057, #212529)',
                                    border: '1px solid rgba(235, 100, 150, 0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    color: '#f783ac',
                                    fontSize: '0.9rem',
                                    flexShrink: 0,
                                }}
                            >
                                {user?.name ? user.name[0].toUpperCase() : 'A'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div
                                    style={{
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        maxWidth: '150px',
                                    }}
                                >
                                    {user?.name || 'Administrador'}
                                </div>
                                <div
                                    style={{
                                        color: '#8b8491',
                                        fontSize: '0.72rem',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        maxWidth: '150px',
                                    }}
                                >
                                    {user?.email || 'admin@glamourstudio.com.br'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.65rem',
                            borderRadius: '10px',
                            background: 'rgba(235, 100, 150, 0.1)',
                            border: '1px solid rgba(235, 100, 150, 0.25)',
                            color: '#ff8787',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            minHeight: '40px',
                        }}
                    >
                        <span>🚪</span> Sair da Conta
                    </button>
                </div>
            </aside>
        </>
    );
}
