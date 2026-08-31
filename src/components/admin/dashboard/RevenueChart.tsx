'use client';

import React, { useState } from 'react';

export interface ChartDataPoint {
    label: string; // Ex: "25/08", "Seg", "Ago"
    fullDate?: string;
    realizedRevenue: number;   // CONCLUIDO
    incomingRevenue: number;   // CONFIRMADO + PENDENTE
    cancelledRevenue: number;  // CANCELADO
    totalRevenue: number;      // Realizado + Por Vir
    completedCount: number;
    incomingCount: number;
    cancelledCount: number;
    appointmentsCount: number;
}

interface RevenueChartProps {
    data: ChartDataPoint[];
    periodTitle: string;
}

type ChartViewMode = 'realized' | 'incoming' | 'all_revenue' | 'appointments';

export function RevenueChart({ data, periodTitle }: RevenueChartProps) {
    const [viewMode, setViewMode] = useState<ChartViewMode>('realized');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const getValue = (item: ChartDataPoint): number => {
        switch (viewMode) {
            case 'realized':
                return item.realizedRevenue;
            case 'incoming':
                return item.incomingRevenue;
            case 'all_revenue':
                return item.totalRevenue;
            case 'appointments':
                return item.appointmentsCount;
        }
    };

    const values = data.map(getValue);
    const maxValue = Math.max(...values, viewMode === 'appointments' ? 5 : 100);
    const totalSum = values.reduce((acc, v) => acc + v, 0);
    const avgValue = data.length > 0 ? totalSum / data.length : 0;

    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getViewModeColor = () => {
        switch (viewMode) {
            case 'realized':
                return '#51cf66';
            case 'incoming':
                return '#339af0';
            case 'all_revenue':
                return '#d6336c';
            case 'appointments':
                return '#ae3ec9';
        }
    };

    const getViewModeTitle = () => {
        switch (viewMode) {
            case 'realized':
                return 'Faturamento Realizado (Já Ganho)';
            case 'incoming':
                return 'Faturamento Por Vir (Confirmados + Pendentes)';
            case 'all_revenue':
                return 'Faturamento Total Previsto (Realizado + Por Vir)';
            case 'appointments':
                return 'Volume de Atendimentos';
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
                gap: '1rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
        >
            {/* Header do Gráfico */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem' }}>📈</span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                            Evolução: {getViewModeTitle()}
                        </h3>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#a89fad' }}>
                        {periodTitle} • Média:{' '}
                        {viewMode === 'appointments' ? `${avgValue.toFixed(1)} atendimentos/dia` : formatCurrency(avgValue)}
                    </span>
                </div>

                {/* Toggle de Modo de Visualização */}
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
                        onClick={() => setViewMode('realized')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'realized' ? '#51cf66' : 'transparent',
                            color: viewMode === 'realized' ? '#161318' : '#a89fad',
                            transition: 'all 0.2s',
                        }}
                    >
                        💵 Realizado (Ganho)
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('incoming')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'incoming' ? '#1c7ed6' : 'transparent',
                            color: viewMode === 'incoming' ? '#fff' : '#a89fad',
                            transition: 'all 0.2s',
                        }}
                    >
                        ⏳ Por Vir
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('all_revenue')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'all_revenue' ? '#d6336c' : 'transparent',
                            color: viewMode === 'all_revenue' ? '#fff' : '#a89fad',
                            transition: 'all 0.2s',
                        }}
                    >
                        📊 Total
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('appointments')}
                        style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'appointments' ? '#ae3ec9' : 'transparent',
                            color: viewMode === 'appointments' ? '#fff' : '#a89fad',
                            transition: 'all 0.2s',
                        }}
                    >
                        🔢 Qtd
                    </button>
                </div>
            </div>

            {/* Container do Gráfico em Barras */}
            {data.length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#8b8491', fontSize: '0.88rem' }}>
                    Nenhum dado encontrado para o período selecionado.
                </div>
            ) : (
                <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                    {/* Tooltip flutuante detalhado */}
                    {hoveredIndex !== null && data[hoveredIndex] && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '-60px',
                                left: `${((hoveredIndex + 0.5) / data.length) * 100}%`,
                                transform: 'translateX(-50%)',
                                backgroundColor: '#251e2b',
                                border: `1px solid ${getViewModeColor()}`,
                                borderRadius: '8px',
                                padding: '6px 10px',
                                fontSize: '0.74rem',
                                color: '#fff',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                zIndex: 10,
                                boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                            }}
                        >
                            <div style={{ fontWeight: 700, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2px' }}>
                                📅 {data[hoveredIndex].fullDate || data[hoveredIndex].label}
                            </div>
                            <div style={{ color: '#51cf66', fontWeight: 600 }}>
                                • Realizado (Ganho): {formatCurrency(data[hoveredIndex].realizedRevenue)} ({data[hoveredIndex].completedCount} concl.)
                            </div>
                            <div style={{ color: '#74c0fc', fontWeight: 600 }}>
                                • Por Vir: {formatCurrency(data[hoveredIndex].incomingRevenue)} ({data[hoveredIndex].incomingCount} agend.)
                            </div>
                            {data[hoveredIndex].cancelledCount > 0 && (
                                <div style={{ color: '#ff8787', fontSize: '0.68rem' }}>
                                    • Rejeitado/Cancelado: {formatCurrency(data[hoveredIndex].cancelledRevenue)} ({data[hoveredIndex].cancelledCount}x)
                                </div>
                            )}
                        </div>
                    )}

                    {/* Barras do Gráfico */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            height: '180px',
                            paddingTop: '20px',
                            gap: data.length > 20 ? '2px' : '6px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        {data.map((item, index) => {
                            const val = getValue(item);
                            const heightPercent = maxValue > 0 ? Math.max(4, Math.round((val / maxValue) * 100)) : 4;
                            const isHovered = hoveredIndex === index;
                            const isZero = val === 0;

                            return (
                                <div
                                    key={index}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    style={{
                                        flex: 1,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            maxWidth: '32px',
                                            height: `${heightPercent}%`,
                                            backgroundColor: isZero
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : isHovered
                                                ? '#fff'
                                                : getViewModeColor(),
                                            borderRadius: '6px 6px 0 0',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: isHovered
                                                ? `0 0 16px ${getViewModeColor()}cc`
                                                : isZero
                                                ? 'none'
                                                : '0 2px 8px rgba(0, 0, 0, 0.3)',
                                            position: 'relative',
                                        }}
                                    >
                                        {!isZero && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: '3px',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '6px 6px 0 0',
                                                    opacity: 0.6,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Rótulos do Eixo X */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            paddingTop: '6px',
                            gap: '4px',
                        }}
                    >
                        {data.map((item, index) => {
                            const showLabel =
                                data.length <= 12 ||
                                index === 0 ||
                                index === data.length - 1 ||
                                index % Math.ceil(data.length / 8) === 0;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        fontSize: '0.68rem',
                                        color: hoveredIndex === index ? '#fff' : '#8b8491',
                                        fontWeight: hoveredIndex === index ? 700 : 400,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {showLabel ? item.label : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
