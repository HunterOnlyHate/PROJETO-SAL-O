'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardKpiCards, DashboardKpiData } from '@/components/admin/dashboard/DashboardKpiCards';
import { RevenueChart, ChartDataPoint } from '@/components/admin/dashboard/RevenueChart';
import { ProfessionalComparison, ProfessionalStats } from '@/components/admin/dashboard/ProfessionalComparison';
import { TopServicesChart, ServiceMetric, CategoryMetric } from '@/components/admin/dashboard/TopServicesChart';
import { PeakHoursChart, HourMetric, DayMetric } from '@/components/admin/dashboard/PeakHoursChart';
import { TopClientsTable, ClientMetric } from '@/components/admin/dashboard/TopClientsTable';
import { InventoryAlerts, ProductInventoryItem } from '@/components/admin/dashboard/InventoryAlerts';
import { updateAppointmentStatusAction } from '@/actions/adminAppointmentActions';
import { getBrazilTodayDateString } from '@/lib/scheduleEngine';

export interface RawAppointment {
    id: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string | null;
    notes?: string | null;
    date: string; // "YYYY-MM-DD"
    startTime: string; // "10:00"
    endTime: string;
    durationMinutes: number;
    professionalId: string;
    professionalName: string;
    serviceIds: string;
    serviceNames: string;
    totalPrice: number;
    status: string; // "PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"
    whatsappSent: boolean;
    createdAt: string;
}

export interface RawProduct {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    active: boolean;
}

export interface RawService {
    id: string;
    name: string;
    category: string;
    professionalId: string;
    professionalName: string;
    price: number;
    durationMinutes: number;
    active: boolean;
}

interface AdminDashboardClientProps {
    initialAppointments: RawAppointment[];
    products: RawProduct[];
    services: RawService[];
    adminName: string;
}

type PeriodFilter = 'today' | '7days' | 'month' | '30days' | 'year' | 'all' | 'custom';
type TabType = 'overview' | 'services' | 'team' | 'clients' | 'inventory';

