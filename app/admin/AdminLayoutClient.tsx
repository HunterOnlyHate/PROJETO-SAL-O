'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLayoutProvider, useAdminLayout } from '@/context/AdminLayoutContext';

interface AdminLayoutClientProps {
    children: React.ReactNode;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    } | null;
}

function AdminLayoutInner({ children, user }: AdminLayoutClientProps) {
    const pathname = usePathname();
    const { toggleMobileOpen } = useAdminLayout();

    // Se estiver na tela de login, renderiza limpo
    if (pathname === '/admin/login') {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#0e0c0f',
                    color: '#fff',
                }}
            >
                {children}
            </div>
        );
    }

    const bottomNavItems = [
        { href: '/admin', label: 'Métricas', icon: '📊', exact: true },
        { href: '/admin/agendamentos', label: 'Agenda', icon: '📅' },
        { href: '/admin/horarios', label: 'Horários', icon: '⏰' },
        { href: '/admin/servicos', label: 'Serviços', icon: '💇‍♀️' },
        { href: '/admin/produtos', label: 'Produtos', icon: '🛍️' },
    ];

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: '#120f14',
                color: '#fff',
                position: 'relative',
            }}
        >
            {/* Sidebar lateral (Desktop fixa / Mobile gaveta deslizante) */}
            <AdminSidebar user={user} />

            {/* Conteúdo Principal */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    backgroundColor: '#0f0c11',
                    paddingBottom: 'calc(65px + env(safe-area-inset-bottom, 10px))',
                }}
            >
                {children}
            </div>

            {/* Barra de Navegação Inferior Fixa para Mobile (visível até 900px) */}
            <nav
                className="admin-bottom-nav"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(22, 19, 24, 0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderTop: '1px solid rgba(235, 100, 150, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0.4rem 0.25rem',
                    zIndex: 85,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
                }}
            >
                {bottomNavItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                textDecoration: 'none',
                                color: isActive ? '#f783ac' : '#8b8491',
                                flex: 1,
                                padding: '4px 2px',
                                borderRadius: '8px',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '1.2rem',
                                    filter: isActive ? 'drop-shadow(0 2px 6px rgba(214, 51, 108, 0.6))' : 'none',
                                }}
                            >
                                {item.icon}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.65rem',
                                    fontWeight: isActive ? 700 : 500,
                                    letterSpacing: '0.2px',
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                {/* Botão Menu Completo (Abre Drawer Lateral) */}
                <button
                    type="button"
                    onClick={toggleMobileOpen}
                    aria-label="Abrir menu completo"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        background: 'transparent',
                        border: 'none',
                        color: '#8b8491',
                        flex: 1,
                        padding: '4px 2px',
                        cursor: 'pointer',
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>☰</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>Menu</span>
                </button>
            </nav>
        </div>
    );
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
    return (
        <AdminLayoutProvider>
            <AdminLayoutInner user={user}>{children}</AdminLayoutInner>
        </AdminLayoutProvider>
    );
}
