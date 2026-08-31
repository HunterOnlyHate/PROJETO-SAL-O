'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { addMinutesToTime } from '@/lib/scheduleEngine';

function safeRevalidate(path: string) {
    try {
        revalidatePath(path);
    } catch {
        // Ignorar erro se fora do Next.js request context
    }
}

export interface AppointmentFilterParams {
    date?: string; // "YYYY-MM-DD"
    status?: string; // "TODOS", "PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"
    professionalId?: string; // "all", "luciana-bezerra", "graziele-bezerra", "ambas"
    search?: string;
}

export interface AdminCreateAppointmentInput {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    notes?: string;
    date: string;
    startTime: string;
    durationMinutes: number;
    professionalId: string;
    professionalName?: string;
    serviceIds?: string[];
    serviceNames: string;
    totalPrice: number;
    status?: string;
}

export async function getAdminAppointmentsAction(filters?: AppointmentFilterParams) {
    const session = await getAdminSession();
    if (!session) {
        throw new Error('Acesso não autorizado.');
    }

    try {
        const whereClause: any = {};

        if (filters?.date && filters.date !== 'all') {
            whereClause.date = filters.date;
        }

        if (filters?.status && filters.status !== 'TODOS') {
            whereClause.status = filters.status;
        }

        if (filters?.professionalId && filters.professionalId !== 'all') {
            whereClause.professionalId = filters.professionalId;
        }

        if (filters?.search && filters.search.trim()) {
            const term = filters.search.trim();
            whereClause.OR = [
                { clientName: { contains: term, mode: 'insensitive' } },
                { clientPhone: { contains: term, mode: 'insensitive' } },
                { serviceNames: { contains: term, mode: 'insensitive' } },
            ];
        }

        const appointments = await prisma.appointment.findMany({
            where: whereClause,
            orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        });

        return { success: true, appointments };
    } catch (error) {
        console.error('Erro ao buscar agendamentos admin:', error);
        return { success: false, appointments: [], message: 'Erro ao buscar agendamentos.' };
    }
}

export async function updateAppointmentStatusAction(id: string, status: string) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        const updated = await prisma.appointment.update({
            where: { id },
            data: { status },
        });

        safeRevalidate('/admin');
        safeRevalidate('/admin/agendamentos');
        safeRevalidate('/agendar');

        return { success: true, appointment: updated };
    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error);
        return { success: false, message: 'Erro ao atualizar status.' };
    }
}

export async function createAdminAppointmentAction(input: AdminCreateAppointmentInput) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        const {
            clientName,
            clientPhone,
            clientEmail,
            notes,
            date,
            startTime,
            durationMinutes = 30,
            professionalId,
            serviceIds = [],
            serviceNames,
            totalPrice = 0,
            status = 'CONFIRMADO',
        } = input;

        if (!clientName || !clientPhone || !date || !startTime) {
            return { success: false, message: 'Preencha todos os campos obrigatórios (nome, telefone, data e horário).' };
        }

        const endTime = addMinutesToTime(startTime, durationMinutes);
        const proName =
            input.professionalName ||
            (professionalId === 'luciana-bezerra'
                ? 'Luciana Bezerra'
                : professionalId === 'graziele-bezerra'
                ? 'Graziele Bezerra'
                : 'Luciana & Graziele');

        const appointment = await prisma.appointment.create({
            data: {
                clientName: clientName.trim(),
                clientPhone: clientPhone.trim(),
                clientEmail: clientEmail?.trim() || null,
                notes: notes?.trim() || null,
                date,
                startTime,
                endTime,
                durationMinutes,
                professionalId,
                professionalName: proName,
                serviceIds: JSON.stringify(serviceIds),
                serviceNames: serviceNames.trim(),
                totalPrice: Number(totalPrice),
                status,
                whatsappSent: false,
            },
        });

        safeRevalidate('/admin');
        safeRevalidate('/admin/agendamentos');
        safeRevalidate('/agendar');

        return { success: true, appointment };
    } catch (error) {
        console.error('Erro ao criar agendamento manual:', error);
        return { success: false, message: 'Erro ao criar agendamento.' };
    }
}

