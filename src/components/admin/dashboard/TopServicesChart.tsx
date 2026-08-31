'use client';

import React, { useState } from 'react';

export interface ServiceMetric {
    id: string;
    name: string;
    category: string;
    professionalName: string;
    realizedRevenue: number; // CONCLUIDO (Já Ganho)
    incomingRevenue: number; // CONFIRMADO + PENDENTE (Por Vir)
    completedCount: number;
    incomingCount: number;
    totalCount: number;
    price: number;
}

export interface CategoryMetric {
    category: string;
    categoryName: string;
    completedCount: number;
    incomingCount: number;
    totalCount: number;
    realizedRevenue: number;
    incomingRevenue: number;
    totalRevenue: number;
    percentage: number;
}

interface TopServicesChartProps {
    services: ServiceMetric[];
    categories: CategoryMetric[];
    totalRealizedRevenue: number;
}

export function TopServicesChart({
    services,
    categories,
    totalRealizedRevenue,
}: TopServicesChartProps) {
    const [sortBy, setSortBy] = useState<'realized' | 'incoming' | 'count'>('realized');

    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const sortedServices = [...services].sort((a, b) => {
        if (sortBy === 'realized') return b.realizedRevenue - a.realizedRevenue;
        if (sortBy === 'incoming') return b.incomingRevenue - a.incomingRevenue;
        return b.totalCount - a.totalCount;
    });

    const maxMetric =
        sortedServices.length > 0
            ? Math.max(
                  ...sortedServices.map((s) =>
                      sortBy === 'realized' ? s.realizedRevenue : sortBy === 'incoming' ? s.incomingRevenue : s.totalCount
                  )
              )
            : 1;

    const getCategoryBadgeColor = (cat: string) => {
        switch (cat) {
            case 'alinhamento':
                return '#d6336c';
            case 'cabelo':
                return '#f783ac';
            case 'sobrancelhas':
                return '#fab005';
            case 'depilacao':
                return '#51cf66';
            case 'unhas':
                return '#ae3ec9';
            default:
                return '#74c0fc';
        }
    };

    return (
        <div
            style={{
                backgroundColor: '#17141b',
                border: '1px solid rgba(235, 100, 150, 0.15)',
                borderRadius: '18px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
        >
            {/* Header com Opções de Ordenação */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem' }}>🏆</span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                            Procedimentos & Categorias
                        </h3>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#a89fad' }}>
                        Faturamento Realizado (Ganho) vs Por Vir
                    </span>
                </div>

                <div
                    style={{
                        display: 'inline-flex',
                        backgroundColor: '#201b25',
                        padding: '3px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        flexWrap: 'wrap',
                        gap: '2px',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setSortBy('realized')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: sortBy === 'realized' ? '#51cf66' : 'transparent',
                            color: sortBy === 'realized' ? '#161318' : '#a89fad',
                        }}
                    >
                        💵 Já Ganho
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortBy('incoming')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: sortBy === 'incoming' ? '#1c7ed6' : 'transparent',
                            color: sortBy === 'incoming' ? '#fff' : '#a89fad',
                        }}
                    >
                        ⏳ Por Vir
                    </button>
                    <button
                        type="button"
                        onClick={() => setSortBy('count')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: sortBy === 'count' ? '#d6336c' : 'transparent',
                            color: sortBy === 'count' ? '#fff' : '#a89fad',
                        }}
                    >
                        🔢 Qtd
                    </button>
                </div>
            </div>

            {/* Distribuição por Categorias */}
            {categories.length > 0 && (
                <div
                    style={{
                        backgroundColor: '#201a24',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.65rem' }}>
                        Faturamento Realizado por Categoria:
                    </div>

                    {/* Barra de Distribuição de Categorias */}
                    <div
                        style={{
                            width: '100%',
                            height: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            display: 'flex',
                            marginBottom: '0.75rem',
                        }}
                    >
                        {categories.map((cat, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: `${cat.percentage}%`,
                                    height: '100%',
                                    backgroundColor: getCategoryBadgeColor(cat.category),
                                    transition: 'width 0.4s ease',
                                }}
                                title={`${cat.categoryName}: ${cat.percentage}% do realizado`}
                            />
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                        {categories.map((cat, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#17131b',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                }}
                            >
                                <span
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: getCategoryBadgeColor(cat.category),
                                    }}
                                />
                                <span style={{ color: '#fff', fontWeight: 500 }}>{cat.categoryName}:</span>
                                <span style={{ color: '#51cf66', fontWeight: 700 }}>{formatCurrency(cat.realizedRevenue)}</span>
                                {cat.incomingRevenue > 0 && (
                                    <span style={{ color: '#74c0fc', fontSize: '0.7rem' }}>
                                        (+ {formatCurrency(cat.incomingRevenue)} por vir)
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ranking dos Procedimentos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sortedServices.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8b8491', fontSize: '0.86rem' }}>
                        Nenhum procedimento registrado no período.
                    </div>
                ) : (
                    sortedServices.slice(0, 8).map((srv, index) => {
                        const currentVal =
                            sortBy === 'realized'
                                ? srv.realizedRevenue
                                : sortBy === 'incoming'
                                ? srv.incomingRevenue
                                : srv.totalCount;
                        const percent = maxMetric > 0 ? Math.round((currentVal / maxMetric) * 100) : 0;

                        return (
                            <div
                                key={srv.id}
                                style={{
                                    backgroundColor: '#201b25',
                                    borderRadius: '12px',
                                    padding: '0.75rem 0.9rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.4rem',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                color: index < 3 ? '#f783ac' : '#8b8491',
                                                width: '20px',
                                            }}
                                        >
                                            #{index + 1}
                                        </span>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {srv.name}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#a89fad' }}>
                                                {srv.professionalName} • Preço: {formatCurrency(srv.price)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'auto' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#51cf66' }} title="Faturamento Realizado (Concluído)">
                                                {formatCurrency(srv.realizedRevenue)}
                                            </span>
                                            {srv.incomingRevenue > 0 && (
                                                <span style={{ fontSize: '0.74rem', color: '#74c0fc', fontWeight: 600 }} title="Faturamento Por Vir (Confirmados/Pendentes)">
                                                    + {formatCurrency(srv.incomingRevenue)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#8b8491' }}>
                                            {srv.completedCount} concluídos • {srv.incomingCount} por vir
                                        </div>
                                    </div>
                                </div>

                                {/* Barra de Proporção Visual */}
                                <div
                                    style={{
                                        width: '100%',
                                        height: '5px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                        borderRadius: '999px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            backgroundColor: getCategoryBadgeColor(srv.category),
                                            borderRadius: '999px',
                                            transition: 'width 0.4s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
