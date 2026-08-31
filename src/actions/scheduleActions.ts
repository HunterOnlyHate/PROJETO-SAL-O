'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { salonData } from '@/data/salonData';
import {
    calculateAvailableSlots,
    addMinutesToTime,
    isTimeOverlapping,
    validateDualBookingSlots,
    formatWhatsAppTicket,
    formatDualWhatsAppTicket,
    DayScheduleConfig,
    TimeSlot,
} from '@/lib/scheduleEngine';
import { buildWhatsAppUrl } from '@/lib/whatsappUtils';

export interface GetSlotsParams {
    date: string; // "YYYY-MM-DD"
    durationMinutes: number;
    professionalId?: string; // "luciana-bezerra", "graziele-bezerra", "any" ou "ambas"
}

export interface PublicBookingInput {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    notes?: string;
    date: string; // "YYYY-MM-DD"
    // Caso 1: Agendamento Simples (1 Especialista)
    startTime?: string; // "10:00"
    serviceIds?: string[];
    professionalId?: string;

    // Caso 2: Agendamento Combinado (2 Especialistas)
    isDualBooking?: boolean;
    lucianaBooking?: {
        startTime: string;
        serviceIds: string[];
        durationMinutes?: number;
    };
    grazieleBooking?: {
        startTime: string;
        serviceIds: string[];
        durationMinutes?: number;
    };
}

export async function getAvailableSlotsAction(params: GetSlotsParams): Promise<{
    success: boolean;
    isOpen: boolean;
    closedReason?: string;
    slots: TimeSlot[];
    message?: string;
}> {
    try {
        const { date, durationMinutes, professionalId = 'any' } = params;

        if (!date) {
            return { success: false, isOpen: false, slots: [], message: 'Data inválida.' };
        }

        // Determinar dia da semana da data informada (YYYY-MM-DD)
        const [year, month, day] = date.split('-').map(Number);
        const targetDateObj = new Date(year, month - 1, day, 12, 0, 0);
        const dayOfWeek = targetDateObj.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

        // 1. Buscar configuração de horário do dia no banco para a profissional informada
        let scheduleConfig: DayScheduleConfig | null = null;
        try {
            const targetPro = professionalId !== 'any' && professionalId !== 'ambas' ? professionalId : 'luciana-bezerra';
            const proSchedule = await prisma.scheduleSetting.findFirst({
                where: {
                    dayOfWeek,
                    professionalId: targetPro,
                },
            });

            if (proSchedule) {
                scheduleConfig = {
                    dayOfWeek: proSchedule.dayOfWeek,
                    isOpen: proSchedule.isOpen,
                    openTime: proSchedule.openTime,
                    closeTime: proSchedule.closeTime,
                    breakStart: proSchedule.breakStart,
                    breakEnd: proSchedule.breakEnd,
                    slotIntervalMinutes: proSchedule.slotIntervalMinutes,
                };
            }
        } catch (err) {
            console.warn('⚠️ Falha ao buscar schedule no banco, usando padrão:', err);
        }

        // Fallback padrão se ainda não configurado para a profissional
        if (!scheduleConfig) {
            scheduleConfig = {
                dayOfWeek,
                isOpen: dayOfWeek !== 0, // Domingo fechado por padrão
                openTime: '10:00',
                closeTime: '18:00',
                breakStart: null,
                breakEnd: null,
                slotIntervalMinutes: 30,
            };
        }

        // 2. Buscar agendamentos existentes no banco para essa data e profissional
        let appointments: { startTime: string; endTime: string; professionalId?: string; status?: string }[] = [];
        try {
            const whereApt: any = {
                date,
                status: { not: 'CANCELADO' },
            };

            if (professionalId !== 'any' && professionalId !== 'ambas') {
                whereApt.OR = [
                    { professionalId },
                    { professionalId: 'ambas' },
                ];
            }

            const dbAppointments = await prisma.appointment.findMany({
                where: whereApt,
                select: {
                    startTime: true,
                    endTime: true,
                    professionalId: true,
                    status: true,
                },
            });
            appointments = dbAppointments;
        } catch (err) {
            console.warn('⚠️ Falha ao buscar appointments no banco:', err);
        }

        // 3. Buscar bloqueios de horários no banco
        let blockedSlots: { startTime?: string | null; endTime?: string | null; professionalId?: string | null; reason?: string }[] = [];
        try {
            const dbBlocked = await prisma.blockedSlot.findMany({
                where: {
                    date,
                    OR: [
                        { professionalId: null },
                        ...(professionalId !== 'any' && professionalId !== 'ambas' ? [{ professionalId }] : []),
                    ],
                },
            });
            blockedSlots = dbBlocked;
        } catch (err) {
            console.warn('⚠️ Falha ao buscar blocked_slots no banco:', err);
        }

        // 4. Executar cálculo de slots
        const result = calculateAvailableSlots({
            date,
            durationMinutes: durationMinutes || 30,
            schedule: scheduleConfig,
            appointments,
            blockedSlots,
            targetProfessionalId: professionalId,
            currentDateObj: new Date(),
        });

        return {
            success: true,
            isOpen: result.isOpen,
            closedReason: result.closedReason,
            slots: result.slots,
        };
    } catch (error) {
        console.error('Erro em getAvailableSlotsAction:', error);
        return {
            success: false,
            isOpen: false,
            slots: [],
            message: 'Erro ao calcular horários disponíveis.',
        };
    }
}

