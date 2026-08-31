'use client';

import React from 'react';
import { useAdminLayout } from '@/context/AdminLayoutContext';

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    actionButton?: {
        label: string;
        icon?: string;
        onClick: () => void;
    };
    onOpenMobileMenu?: () => void;
}

export function AdminHeader({
    title,
    subtitle,
    actionButton,
    onOpenMobileMenu: propOnOpenMobileMenu,
}: AdminHeaderProps) {
    const { toggleMobileOpen } = useAdminLayout();
    const handleToggle = propOnOpenMobileMenu || toggleMobileOpen;

    return (
        <header
            style={{
                backgroundColor: 'rgba(22, 19, 24, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(235, 100, 150, 0.15)',
                padding: '1rem 1.5rem',
                paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
                position: 'sticky',
                top: 0,
                zIndex: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                minHeight: '68px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                {/* Botão Hambúrguer Mobile */}
                <button
                    type="button"
                    onClick={handleToggle}
                    className="admin-mobile-toggle"
                    aria-label="Abrir menu de navegação"
                    style={{
                        background: 'rgba(214, 51, 108, 0.15)',
                        border: '1px solid rgba(214, 51, 108, 0.3)',
                        borderRadius: '10px',
                        color: '#f783ac',
                        width: '40px',
                        height: '40px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                    }}
                >
                    ☰
                </button>

                <div style={{ minWidth: 0, flex: 1 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: '#fff',
                            fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                            letterSpacing: '0.2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p
                            style={{
                                margin: '0.15rem 0 0',
                                fontSize: '0.78rem',
                                color: '#a89fad',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Ação Principal do Header */}
            {actionButton && (
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={actionButton.onClick}
                        style={{
                            background: 'linear-gradient(135deg, #d6336c, #e64980)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '0.55rem 1rem',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 4px 14px rgba(214, 51, 108, 0.35)',
                            transition: 'all 0.2s ease',
                            minHeight: '38px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {actionButton.icon && <span style={{ fontSize: '0.95rem' }}>{actionButton.icon}</span>}
                        <span>{actionButton.label}</span>
                    </button>
                </div>
            )}
        </header>
    );
}
