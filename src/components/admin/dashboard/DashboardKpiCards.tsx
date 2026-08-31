'use client';

import React from 'react';

export interface DashboardKpiData {
    realizedRevenue: number;        // CONCLUIDO (Já faturado / Ganho)
    incomingRevenue: number;        // CONFIRMADO + PENDENTE (Faturamento por vir)
    pendingRevenue: number;         // PENDENTE (Aguardando confirmação)
    confirmedRevenue: number;       // CONFIRMADO (Confirmados a atender)
    cancelledRevenue: number;       // CANCELADO (Rejeitados / Perdidos)
    totalPotentialRevenue: number;  // CONCLUIDO + CONFIRMADO + PENDENTE
    
    completedCount: number;         // CONCLUIDO
    confirmedCount: number;         // CONFIRMADO
    pendingCount: number;           // PENDENTE
    cancelledCount: number;         // CANCELADO
    totalAppointments: number;      // Total de agendamentos
    
    averageTicketRealized: number;  // realizedRevenue / completedCount
    averageTicketIncoming: number;  // incomingRevenue / (confirmedCount + pendingCount)
    
    realizedDurationMinutes: number;// Duração de procedimentos CONCLUIDO
    totalDurationMinutes: number;   // Duração de todos os ativos
    
    uniqueClientsCount: number;
    recurringClientsCount: number;
    stockTotalValue: number;
    lowStockCount: number;
    monthlyGoal: number;
}

interface DashboardKpiCardsProps {
    data: DashboardKpiData;
    periodLabel: string;
}

