'use client';

import React from 'react';

export interface ProfessionalStats {
    id: string;
    name: string;
    role: string;
    realizedRevenue: number;   // CONCLUIDO (Já Ganho)
    incomingRevenue: number;   // CONFIRMADO + PENDENTE (Por Vir)
    cancelledRevenue: number;  // CANCELADO (Rejeitados)
    completedCount: number;
    incomingCount: number;
    cancelledCount: number;
    appointmentsCount: number;
    durationMinutes: number;
    averageTicketRealized: number;
    topServices: { name: string; count: number }[];
}

interface ProfessionalComparisonProps {
    luciana: ProfessionalStats;
    graziele: ProfessionalStats;
    totalRealizedRevenue: number;
}

export function ProfessionalComparison({
    luciana,
    graziele,
    totalRealizedRevenue,
}: ProfessionalComparisonProps) {
    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatHours = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h === 0) return `${m} min`;
        return `${h}h ${m > 0 ? `${m}m` : ''}`;
    };

    const totalCombinedRealized = luciana.realizedRevenue + graziele.realizedRevenue;
    const lucianaShare = totalCombinedRealized > 0 ? Math.round((luciana.realizedRevenue / totalCombinedRealized) * 100) : 50;
    const grazieleShare = totalCombinedRealized > 0 ? 100 - lucianaShare : 50;

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
                    <span style={{ fontSize: '1.15rem' }}>👑</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                        Performance das Especialistas
                    </h3>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#a89fad' }}>
                    Faturamento Realizado (Ganho) vs Por Vir
                </span>
            </div>

            {/* Barra Visual de Participação do Faturamento Ganho */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                    <span style={{ color: '#f783ac' }}>
                        Luciana Bezerra ({lucianaShare}% do realizado)
                    </span>
                    <span style={{ color: '#74c0fc' }}>
                        Graziele Bezerra ({grazieleShare}% do realizado)
                    </span>
                </div>
                <div
                    style={{
                        width: '100%',
                        height: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        display: 'flex',
                    }}
                >
                    <div
                        style={{
                            width: `${lucianaShare}%`,
                            height: '100%',
                            backgroundColor: '#d6336c',
                            transition: 'width 0.5s ease',
                        }}
                        title={`Luciana: ${formatCurrency(luciana.realizedRevenue)}`}
                    />
                    <div
                        style={{
                            width: `${grazieleShare}%`,
                            height: '100%',
                            backgroundColor: '#1c7ed6',
                            transition: 'width 0.5s ease',
                        }}
                        title={`Graziele: ${formatCurrency(graziele.realizedRevenue)}`}
                    />
                </div>
            </div>

            {/* Cards Lado a Lado das Duas Especialistas */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                }}
            >
                {/* Luciana Bezerra */}
                <div
                    style={{
                        backgroundColor: '#201a24',
                        border: '1px solid rgba(214, 51, 108, 0.3)',
                        borderRadius: '14px',
                        padding: '1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #d6336c, #f783ac)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#fff',
                                fontWeight: 700,
                            }}
                        >
                            💇‍♀️
                        </div>
                        <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                                Luciana Bezerra
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#f783ac' }}>
                                Alisamentos, Cabelos, Botox & Manicure
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.2rem' }}>
                        <div style={{ backgroundColor: '#18131b', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(81, 207, 102, 0.2)' }}>
                            <div style={{ fontSize: '0.66rem', color: '#51cf66', textTransform: 'uppercase', fontWeight: 700 }}>💵 Já Faturado</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#51cf66' }}>{formatCurrency(luciana.realizedRevenue)}</div>
                            <div style={{ fontSize: '0.66rem', color: '#8b8491' }}>{luciana.completedCount} concl.</div>
                        </div>
                        <div style={{ backgroundColor: '#18131b', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(116, 192, 252, 0.2)' }}>
                            <div style={{ fontSize: '0.66rem', color: '#74c0fc', textTransform: 'uppercase', fontWeight: 700 }}>⏳ Por Vir</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#74c0fc' }}>{formatCurrency(luciana.incomingRevenue)}</div>
                            <div style={{ fontSize: '0.66rem', color: '#8b8491' }}>{luciana.incomingCount} agend.</div>
                        </div>
                        <div style={{ backgroundColor: '#18131b', padding: '0.6rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.66rem', color: '#a89fad', textTransform: 'uppercase' }}>Ticket Médio</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{formatCurrency(luciana.averageTicketRealized)}</div>
                        </div>
                        <div style={{ backgroundColor: '#18131b', padding: '0.6rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.66rem', color: '#a89fad', textTransform: 'uppercase' }}>Tempo Concluído</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e599f7' }}>{formatHours(luciana.durationMinutes)}</div>
                        </div>
                    </div>

                    {luciana.topServices.length > 0 && (
                        <div style={{ marginTop: '0.2rem' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8b8491', fontWeight: 600, marginBottom: '0.3rem' }}>
                                Procedimentos Realizados:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {luciana.topServices.slice(0, 3).map((s, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.74rem',
                                            color: '#c3bcc9',
                                        }}
                                    >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                            • {s.name}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#f783ac' }}>{s.count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Graziele Bezerra */}
                <div
                    style={{
                        backgroundColor: '#161d25',
                        border: '1px solid rgba(28, 126, 214, 0.3)',
                        borderRadius: '14px',
                        padding: '1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1c7ed6, #74c0fc)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: '#fff',
                                fontWeight: 700,
                            }}
                        >
                            🌸
                        </div>
                        <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                                Graziele Bezerra
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#74c0fc' }}>
                                Designer Sobrancelhas, Depilação & WePink
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.2rem' }}>
                        <div style={{ backgroundColor: '#10151c', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(81, 207, 102, 0.2)' }}>
                            <div style={{ fontSize: '0.66rem', color: '#51cf66', textTransform: 'uppercase', fontWeight: 700 }}>💵 Já Faturado</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#51cf66' }}>{formatCurrency(graziele.realizedRevenue)}</div>
                            <div style={{ fontSize: '0.66rem', color: '#8b8491' }}>{graziele.completedCount} concl.</div>
                        </div>
                        <div style={{ backgroundColor: '#10151c', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(116, 192, 252, 0.2)' }}>
                            <div style={{ fontSize: '0.66rem', color: '#74c0fc', textTransform: 'uppercase', fontWeight: 700 }}>⏳ Por Vir</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#74c0fc' }}>{formatCurrency(graziele.incomingRevenue)}</div>
                            <div style={{ fontSize: '0.66rem', color: '#8b8491' }}>{graziele.incomingCount} agend.</div>
                        </div>
                        <div style={{ backgroundColor: '#10151c', padding: '0.6rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.66rem', color: '#a89fad', textTransform: 'uppercase' }}>Ticket Médio</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{formatCurrency(graziele.averageTicketRealized)}</div>
                        </div>
                        <div style={{ backgroundColor: '#10151c', padding: '0.6rem', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.66rem', color: '#a89fad', textTransform: 'uppercase' }}>Tempo Concluído</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e599f7' }}>{formatHours(graziele.durationMinutes)}</div>
                        </div>
                    </div>

                    {graziele.topServices.length > 0 && (
                        <div style={{ marginTop: '0.2rem' }}>
                            <div style={{ fontSize: '0.72rem', color: '#8b8491', fontWeight: 600, marginBottom: '0.3rem' }}>
                                Procedimentos Realizados:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {graziele.topServices.slice(0, 3).map((s, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '0.74rem',
                                            color: '#c3bcc9',
                                        }}
                                    >
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                                            • {s.name}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#74c0fc' }}>{s.count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
