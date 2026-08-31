'use client';

import React, { useState, useMemo, useRef } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminCard } from '@/components/admin/AdminCard';
import {
    updateAppointmentStatusAction,
    createAdminAppointmentAction,
    updateAdminAppointmentAction,
    deleteAdminAppointmentAction,
} from '@/actions/adminAppointmentActions';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { WhatsAppConfirmationModal, WhatsAppAppointmentData } from '@/components/admin/WhatsAppConfirmationModal';
import {
    getBrazilTodayDateString,
    timeToMinutes,
} from '@/lib/scheduleEngine';
import {
    formatPhoneWithCountry,
    detectCountryFromPhone,
    CountryPhoneCode,
} from '@/lib/phoneUtils';

interface AppointmentItem {
    id: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string | null;
    notes?: string | null;
    date: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    professionalId: string;
    professionalName: string;
    serviceIds: string;
    serviceNames: string;
    totalPrice: number;
    status: string;
    whatsappSent: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ServiceOption {
    id: string;
    name: string;
    professionalId: string;
    professionalName: string;
    durationMinutes: number;
    price: number;
}

interface AdminAppointmentsClientProps {
    initialAppointments: AppointmentItem[];
    services: ServiceOption[];
    adminName: string;
}

export function AdminAppointmentsClient({
    initialAppointments,
    services,
    adminName,
}: AdminAppointmentsClientProps) {
    const [appointments, setAppointments] = useState<AppointmentItem[]>(initialAppointments);
    const [statusFilter, setStatusFilter] = useState<string>('TODOS');
    const [proFilter, setProFilter] = useState<string>('all');
    const [dateQuickFilter, setDateQuickFilter] = useState<string>('all'); // 'all', 'today', 'tomorrow', 'yesterday', 'custom'
    const [customDate, setCustomDate] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const appointmentsListRef = useRef<HTMLDivElement>(null);

    const scrollToAppointments = () => {
        if (appointmentsListRef.current) {
            appointmentsListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleCardClickToday = () => {
        setDateQuickFilter('today');
        setStatusFilter('TODOS');
        scrollToAppointments();
    };

    const handleCardClickPending = () => {
        setStatusFilter('PENDENTE');
        setDateQuickFilter('all');
        scrollToAppointments();
    };

    const handleCardClickConfirmed = () => {
        setStatusFilter('CONFIRMADO');
        setDateQuickFilter('all');
        scrollToAppointments();
    };

    const handleCardClickCompleted = () => {
        setStatusFilter('CONCLUIDO');
        setDateQuickFilter('all');
        scrollToAppointments();
    };

    // Modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<AppointmentItem | null>(null);
    const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
    const [whatsAppModalData, setWhatsAppModalData] = useState<WhatsAppAppointmentData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Formulário de Criação/Edição
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formPhoneCountry, setFormPhoneCountry] = useState<CountryPhoneCode>('BR');
    const [formEmail, setFormEmail] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const todayStr = getBrazilTodayDateString();
    const [formDate, setFormDate] = useState(todayStr);
    const [formStartTime, setFormStartTime] = useState('10:00');
    const [formDuration, setFormDuration] = useState<number>(45);
    const [formProId, setFormProId] = useState('luciana-bezerra');
    const [formSelectedServices, setFormSelectedServices] = useState<string[]>([]);
    const [formCustomPrice, setFormCustomPrice] = useState<number>(0);
    const [formStatus, setFormStatus] = useState('CONFIRMADO');

    const [y, m, d] = todayStr.split('-').map(Number);
    const tomorrowDate = new Date(y, m - 1, d + 1, 12, 0, 0);
    const tomY = tomorrowDate.getFullYear();
    const tomM = String(tomorrowDate.getMonth() + 1).padStart(2, '0');
    const tomD = String(tomorrowDate.getDate()).padStart(2, '0');
    const tomorrowStr = `${tomY}-${tomM}-${tomD}`;

    const yesterdayDate = new Date(y, m - 1, d - 1, 12, 0, 0);
    const yestY = yesterdayDate.getFullYear();
    const yestM = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
    const yestD = String(yesterdayDate.getDate()).padStart(2, '0');
    const yesterdayStr = `${yestY}-${yestM}-${yestD}`;

    const showToast = (type: 'success' | 'error', message: string) => {
        setActionFeedback({ type, message });
        setTimeout(() => setActionFeedback(null), 4000);
    };

    const handleFormPhoneChange = (val: string, countryOverride?: CountryPhoneCode) => {
        const country = countryOverride || formPhoneCountry;
        if (val.startsWith('+592') || val.startsWith('592')) {
            setFormPhoneCountry('GY');
            setFormPhone(formatPhoneWithCountry(val, 'GY'));
            return;
        }
        const formatted = formatPhoneWithCountry(val, country);
        setFormPhone(formatted);
    };

    const toggleFormPhoneCountry = (country: CountryPhoneCode) => {
        setFormPhoneCountry(country);
        if (formPhone) {
            handleFormPhoneChange(formPhone, country);
        }
    };

    // Filtros e Ordenação aplicados a todos os agendamentos
    const filteredAppointments = useMemo(() => {
        const filtered = appointments.filter((apt) => {
            if (statusFilter !== 'TODOS' && apt.status !== statusFilter) {
                return false;
            }

            if (proFilter !== 'all' && apt.professionalId !== proFilter && apt.professionalId !== 'ambas') {
                return false;
            }

            if (dateQuickFilter === 'today' && apt.date !== todayStr) {
                return false;
            }
            if (dateQuickFilter === 'tomorrow' && apt.date !== tomorrowStr) {
                return false;
            }
            if (dateQuickFilter === 'yesterday' && apt.date !== yesterdayStr) {
                return false;
            }
            if (dateQuickFilter === 'custom' && customDate && apt.date !== customDate) {
                return false;
            }

            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchName = apt.clientName.toLowerCase().includes(term);
                const matchPhone = apt.clientPhone.toLowerCase().includes(term);
                const matchService = apt.serviceNames.toLowerCase().includes(term);
                const matchCode = apt.id.toLowerCase().includes(term);
                if (!matchName && !matchPhone && !matchService && !matchCode) {
                    return false;
                }
            }

            return true;
        });

        // Ordenação por data mais recente primeiro, e horário de início
        return filtered.sort((a, b) => {
            if (a.date !== b.date) {
                return b.date.localeCompare(a.date);
            }
            return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        });
    }, [
        appointments,
        statusFilter,
        proFilter,
        dateQuickFilter,
        customDate,
        searchTerm,
        todayStr,
        tomorrowStr,
        yesterdayStr,
    ]);

    // Métricas Estatísticas
    const stats = useMemo(() => {
        const todayCount = appointments.filter((a) => a.date === todayStr && a.status !== 'CANCELADO').length;
        const pendingCount = appointments.filter((a) => a.status === 'PENDENTE').length;
        const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMADO').length;
        const completedCount = appointments.filter((a) => a.status === 'CONCLUIDO').length;
        const totalRevenue = appointments
            .filter((a) => a.status === 'CONFIRMADO' || a.status === 'CONCLUIDO')
            .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        return {
            todayCount,
            pendingCount,
            confirmedCount,
            completedCount,
            totalRevenue,
            totalCount: appointments.length,
        };
    }, [appointments, todayStr]);

    // Ações Rápidas de Status
    const handleStatusChange = async (id: string, newStatus: string) => {
        const res = await updateAppointmentStatusAction(id, newStatus);
        if (res.success && res.appointment) {
            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === id ? { ...a, status: newStatus } : a
                )
            );
            showToast('success', `Status atualizado para ${newStatus}!`);

            if (newStatus === 'CONFIRMADO' || newStatus === 'CANCELADO' || newStatus === 'CONCLUIDO') {
                const targetApt = appointments.find((a) => a.id === id);
                if (targetApt) {
                    setWhatsAppModalData({
                        id: targetApt.id,
                        clientName: targetApt.clientName,
                        clientPhone: targetApt.clientPhone,
                        date: targetApt.date,
                        startTime: targetApt.startTime,
                        endTime: targetApt.endTime,
                        professionalName: targetApt.professionalName,
                        serviceNames: targetApt.serviceNames,
                        totalPrice: targetApt.totalPrice,
                        status: newStatus,
                    });
                }
            }
        } else {
            showToast('error', res.message || 'Erro ao alterar status.');
        }
    };

    // Abertura do Modal de Criação
    const handleOpenCreate = () => {
        setEditingAppointment(null);
        setFormName('');
        setFormPhone('');
        setFormPhoneCountry('BR');
        setFormEmail('');
        setFormNotes('');
        setFormDate(todayStr);
        setFormStartTime('10:00');
        setFormDuration(45);
        setFormProId('luciana-bezerra');
        setFormSelectedServices([]);
        setFormCustomPrice(0);
        setFormStatus('CONFIRMADO');
        setIsCreateModalOpen(true);
    };

    // Abertura do Modal de Edição
    const handleOpenEdit = (apt: AppointmentItem) => {
        setEditingAppointment(apt);
        setFormName(apt.clientName);
        setFormPhoneCountry(detectCountryFromPhone(apt.clientPhone));
        setFormPhone(apt.clientPhone);
        setFormEmail(apt.clientEmail || '');
        setFormNotes(apt.notes || '');
        setFormDate(apt.date);
        setFormStartTime(apt.startTime);
        setFormDuration(apt.durationMinutes);
        setFormProId(apt.professionalId);
        setFormCustomPrice(apt.totalPrice);
        setFormStatus(apt.status);

        try {
            const parsedIds = JSON.parse(apt.serviceIds);
            setFormSelectedServices(Array.isArray(parsedIds) ? parsedIds : []);
        } catch {
            setFormSelectedServices([]);
        }

        setIsCreateModalOpen(true);
    };

    // Salvar Agendamento
    const handleSaveAppointment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formName.trim() || !formPhone.trim() || !formDate || !formStartTime) {
            showToast('error', 'Preencha os campos obrigatórios (Nome, WhatsApp, Data e Horário).');
            return;
        }

        setIsSubmitting(true);

        const chosenServiceObjs = services.filter((s) => formSelectedServices.includes(s.id));
        const serviceNamesText = chosenServiceObjs.length > 0
            ? chosenServiceObjs.map((s) => s.name).join(', ')
            : 'Atendimento Personalizado';

        const finalPrice = formCustomPrice > 0
            ? formCustomPrice
            : chosenServiceObjs.reduce((acc, curr) => acc + curr.price, 0);

        const proName =
            formProId === 'luciana-bezerra'
                ? 'Luciana Bezerra'
                : formProId === 'graziele-bezerra'
                ? 'Graziele Bezerra'
                : 'Luciana & Graziele';

        if (editingAppointment) {
            const res = await updateAdminAppointmentAction(editingAppointment.id, {
                clientName: formName,
                clientPhone: formPhone,
                clientEmail: formEmail || undefined,
                notes: formNotes || undefined,
                date: formDate,
                startTime: formStartTime,
                durationMinutes: formDuration,
                professionalId: formProId,
                professionalName: proName,
                serviceNames: serviceNamesText,
                totalPrice: finalPrice,
                status: formStatus,
            });

            if (res.success && res.appointment) {
                setAppointments((prev) =>
                    prev.map((a) =>
                        a.id === editingAppointment.id
                            ? {
                                  ...a,
                                  clientName: formName,
                                  clientPhone: formPhone,
                                  clientEmail: formEmail || null,
                                  notes: formNotes || null,
                                  date: formDate,
                                  startTime: formStartTime,
                                  endTime: res.appointment?.endTime || a.endTime,
                                  durationMinutes: formDuration,
                                  professionalId: formProId,
                                  professionalName: proName,
                                  serviceNames: serviceNamesText,
                                  totalPrice: finalPrice,
                                  status: formStatus,
                              }
                            : a
                    )
                );
                showToast('success', 'Agendamento atualizado com sucesso!');
                setIsCreateModalOpen(false);

                if (formStatus === 'CONFIRMADO' || formStatus === 'CANCELADO' || formStatus === 'CONCLUIDO') {
                    setWhatsAppModalData({
                        id: editingAppointment.id,
                        clientName: formName,
                        clientPhone: formPhone,
                        date: formDate,
                        startTime: formStartTime,
                        endTime: res.appointment?.endTime,
                        professionalName: proName,
                        serviceNames: serviceNamesText,
                        totalPrice: finalPrice,
                        status: formStatus,
                    });
                }
            } else {
                showToast('error', res.message || 'Erro ao atualizar agendamento.');
            }
        } else {
            const res = await createAdminAppointmentAction({
                clientName: formName,
                clientPhone: formPhone,
                clientEmail: formEmail || undefined,
                notes: formNotes || undefined,
                date: formDate,
                startTime: formStartTime,
                durationMinutes: formDuration,
                professionalId: formProId,
                professionalName: proName,
                serviceIds: formSelectedServices,
                serviceNames: serviceNamesText,
                totalPrice: finalPrice,
                status: formStatus,
            });

            if (res.success && res.appointment) {
                const newApt: AppointmentItem = {
                    ...res.appointment,
                    createdAt: res.appointment.createdAt.toISOString(),
                    updatedAt: res.appointment.updatedAt.toISOString(),
                };
                setAppointments((prev) => [newApt, ...prev]);
                showToast('success', 'Novo agendamento criado com sucesso!');
                setIsCreateModalOpen(false);

                if (formStatus === 'CONFIRMADO' || formStatus === 'CANCELADO' || formStatus === 'CONCLUIDO') {
                    setWhatsAppModalData({
                        id: res.appointment.id,
                        clientName: formName,
                        clientPhone: formPhone,
                        date: formDate,
                        startTime: formStartTime,
                        endTime: res.appointment.endTime,
                        professionalName: proName,
                        serviceNames: serviceNamesText,
                        totalPrice: finalPrice,
                        status: formStatus,
                    });
                }
            } else {
                showToast('error', res.message || 'Erro ao criar agendamento.');
            }
        }

        setIsSubmitting(false);
    };

    // Exclusão de Agendamento
    const handleDeleteAppointment = async (): Promise<{ success: boolean; message?: string }> => {
        if (!deletingAppointmentId) return { success: false, message: 'Nenhum agendamento selecionado' };

        const res = await deleteAdminAppointmentAction(deletingAppointmentId);

        if (res.success) {
            setAppointments((prev) => prev.filter((a) => a.id !== deletingAppointmentId));
            showToast('success', 'Agendamento excluído do sistema.');
            setDeletingAppointmentId(null);
            return { success: true };
        } else {
            showToast('error', res.message || 'Erro ao excluir agendamento.');
            return { success: false, message: res.message };
        }
    };

    // Abrir WhatsApp da cliente
    const openClientWhatsApp = (apt: AppointmentItem) => {
        setWhatsAppModalData({
            id: apt.id,
            clientName: apt.clientName,
            clientPhone: apt.clientPhone,
            date: apt.date,
            startTime: apt.startTime,
            endTime: apt.endTime,
            professionalName: apt.professionalName,
            serviceNames: apt.serviceNames,
            totalPrice: apt.totalPrice,
            status: apt.status,
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <AdminHeader
                title="Gestão de Agendamentos"
                subtitle="Controle em tempo real de horários marcados, confirmações e histórico."
                actionButton={{
                    label: 'Novo Agendamento',
                    icon: '➕',
                    onClick: handleOpenCreate,
                }}
            />

            <main className="admin-content-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Feedback Toast */}
                {actionFeedback && (
                    <div
                        style={{
                            padding: '0.85rem 1.25rem',
                            borderRadius: '12px',
                            backgroundColor: actionFeedback.type === 'success' ? 'rgba(81, 207, 102, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                            border: actionFeedback.type === 'success' ? '1px solid rgba(81, 207, 102, 0.4)' : '1px solid rgba(255, 107, 107, 0.4)',
                            color: actionFeedback.type === 'success' ? '#51cf66' : '#ff8787',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                        }}
                    >
                        <span>{actionFeedback.type === 'success' ? '✓' : '⚠️'}</span>
                        <span>{actionFeedback.message}</span>
                    </div>
                )}

                {/* Cards de Métricas Responsivo */}
                <div className="admin-stats-grid">
                    <AdminCard
                        title="Agendamentos Hoje"
                        value={stats.todayCount}
                        icon="📅"
                        subtitle={new Date().toLocaleDateString('pt-BR')}
                        trend="Agenda do dia"
                        trendColor="#74c0fc"
                        accentColor="#1c7ed6"
                        onClick={handleCardClickToday}
                        isActive={dateQuickFilter === 'today' && statusFilter === 'TODOS'}
                    />

                    <AdminCard
                        title="Pendentes"
                        value={stats.pendingCount}
                        icon="⏳"
                        subtitle="Aguardando confirmação"
                        trend="Requer atenção"
                        trendColor="#ffd43b"
                        accentColor="#fab005"
                        onClick={handleCardClickPending}
                        isActive={statusFilter === 'PENDENTE'}
                    />

                    <AdminCard
                        title="Confirmados"
                        value={stats.confirmedCount}
                        icon="✓"
                        subtitle="Horários garantidos"
                        trend="Prontos para atendimento"
                        trendColor="#51cf66"
                        accentColor="#2b8a3e"
                        onClick={handleCardClickConfirmed}
                        isActive={statusFilter === 'CONFIRMADO'}
                    />

                    <AdminCard
                        title="Concluídos"
                        value={stats.completedCount}
                        icon="🏆"
                        subtitle="Realizados com sucesso"
                        trend="Histórico positivo"
                        trendColor="#e599f7"
                        accentColor="#ae3ec9"
                        onClick={handleCardClickCompleted}
                        isActive={statusFilter === 'CONCLUIDO'}
                    />

                    <AdminCard
                        title="Faturamento Previsto"
                        value={`R$ ${stats.totalRevenue.toFixed(2).replace('.', ',')}`}
                        icon="💰"
                        subtitle="Confirmados + Concluídos"
                        trend="Receita total"
                        trendColor="#f783ac"
                        accentColor="#d6336c"
                    />
                </div>

                {/* Barra de Filtros e Busca Responsiva */}
                <div
                    ref={appointmentsListRef}
                    style={{
                        scrollMarginTop: '24px',
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(235, 100, 150, 0.15)',
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                    }}
                >
                    {/* Linha 1: Busca por texto & Filtro de Especialista */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar por cliente, WhatsApp ou serviço..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: '10px',
                                    backgroundColor: '#201b25',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.88rem',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
                            <select
                                value={proFilter}
                                onChange={(e) => setProFilter(e.target.value)}
                                style={{
                                    padding: '0.65rem 0.75rem',
                                    borderRadius: '10px',
                                    backgroundColor: '#201b25',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="all">Todas as Especialistas</option>
                                <option value="luciana-bezerra">💇‍♀️ Luciana Bezerra</option>
                                <option value="graziele-bezerra">🌸 Graziele Bezerra</option>
                                <option value="ambas">✨ Ambas (Combinado)</option>
                            </select>
                        </div>
                    </div>

                    {/* Linha 2: Filtros Rápidos de Data */}
                    <div
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: '0.4rem',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            paddingBottom: '2px',
                            alignItems: 'center',
                        }}
                    >
                        {[
                            { id: 'all', label: 'Todos os Agendamentos' },
                            { id: 'today', label: '📅 Hoje' },
                            { id: 'tomorrow', label: 'Amanhã' },
                            { id: 'yesterday', label: 'Ontem' },
                            { id: 'custom', label: 'Data Específica' },
                        ].map((df) => (
                            <button
                                key={df.id}
                                type="button"
                                onClick={() => setDateQuickFilter(df.id)}
                                style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '8px',
                                    border:
                                        dateQuickFilter === df.id
                                            ? '1px solid #d6336c'
                                            : '1px solid rgba(255, 255, 255, 0.08)',
                                    backgroundColor:
                                        dateQuickFilter === df.id
                                            ? 'rgba(214, 51, 108, 0.25)'
                                            : '#201b25',
                                    color:
                                        dateQuickFilter === df.id
                                            ? '#f783ac'
                                            : '#c3bcc9',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                }}
                            >
                                {df.label}
                            </button>
                        ))}

                        {dateQuickFilter === 'custom' && (
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                style={{
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#201b25',
                                    border: '1px solid #d6336c',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                    </div>

                    {/* Linha 3: Filtro de Status (Scroll Horizontal suave) */}
                    <div
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: '0.4rem',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            paddingBottom: '2px',
                        }}
                    >
                        {['TODOS', 'PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'].map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => setStatusFilter(st)}
                                style={{
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor:
                                        statusFilter === st
                                            ? '#d6336c'
                                            : 'rgba(255, 255, 255, 0.06)',
                                    color: statusFilter === st ? '#fff' : '#a89fad',
                                    fontSize: '0.76rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                }}
                            >
                                {st === 'TODOS' ? 'Todos os Status' : st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Agendamentos (Cards Responsivos) */}
                <div
                    style={{
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(235, 100, 150, 0.15)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                        }}
                    >
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                                📅 Agendamentos ({filteredAppointments.length})
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#8b8491' }}>
                                Exibindo agendamentos cadastrados no sistema
                            </p>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#8b8491' }}>
                            Total geral cadastrado: {appointments.length}
                        </span>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#8b8491' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>
                                📅
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                                Nenhum agendamento encontrado
                            </div>
                            <p style={{ fontSize: '0.88rem', margin: '0.4rem 0 1rem' }}>
                                Não há agendamentos que correspondam aos filtros selecionados.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('TODOS');
                                    setProFilter('all');
                                    setDateQuickFilter('all');
                                    setSearchTerm('');
                                }}
                                style={{
                                    padding: '0.55rem 1.1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: '#fff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                }}
                            >
                                Limpar Todos os Filtros
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {filteredAppointments.map((apt, index) => {
                                const isPending = apt.status === 'PENDENTE';
                                const isConfirmed = apt.status === 'CONFIRMADO';
                                const isCompleted = apt.status === 'CONCLUIDO';
                                const isCancelled = apt.status === 'CANCELADO';

                                const [y, m, d] = apt.date.split('-');
                                const dateFormatted = `${d}/${m}/${y}`;
                                const isTodayApt = apt.date === todayStr;

                                return (
                                    <div
                                        key={apt.id}
                                        style={{
                                            padding: '1.15rem 1.25rem',
                                            borderBottom:
                                                index !== filteredAppointments.length - 1
                                                    ? '1px solid rgba(255, 255, 255, 0.06)'
                                                    : 'none',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.85rem',
                                            backgroundColor: isTodayApt ? 'rgba(214, 51, 108, 0.04)' : 'transparent',
                                        }}
                                    >
                                        {/* Linha Superior: Ícone + Nome + Status + Código */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        width: '42px',
                                                        height: '42px',
                                                        borderRadius: '12px',
                                                        backgroundColor: isConfirmed
                                                            ? 'rgba(81, 207, 102, 0.15)'
                                                            : isPending
                                                            ? 'rgba(255, 212, 59, 0.15)'
                                                            : isCompleted
                                                            ? 'rgba(229, 153, 247, 0.15)'
                                                            : 'rgba(255, 107, 107, 0.15)',
                                                        color: isConfirmed
                                                            ? '#51cf66'
                                                            : isPending
                                                            ? '#ffd43b'
                                                            : isCompleted
                                                            ? '#e599f7'
                                                            : '#ff8787',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.25rem',
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {isConfirmed ? '✓' : isPending ? '⏳' : isCompleted ? '🏆' : '✕'}
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>
                                                            {apt.clientName}
                                                        </span>
                                                        {isTodayApt && (
                                                            <span
                                                                style={{
                                                                    fontSize: '0.65rem',
                                                                    padding: '1px 6px',
                                                                    borderRadius: '4px',
                                                                    backgroundColor: 'rgba(214, 51, 108, 0.3)',
                                                                    color: '#f783ac',
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                HOJE
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.74rem', color: '#a89fad', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                                        <span>📱 {apt.clientPhone}</span>
                                                        <span>•</span>
                                                        <span style={{ fontFamily: 'monospace', color: '#8b8491' }}>
                                                            #{apt.id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <span
                                                style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: '999px',
                                                    backgroundColor: isConfirmed
                                                        ? 'rgba(81, 207, 102, 0.2)'
                                                        : isPending
                                                        ? 'rgba(255, 212, 59, 0.2)'
                                                        : isCompleted
                                                        ? 'rgba(229, 153, 247, 0.2)'
                                                        : 'rgba(255, 107, 107, 0.2)',
                                                    color: isConfirmed
                                                        ? '#51cf66'
                                                        : isPending
                                                        ? '#ffd43b'
                                                        : isCompleted
                                                        ? '#e599f7'
                                                        : '#ff8787',
                                                    flexShrink: 0,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                ● {apt.status}
                                            </span>
                                        </div>

                                        {/* Linha Central: Data/Horário, Especialista e Procedimento */}
                                        <div
                                            style={{
                                                backgroundColor: '#201b25',
                                                borderRadius: '10px',
                                                padding: '0.75rem 0.85rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.35rem',
                                                fontSize: '0.82rem',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                                                <span style={{ color: '#f783ac', fontWeight: 600 }}>
                                                    📅 {dateFormatted} às {apt.startTime} (até {apt.endTime})
                                                </span>
                                                <span style={{ color: '#c3bcc9', fontWeight: 500 }}>
                                                    {apt.professionalName}
                                                </span>
                                            </div>

                                            <div style={{ color: '#e5d5d5' }}>
                                                <strong style={{ color: '#a89fad' }}>Procedimentos:</strong> {apt.serviceNames}
                                            </div>

                                            {apt.notes && (
                                                <div style={{ fontSize: '0.75rem', color: '#8b8491', fontStyle: 'italic' }}>
                                                    Obs: {apt.notes}
                                                </div>
                                            )}
                                        </div>

                                        {/* Linha Inferior: Valor + Botões de Ação Táteis */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: '0.75rem',
                                                paddingTop: '0.25rem',
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontSize: '0.72rem', color: '#8b8491', display: 'block' }}>Valor:</span>
                                                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f783ac' }}>
                                                    {apt.totalPrice > 0 ? `R$ ${apt.totalPrice.toFixed(2).replace('.', ',')}` : 'Sob consulta'}
                                                </span>
                                            </div>

                                            {/* Toolbar de Ações Rápidas */}
                                            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => openClientWhatsApp(apt)}
                                                    title="Conversar no WhatsApp com a cliente"
                                                    style={{
                                                        padding: '0.45rem 0.75rem',
                                                        borderRadius: '8px',
                                                        background: 'rgba(37, 211, 102, 0.15)',
                                                        border: '1px solid rgba(37, 211, 102, 0.35)',
                                                        color: '#25d366',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        minHeight: '36px',
                                                    }}
                                                >
                                                    <span>💬</span> WhatsApp
                                                </button>

                                                {!isConfirmed && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(apt.id, 'CONFIRMADO')}
                                                        style={{
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: 'rgba(81, 207, 102, 0.15)',
                                                            border: '1px solid rgba(81, 207, 102, 0.3)',
                                                            color: '#51cf66',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            minHeight: '36px',
                                                        }}
                                                    >
                                                        ✓ Confirmar
                                                    </button>
                                                )}

                                                {!isCompleted && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(apt.id, 'CONCLUIDO')}
                                                        style={{
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: 'rgba(229, 153, 247, 0.15)',
                                                            border: '1px solid rgba(229, 153, 247, 0.3)',
                                                            color: '#e599f7',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            minHeight: '36px',
                                                        }}
                                                    >
                                                        🏆 Concluir
                                                    </button>
                                                )}

                                                {!isCancelled && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(apt.id, 'CANCELADO')}
                                                        style={{
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: 'rgba(255, 107, 107, 0.15)',
                                                            border: '1px solid rgba(255, 107, 107, 0.3)',
                                                            color: '#ff8787',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            minHeight: '36px',
                                                        }}
                                                    >
                                                        ✕ Cancelar
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(apt)}
                                                    title="Editar agendamento"
                                                    style={{
                                                        padding: '0.45rem 0.65rem',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                        color: '#fff',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        minHeight: '36px',
                                                    }}
                                                >
                                                    ✏️
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingAppointmentId(apt.id)}
                                                    title="Excluir do sistema"
                                                    style={{
                                                        padding: '0.45rem 0.65rem',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255, 107, 107, 0.1)',
                                                        border: '1px solid rgba(255, 107, 107, 0.2)',
                                                        color: '#ff8787',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        minHeight: '36px',
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL DE CRIAÇÃO / EDIÇÃO DE AGENDAMENTO (Mobile-First) */}
            {isCreateModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#1a161e',
                            border: '1px solid rgba(235, 100, 150, 0.3)',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '92vh',
                            overflowY: 'auto',
                            padding: '1.5rem',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                                {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento Manual'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: '#a89fad', fontSize: '1.4rem', cursor: 'pointer', padding: '4px' }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Nome do Cliente *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Ex: Maria Santos"
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <label style={{ fontSize: '0.82rem', color: '#c3bcc9', fontWeight: 600, margin: 0 }}>
                                            WhatsApp / Telefone *
                                        </label>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleFormPhoneCountry('BR')}
                                                style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: formPhoneCountry === 'BR' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                                                    background: formPhoneCountry === 'BR' ? 'rgba(212,175,55,0.2)' : 'transparent',
                                                    color: formPhoneCountry === 'BR' ? '#ffd700' : '#888',
                                                    fontSize: '0.72rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                🇧🇷 BR (+55)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleFormPhoneCountry('GY')}
                                                style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: formPhoneCountry === 'GY' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                                                    background: formPhoneCountry === 'GY' ? 'rgba(212,175,55,0.2)' : 'transparent',
                                                    color: formPhoneCountry === 'GY' ? '#ffd700' : '#888',
                                                    fontSize: '0.72rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                🇬🇾 Lethem (+592)
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={formPhone}
                                        onChange={(e) => handleFormPhoneChange(e.target.value)}
                                        placeholder={formPhoneCountry === 'GY' ? '+592 612-3456' : '(95) 98400-0000'}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Data do Atendimento *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', colorScheme: 'dark' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Horário de Início *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formStartTime}
                                        onChange={(e) => setFormStartTime(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Duração (Minutos) *
                                    </label>
                                    <input
                                        type="number"
                                        step="15"
                                        min="15"
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(Number(e.target.value))}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Especialista *
                                    </label>
                                    <select
                                        value={formProId}
                                        onChange={(e) => setFormProId(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    >
                                        <option value="luciana-bezerra">Luciana Bezerra (Cabelos & Unhas)</option>
                                        <option value="graziele-bezerra">Graziele Bezerra (Sobrancelhas & Depilação)</option>
                                        <option value="ambas">Ambas as Especialistas (Combinado)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                    Procedimentos do Salão:
                                </label>
                                <div
                                    style={{
                                        maxHeight: '140px',
                                        overflowY: 'auto',
                                        backgroundColor: '#201b25',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        padding: '0.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                    }}
                                >
                                    {services.map((s) => {
                                        const isSelected = formSelectedServices.includes(s.id);
                                        return (
                                            <label
                                                key={s.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    fontSize: '0.84rem',
                                                    color: isSelected ? '#fff' : '#a89fad',
                                                    padding: '6px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: isSelected ? 'rgba(214,51,108,0.2)' : 'transparent',
                                                    cursor: 'pointer',
                                                    minHeight: '34px',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setFormSelectedServices((prev) =>
                                                            prev.includes(s.id)
                                                                ? prev.filter((id) => id !== s.id)
                                                                : [...prev, s.id]
                                                        );
                                                    }}
                                                    style={{ width: '18px', height: '18px', accentColor: '#d6336c' }}
                                                />
                                                <span>{s.name} (R$ {s.price.toFixed(2).replace('.', ',')})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Valor Total (R$)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formCustomPrice}
                                        onChange={(e) => setFormCustomPrice(Number(e.target.value))}
                                        placeholder="0.00"
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                        Status Inicial
                                    </label>
                                    <select
                                        value={formStatus}
                                        onChange={(e) => setFormStatus(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    >
                                        <option value="CONFIRMADO">CONFIRMADO</option>
                                        <option value="PENDENTE">PENDENTE</option>
                                        <option value="CONCLUIDO">CONCLUIDO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '4px', fontWeight: 600 }}>
                                    Observações Internas (opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    placeholder="Ex: Cliente agendou presencialmente no balcão..."
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', backgroundColor: '#201b25', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer', minHeight: '42px', flex: '1 1 auto' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ padding: '0.65rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #d6336c, #e64980)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', minHeight: '42px', flex: '1 1 auto' }}
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            <DeleteConfirmModal
                isOpen={!!deletingAppointmentId}
                title="Excluir Agendamento"
                itemName="este agendamento da agenda do salão"
                itemType="item"
                onClose={() => setDeletingAppointmentId(null)}
                onConfirm={handleDeleteAppointment}
            />

            {/* MODAL DE ENVIO DE WHATSAPP PARA O CLIENTE */}
            <WhatsAppConfirmationModal
                isOpen={!!whatsAppModalData}
                appointment={whatsAppModalData}
                onClose={() => setWhatsAppModalData(null)}
            />
        </div>
    );
}
