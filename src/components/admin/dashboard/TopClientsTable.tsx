'use client';

import React, { useState } from 'react';
import { formatPhoneWithCountry } from '@/lib/phoneUtils';
import { buildWhatsAppUrl } from '@/lib/whatsappUtils';

export interface ClientMetric {
    name: string;
    phone: string;
    email?: string | null;
    completedVisits: number;
    incomingVisits: number;
    totalAppointments: number;
    realizedSpent: number; // CONCLUIDO (Já Ganho)
    incomingSpent: number; // CONFIRMADO + PENDENTE (Por Vir)
    lastVisitDate: string;
    favoriteServices: string[];
}

interface TopClientsTableProps {
    clients: ClientMetric[];
    totalClientsCount: number;
    recurringClientsCount: number;
}

export function TopClientsTable({
    clients,
    totalClientsCount,
    recurringClientsCount,
}: TopClientsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const formatCurrency = (val: number) => {
        return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dStr: string) => {
        if (!dStr) return '-';
        const parts = dStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dStr;
    };

    const filteredClients = clients.filter((c) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(term) || c.phone.includes(term);
    });

    const retentionRate =
        totalClientsCount > 0
            ? Math.round((recurringClientsCount / totalClientsCount) * 100)
            : 0;

    const handleSendVipMessage = (client: ClientMetric) => {
        const message = `Olá ${client.name.split(' ')[0]}! Tudo bem com você? ✨ Aqui é do Glamour Studio! Passando para agradecer seu carinho e preferência pelo nosso salão. Estamos preparando novidades e horários especiais para você! Como está seu cabelo/procedimento?`;
        const url = buildWhatsAppUrl(client.phone, message);
        window.open(url, '_blank');
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
                gap: '1.15rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem' }}>👑</span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                            Inteligência de Clientes & Clientes VIP
                        </h3>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#a89fad' }}>
                        {totalClientsCount} clientes únicos • {recurringClientsCount} recorrentes ({retentionRate}% de retenção)
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Buscar cliente ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            backgroundColor: '#201b25',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            color: '#fff',
                            fontSize: '0.8rem',
                            outline: 'none',
                            minWidth: '200px',
                        }}
                    />
                </div>
            </div>

            {/* Tabela de Clientes VIP */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#a89fad', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '0.65rem 0.75rem' }}>Cliente</th>
                            <th style={{ padding: '0.65rem 0.75rem' }}>Telefone</th>
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Atendimentos</th>
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Já Faturado (Ganho)</th>
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>Por Vir</th>
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Última Data</th>
                            <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8b8491', fontSize: '0.86rem' }}>
                                    Nenhuma cliente encontrada.
                                </td>
                            </tr>
                        ) : (
                            filteredClients.slice(0, 10).map((client, idx) => (
                                <tr
                                    key={idx}
                                    className="admin-table-row"
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                        fontSize: '0.84rem',
                                        color: '#fff',
                                    }}
                                >
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    backgroundColor: idx === 0 ? '#fab005' : idx === 1 ? '#adb5bd' : idx === 2 ? '#cd7f32' : 'rgba(214, 51, 108, 0.25)',
                                                    color: idx < 3 ? '#161318' : '#f783ac',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{client.name}</div>
                                                {client.completedVisits > 1 && (
                                                    <span style={{ fontSize: '0.68rem', color: '#51cf66', fontWeight: 600 }}>
                                                        ⭐ Cliente Fiel ({client.completedVisits}x concluídas)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#a89fad', fontSize: '0.8rem' }}>
                                        {formatPhoneWithCountry(client.phone)}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
                                        <span style={{ color: '#51cf66' }}>{client.completedVisits} concl.</span>
                                        {client.incomingVisits > 0 && (
                                            <span style={{ color: '#74c0fc', fontSize: '0.74rem', marginLeft: '4px' }}>
                                                ({client.incomingVisits} por vir)
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#51cf66' }}>
                                        {formatCurrency(client.realizedSpent)}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#74c0fc' }}>
                                        {client.incomingSpent > 0 ? formatCurrency(client.incomingSpent) : '-'}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#f783ac', fontSize: '0.78rem' }}>
                                        {formatDate(client.lastVisitDate)}
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleSendVipMessage(client)}
                                            style={{
                                                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                                                border: '1px solid rgba(37, 211, 102, 0.3)',
                                                color: '#25D366',
                                                borderRadius: '8px',
                                                padding: '0.35rem 0.65rem',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                            }}
                                            title="Enviar WhatsApp para cliente"
                                        >
                                            <span>💬</span> WhatsApp
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
