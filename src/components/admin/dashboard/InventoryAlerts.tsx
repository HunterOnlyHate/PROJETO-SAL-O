'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';

export interface ProductInventoryItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    active: boolean;
}

interface InventoryAlertsProps {
    products: ProductInventoryItem[];
}

export function InventoryAlerts({ products }: InventoryAlertsProps) {
    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalStockUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * (p.stock || 0), 0);
    const lowStockProducts = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 5);
    const outOfStockProducts = products.filter((p) => (p.stock || 0) <= 0);

    return (
        <div
            style={{
                backgroundColor: '#17141b',
                border: '1px solid rgba(235, 100, 150, 0.15)',
                borderRadius: '18px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.15rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>🛍️</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                        Patrimônio & Estoque WePink
                    </h3>
                </div>

                <Link
                    href="/admin/produtos"
                    style={{
                        fontSize: '0.8rem',
                        color: '#f783ac',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Gerenciar Produtos ({products.length}) →
                </Link>
            </div>

            {/* Resumo de Inventário */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#201a24', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a89fad', textTransform: 'uppercase' }}>Valor Total Estocado</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#51cf66', marginTop: '2px' }}>
                        {formatCurrency(totalInventoryValue)}
                    </div>
                </div>
                <div style={{ backgroundColor: '#201a24', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a89fad', textTransform: 'uppercase' }}>Unidades em Estoque</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {totalStockUnits} itens
                    </div>
                </div>
                <div style={{ backgroundColor: '#201a24', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#a89fad', textTransform: 'uppercase' }}>Produtos Críticos</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: lowStockProducts.length + outOfStockProducts.length > 0 ? '#ff8787' : '#51cf66', marginTop: '2px' }}>
                        {lowStockProducts.length + outOfStockProducts.length} itens
                    </div>
                </div>
            </div>

            {/* Lista de Alertas de Estoque Crítico */}
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ff8787' }}>
                        ⚠️ Produtos Precisando de Reposição Urgente:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[...outOfStockProducts, ...lowStockProducts].slice(0, 5).map((p) => (
                            <div
                                key={p.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.5rem 0.75rem',
                                    backgroundColor: '#201b25',
                                    borderRadius: '10px',
                                    gap: '0.5rem',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                    <Image
                                        src={p.image || '/assets/images/logo-glamour-studio.jpg'}
                                        alt={p.name}
                                        width={32}
                                        height={32}
                                        unoptimized={!isOptimizableImage(p.image)}
                                        style={{ borderRadius: '6px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.srcset = '';
                                            target.src = '/assets/images/logo-glamour-studio.jpg';
                                        }}
                                    />
                                    <span style={{ fontSize: '0.82rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.name}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontSize: '0.72rem',
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        backgroundColor: p.stock === 0 ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 212, 59, 0.2)',
                                        color: p.stock === 0 ? '#ff8787' : '#ffd43b',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}
                                >
                                    {p.stock === 0 ? 'ESGOTADO' : `${p.stock} em estoque`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '0.85rem', backgroundColor: 'rgba(81, 207, 102, 0.1)', borderRadius: '10px', color: '#51cf66', fontSize: '0.82rem', textAlign: 'center', fontWeight: 600 }}>
                    ✨ Todo o estoque WePink está abastecido e em níveis saudáveis!
                </div>
            )}
        </div>
    );
}