export async function updateAdminAppointmentAction(id: string, input: Partial<AdminCreateAppointmentInput>) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        let endTime = undefined;
        if (input.startTime && input.durationMinutes) {
            endTime = addMinutesToTime(input.startTime, input.durationMinutes);
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                ...(input.clientName && { clientName: input.clientName.trim() }),
                ...(input.clientPhone && { clientPhone: input.clientPhone.trim() }),
                ...(input.clientEmail !== undefined && { clientEmail: input.clientEmail?.trim() || null }),
                ...(input.notes !== undefined && { notes: input.notes?.trim() || null }),
                ...(input.date && { date: input.date }),
                ...(input.startTime && { startTime: input.startTime }),
                ...(endTime && { endTime }),
                ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
                ...(input.professionalId && { professionalId: input.professionalId }),
                ...(input.professionalName && { professionalName: input.professionalName }),
                ...(input.serviceNames && { serviceNames: input.serviceNames.trim() }),
                ...(input.totalPrice !== undefined && { totalPrice: Number(input.totalPrice) }),
                ...(input.status && { status: input.status }),
            },
        });

        safeRevalidate('/admin');
        safeRevalidate('/admin/agendamentos');
        safeRevalidate('/agendar');

        return { success: true, appointment: updated };
    } catch (error) {
        console.error('Erro ao editar agendamento:', error);
        return { success: false, message: 'Erro ao atualizar dados do agendamento.' };
    }
}

export async function deleteAdminAppointmentAction(id: string) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        await prisma.appointment.delete({
            where: { id },
        });

        safeRevalidate('/admin');
        safeRevalidate('/admin/agendamentos');
        safeRevalidate('/agendar');

        return { success: true };
    } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        return { success: false, message: 'Erro ao excluir agendamento.' };
    }
}

// ----------------- CONFIGURAÇÕES DE HORÁRIOS & BLOQUEIOS -----------------

export async function getAdminScheduleSettingsAction() {
    const session = await getAdminSession();
    if (!session) {
        throw new Error('Acesso não autorizado.');
    }

    try {
        const settings = await prisma.scheduleSetting.findMany({
            orderBy: { dayOfWeek: 'asc' },
        });

        return { success: true, settings };
    } catch (error) {
        console.error('Erro ao buscar configurações de horário:', error);
        return { success: false, settings: [], message: 'Erro ao buscar horários.' };
    }
}

export async function saveAdminScheduleSettingAction(data: {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    breakStart?: string | null;
    breakEnd?: string | null;
    slotIntervalMinutes: number;
    professionalId?: string | null;
}) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        const proId = data.professionalId || null;
        const existing = await prisma.scheduleSetting.findFirst({
            where: {
                dayOfWeek: data.dayOfWeek,
                professionalId: proId,
            },
        });

        let saved;
        if (existing) {
            saved = await prisma.scheduleSetting.update({
                where: { id: existing.id },
                data: {
                    isOpen: data.isOpen,
                    openTime: data.openTime,
                    closeTime: data.closeTime,
                    breakStart: data.breakStart || null,
                    breakEnd: data.breakEnd || null,
                    slotIntervalMinutes: data.slotIntervalMinutes || 30,
                },
            });
        } else {
            saved = await prisma.scheduleSetting.create({
                data: {
                    dayOfWeek: data.dayOfWeek,
                    isOpen: data.isOpen,
                    openTime: data.openTime,
                    closeTime: data.closeTime,
                    breakStart: data.breakStart || null,
                    breakEnd: data.breakEnd || null,
                    slotIntervalMinutes: data.slotIntervalMinutes || 30,
                    professionalId: proId,
                },
            });
        }

        safeRevalidate('/admin/horarios');
        safeRevalidate('/agendar');
        safeRevalidate('/');

        return { success: true, setting: saved };
    } catch (error) {
        console.error('Erro ao salvar configuração de horário:', error);
        return { success: false, message: 'Erro ao salvar horário de atendimento.' };
    }
}

export async function getAdminBlockedSlotsAction() {
    const session = await getAdminSession();
    if (!session) {
        throw new Error('Acesso não autorizado.');
    }

    try {
        const blocks = await prisma.blockedSlot.findMany({
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });

        return { success: true, blocks };
    } catch (error) {
        console.error('Erro ao buscar bloqueios:', error);
        return { success: false, blocks: [], message: 'Erro ao buscar bloqueios.' };
    }
}

export async function createAdminBlockedSlotAction(data: {
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    professionalId?: string | null;
    reason: string;
}) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        if (!data.date || !data.reason) {
            return { success: false, message: 'Informe a data e o motivo do bloqueio.' };
        }

        const block = await prisma.blockedSlot.create({
            data: {
                date: data.date,
                startTime: data.startTime || null,
                endTime: data.endTime || null,
                professionalId: data.professionalId || null,
                reason: data.reason.trim(),
            },
        });

        safeRevalidate('/admin/horarios');
        safeRevalidate('/agendar');

        return { success: true, block };
    } catch (error) {
        console.error('Erro ao criar bloqueio:', error);
        return { success: false, message: 'Erro ao cadastrar bloqueio no banco.' };
    }
}

export async function deleteAdminBlockedSlotAction(id: string) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        await prisma.blockedSlot.delete({
            where: { id },
        });

        safeRevalidate('/admin/horarios');
        safeRevalidate('/agendar');

        return { success: true };
    } catch (error) {
        console.error('Erro ao remover bloqueio:', error);
        return { success: false, message: 'Erro ao excluir bloqueio.' };
    }
}