export function DashboardKpiCards({ data, periodLabel }: DashboardKpiCardsProps) {
    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatHours = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m} min`;
        return `${h}h ${m > 0 ? `${m}m` : ''}`;
    };

    const completionRate =
        data.totalAppointments > 0
            ? Math.round((data.completedCount / data.totalAppointments) * 100)
            : 0;

    const goalProgressRealized =
        data.monthlyGoal > 0
            ? Math.min(100, Math.round((data.realizedRevenue / data.monthlyGoal) * 100))
            : 0;

    const goalProgressPotential =
        data.monthlyGoal > 0
            ? Math.min(100, Math.round(((data.realizedRevenue + data.incomingRevenue) / data.monthlyGoal) * 100))
            : 0;

    const cards = [
        {
            title: 'Faturamento Realizado',
            value: formatCurrency(data.realizedRevenue),
            subtitle: `${data.completedCount} procedimento(s) concluído(s) • Dinheiro ganho`,
            icon: '💵',
            badge: `${goalProgressRealized}% da Meta`,
            badgeColor: goalProgressRealized >= 80 ? '#51cf66' : '#fab005',
            accentColor: '#51cf66',
            highlight: true,
        },
        {
            title: 'Faturamento Por Vir',
            value: formatCurrency(data.incomingRevenue),
            subtitle: `${data.confirmedCount} confirmados (${formatCurrency(data.confirmedRevenue)}) + ${data.pendingCount} pendentes (${formatCurrency(data.pendingRevenue)})`,
            icon: '⏳',
            badge: 'A Receber',
            badgeColor: '#74c0fc',
            accentColor: '#1c7ed6',
        },
        {
            title: 'Ticket Médio Realizado',
            value: formatCurrency(data.averageTicketRealized),
            subtitle: 'Por atendimento concluído e pago',
            icon: '🎯',
            badge: 'Ganho Médio',
            badgeColor: '#f783ac',
            accentColor: '#d6336c',
        },
        {
            title: 'Faturamento Rejeitado',
            value: formatCurrency(data.cancelledRevenue),
            subtitle: `${data.cancelledCount} agendamento(s) cancelado(s)`,
            icon: '🚫',
            badge: 'Cancelados',
            badgeColor: '#ff8787',
            accentColor: '#ff6b6b',
        },
        {
            title: 'Total de Agendamentos',
            value: data.totalAppointments,
            subtitle: `${data.completedCount} concl. • ${data.confirmedCount + data.pendingCount} por vir • ${data.cancelledCount} rej.`,
            icon: '📅',
            badge: `${completionRate}% Concluído`,
            badgeColor: completionRate >= 70 ? '#51cf66' : '#fab005',
            accentColor: '#ae3ec9',
        },
        {
            title: 'Horas Realizadas no Salão',
            value: formatHours(data.realizedDurationMinutes),
            subtitle: `Tempo total executado em atendimentos`,
            icon: '⏱️',
            badge: 'Executado',
            badgeColor: '#e599f7',
            accentColor: '#ae3ec9',
        },
        {
            title: 'Estoque WePink Total',
            value: formatCurrency(data.stockTotalValue),
            subtitle: data.lowStockCount > 0 ? `⚠️ ${data.lowStockCount} produtos com baixo estoque` : 'Estoque 100% abastecido',
            icon: '🛍️',
            badge: data.lowStockCount > 0 ? 'Atenção' : 'Excelente',
            badgeColor: data.lowStockCount > 0 ? '#ff8787' : '#51cf66',
            accentColor: '#e64980',
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Meta de Faturamento com Barra de Progresso Realizado vs Por Vir */}
            {data.monthlyGoal > 0 && (
                <div
                    style={{
                        backgroundColor: '#1a1620',
                        border: '1px solid rgba(235, 100, 150, 0.25)',
                        borderRadius: '16px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎯</span>
                            <div>
                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                                    Termômetro da Meta Mensal de Faturamento
                                </span>
                                <span style={{ fontSize: '0.78rem', color: '#a89fad', marginLeft: '0.5rem' }}>
                                    Meta: {formatCurrency(data.monthlyGoal)}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#51cf66' }} />
                                <span style={{ fontSize: '0.75rem', color: '#51cf66', fontWeight: 700 }}>
                                    Ganho: {formatCurrency(data.realizedRevenue)} ({goalProgressRealized}%)
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#339af0' }} />
                                <span style={{ fontSize: '0.75rem', color: '#74c0fc', fontWeight: 700 }}>
                                    + Por Vir: {formatCurrency(data.incomingRevenue)} (Projeção: {goalProgressPotential}%)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Progresso Segmentada (Realizado + Por Vir) */}
                    <div
                        style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            display: 'flex',
                            position: 'relative',
                        }}
                    >
                        {/* Segmento 1: Faturamento Realizado (Verde) */}
                        <div
                            style={{
                                width: `${Math.min(100, goalProgressRealized)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #51cf66, #38d9a9)',
                                transition: 'width 0.5s ease',
                            }}
                            title={`Faturamento Realizado: ${formatCurrency(data.realizedRevenue)}`}
                        />

                        {/* Segmento 2: Faturamento Por Vir (Azul) */}
                        <div
                            style={{
                                width: `${Math.max(0, Math.min(100 - goalProgressRealized, goalProgressPotential - goalProgressRealized))}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #1c7ed6, #74c0fc)',
                                transition: 'width 0.5s ease',
                            }}
                            title={`Faturamento Por Vir: ${formatCurrency(data.incomingRevenue)}`}
                        />
                    </div>
                </div>
            )}

            {/* Grid dos Cards Principais */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                }}
            >
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        style={{
                            backgroundColor: card.highlight ? '#201b25' : '#1a1620',
                            border: card.highlight
                                ? '1.5px solid rgba(81, 207, 102, 0.4)'
                                : '1px solid rgba(235, 100, 150, 0.14)',
                            borderRadius: '16px',
                            padding: '1.2rem 1.15rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.65rem',
                            boxShadow: card.highlight
                                ? '0 8px 24px rgba(81, 207, 102, 0.12)'
                                : '0 4px 18px rgba(0, 0, 0, 0.25)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: `linear-gradient(90deg, ${card.accentColor}, transparent)`,
                            }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <span
                                style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    color: '#a89fad',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                {card.title}
                            </span>
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    flexShrink: 0,
                                }}
                            >
                                {card.icon}
                            </div>
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                                    fontWeight: 800,
                                    color: card.highlight ? '#51cf66' : '#fff',
                                    fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                                    lineHeight: 1.15,
                                }}
                            >
                                {card.value}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.4rem',
                                marginTop: 'auto',
                                paddingTop: '0.4rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                flexWrap: 'wrap',
                            }}
                        >
                            <span style={{ fontSize: '0.74rem', color: '#8b8491', lineHeight: 1.3 }}>
                                {card.subtitle}
                            </span>
                            {card.badge && (
                                <span
                                    style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        padding: '2px 7px',
                                        borderRadius: '999px',
                                        backgroundColor: `${card.badgeColor}22`,
                                        color: card.badgeColor,
                                        border: `1px solid ${card.badgeColor}40`,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {card.badge}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
