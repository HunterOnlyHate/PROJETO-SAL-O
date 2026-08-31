'use client';

import React, { useState, useEffect } from 'react';
import {
    formatAdminStatusMessage,
    buildWhatsAppUrl,
    WhatsAppMessageType,
} from '@/lib/whatsappUtils';

export interface WhatsAppAppointmentData {
    id: string;
    clientName: string;
    clientPhone: string;
    date: string;
    startTime: string;
    endTime?: string;
    professionalName: string;
    serviceNames: string;
    totalPrice?: number;
    status: string;
}

interface WhatsAppConfirmationModalProps {
    isOpen: boolean;
    appointment: WhatsAppAppointmentData | null;
    onClose: () => void;
}

const TEMPLATE_OPTIONS: Array<{
    type: WhatsAppMessageType;
    label: string;
    icon: string;
    accentColor: string;
    badgeBg: string;
    badgeColor: string;
}> = [
    {
        type: 'CONFIRMADO',
        label: 'Confirmado',
        icon: '✓',
        accentColor: '#25d366',
        badgeBg: 'rgba(37, 211, 102, 0.18)',
        badgeColor: '#25d366',
    },
    {
        type: 'CONCLUIDO',
        label: 'Concluído / Agradecer',
        icon: '💖',
        accentColor: '#d6336c',
        badgeBg: 'rgba(214, 51, 108, 0.18)',
        badgeColor: '#f783ac',
    },
    {
        type: 'CANCELADO',
        label: 'Cancelamento',
        icon: '✕',
        accentColor: '#ff6b6b',
        badgeBg: 'rgba(255, 107, 107, 0.18)',
        badgeColor: '#ff8787',
    },
    {
        type: 'PENDENTE',
        label: 'Pendente',
        icon: '⏳',
        accentColor: '#fab005',
        badgeBg: 'rgba(250, 176, 5, 0.18)',
        badgeColor: '#ffd43b',
    },
    {
        type: 'LEMBRETE',
        label: 'Lembrete',
        icon: '🔔',
        accentColor: '#339af0',
        badgeBg: 'rgba(51, 154, 240, 0.18)',
        badgeColor: '#74c0fc',
    },
];

