'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
    saveAdminScheduleSettingAction,
    createAdminBlockedSlotAction,
    deleteAdminBlockedSlotAction,
} from '@/actions/adminAppointmentActions';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { getBrazilTodayDateString } from '@/lib/scheduleEngine';

interface ScheduleSettingItem {
    id: string;
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breakStart?: string | null;
    breakEnd?: string | null;
    slotIntervalMinutes: number;
    professionalId?: string | null;
}

interface BlockedSlotItem {
    id: string;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    professionalId?: string | null;
    reason: string;
    createdAt: string;
}

interface ProfessionalOption {
    id: string;
    name: string;
}

interface AdminScheduleClientProps {
    initialSettings: ScheduleSettingItem[];
    initialBlocks: BlockedSlotItem[];
    professionals: ProfessionalOption[];
    adminName: string;
}

const DAYS_NAMES = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];

export function AdminScheduleClient({
    initialSettings,
    initialBlocks,
    professionals,
    adminName,
}: AdminScheduleClientProps) {
    // Abas de configuração individual das especialistas (Luciana e Graziele)
    const [activeTab, setActiveTab] = useState<'luciana-bezerra' | 'graziele-bezerra'>('luciana-bezerra');
    const [allSettings, setAllSettings] = useState<ScheduleSettingItem[]>(initialSettings);
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlotItem[]>(initialBlocks);
    const [blockFilter, setBlockFilter] = useState<'all' | 'luciana-bezerra' | 'graziele-bezerra' | 'ambas'>('all');

    // Feedback
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSavingDay, setIsSavingDay] = useState<number | null>(null);

    // Novo Bloqueio
    const [newBlockDate, setNewBlockDate] = useState(getBrazilTodayDateString());
    const [newBlockIsFullDay, setNewBlockIsFullDay] = useState(true);
    const [newBlockStartTime, setNewBlockStartTime] = useState('14:00');
    const [newBlockEndTime, setNewBlockEndTime] = useState('16:00');
    const [newBlockProId, setNewBlockProId] = useState('ambas');
    const [newBlockReason, setNewBlockReason] = useState('');
    const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

    // Exclusão de Bloqueio
    const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4000);
    };

    // Obter horários dos 7 dias para a profissional selecionada
    const getDaysForCurrentTab = () => {
        return Array.from({ length: 7 }, (_, dayIdx) => {
            const foundSpecific = allSettings.find(
                (s) => s.dayOfWeek === dayIdx && s.professionalId === activeTab
            );
            if (foundSpecific) return foundSpecific;

            return {
                id: `temp-${activeTab}-${dayIdx}`,
                dayOfWeek: dayIdx,
                isOpen: dayIdx !== 0,
                openTime: '10:00',
                closeTime: '18:00',
                breakStart: null,
                breakEnd: null,
                slotIntervalMinutes: 30,
                professionalId: activeTab,
            };
        });
    };

    const daysSchedule = getDaysForCurrentTab();

    const handleDayChange = (dayIdx: number, field: keyof ScheduleSettingItem, value: any) => {
        setAllSettings((prev) => {
            const existingIndex = prev.findIndex(
                (s) => s.dayOfWeek === dayIdx && s.professionalId === activeTab
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    [field]: value,
                };
                return updated;
            } else {
                const base = daysSchedule.find((d) => d.dayOfWeek === dayIdx);
                const newItem: ScheduleSettingItem = {
                    id: `new-${Date.now()}-${dayIdx}`,
                    dayOfWeek: dayIdx,
                    isOpen: base?.isOpen ?? (dayIdx !== 0),
                    openTime: base?.openTime ?? '10:00',
                    closeTime: base?.closeTime ?? '18:00',
                    breakStart: base?.breakStart ?? null,
                    breakEnd: base?.breakEnd ?? null,
                    slotIntervalMinutes: base?.slotIntervalMinutes ?? 30,
                    professionalId: activeTab,
                    [field]: value,
                };
                return [...prev, newItem];
            }
        });
    };

    const handleSaveDay = async (dayIdx: number) => {
        const dayConfig = daysSchedule.find((d) => d.dayOfWeek === dayIdx);
        if (!dayConfig) return;

        setIsSavingDay(dayIdx);
        const res = await saveAdminScheduleSettingAction({
            dayOfWeek: dayConfig.dayOfWeek,
            isOpen: dayConfig.isOpen,
            openTime: dayConfig.openTime,
            closeTime: dayConfig.closeTime,
            breakStart: dayConfig.breakStart || null,
            breakEnd: dayConfig.breakEnd || null,
            slotIntervalMinutes: dayConfig.slotIntervalMinutes || 30,
            professionalId: activeTab,
        });
        setIsSavingDay(null);

        if (res.success && res.setting) {
            setAllSettings((prev) => {
                const filtered = prev.filter(
                    (s) => !(s.dayOfWeek === dayIdx && s.professionalId === activeTab)
                );
                return [...filtered, res.setting!];
            });

            const proName = activeTab === 'luciana-bezerra' ? 'Luciana Bezerra' : 'Graziele Bezerra';
            showToast('success', `Horário de ${DAYS_NAMES[dayIdx]} salvo para ${proName}!`);
        } else {
            showToast('error', res.message || 'Erro ao salvar horário.');
        }
    };

    const handleCreateBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBlockDate || !newBlockReason.trim()) {
            showToast('error', 'Informe a data e o motivo do bloqueio.');
            return;
        }

        setIsSubmittingBlock(true);
        const targetPro = newBlockProId === 'ambas' ? null : newBlockProId;

        const res = await createAdminBlockedSlotAction({
            date: newBlockDate,
            startTime: newBlockIsFullDay ? null : newBlockStartTime,
            endTime: newBlockIsFullDay ? null : newBlockEndTime,
            professionalId: targetPro,
            reason: newBlockReason,
        });
        setIsSubmittingBlock(false);

        if (res.success && res.block) {
            setBlockedSlots((prev) => [
                {
                    ...res.block!,
                    createdAt: res.block!.createdAt.toISOString(),
                },
                ...prev,
            ]);
            setNewBlockReason('');
            showToast('success', 'Bloqueio registrado com sucesso!');
        } else {
            showToast('error', res.message || 'Erro ao criar bloqueio.');
        }
    };

    const handleDeleteBlock = async (): Promise<{ success: boolean; message?: string }> => {
        if (!deletingBlockId) return { success: false, message: 'Nenhum bloqueio selecionado' };

        const res = await deleteAdminBlockedSlotAction(deletingBlockId);

        if (res.success) {
            setBlockedSlots((prev) => prev.filter((b) => b.id !== deletingBlockId));
            showToast('success', 'Bloqueio removido com sucesso.');
            setDeletingBlockId(null);
            return { success: true };
        } else {
            showToast('error', res.message || 'Erro ao remover bloqueio.');
            return { success: false, message: res.message };
        }
    };

    const filteredBlockedSlots = blockedSlots.filter((b) => {
        if (blockFilter === 'all') return true;
        if (blockFilter === 'ambas') return b.professionalId === null;
        return b.professionalId === blockFilter;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <AdminHeader
                title="Horários & Escalas Individuais"
                subtitle="Configuração do expediente semanal e bloqueios de Luciana Bezerra e Graziele Bezerra."
            />

            <main className="admin-content-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Feedback Toast */}
                {feedback && (
                    <div
                        style={{
                            padding: '0.85rem 1.25rem',
                            borderRadius: '12px',
                            backgroundColor: feedback.type === 'success' ? 'rgba(81, 207, 102, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                            border: feedback.type === 'success' ? '1px solid rgba(81, 207, 102, 0.4)' : '1px solid rgba(255, 107, 107, 0.4)',
                            color: feedback.type === 'success' ? '#51cf66' : '#ff8787',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                        }}
                    >
                        <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
                        <span>{feedback.message}</span>
                    </div>
                )}

                {/* Banner Informativo */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, rgba(214, 51, 108, 0.22) 0%, rgba(26, 22, 29, 0.85) 100%)',
                        border: '1px solid rgba(235, 100, 150, 0.25)',
                        borderRadius: '20px',
                        padding: '1.5rem',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(214, 51, 108, 0.25)',
                            color: '#f783ac',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                        }}
                    >
                        ⏰ AGENDAS ESPECÍFICAS POR PROFISSIONAL
                    </div>
                    <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                        Expediente de Luciana & Graziele
                    </h2>
                    <p style={{ margin: 0, color: '#c3bcc9', fontSize: '0.86rem', maxWidth: '750px', lineHeight: 1.4 }}>
                        Cada especialista possui sua própria agenda. Configure abaixo os dias em que cada uma atende, horários de abertura, fechamento, intervalos e bloqueios de data.
                    </p>
                </div>

                {/* SEÇÃO 1: DIAS DA SEMANA COM ABAS DAS PROFISSIONAIS */}
                <div
                    style={{
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(235, 100, 150, 0.15)',
                        borderRadius: '18px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                                Horário Semanal da Especialista
                            </h3>
                            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#8b8491' }}>
                                Alterne entre as especialistas para gerenciar a escala semanal de cada uma.
                            </p>
                        </div>

                        {/* Abas das 2 Profissionais */}
                        <div style={{ display: 'flex', gap: '6px', background: '#201b25', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <button
                                type="button"
                                onClick={() => setActiveTab('luciana-bezerra')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === 'luciana-bezerra' ? '#d6336c' : 'transparent',
                                    color: activeTab === 'luciana-bezerra' ? '#fff' : '#c3bcc9',
                                    fontSize: '0.86rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span>💇‍♀️</span> Luciana Bezerra
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('graziele-bezerra')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === 'graziele-bezerra' ? '#e64980' : 'transparent',
                                    color: activeTab === 'graziele-bezerra' ? '#fff' : '#c3bcc9',
                                    fontSize: '0.86rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span>🌸</span> Graziele Bezerra
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {daysSchedule.map((day) => {
                            const isSaving = isSavingDay === day.dayOfWeek;
                            const activeThemeColor = activeTab === 'luciana-bezerra' ? '#d6336c' : '#e64980';

                            return (
                                <div
                                    key={day.dayOfWeek}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '14px',
                                        backgroundColor: day.isOpen ? '#201b25' : 'rgba(0,0,0,0.3)',
                                        border: day.isOpen
                                            ? '1px solid rgba(255, 255, 255, 0.08)'
                                            : '1px dashed rgba(255, 255, 255, 0.05)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                    }}
                                >
                                    {/* Linha 1: Nome do Dia + Switch */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={day.isOpen}
                                                onChange={(e) => handleDayChange(day.dayOfWeek, 'isOpen', e.target.checked)}
                                                style={{ width: '22px', height: '22px', accentColor: activeThemeColor, cursor: 'pointer' }}
                                            />
                                            <div>
                                                <span style={{ fontWeight: 700, color: day.isOpen ? '#fff' : '#8b8491', fontSize: '0.95rem' }}>
                                                    {DAYS_NAMES[day.dayOfWeek]}
                                                </span>
                                                <span
                                                    style={{
                                                        marginLeft: '8px',
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: day.isOpen ? 'rgba(81, 207, 102, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                                                        color: day.isOpen ? '#51cf66' : '#ff8787',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {day.isOpen ? 'Atende neste dia' : 'Folga / Não atende'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => handleSaveDay(day.dayOfWeek)}
                                            style={{
                                                padding: '0.45rem 1rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: activeThemeColor,
                                                color: '#fff',
                                                fontSize: '0.82rem',
                                                fontWeight: 600,
                                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                                opacity: isSaving ? 0.6 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                            }}
                                        >
                                            <span>💾</span>
                                            <span>{isSaving ? 'Salvando...' : 'Salvar Dia'}</span>
                                        </button>
                                    </div>

                                    {/* Linha 2: Controles de Horário (se aberto) */}
                                    {day.isOpen && (
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                                gap: '0.75rem',
                                                paddingTop: '0.5rem',
                                                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                            }}
                                        >
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b8491', marginBottom: '3px' }}>
                                                    Abertura
                                                </label>
                                                <input
                                                    type="time"
                                                    value={day.openTime}
                                                    onChange={(e) => handleDayChange(day.dayOfWeek, 'openTime', e.target.value)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', colorScheme: 'dark' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b8491', marginBottom: '3px' }}>
                                                    Fechamento
                                                </label>
                                                <input
                                                    type="time"
                                                    value={day.closeTime}
                                                    onChange={(e) => handleDayChange(day.dayOfWeek, 'closeTime', e.target.value)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', colorScheme: 'dark' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b8491', marginBottom: '3px' }}>
                                                    Início Almoço / Pausa
                                                </label>
                                                <input
                                                    type="time"
                                                    value={day.breakStart || ''}
                                                    onChange={(e) => handleDayChange(day.dayOfWeek, 'breakStart', e.target.value || null)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', colorScheme: 'dark' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b8491', marginBottom: '3px' }}>
                                                    Fim Almoço / Pausa
                                                </label>
                                                <input
                                                    type="time"
                                                    value={day.breakEnd || ''}
                                                    onChange={(e) => handleDayChange(day.dayOfWeek, 'breakEnd', e.target.value || null)}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', colorScheme: 'dark' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b8491', marginBottom: '3px' }}>
                                                    Intervalo de Grade
                                                </label>
                                                <select
                                                    value={day.slotIntervalMinutes}
                                                    onChange={(e) => handleDayChange(day.dayOfWeek, 'slotIntervalMinutes', Number(e.target.value))}
                                                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                                                >
                                                    <option value={15}>A cada 15 min</option>
                                                    <option value={30}>A cada 30 min (Padrão)</option>
                                                    <option value={45}>A cada 45 min</option>
                                                    <option value={60}>A cada 60 min</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SEÇÃO 2: BLOQUEIOS DE HORÁRIOS & FOLGAS */}
                <div
                    style={{
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(235, 100, 150, 0.15)',
                        borderRadius: '18px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                    }}
                >
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                            Bloqueios Específicos & Ausências
                        </h3>
                        <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#8b8491' }}>
                            Bloqueie datas completas ou janelas parciais para consultas, folgas ou compromissos.
                        </p>
                    </div>

                    {/* Formulário de Novo Bloqueio */}
                    <form
                        onSubmit={handleCreateBlock}
                        style={{
                            padding: '1.25rem',
                            borderRadius: '14px',
                            backgroundColor: '#201b25',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}
                    >
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f783ac' }}>
                            + Adicionar Novo Bloqueio
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#c3bcc9', marginBottom: '4px' }}>
                                    Data do Bloqueio *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={newBlockDate}
                                    onChange={(e) => setNewBlockDate(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem', colorScheme: 'dark' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#c3bcc9', marginBottom: '4px' }}>
                                    Especialista Afetada *
                                </label>
                                <select
                                    value={newBlockProId}
                                    onChange={(e) => setNewBlockProId(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem' }}
                                >
                                    <option value="luciana-bezerra">💇‍♀️ Apenas Luciana Bezerra</option>
                                    <option value="graziele-bezerra">🌸 Apenas Graziele Bezerra</option>
                                    <option value="ambas">✨ Ambas as Profissionais (Salão Completo)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#c3bcc9', marginBottom: '4px' }}>
                                    Motivo do Bloqueio *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Consulta médica, Feriado, Curso..."
                                    value={newBlockReason}
                                    onChange={(e) => setNewBlockReason(e.target.value)}
                                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.88rem' }}
                                />
                            </div>
                        </div>

                        {/* Switch Dia Inteiro vs Horário Parcial */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}>
                                <input
                                    type="checkbox"
                                    checked={newBlockIsFullDay}
                                    onChange={(e) => setNewBlockIsFullDay(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: '#d6336c' }}
                                />
                                Bloquear o Dia Todo
                            </label>

                            {!newBlockIsFullDay && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#8b8491' }}>Das:</span>
                                    <input
                                        type="time"
                                        value={newBlockStartTime}
                                        onChange={(e) => setNewBlockStartTime(e.target.value)}
                                        style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', colorScheme: 'dark' }}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: '#8b8491' }}>às:</span>
                                    <input
                                        type="time"
                                        value={newBlockEndTime}
                                        onChange={(e) => setNewBlockEndTime(e.target.value)}
                                        style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#17141b', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', colorScheme: 'dark' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmittingBlock}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#d6336c',
                                    color: '#fff',
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    cursor: isSubmittingBlock ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                }}
                            >
                                <span>🔒</span>
                                <span>{isSubmittingBlock ? 'Cadastrando Bloqueio...' : 'Registrar Bloqueio'}</span>
                            </button>
                        </div>
                    </form>

                    {/* Filtro e Lista de Bloqueios Cadastrados */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                                Bloqueios Ativos ({filteredBlockedSlots.length})
                            </h4>

                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                    type="button"
                                    onClick={() => setBlockFilter('all')}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: blockFilter === 'all' ? '#d6336c' : '#201b25',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Todos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBlockFilter('luciana-bezerra')}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: blockFilter === 'luciana-bezerra' ? '#d6336c' : '#201b25',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    💇‍♀️ Luciana
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBlockFilter('graziele-bezerra')}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: blockFilter === 'graziele-bezerra' ? '#e64980' : '#201b25',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    🌸 Graziele
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBlockFilter('ambas')}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: blockFilter === 'ambas' ? '#845ef7' : '#201b25',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✨ Ambas
                                </button>
                            </div>
                        </div>

                        {filteredBlockedSlots.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#8b8491', backgroundColor: '#201b25', borderRadius: '12px', fontSize: '0.88rem' }}>
                                Nenhum bloqueio registrado para este filtro.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                {filteredBlockedSlots.map((block) => {
                                    const isFullDay = !block.startTime || !block.endTime;
                                    const proBadge =
                                        block.professionalId === 'luciana-bezerra'
                                            ? '💇‍♀️ Luciana Bezerra'
                                            : block.professionalId === 'graziele-bezerra'
                                            ? '🌸 Graziele Bezerra'
                                            : '✨ Ambas as Profissionais';

                                    return (
                                        <div
                                            key={block.id}
                                            style={{
                                                padding: '0.85rem 1rem',
                                                borderRadius: '12px',
                                                backgroundColor: '#201b25',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                                                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                                                        📅 {block.date.split('-').reverse().join('/')}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(214, 51, 108, 0.25)', color: '#f783ac' }}>
                                                        {isFullDay ? 'Dia Todo' : `${block.startTime} às ${block.endTime}`}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#c3bcc9' }}>
                                                    {block.reason}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#8b8491', marginTop: '2px' }}>
                                                    {proBadge}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setDeletingBlockId(block.id)}
                                                style={{
                                                    padding: '6px 10px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: 'rgba(255, 107, 107, 0.15)',
                                                    color: '#ff8787',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de Exclusão de Bloqueio */}
            <DeleteConfirmModal
                isOpen={!!deletingBlockId}
                title="Excluir Bloqueio de Horário"
                itemName="este bloqueio de agenda"
                itemType="item"
                onClose={() => setDeletingBlockId(null)}
                onConfirm={handleDeleteBlock}
            />
        </div>
    );
}
