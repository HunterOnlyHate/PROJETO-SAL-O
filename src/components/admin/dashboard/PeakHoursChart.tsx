'use client';

import React from 'react';

export interface HourMetric {
    hour: string; // "10:00", "11:00", etc.
    count: number;
    revenue: number;
}

export interface DayMetric {
    dayIndex: number; // 0=Dom, 1=Seg, ... 6=Sab
    dayName: string; // "Segunda", "Terça", etc.
    count: number;
    revenue: number;
}

interface PeakHoursChartProps {
    hoursData: HourMetric[];
    daysData: DayMetric[];
}

export function PeakHoursChart({ hoursData, daysData }: PeakHoursChartProps) {
    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const maxHourCount = Math.max(...hoursData.map((h) => h.count), 1);
    const maxDayCount = Math.max(...daysData.map((d) => d.count), 1);

    // Identificar horário de maior pico
    const peakHour = hoursData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), hoursData[0] || { hour: '-', count: 0 });
    const peakDay = daysData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), daysData[0] || { dayName: '-', count: 0 });

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.15rem' }}>⏰</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                        Horários de Pico & Dias Mais Movimentados
                    </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {peakHour && peakHour.count > 0 && (
                        <span
                            style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                backgroundColor: 'rgba(214, 51, 108, 0.2)',
                                color: '#f783ac',
                                fontWeight: 600,
                            }}
                        >
                            🔥 Pico: {peakHour.hour} ({peakHour.count}x)
                        </span>
                    )}
                    {peakDay && peakDay.count > 0 && (
                        <span
                            style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                backgroundColor: 'rgba(51, 154, 240, 0.2)',
                                color: '#74c0fc',
                                fontWeight: 600,
                            }}
                        >
                            📆 Melhor dia: {peakDay.dayName}
                        </span>
                    )}
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.25rem',
                }}
            >
                {/* 1. Distribuição por Faixa de Horário */}
                <div
                    style={{
                        backgroundColor: '#201a24',
                        padding: '1.1rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        Procura por Horário (10:00 às 18:00)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {hoursData.map((h, idx) => {
                            const percent = maxHourCount > 0 ? Math.round((h.count / maxHourCount) * 100) : 0;
                            const isPeak = peakHour && peakHour.hour === h.hour && h.count > 0;

                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: isPeak ? '#f783ac' : '#a89fad', width: '42px', fontWeight: isPeak ? 700 : 500 }}>
                                        {h.hour}
                                    </span>
                                    <div
                                        style={{
                                            flex: 1,
                                            height: '14px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${percent}%`,
                                                height: '100%',
                                                backgroundColor: isPeak ? '#f783ac' : h.count > 0 ? '#d6336c' : 'transparent',
                                                borderRadius: '6px',
                                                transition: 'width 0.4s ease',
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', width: '30px', textAlign: 'right' }}>
                                        {h.count}x
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Distribuição por Dia da Semana */}
                <div
                    style={{
                        backgroundColor: '#201a24',
                        padding: '1.1rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                        Movimento por Dia da Semana
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {daysData.map((d, idx) => {
                            const percent = maxDayCount > 0 ? Math.round((d.count / maxDayCount) * 100) : 0;
                            const isPeak = peakDay && peakDay.dayName === d.dayName && d.count > 0;

                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                                        <span style={{ color: isPeak ? '#74c0fc' : '#c3bcc9', fontWeight: isPeak ? 700 : 500 }}>
                                            {d.dayName}
                                        </span>
                                        <span style={{ color: '#51cf66', fontWeight: 600 }}>
                                            {formatCurrency(d.revenue)} ({d.count}x)
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '8px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                            borderRadius: '999px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${percent}%`,
                                                height: '100%',
                                                backgroundColor: isPeak ? '#339af0' : '#1c7ed6',
                                                borderRadius: '999px',
                                                transition: 'width 0.4s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