export function WhatsAppConfirmationModal({
    isOpen,
    appointment,
    onClose,
}: WhatsAppConfirmationModalProps) {
    const [selectedType, setSelectedType] = useState<WhatsAppMessageType>('CONFIRMADO');
    const [customMessage, setCustomMessage] = useState('');
    const [isEditingMessage, setIsEditingMessage] = useState(false);

    useEffect(() => {
        if (!appointment) return;

        let initialType: WhatsAppMessageType = 'CONFIRMADO';
        const st = (appointment.status || '').toUpperCase();
        if (st === 'CONCLUIDO') initialType = 'CONCLUIDO';
        else if (st === 'CANCELADO') initialType = 'CANCELADO';
        else if (st === 'PENDENTE') initialType = 'PENDENTE';
        else initialType = 'CONFIRMADO';

        setSelectedType(initialType);

        const msg = formatAdminStatusMessage(initialType, {
            clientName: appointment.clientName,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            professionalName: appointment.professionalName,
            serviceNames: appointment.serviceNames,
            totalPrice: appointment.totalPrice,
            appointmentId: appointment.id,
            status: appointment.status,
        });

        setCustomMessage(msg);
        setIsEditingMessage(false);
    }, [appointment]);

    if (!isOpen || !appointment) return null;

    const handleSelectTemplate = (type: WhatsAppMessageType) => {
        setSelectedType(type);
        const msg = formatAdminStatusMessage(type, {
            clientName: appointment.clientName,
            date: appointment.date,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            professionalName: appointment.professionalName,
            serviceNames: appointment.serviceNames,
            totalPrice: appointment.totalPrice,
            appointmentId: appointment.id,
            status: appointment.status,
        });
        setCustomMessage(msg);
    };

    const handleSendWhatsApp = () => {
        const url = buildWhatsAppUrl(appointment.clientPhone, customMessage);
        window.open(url, '_blank');
        onClose();
    };

    const currentOption = TEMPLATE_OPTIONS.find((t) => t.type === selectedType) || TEMPLATE_OPTIONS[0];

    const [y, m, d] = appointment.date.split('-');
    const dateFormatted = `${d}/${m}/${y}`;

    const modalTitles: Record<WhatsAppMessageType, string> = {
        CONFIRMADO: 'Enviar Confirmação',
        CONCLUIDO: 'Enviar Agradecimento',
        CANCELADO: 'Enviar Aviso de Cancelamento',
        PENDENTE: 'Enviar Contato Pendente',
        LEMBRETE: 'Enviar Lembrete',
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.82)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    backgroundColor: '#18141d',
                    border: `1px solid ${currentOption.accentColor}40`,
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '580px',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    padding: '1.5rem',
                    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px ${currentOption.accentColor}25`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'border 0.25s ease, box-shadow 0.25s ease',
                }}
            >
                {/* Header com Ícone de Destaque Dinâmico */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${currentOption.accentColor}, #128c7e)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                                color: '#fff',
                                boxShadow: `0 6px 18px ${currentOption.accentColor}45`,
                                flexShrink: 0,
                            }}
                        >
                            💬
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: '0.7rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: currentOption.badgeColor,
                                    fontWeight: 700,
                                    marginBottom: '2px',
                                }}
                            >
                                Status: {appointment.status}
                            </div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontSize: '1.15rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {modalTitles[selectedType]}
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#a89fad',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            padding: '4px',
                            lineHeight: 1,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Card de Resumo do Atendimento */}
                <div
                    style={{
                        backgroundColor: '#201b25',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                                {appointment.clientName}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.72rem',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(37, 211, 102, 0.15)',
                                    color: '#25d366',
                                    fontWeight: 600,
                                    border: '1px solid rgba(37, 211, 102, 0.3)',
                                }}
                            >
                                📱 {appointment.clientPhone}
                            </span>
                        </div>

                        <span
                            style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255,255,255,0.06)',
                                color: '#a89fad',
                                fontFamily: 'monospace',
                            }}
                        >
                            #{appointment.id.slice(-6).toUpperCase()}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#c3bcc9', flexWrap: 'wrap' }}>
                        <span style={{ color: '#f783ac', fontWeight: 600 }}>
                            📅 {dateFormatted} às {appointment.startTime}
                        </span>
                        <span>•</span>
                        <span>{appointment.professionalName}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#8b8491' }}>
                        <strong>Procedimentos:</strong> {appointment.serviceNames}
                    </div>
                </div>

                {/* Seletor de Modelo de Mensagem (Scroll Horizontal suave) */}
                <div>
                    <div style={{ fontSize: '0.76rem', color: '#a89fad', fontWeight: 600, marginBottom: '0.4rem' }}>
                        Selecionar Modelo de Mensagem:
                    </div>
                    <div
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: '0.35rem',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            paddingBottom: '2px',
                        }}
                    >
                        {TEMPLATE_OPTIONS.map((opt) => {
                            const isSelected = selectedType === opt.type;
                            return (
                                <button
                                    key={opt.type}
                                    type="button"
                                    onClick={() => handleSelectTemplate(opt.type)}
                                    style={{
                                        padding: '0.4rem 0.65rem',
                                        borderRadius: '8px',
                                        fontSize: '0.76rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        border: isSelected
                                            ? `1px solid ${opt.accentColor}`
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                        backgroundColor: isSelected ? opt.badgeBg : 'rgba(255, 255, 255, 0.04)',
                                        color: isSelected ? opt.badgeColor : '#a89fad',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        minHeight: '34px',
                                    }}
                                >
                                    <span>{opt.icon}</span>
                                    <span>{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Prévia da Mensagem */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a89fad', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📝</span> Prévia ({currentOption.label}):
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsEditingMessage(!isEditingMessage)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#74c0fc',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: '2px 4px',
                            }}
                        >
                            {isEditingMessage ? 'Concluir Edição' : 'Personalizar Texto'}
                        </button>
                    </div>

                    {isEditingMessage ? (
                        <textarea
                            rows={6}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                backgroundColor: '#131116',
                                border: `1px solid ${currentOption.accentColor}`,
                                color: '#fff',
                                fontSize: '0.84rem',
                                lineHeight: 1.5,
                                fontFamily: 'inherit',
                                resize: 'vertical',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                backgroundColor: 'rgba(18, 140, 126, 0.12)',
                                border: '1px solid rgba(37, 211, 102, 0.25)',
                                borderRadius: '12px',
                                padding: '0.85rem',
                                color: '#e1e7e4',
                                fontSize: '0.8rem',
                                lineHeight: 1.5,
                                whiteSpace: 'pre-wrap',
                                maxHeight: '160px',
                                overflowY: 'auto',
                            }}
                        >
                            {customMessage}
                        </div>
                    )}
                </div>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '0.65rem 1.15rem',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#c3bcc9',
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            minHeight: '44px',
                            flex: '1 1 auto',
                        }}
                    >
                        Fechar
                    </button>

                    <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        style={{
                            padding: '0.65rem 1.35rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
                            minHeight: '44px',
                            flex: '2 1 auto',
                        }}
                    >
                        <span>💬</span> Enviar no WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
