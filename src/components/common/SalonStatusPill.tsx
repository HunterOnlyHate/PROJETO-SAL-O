'use client';

import React, { useState, useEffect } from 'react';

interface SalonStatusPillProps {
    className?: string;
    style?: React.CSSProperties;
}

export function SalonStatusPill({ className = 'hero-status-pill', style }: SalonStatusPillProps) {
    const [status, setStatus] = useState({
        isOpen: false,
        text: 'Carregando status...',
    });

    useEffect(() => {
        const updateStatus = () => {
            const now = new Date();
            const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
            const hour = now.getHours();
            const minutes = now.getMinutes();
            const currentTime = hour + minutes / 60;

            let isOpen = false;
            let statusText = '';

            if (day >= 1 && day <= 6) {
                // Segunda a Sábado: 10h às 18h
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
                // Domingo
                statusText = 'Fechado hoje • Abre segunda às 10:00';
            }

            setStatus({ isOpen, text: statusText });
        };

        updateStatus();
        const timer = setInterval(updateStatus, 60000); // Atualiza a cada minuto
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={className} style={style}>
            <span
                className="status-dot"
                style={
                    status.isOpen
                        ? undefined
                        : { background: '#e74c3c', animation: 'none', boxShadow: '0 0 8px rgba(231,76,60,0.5)' }
                }
            ></span>
            <span style={status.isOpen ? undefined : { color: '#e74c3c' }}>{status.text}</span>
        </div>
    );
}
