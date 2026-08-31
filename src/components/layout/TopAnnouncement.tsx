'use client';

import React, { useEffect, useState } from 'react';

export function TopAnnouncement() {
    const [status, setStatus] = useState({
        isOpen: false,
        text: 'Carregando status...',
    });

    useEffect(() => {
        const updateStatus = () => {
            const now = new Date();
            const day = now.getDay();
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const currentTime = hour + minutes / 60;

            let isOpen = false;
            let statusText = '';

            if (day >= 1 && day <= 6) {
                if (currentTime >= 10 && currentTime < 18) {
                    isOpen = true;
                    statusText = 'Aberto agora até às 18:00';
                } else if (currentTime < 10) {
                    statusText = 'Fechado no momento • Abre hoje às 10:00';
                } else {
                    if (day === 6) {
                        statusText = 'Fechado no momento • Abre segunda às 10:00';
                    } else {
                        statusText = 'Fechado no momento • Abre amanhã às 10:00';
                    }
                }
            } else {
                statusText = 'Fechado hoje • Abre segunda às 10:00';
            }

            setStatus({ isOpen, text: statusText });
        };

        updateStatus();
        const timer = setInterval(updateStatus, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="top-announcement">
            <div className="container top-announcement-content">
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>📍 Av. Tuxaua Farias, 259, Bonfim - RR</span>
                    <span className="announcement-divider">•</span>
                    <a href="/agendar" style={{ color: 'var(--gold-300)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>💇‍♀️</span> Serviços & Preços
                    </a>
                    <span className="announcement-divider">•</span>
                    <a href="/produtos" style={{ color: '#FFB6C1', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>🌸</span> Boutique WePink (Frete Grátis)
                    </a>
                </div>
                <div
                    id="salonStatusPill"
                    className="hero-status-pill"
                    style={{
                        background: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(223,199,155,0.3)',
                        color: 'var(--gold-200)',
                    }}
                >
                    <span
                        className="status-dot"
                        style={
                            status.isOpen
                                ? undefined
                                : { background: '#e74c3c', animation: 'none', boxShadow: '0 0 8px rgba(231,76,60,0.5)' }
                        }
                    ></span>
                    <span style={status.isOpen ? undefined : { color: '#c0392b' }}>{status.text}</span>
                </div>
            </div>
        </div>
    );
}