export function AdminDashboardClient({
    initialAppointments,
    products,
    services,
    adminName,
}: AdminDashboardClientProps) {
    const [appointments, setAppointments] = useState<RawAppointment[]>(initialAppointments);
    const [period, setPeriod] = useState<PeriodFilter>('month');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [selectedPro, setSelectedPro] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [monthlyGoal, setMonthlyGoal] = useState<number>(15000);
    const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
    const [tempGoal, setTempGoal] = useState<string>('15000');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    // Carregar meta do localStorage se existir
    useEffect(() => {
        try {
            const savedGoal = localStorage.getItem('glamour_monthly_goal');
            if (savedGoal) {
                const parsed = Number(savedGoal);
                if (!isNaN(parsed) && parsed > 0) {
                    setMonthlyGoal(parsed);
                    setTempGoal(parsed.toString());
                }
            }
        } catch {}
    }, []);

    const handleSaveGoal = () => {
        const val = Number(tempGoal);
        if (!isNaN(val) && val > 0) {
            setMonthlyGoal(val);
            try {
                localStorage.setItem('glamour_monthly_goal', val.toString());
            } catch {}
        }
        setIsEditingGoal(false);
    };

    const todayStr = getBrazilTodayDateString(); // "YYYY-MM-DD"

    // -------------------------------------------------------------
    // Filtragem de Agendamentos por Período e Profissional
    // -------------------------------------------------------------
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            // Filtro por profissional
            if (selectedPro !== 'all') {
                if (apt.professionalId !== selectedPro && apt.professionalId !== 'ambas') {
                    return false;
                }
            }

            // Filtro por período
            const aptDate = apt.date; // "YYYY-MM-DD"

            if (period === 'today') {
                return aptDate === todayStr;
            }

            if (period === '7days') {
                const past7 = new Date();
                past7.setDate(past7.getDate() - 7);
                const past7Str = past7.toISOString().split('T')[0];
                return aptDate >= past7Str;
            }

            if (period === 'month') {
                const currentMonthPrefix = todayStr.substring(0, 7); // "YYYY-MM"
                return aptDate.startsWith(currentMonthPrefix);
            }

            if (period === '30days') {
                const past30 = new Date();
                past30.setDate(past30.getDate() - 30);
                const past30Str = past30.toISOString().split('T')[0];
                return aptDate >= past30Str;
            }

            if (period === 'year') {
                const currentYearPrefix = todayStr.substring(0, 4); // "YYYY"
                return aptDate.startsWith(currentYearPrefix);
            }

            if (period === 'custom') {
                if (customStartDate && aptDate < customStartDate) return false;
                if (customEndDate && aptDate > customEndDate) return false;
                return true;
            }

            return true; // 'all'
        });
    }, [appointments, period, selectedPro, todayStr, customStartDate, customEndDate]);

    // Rótulo amigável do período selecionado
    const periodLabel = useMemo(() => {
        switch (period) {
            case 'today':
                return 'Hoje';
            case '7days':
                return 'Últimos 7 dias';
            case 'month':
                return 'Este Mês';
            case '30days':
                return 'Últimos 30 dias';
            case 'year':
                return 'Este Ano';
            case 'custom':
                return 'Período Personalizado';
            default:
                return 'Todo o Histórico';
        }
    }, [period]);

    // -------------------------------------------------------------
    // Cálculos de KPIs Globais (Regra de Negócio: Concluído = Ganho, Confirmado/Pendente = Por Vir, Cancelado = Rejeitado)
    // -------------------------------------------------------------
    const kpiData: DashboardKpiData = useMemo(() => {
        let realizedRevenue = 0;   // CONCLUIDO
        let confirmedRevenue = 0;  // CONFIRMADO
        let pendingRevenue = 0;    // PENDENTE
        let cancelledRevenue = 0;  // CANCELADO
        
        let completedCount = 0;
        let confirmedCount = 0;
        let pendingCount = 0;
        let cancelledCount = 0;
        
        let realizedDuration = 0;
        let totalDuration = 0;

        const clientsSet = new Set<string>();
        const clientVisitMap = new Map<string, number>();

        filteredAppointments.forEach((apt) => {
            const price = apt.totalPrice || 0;
            const phone = apt.clientPhone || apt.clientName;
            const duration = apt.durationMinutes || 30;

            if (phone) {
                clientsSet.add(phone);
                clientVisitMap.set(phone, (clientVisitMap.get(phone) || 0) + 1);
            }

            if (apt.status === 'CONCLUIDO') {
                realizedRevenue += price;
                completedCount++;
                realizedDuration += duration;
                totalDuration += duration;
            } else if (apt.status === 'CONFIRMADO') {
                confirmedRevenue += price;
                confirmedCount++;
                totalDuration += duration;
            } else if (apt.status === 'PENDENTE') {
                pendingRevenue += price;
                pendingCount++;
                totalDuration += duration;
            } else if (apt.status === 'CANCELADO') {
                cancelledRevenue += price;
                cancelledCount++;
            }
        });

        // Contar clientes recorrentes (mais de 1 agendamento)
        let recurringCount = 0;
        clientVisitMap.forEach((count) => {
            if (count > 1) recurringCount++;
        });

        const incomingRevenue = confirmedRevenue + pendingRevenue;
        const incomingCount = confirmedCount + pendingCount;
        const totalPotentialRevenue = realizedRevenue + incomingRevenue;

        const averageTicketRealized = completedCount > 0 ? realizedRevenue / completedCount : 0;
        const averageTicketIncoming = incomingCount > 0 ? incomingRevenue / incomingCount : 0;

        const stockTotalValue = products.reduce((acc, p) => acc + p.price * (p.stock || 0), 0);
        const lowStockCount = products.filter((p) => (p.stock || 0) < 5).length;

        return {
            realizedRevenue,
            incomingRevenue,
            pendingRevenue,
            confirmedRevenue,
            cancelledRevenue,
            totalPotentialRevenue,
            completedCount,
            confirmedCount,
            pendingCount,
            cancelledCount,
            totalAppointments: filteredAppointments.length,
            averageTicketRealized,
            averageTicketIncoming,
            realizedDurationMinutes: realizedDuration,
            totalDurationMinutes: totalDuration,
            uniqueClientsCount: clientsSet.size,
            recurringClientsCount: recurringCount,
            stockTotalValue,
            lowStockCount,
            monthlyGoal,
        };
    }, [filteredAppointments, products, monthlyGoal]);

    // -------------------------------------------------------------
    // Gráfico de Evolução de Faturamento no Tempo
    // -------------------------------------------------------------
    const chartData: ChartDataPoint[] = useMemo(() => {
        const dateMap = new Map<
            string,
            {
                realizedRevenue: number;
                incomingRevenue: number;
                cancelledRevenue: number;
                completedCount: number;
                incomingCount: number;
                cancelledCount: number;
                appointmentsCount: number;
            }
        >();

        // Pre-popular se for 7 dias
        if (period === '7days') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dStr = d.toISOString().split('T')[0];
                dateMap.set(dStr, {
                    realizedRevenue: 0,
                    incomingRevenue: 0,
                    cancelledRevenue: 0,
                    completedCount: 0,
                    incomingCount: 0,
                    cancelledCount: 0,
                    appointmentsCount: 0,
                });
            }
        }

        filteredAppointments.forEach((apt) => {
            const dateKey = apt.date;
            const current = dateMap.get(dateKey) || {
                realizedRevenue: 0,
                incomingRevenue: 0,
                cancelledRevenue: 0,
                completedCount: 0,
                incomingCount: 0,
                cancelledCount: 0,
                appointmentsCount: 0,
            };

            const price = apt.totalPrice || 0;

            if (apt.status === 'CONCLUIDO') {
                current.realizedRevenue += price;
                current.completedCount += 1;
            } else if (apt.status === 'CONFIRMADO' || apt.status === 'PENDENTE') {
                current.incomingRevenue += price;
                current.incomingCount += 1;
            } else if (apt.status === 'CANCELADO') {
                current.cancelledRevenue += price;
                current.cancelledCount += 1;
            }

            current.appointmentsCount += 1;
            dateMap.set(dateKey, current);
        });

        const sortedKeys = Array.from(dateMap.keys()).sort();

        return sortedKeys.map((key) => {
            const item = dateMap.get(key)!;
            const parts = key.split('-');
            const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : key;
            const fullDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : key;

            return {
                label,
                fullDate,
                realizedRevenue: item.realizedRevenue,
                incomingRevenue: item.incomingRevenue,
                cancelledRevenue: item.cancelledRevenue,
                totalRevenue: item.realizedRevenue + item.incomingRevenue,
                completedCount: item.completedCount,
                incomingCount: item.incomingCount,
                cancelledCount: item.cancelledCount,
                appointmentsCount: item.appointmentsCount,
            };
        });
    }, [filteredAppointments, period]);

    // -------------------------------------------------------------
    // Performance e Comparativo por Especialista
    // -------------------------------------------------------------
    const { lucianaStats, grazieleStats } = useMemo(() => {
        const buildProStats = (proId: string, name: string, role: string): ProfessionalStats => {
            const proAppointments = filteredAppointments.filter(
                (a) => a.professionalId === proId || (a.professionalId === 'ambas' && proId === 'luciana-bezerra')
            );

            let realizedRevenue = 0;
            let incomingRevenue = 0;
            let cancelledRevenue = 0;
            let completedCount = 0;
            let incomingCount = 0;
            let cancelledCount = 0;
            let durationMinutes = 0;
            const serviceCounts = new Map<string, number>();

            proAppointments.forEach((apt) => {
                const price = apt.totalPrice || 0;
                const duration = apt.durationMinutes || 30;

                if (apt.status === 'CONCLUIDO') {
                    realizedRevenue += price;
                    completedCount++;
                    durationMinutes += duration;
                } else if (apt.status === 'CONFIRMADO' || apt.status === 'PENDENTE') {
                    incomingRevenue += price;
                    incomingCount++;
                } else if (apt.status === 'CANCELADO') {
                    cancelledRevenue += price;
                    cancelledCount++;
                }

                // Contabilizar serviços
                if (apt.serviceNames) {
                    apt.serviceNames.split(',').forEach((s) => {
                        const trimmed = s.trim();
                        if (trimmed) {
                            serviceCounts.set(trimmed, (serviceCounts.get(trimmed) || 0) + 1);
                        }
                    });
                }
            });

            const topServices = Array.from(serviceCounts.entries())
                .map(([srvName, count]) => ({ name: srvName, count }))
                .sort((a, b) => b.count - a.count);

            const averageTicketRealized = completedCount > 0 ? realizedRevenue / completedCount : 0;

            return {
                id: proId,
                name,
                role,
                realizedRevenue,
                incomingRevenue,
                cancelledRevenue,
                completedCount,
                incomingCount,
                cancelledCount,
                appointmentsCount: proAppointments.length,
                durationMinutes,
                averageTicketRealized,
                topServices,
            };
        };

        return {
            lucianaStats: buildProStats(
                'luciana-bezerra',
                'Luciana Bezerra',
                'Master Hair Stylist & Visagista'
            ),
            grazieleStats: buildProStats(
                'graziele-bezerra',
                'Graziele Bezerra',
                'Designer de Sobrancelhas, Depilação & WePink'
            ),
        };
    }, [filteredAppointments]);

    // -------------------------------------------------------------
    // Ranking de Procedimentos & Categorias
    // -------------------------------------------------------------
    const { serviceMetrics, categoryMetrics } = useMemo(() => {
        const srvMap = new Map<string, ServiceMetric>();
        const catMap = new Map<
            string,
            { completedCount: number; incomingCount: number; totalCount: number; realizedRevenue: number; incomingRevenue: number }
        >();

        // Pre-popular serviços cadastrados
        services.forEach((s) => {
            srvMap.set(s.id, {
                id: s.id,
                name: s.name,
                category: s.category,
                professionalName: s.professionalName,
                realizedRevenue: 0,
                incomingRevenue: 0,
                completedCount: 0,
                incomingCount: 0,
                totalCount: 0,
                price: s.price,
            });
        });

        filteredAppointments.forEach((apt) => {
            const isCompleted = apt.status === 'CONCLUIDO';
            const isIncoming = apt.status === 'CONFIRMADO' || apt.status === 'PENDENTE';
            let srvIds: string[] = [];

            try {
                if (apt.serviceIds) {
                    srvIds = JSON.parse(apt.serviceIds);
                }
            } catch {
                if (apt.serviceIds) srvIds = [apt.serviceIds];
            }

            if (srvIds.length > 0) {
                srvIds.forEach((sId) => {
                    const existing = srvMap.get(sId);
                    if (existing) {
                        existing.totalCount += 1;
                        const sharePrice = existing.price || (apt.totalPrice / srvIds.length);

                        if (isCompleted) {
                            existing.completedCount += 1;
                            existing.realizedRevenue += sharePrice;
                        } else if (isIncoming) {
                            existing.incomingCount += 1;
                            existing.incomingRevenue += sharePrice;
                        }
                    }
                });
            } else if (apt.serviceNames) {
                const found = services.find((s) => apt.serviceNames.includes(s.name));
                if (found) {
                    const existing = srvMap.get(found.id);
                    if (existing) {
                        existing.totalCount += 1;
                        if (isCompleted) {
                            existing.completedCount += 1;
                            existing.realizedRevenue += apt.totalPrice || found.price;
                        } else if (isIncoming) {
                            existing.incomingCount += 1;
                            existing.incomingRevenue += apt.totalPrice || found.price;
                        }
                    }
                }
            }
        });

        const serviceList = Array.from(srvMap.values()).filter((s) => s.totalCount > 0 || s.realizedRevenue > 0);

        // Agrupar por categorias
        serviceList.forEach((s) => {
            const cat = s.category || 'outros';
            const cur = catMap.get(cat) || {
                completedCount: 0,
                incomingCount: 0,
                totalCount: 0,
                realizedRevenue: 0,
                incomingRevenue: 0,
            };

            catMap.set(cat, {
                completedCount: cur.completedCount + s.completedCount,
                incomingCount: cur.incomingCount + s.incomingCount,
                totalCount: cur.totalCount + s.totalCount,
                realizedRevenue: cur.realizedRevenue + s.realizedRevenue,
                incomingRevenue: cur.incomingRevenue + s.incomingRevenue,
            });
        });

        const categoryNames: Record<string, string> = {
            alinhamento: 'Alisamentos & Alinhamento',
            cabelo: 'Cabelos & Escovas',
            sobrancelhas: 'Designer de Sobrancelhas',
            depilacao: 'Depilação Corporal',
            unhas: 'Manicure & Pedicure',
        };

        const totalCatRealized = Array.from(catMap.values()).reduce((acc, c) => acc + c.realizedRevenue, 0) || 1;

        const categoryList: CategoryMetric[] = Array.from(catMap.entries()).map(([cat, val]) => ({
            category: cat,
            categoryName: categoryNames[cat] || cat,
            completedCount: val.completedCount,
            incomingCount: val.incomingCount,
            totalCount: val.totalCount,
            realizedRevenue: val.realizedRevenue,
            incomingRevenue: val.incomingRevenue,
            totalRevenue: val.realizedRevenue + val.incomingRevenue,
            percentage: Math.round((val.realizedRevenue / totalCatRealized) * 100),
        }));

        return {
            serviceMetrics: serviceList,
            categoryMetrics: categoryList.sort((a, b) => b.realizedRevenue - a.realizedRevenue),
        };
    }, [filteredAppointments, services]);

    // -------------------------------------------------------------
    // Horários de Pico & Dias da Semana Mais Movimentados
    // -------------------------------------------------------------
    const { hoursData, daysData } = useMemo(() => {
        const defaultHours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
        const hMap = new Map<string, { count: number; revenue: number }>();
        defaultHours.forEach((h) => hMap.set(h, { count: 0, revenue: 0 }));

        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const dMap = new Map<number, { count: number; revenue: number }>();
        for (let i = 1; i <= 6; i++) {
            dMap.set(i, { count: 0, revenue: 0 }); // Seg a Sáb
        }

        filteredAppointments.forEach((apt) => {
            const isCompleted = apt.status === 'CONCLUIDO';
            const price = isCompleted ? apt.totalPrice || 0 : 0;

            if (apt.startTime) {
                const hourPrefix = `${apt.startTime.split(':')[0]}:00`;
                const curH = hMap.get(hourPrefix) || { count: 0, revenue: 0 };
                hMap.set(hourPrefix, {
                    count: curH.count + 1,
                    revenue: curH.revenue + price,
                });
            }

            if (apt.date) {
                const [y, m, d] = apt.date.split('-').map(Number);
                const dateObj = new Date(y, m - 1, d, 12, 0, 0);
                const dayOfWeek = dateObj.getDay();
                const curD = dMap.get(dayOfWeek) || { count: 0, revenue: 0 };
                dMap.set(dayOfWeek, {
                    count: curD.count + 1,
                    revenue: curD.revenue + price,
                });
            }
        });

        const hoursList: HourMetric[] = Array.from(hMap.entries()).map(([hour, val]) => ({
            hour,
            count: val.count,
            revenue: val.revenue,
        }));

        const daysList: DayMetric[] = Array.from(dMap.entries()).map(([dayIndex, val]) => ({
            dayIndex,
            dayName: dayNames[dayIndex],
            count: val.count,
            revenue: val.revenue,
        }));

        return {
            hoursData: hoursList,
            daysData: daysList,
        };
    }, [filteredAppointments]);

    // -------------------------------------------------------------
    // Inteligência de Clientes VIP
    // -------------------------------------------------------------
    const topClients: ClientMetric[] = useMemo(() => {
        const cMap = new Map<string, ClientMetric>();

        filteredAppointments.forEach((apt) => {
            const phone = apt.clientPhone || apt.clientName;
            const isCompleted = apt.status === 'CONCLUIDO';
            const isIncoming = apt.status === 'CONFIRMADO' || apt.status === 'PENDENTE';
            const price = apt.totalPrice || 0;
            const existing = cMap.get(phone);

            if (!existing) {
                cMap.set(phone, {
                    name: apt.clientName,
                    phone: apt.clientPhone,
                    email: apt.clientEmail,
                    completedVisits: isCompleted ? 1 : 0,
                    incomingVisits: isIncoming ? 1 : 0,
                    totalAppointments: 1,
                    realizedSpent: isCompleted ? price : 0,
                    incomingSpent: isIncoming ? price : 0,
                    lastVisitDate: apt.date,
                    favoriteServices: [apt.serviceNames].filter(Boolean),
                });
            } else {
                existing.totalAppointments += 1;
                if (isCompleted) {
                    existing.completedVisits += 1;
                    existing.realizedSpent += price;
                } else if (isIncoming) {
                    existing.incomingVisits += 1;
                    existing.incomingSpent += price;
                }

                if (apt.date > existing.lastVisitDate) existing.lastVisitDate = apt.date;
                if (apt.serviceNames && !existing.favoriteServices.includes(apt.serviceNames)) {
                    existing.favoriteServices.push(apt.serviceNames);
                }
            }
        });

        return Array.from(cMap.values()).sort((a, b) => b.realizedSpent - a.realizedSpent);
    }, [filteredAppointments]);

    // -------------------------------------------------------------
    // Exportar CSV
    // -------------------------------------------------------------
    const handleExportCsv = () => {
        const headers = ['Data', 'Horario', 'Cliente', 'Telefone', 'Especialista', 'Procedimentos', 'Valor_RS', 'Status_Classificacao'];
        const rows = filteredAppointments.map((apt) => {
            const classification =
                apt.status === 'CONCLUIDO'
                    ? 'REALIZADO_GANHO'
                    : apt.status === 'CONFIRMADO' || apt.status === 'PENDENTE'
                    ? 'POR_VIR'
                    : 'REJEITADO_CANCELADO';

            return [
                apt.date,
                apt.startTime,
                `"${apt.clientName.replace(/"/g, '""')}"`,
                `"${apt.clientPhone}"`,
                `"${apt.professionalName}"`,
                `"${(apt.serviceNames || '').replace(/"/g, '""')}"`,
                (apt.totalPrice || 0).toFixed(2),
                classification,
            ];
        });

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `relatorio_financeiro_glamour_${period}_${todayStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const pendingList = appointments.filter((a) => a.status === 'PENDENTE');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <AdminHeader
                title="Dashboard Executivo & Inteligência de Negócio"
                subtitle={`Painel Estratégico do Glamour Studio • Logado como ${adminName}`}
            />

            <main className="admin-content-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Barra de Filtros de Período e Especialista */}
                <div
                    style={{
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(235, 100, 150, 0.2)',
                        borderRadius: '18px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Botões Rápidos de Período */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: '#a89fad', fontWeight: 600, marginRight: '0.2rem' }}>
                            📅 Período:
                        </span>
                        {[
                            { id: 'today', label: 'Hoje' },
                            { id: '7days', label: '7 Dias' },
                            { id: 'month', label: 'Este Mês' },
                            { id: '30days', label: '30 Dias' },
                            { id: 'year', label: 'Este Ano' },
                            { id: 'all', label: 'Todo Histórico' },
                            { id: 'custom', label: 'Personalizado' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                type="button"
                                onClick={() => setPeriod(btn.id as PeriodFilter)}
                                style={{
                                    padding: '0.45rem 0.85rem',
                                    borderRadius: '10px',
                                    border: period === btn.id ? '1px solid #f783ac' : '1px solid rgba(255, 255, 255, 0.08)',
                                    backgroundColor: period === btn.id ? 'rgba(214, 51, 108, 0.3)' : '#201b25',
                                    color: period === btn.id ? '#fff' : '#c3bcc9',
                                    fontSize: '0.8rem',
                                    fontWeight: period === btn.id ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {/* Filtro por Profissional & Ações */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <select
                            value={selectedPro}
                            onChange={(e) => setSelectedPro(e.target.value)}
                            style={{
                                backgroundColor: '#201b25',
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '10px',
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.8rem',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="all">👑 Todas as Especialistas</option>
                            <option value="luciana-bezerra">💇‍♀️ Luciana Bezerra</option>
                            <option value="graziele-bezerra">🌸 Graziele Bezerra</option>
                        </select>

                        {/* Botão de Exportar CSV */}
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(81, 207, 102, 0.15)',
                                border: '1px solid rgba(81, 207, 102, 0.3)',
                                color: '#51cf66',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            title="Exportar planilha financeira em CSV"
                        >
                            <span>📥</span> Exportar CSV
                        </button>

                        {/* Botão de Configurar Meta */}
                        <button
                            type="button"
                            onClick={() => setIsEditingGoal(!isEditingGoal)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(250, 176, 5, 0.15)',
                                border: '1px solid rgba(250, 176, 5, 0.3)',
                                color: '#fab005',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            title="Configurar Meta Mensal"
                        >
                            <span>🎯</span> Meta
                        </button>
                    </div>
                </div>

                {/* Período Personalizado De / Até */}
                {period === 'custom' && (
                    <div
                        style={{
                            backgroundColor: '#201a24',
                            border: '1px solid rgba(214, 51, 108, 0.3)',
                            borderRadius: '14px',
                            padding: '0.85rem 1.15rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f783ac' }}>
                            📅 Selecione o intervalo:
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#a89fad' }}>De:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                style={{
                                    backgroundColor: '#161218',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.35rem 0.65rem',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#a89fad' }}>Até:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                style={{
                                    backgroundColor: '#161218',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '8px',
                                    padding: '0.35rem 0.65rem',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Modal Rápido de Edição de Meta */}
                {isEditingGoal && (
                    <div
                        style={{
                            backgroundColor: '#201a24',
                            border: '1px solid #fab005',
                            borderRadius: '14px',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎯</span>
                            <div>
                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                                    Definir Meta Mensal de Faturamento Realizado
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#a89fad' }}>
                                    Acompanhe o faturamento ganho em caixa vs os valores por vir no mês.
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#fff', fontWeight: 700 }}>R$</span>
                            <input
                                type="number"
                                value={tempGoal}
                                onChange={(e) => setTempGoal(e.target.value)}
                                style={{
                                    backgroundColor: '#161218',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '8px',
                                    padding: '0.4rem 0.75rem',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    width: '130px',
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleSaveGoal}
                                style={{
                                    backgroundColor: '#51cf66',
                                    color: '#161318',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.45rem 0.85rem',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Salvar Meta
                            </button>
                        </div>
                    </div>
                )}

                {/* Banner Informativo de Solicitações Pendentes */}
                {pendingList.length > 0 && (
                    <div
                        style={{
                            backgroundColor: 'rgba(250, 176, 5, 0.12)',
                            border: '1px solid rgba(250, 176, 5, 0.35)',
                            borderRadius: '14px',
                            padding: '0.9rem 1.15rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>⏳</span>
                            <div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffd43b' }}>
                                    {pendingList.length} solicitação(ões) pendente(s) por confirmar (R$ {kpiData.pendingRevenue.toFixed(2).replace('.', ',')})
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#c3bcc9' }}>
                                    Valores que estão por vir assim que forem confirmados e atendidos.
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/admin/agendamentos"
                            style={{
                                backgroundColor: '#fab005',
                                color: '#161318',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            Ver Agendamentos Pendentes →
                        </Link>
                    </div>
                )}

                {/* Abas de Navegação Interna do Dashboard */}
                <div
                    style={{
                        display: 'flex',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        gap: '0.5rem',
                        overflowX: 'auto',
                    }}
                >
                    {[
                        { id: 'overview', label: '📊 Visão Geral Executiva', icon: '📊' },
                        { id: 'services', label: '💇‍♀️ Procedimentos & Receita', icon: '💇‍♀️' },
                        { id: 'team', label: '👑 Especialistas & Horários', icon: '👑' },
                        { id: 'clients', label: '👥 Clientes VIP & Retenção', icon: '👥' },
                        { id: 'inventory', label: '🛍️ Estoque WePink', icon: '🛍️' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as TabType)}
                            style={{
                                padding: '0.65rem 1rem',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid #d6336c' : '3px solid transparent',
                                backgroundColor: activeTab === tab.id ? 'rgba(214, 51, 108, 0.12)' : 'transparent',
                                color: activeTab === tab.id ? '#fff' : '#8b8491',
                                fontSize: '0.84rem',
                                fontWeight: activeTab === tab.id ? 700 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                borderRadius: '8px 8px 0 0',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTEÚDO DA ABA 1: VISÃO GERAL EXECUTIVA */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Cards de KPIs com regra: Concluído = Ganho, Confirmado/Pendente = Por Vir, Cancelado = Rejeitado */}
                        <DashboardKpiCards data={kpiData} periodLabel={periodLabel} />

                        {/* Gráficos em Grid 2 Colunas */}
                        <div className="admin-two-cols">
                            <RevenueChart data={chartData} periodTitle={periodLabel} />
                            <ProfessionalComparison
                                luciana={lucianaStats}
                                graziele={grazieleStats}
                                totalRealizedRevenue={kpiData.realizedRevenue}
                            />
                        </div>

                        {/* Top Serviços & Horários de Pico */}
                        <div className="admin-two-cols">
                            <TopServicesChart
                                services={serviceMetrics}
                                categories={categoryMetrics}
                                totalRealizedRevenue={kpiData.realizedRevenue}
                            />
                            <PeakHoursChart hoursData={hoursData} daysData={daysData} />
                        </div>
                    </div>
                )}

                {/* CONTEÚDO DA ABA 2: PROCEDIMENTOS & RECEITA */}
                {activeTab === 'services' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <TopServicesChart
                            services={serviceMetrics}
                            categories={categoryMetrics}
                            totalRealizedRevenue={kpiData.realizedRevenue}
                        />
                        <RevenueChart data={chartData} periodTitle={periodLabel} />
                    </div>
                )}

                {/* CONTEÚDO DA ABA 3: ESPECIALISTAS & HORÁRIOS */}
                {activeTab === 'team' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <ProfessionalComparison
                            luciana={lucianaStats}
                            graziele={grazieleStats}
                            totalRealizedRevenue={kpiData.realizedRevenue}
                        />
                        <PeakHoursChart hoursData={hoursData} daysData={daysData} />
                    </div>
                )}

                {/* CONTEÚDO DA ABA 4: CLIENTES VIP & CRM */}
                {activeTab === 'clients' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <TopClientsTable
                            clients={topClients}
                            totalClientsCount={kpiData.uniqueClientsCount}
                            recurringClientsCount={kpiData.recurringClientsCount}
                        />
                    </div>
                )}

                {/* CONTEÚDO DA ABA 5: ESTOQUE WEPINK */}
                {activeTab === 'inventory' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <InventoryAlerts products={products} />
                    </div>
                )}
            </main>
        </div>
    );
}