export async function createPublicBookingAction(input: PublicBookingInput) {
    try {
        const {
            clientName,
            clientPhone,
            clientEmail,
            notes,
            date,
            isDualBooking,
            lucianaBooking,
            grazieleBooking,
            startTime,
            serviceIds,
            professionalId,
        } = input;

        // Validações essenciais de identificação
        if (!clientName || clientName.trim().length < 2) {
            return { success: false, message: 'Por favor, informe seu nome completo.' };
        }
        if (!clientPhone || clientPhone.trim().length < 7) {
            return { success: false, message: 'Por favor, informe um número de telefone/WhatsApp válido (Brasil ou Lethem).' };
        }
        if (!date) {
            return { success: false, message: 'Por favor, selecione uma data válida para o atendimento.' };
        }

        // =========================================================================
        // CENÁRIO A: AGENDAMENTO COMBINADO (LUCIANA & GRAZIELE)
        // =========================================================================
        if (
            isDualBooking ||
            (lucianaBooking && grazieleBooking && lucianaBooking.serviceIds.length > 0 && grazieleBooking.serviceIds.length > 0)
        ) {
            if (!lucianaBooking || !grazieleBooking) {
                return { success: false, message: 'Dados de agendamento combinado incompletos.' };
            }

            const lucianaServiceIds = lucianaBooking.serviceIds || [];
            const grazieleServiceIds = grazieleBooking.serviceIds || [];

            if (lucianaServiceIds.length === 0 || grazieleServiceIds.length === 0) {
                return { success: false, message: 'Selecione procedimentos para ambas as profissionais.' };
            }

            if (!lucianaBooking.startTime || !grazieleBooking.startTime) {
                return { success: false, message: 'Selecione os horários de início para ambas as especialistas.' };
            }

            // Buscar serviços de ambas
            const allServiceIds = [...lucianaServiceIds, ...grazieleServiceIds];
            let allServices: Array<{
                id: string;
                name: string;
                professionalId: string;
                professionalName?: string;
                durationMinutes: number;
                price: number;
            }> = [];

            try {
                const dbServices = await prisma.service.findMany({
                    where: { id: { in: allServiceIds } },
                });
                if (dbServices && dbServices.length > 0) {
                    allServices = dbServices;
                }
            } catch (err) {
                console.warn('⚠️ Falha ao buscar serviços no banco:', err);
            }

            if (allServices.length === 0) {
                allServices = salonData.services.filter((s) => allServiceIds.includes(s.id));
            }

            const lucianaServices = allServices.filter((s) => lucianaServiceIds.includes(s.id));
            const grazieleServices = allServices.filter((s) => grazieleServiceIds.includes(s.id));

            // Calcular durações e preços de cada uma
            const lucianaDuration = lucianaServices.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);
            const grazieleDuration = grazieleServices.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);

            const lucianaTotalPrice = lucianaServices.reduce((acc, s) => acc + (s.price || 0), 0);
            const grazieleTotalPrice = grazieleServices.reduce((acc, s) => acc + (s.price || 0), 0);
            const combinedTotalPrice = lucianaTotalPrice + grazieleTotalPrice;

            const lucianaEndTime = addMinutesToTime(lucianaBooking.startTime, lucianaDuration);
            const grazieleEndTime = addMinutesToTime(grazieleBooking.startTime, grazieleDuration);

            // 1. Validação Estrita Anti-Sobreposição entre as duas para a cliente
            const validation = validateDualBookingSlots({
                lucianaStartTime: lucianaBooking.startTime,
                lucianaEndTime,
                grazieleStartTime: grazieleBooking.startTime,
                grazieleEndTime,
            });

            if (!validation.valid) {
                return { success: false, message: validation.errorMessage };
            }

            // 2. Validação Atômica no Banco: Disponibilidade na agenda da Luciana
            const lucianaActiveAppointments = await prisma.appointment.findMany({
                where: {
                    date,
                    status: { not: 'CANCELADO' },
                    OR: [
                        { professionalId: 'luciana-bezerra' },
                        { professionalId: 'ambas' },
                    ],
                },
            });

            const lucianaHasConflict = lucianaActiveAppointments.some((apt) =>
                isTimeOverlapping(lucianaBooking.startTime, lucianaEndTime, apt.startTime, apt.endTime)
            );

            if (lucianaHasConflict) {
                return {
                    success: false,
                    message: `O horário das ${lucianaBooking.startTime} com a Luciana já foi reservado recentemente por outra cliente. Por favor, escolha outro horário livre.`,
                };
            }

            // 3. Validação Atômica no Banco: Disponibilidade na agenda da Graziele
            const grazieleActiveAppointments = await prisma.appointment.findMany({
                where: {
                    date,
                    status: { not: 'CANCELADO' },
                    OR: [
                        { professionalId: 'graziele-bezerra' },
                        { professionalId: 'ambas' },
                    ],
                },
            });

            const grazieleHasConflict = grazieleActiveAppointments.some((apt) =>
                isTimeOverlapping(grazieleBooking.startTime, grazieleEndTime, apt.startTime, apt.endTime)
            );

            if (grazieleHasConflict) {
                return {
                    success: false,
                    message: `O horário das ${grazieleBooking.startTime} com a Graziele já foi reservado recentemente por outra cliente. Por favor, escolha outro horário livre.`,
                };
            }

            // 4. Salvar 2 Agendamentos Distintos no Banco com Código de Grupo Vinculado
            const groupCode = `COMB-${Date.now().toString(36).slice(-5).toUpperCase()}`;
            const clientNotesText = notes?.trim() ? `${notes.trim()} ` : '';

            const lucianaServiceNames = lucianaServices.map((s) => s.name).join(', ');
            const grazieleServiceNames = grazieleServices.map((s) => s.name).join(', ');

            const [aptLuciana, aptGraziele] = await prisma.$transaction([
                prisma.appointment.create({
                    data: {
                        clientName: clientName.trim(),
                        clientPhone: clientPhone.trim(),
                        clientEmail: clientEmail?.trim() || null,
                        notes: `${clientNotesText}[Pacote Combinado #${groupCode}]`.trim(),
                        date,
                        startTime: lucianaBooking.startTime,
                        endTime: lucianaEndTime,
                        durationMinutes: lucianaDuration,
                        professionalId: 'luciana-bezerra',
                        professionalName: 'Luciana Bezerra',
                        serviceIds: JSON.stringify(lucianaServiceIds),
                        serviceNames: lucianaServiceNames,
                        totalPrice: lucianaTotalPrice,
                        status: 'PENDENTE',
                        whatsappSent: true,
                    },
                }),
                prisma.appointment.create({
                    data: {
                        clientName: clientName.trim(),
                        clientPhone: clientPhone.trim(),
                        clientEmail: clientEmail?.trim() || null,
                        notes: `${clientNotesText}[Pacote Combinado #${groupCode}]`.trim(),
                        date,
                        startTime: grazieleBooking.startTime,
                        endTime: grazieleEndTime,
                        durationMinutes: grazieleDuration,
                        professionalId: 'graziele-bezerra',
                        professionalName: 'Graziele Bezerra',
                        serviceIds: JSON.stringify(grazieleServiceIds),
                        serviceNames: grazieleServiceNames,
                        totalPrice: grazieleTotalPrice,
                        status: 'PENDENTE',
                        whatsappSent: true,
                    },
                }),
            ]);

            // 5. Formatar Comprovante Consolidado do WhatsApp
            const [y, m, d] = date.split('-');
            const dateFormatted = `${d}/${m}/${y}`;

            const lucianaHours = Math.floor(lucianaDuration / 60);
            const lucianaMins = lucianaDuration % 60;
            const lucianaDurationFmt = `${lucianaHours > 0 ? `${lucianaHours}h` : ''}${lucianaMins > 0 ? `${lucianaMins}min` : ''}` || '30min';

            const grazieleHours = Math.floor(grazieleDuration / 60);
            const grazieleMins = grazieleDuration % 60;
            const grazieleDurationFmt = `${grazieleHours > 0 ? `${grazieleHours}h` : ''}${grazieleMins > 0 ? `${grazieleMins}min` : ''}` || '30min';

            const priceDisplay =
                combinedTotalPrice > 0
                    ? `R$ ${combinedTotalPrice.toFixed(2).replace('.', ',')}`
                    : 'A consultar no WhatsApp';

            const lucianaServicesText = lucianaServices
                .map((s) => `> * ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob consulta'}`)
                .join('\n');

            const grazieleServicesText = grazieleServices
                .map((s) => `> * ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob consulta'}`)
                .join('\n');

            const ticketText = formatDualWhatsAppTicket({
                clientName,
                lucianaServicesText,
                lucianaTimeRange: `${lucianaBooking.startTime} as ${lucianaEndTime}`,
                lucianaDuration: lucianaDurationFmt,
                lucianaAppointmentId: aptLuciana.id,
                grazieleServicesText,
                grazieleTimeRange: `${grazieleBooking.startTime} as ${grazieleEndTime}`,
                grazieleDuration: grazieleDurationFmt,
                grazieleAppointmentId: aptGraziele.id,
                totalPriceDisplay: priceDisplay,
                dateFormatted,
                notes: notes || undefined,
                bookingGroupCode: groupCode,
            });

            const targetWhatsapp = salonData.info.whatsapp || '5595984072160';
            const whatsappUrl = buildWhatsAppUrl(targetWhatsapp, ticketText);
            const whatsappLucianaUrl = buildWhatsAppUrl('5595984072160', ticketText);
            const whatsappGrazieleUrl = buildWhatsAppUrl('5595984298305', ticketText);

            try {
                revalidatePath('/agendar');
                revalidatePath('/admin');
                revalidatePath('/admin/agendamentos');
            } catch {}

            return {
                success: true,
                isDual: true,
                bookingGroupCode: groupCode,
                appointmentId: `${aptLuciana.id},${aptGraziele.id}`,
                lucianaAppointmentId: aptLuciana.id,
                grazieleAppointmentId: aptGraziele.id,
                appointments: [aptLuciana, aptGraziele],
                whatsappUrl,
                whatsappLucianaUrl,
                whatsappGrazieleUrl,
                ticketText,
            };
        }

        // =========================================================================
        // CENÁRIO B: AGENDAMENTO SIMPLES (1 PROFISSIONAL)
        // =========================================================================
        if (!startTime) {
            return { success: false, message: 'Por favor, selecione um horário para o atendimento.' };
        }
        if (!serviceIds || serviceIds.length === 0) {
            return { success: false, message: 'Selecione ao menos um procedimento para agendar.' };
        }

        let selectedServices: Array<{
            id: string;
            name: string;
            professionalId: string;
            professionalName?: string;
            durationMinutes: number;
            price: number;
        }> = [];

        try {
            const dbServices = await prisma.service.findMany({
                where: { id: { in: serviceIds } },
            });
            if (dbServices && dbServices.length > 0) {
                selectedServices = dbServices;
            }
        } catch (err) {
            console.warn('⚠️ Falha ao buscar serviços no banco para booking:', err);
        }

        if (selectedServices.length === 0) {
            selectedServices = salonData.services.filter((s) => serviceIds.includes(s.id));
        }

        if (selectedServices.length === 0) {
            return { success: false, message: 'Serviços selecionados inválidos.' };
        }

        const totalDurationMinutes = selectedServices.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);
        const totalPrice = selectedServices.reduce((acc, s) => acc + (s.price || 0), 0);
        const hasCustomPrice = selectedServices.some((s) => s.price === 0);

        const endTime = addMinutesToTime(startTime, totalDurationMinutes);

        const isGraziele = professionalId === 'graziele-bezerra' || selectedServices.every((s) => s.professionalId === 'graziele-bezerra');
        const targetProId = isGraziele ? 'graziele-bezerra' : 'luciana-bezerra';
        const targetProName = isGraziele ? 'Graziele Bezerra' : 'Luciana Bezerra';
        const targetWhatsapp = isGraziele ? (salonData.info.whatsappVendas || '5595984298305') : (salonData.info.whatsapp || '5595984072160');

        // Validação Atômica de Conflito de Horário
        const activeAppointments = await prisma.appointment.findMany({
            where: {
                date,
                status: { not: 'CANCELADO' },
                OR: [
                    { professionalId: targetProId },
                    { professionalId: 'ambas' },
                ],
            },
        });

        const hasConflict = activeAppointments.some((apt) =>
            isTimeOverlapping(startTime, endTime, apt.startTime, apt.endTime)
        );

        if (hasConflict) {
            return {
                success: false,
                message: `O horário das ${startTime} já foi reservado recentemente por outra cliente. Por favor, escolha outro horário livre.`,
            };
        }

        const serviceNamesText = selectedServices.map((s) => s.name).join(', ');

        const appointment = await prisma.appointment.create({
            data: {
                clientName: clientName.trim(),
                clientPhone: clientPhone.trim(),
                clientEmail: clientEmail?.trim() || null,
                notes: notes?.trim() || null,
                date,
                startTime,
                endTime,
                durationMinutes: totalDurationMinutes,
                professionalId: targetProId,
                professionalName: targetProName,
                serviceIds: JSON.stringify(serviceIds),
                serviceNames: serviceNamesText,
                totalPrice,
                status: 'PENDENTE',
                whatsappSent: true,
            },
        });

        const [y, m, d] = date.split('-');
        const dateFormatted = `${d}/${m}/${y}`;

        const hours = Math.floor(totalDurationMinutes / 60);
        const mins = totalDurationMinutes % 60;
        let durationFormatted = '';
        if (hours > 0) durationFormatted += `${hours}h`;
        if (mins > 0) durationFormatted += `${mins}min`;
        if (!durationFormatted) durationFormatted = '30min';

        const priceDisplay =
            totalPrice > 0
                ? hasCustomPrice
                    ? `R$ ${totalPrice.toFixed(2).replace('.', ',')} (+ sob consulta)`
                    : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
                : 'A consultar no WhatsApp';

        const servicesSection = selectedServices
            .map((s) => `> * ${s.name} - ${s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob consulta'}`)
            .join('\n');

        const ticketText = formatWhatsAppTicket({
            clientName,
            servicesText: `*PROCEDIMENTO(S):*\n${servicesSection}`,
            totalPriceDisplay: priceDisplay,
            professionalDisplayName: targetProName,
            dateFormatted,
            startTime,
            endTime,
            durationFormatted,
            notes: notes || undefined,
            appointmentId: appointment.id,
        });

        const whatsappUrl = buildWhatsAppUrl(targetWhatsapp, ticketText);

        try {
            revalidatePath('/agendar');
            revalidatePath('/admin');
            revalidatePath('/admin/agendamentos');
        } catch {}

        return {
            success: true,
            isDual: false,
            appointmentId: appointment.id,
            appointment,
            whatsappUrl,
            ticketText,
        };
    } catch (error) {
        console.error('Erro ao registrar agendamento:', error);
        return {
            success: false,
            message: 'Erro interno ao registrar agendamento. Tente novamente ou entre em contato pelo WhatsApp.',
        };
    }
}

