/**
 * scheduleEngine.ts
 * Motor de Regras de Negócio de Horários e Agendamentos do Glamour Studio
 */

export interface TimeSlot {
    time: string; // "10:00"
    endTime: string; // "11:30"
    available: boolean;
    reason?: string;
}

export interface DayScheduleConfig {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string; // "10:00"
    closeTime: string; // "18:00"
    breakStart?: string | null; // "12:30"
    breakEnd?: string | null; // "13:30"
    slotIntervalMinutes: number; // 30
}

export interface AppointmentSlotInterval {
    startTime: string;
    endTime: string;
    professionalId?: string;
    status?: string;
}

export interface BlockedSlotInterval {
    startTime?: string | null; // null = full day
    endTime?: string | null;
    professionalId?: string | null;
    reason?: string;
}

/**
 * Converte "HH:mm" em minutos desde as 00:00 (Ex: "10:30" -> 630)
 */
export function timeToMinutes(timeStr: string): number {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converte minutos desde as 00:00 em "HH:mm" (Ex: 630 -> "10:30")
 */
export function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
}

/**
 * Calcula o horário final somando uma duração em minutos ao horário inicial
 */
export function addMinutesToTime(startTime: string, durationMinutes: number): string {
    const startMins = timeToMinutes(startTime);
    return minutesToTime(startMins + durationMinutes);
}

/**
 * Verifica se dois intervalos de tempo [startA, endA) e [startB, endB) se sobrepõem
 */
export function isTimeOverlapping(
    startA: string,
    endA: string,
    startB: string,
    endB: string
): boolean {
    const aStart = timeToMinutes(startA);
    const aEnd = timeToMinutes(endA);
    const bStart = timeToMinutes(startB);
    const bEnd = timeToMinutes(endB);

    return aStart < bEnd && aEnd > bStart;
}

/**
 * Gera lista de horários base de acordo com o expediente e intervalo de slots
 */
export function generateBaseTimeSlots(
    openTime: string,
    closeTime: string,
    intervalMinutes: number = 30
): string[] {
    const slots: string[] = [];
    const openMins = timeToMinutes(openTime);
    const closeMins = timeToMinutes(closeTime);
    const step = intervalMinutes > 0 ? intervalMinutes : 30;

    for (let current = openMins; current < closeMins; current += step) {
        slots.push(minutesToTime(current));
    }

    return slots;
}

/**
 * Obtém a data e horário atual no fuso horário do salão em Bonfim - RR (America/Boa_Vista, UTC-4)
 */
export function getSalonCurrentDateTime(dateObj: Date = new Date()): {
    todayStr: string; // "YYYY-MM-DD"
    currentHours: number;
    currentMinutes: number;
    currentTotalMinutes: number;
} {
    try {
        const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Boa_Vista',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        const parts = formatter.formatToParts(dateObj);
        const partMap: Record<string, string> = {};
        for (const p of parts) {
            partMap[p.type] = p.value;
        }

        const year = partMap.year;
        const month = partMap.month;
        const day = partMap.day;
        const hour = parseInt(partMap.hour || '0', 10);
        const minute = parseInt(partMap.minute || '0', 10);

        return {
            todayStr: `${year}-${month}-${day}`,
            currentHours: hour,
            currentMinutes: minute,
            currentTotalMinutes: hour * 60 + minute,
        };
    } catch {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        const h = dateObj.getHours();
        const min = dateObj.getMinutes();
        return {
            todayStr: `${y}-${m}-${d}`,
            currentHours: h,
            currentMinutes: min,
            currentTotalMinutes: h * 60 + min,
        };
    }
}

/**
 * Retorna a data atual no Brasil (YYYY-MM-DD)
 */
export function getBrazilTodayDateString(): string {
    return getSalonCurrentDateTime().todayStr;
}

/**
 * Converte data "YYYY-MM-DD" em formato brasileiro "DD/MM/AAAA"
 */
export function formatDateToBR(dateStr: string): string {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

/**
 * Retorna o nome do dia da semana em português (ex: "Segunda-feira")
 */
export function getWeekdayName(dateStr: string): string {
    if (!dateStr || !dateStr.includes('-')) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12, 0, 0);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[d.getDay()] || '';
}

/**
 * Retorna os próximos dias para facilitar seleção rápida (chips) no mobile e desktop
 */
export function getUpcomingDates(daysCount: number = 8): {
    dateStr: string;
    label: string;
    dayNum: string;
    weekdayShort: string;
    isSunday: boolean;
    isToday: boolean;
}[] {
    const todayStr = getBrazilTodayDateString();
    const [y, m, d] = todayStr.split('-').map(Number);
    const result = [];
    const weekdaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < daysCount; i++) {
        const dObj = new Date(y, m - 1, d + i, 12, 0, 0);
        const dayOfWeek = dObj.getDay();
        const year = dObj.getFullYear();
        const month = String(dObj.getMonth() + 1).padStart(2, '0');
        const day = String(dObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        let label = `${day}/${month}`;
        if (i === 0) label = `Hoje (${day}/${month})`;
        else if (i === 1) label = `Amanhã (${day}/${month})`;
        else label = `${weekdaysShort[dayOfWeek]} (${day}/${month})`;

        result.push({
            dateStr,
            label,
            dayNum: day,
            weekdayShort: weekdaysShort[dayOfWeek],
            isSunday: dayOfWeek === 0,
            isToday: i === 0,
        });
    }
    return result;
}

/**
 * Calcula todos os slots para um dia específico aplicando todas as regras de negócio
 */
export function calculateAvailableSlots(params: {
    date: string; // "YYYY-MM-DD"
    durationMinutes: number;
    schedule: DayScheduleConfig;
    appointments: AppointmentSlotInterval[];
    blockedSlots: BlockedSlotInterval[];
    currentDateObj?: Date;
    targetProfessionalId?: string; // "luciana-bezerra", "graziele-bezerra", "any" ou "ambas"
}): { isOpen: boolean; closedReason?: string; slots: TimeSlot[] } {
    const {
        date,
        durationMinutes,
        schedule,
        appointments,
        blockedSlots,
        currentDateObj = new Date(),
        targetProfessionalId = 'any',
    } = params;

    // 1. Verificar se o dia está configurado como fechado (ex: Domingo)
    if (!schedule.isOpen) {
        const daysMap = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayName = daysMap[schedule.dayOfWeek] || 'Este dia';
        return {
            isOpen: false,
            closedReason: `O salão não abre aos ${dayName.toLowerCase()}s.`,
            slots: [],
        };
    }

    // 2. Verificar bloqueio total de dia (ex: Feriado ou fechamento geral)
    const fullDayBlock = blockedSlots.find(
        (b) =>
            (!b.startTime && !b.endTime) &&
            (!b.professionalId || b.professionalId === targetProfessionalId || targetProfessionalId === 'any')
    );

    if (fullDayBlock) {
        return {
            isOpen: false,
            closedReason: fullDayBlock.reason || 'Atendimento indisponível nesta data.',
            slots: [],
        };
    }

    // Preparar comparação de horários passados e datas passadas no fuso horário do salão (Bonfim - RR)
    const salonNow = getSalonCurrentDateTime(currentDateObj);
    const isPastDate = date < salonNow.todayStr;
    const isToday = date === salonNow.todayStr;
    const currentMinsNow = salonNow.currentTotalMinutes;

    // Se a data selecionada for no passado (ex: ontem ou dias anteriores)
    if (isPastDate) {
        return {
            isOpen: false,
            closedReason: 'Não é possível agendar em datas que já passaram.',
            slots: [],
        };
    }

    const openMins = timeToMinutes(schedule.openTime);
    const closeMins = timeToMinutes(schedule.closeTime);
    const duration = durationMinutes > 0 ? durationMinutes : 30;
    const baseSlots = generateBaseTimeSlots(schedule.openTime, schedule.closeTime, schedule.slotIntervalMinutes || 30);

    const slots: TimeSlot[] = [];

    for (const slotTime of baseSlots) {
        const slotStartMins = timeToMinutes(slotTime);
        const slotEndMins = slotStartMins + duration;
        const slotEndTime = minutesToTime(slotEndMins);

        let available = true;
        let reason: string | undefined = undefined;

        // Regra A: Horário já passou hoje? (Apenas se a data for hoje no horário de Boa Vista/Roraima)
        if (isToday && slotStartMins <= currentMinsNow) {
            available = false;
            reason = 'Horário já passou';
        }

        // Regra B: O serviço ultrapassa o horário de fechamento do salão?
        if (available && slotEndMins > closeMins) {
            available = false;
            reason = `Serviço de ${duration}min ultrapassa o fechamento (${schedule.closeTime})`;
        }

        // Regra C: O serviço conflita com o horário de almoço/pausa?
        if (available && schedule.breakStart && schedule.breakEnd) {
            if (isTimeOverlapping(slotTime, slotEndTime, schedule.breakStart, schedule.breakEnd)) {
                available = false;
                reason = `Intervalo de pausa (${schedule.breakStart} às ${schedule.breakEnd})`;
            }
        }

        // Regra D: Conflito com bloqueios parciais de horário
        if (available) {
            const conflictingBlock = blockedSlots.find((b) => {
                if (b.startTime && b.endTime) {
                    const matchesPro =
                        !b.professionalId ||
                        targetProfessionalId === 'any' ||
                        targetProfessionalId === 'ambas' ||
                        b.professionalId === targetProfessionalId;

                    return matchesPro && isTimeOverlapping(slotTime, slotEndTime, b.startTime, b.endTime);
                }
                return false;
            });

            if (conflictingBlock) {
                available = false;
                reason = conflictingBlock.reason || 'Horário temporariamente bloqueado';
            }
        }

        // Regra E: Conflito com agendamentos existentes no banco
        if (available) {
            const conflictingAppointment = appointments.find((apt) => {
                // Apenas status ativos bloqueiam a agenda
                const isActive = apt.status !== 'CANCELADO';
                if (!isActive) return false;

                const matchesPro =
                    targetProfessionalId === 'any' ||
                    targetProfessionalId === 'ambas' ||
                    !apt.professionalId ||
                    apt.professionalId === targetProfessionalId ||
                    apt.professionalId === 'ambas';

                return matchesPro && isTimeOverlapping(slotTime, slotEndTime, apt.startTime, apt.endTime);
            });

            if (conflictingAppointment) {
                available = false;
                reason = 'Horário já reservado por outra cliente';
            }
        }

        slots.push({
            time: slotTime,
            endTime: slotEndTime,
            available,
            reason,
        });
    }

    return {
        isOpen: true,
        slots,
    };
}

import { cleanWhatsAppText } from './whatsappUtils';

/**
 * Filtra a lista de slots de uma profissional para impedir conflito com o horário já escolhido para outra profissional pelo mesmo cliente.
 * Se o slot colide com [busyStart, busyEnd), marca available: false com motivo explicativo.
 */
export function filterSlotsByClientOverlap(
    slots: TimeSlot[],
    busyStart?: string | null,
    busyEnd?: string | null,
    otherProName: string = 'outra especialista'
): TimeSlot[] {
    if (!busyStart || !busyEnd) return slots;

    return slots.map((slot) => {
        if (!slot.available) return slot;

        const overlap = isTimeOverlapping(slot.time, slot.endTime, busyStart, busyEnd);
        if (overlap) {
            return {
                ...slot,
                available: false,
                reason: `Conflito com atendimento da ${otherProName} (${busyStart} às ${busyEnd})`,
            };
        }

        return slot;
    });
}

/**
 * Sugere o próximo horário disponível imediatamente após ou logo em seguida ao término de outro atendimento.
 */
export function suggestNextSequentialSlot(
    busyEnd: string,
    targetSlots: TimeSlot[]
): string | null {
    if (!busyEnd || !targetSlots || targetSlots.length === 0) return null;

    const busyEndMins = timeToMinutes(busyEnd);

    // 1. Tentar encontrar slot exatamente no horário de término
    const exactSlot = targetSlots.find(
        (s) => s.available && timeToMinutes(s.time) === busyEndMins
    );
    if (exactSlot) return exactSlot.time;

    // 2. Tentar encontrar o primeiro slot livre posterior ao término
    const nextSlot = targetSlots.find(
        (s) => s.available && timeToMinutes(s.time) >= busyEndMins
    );
    if (nextSlot) return nextSlot.time;

    return null;
}

/**
 * Valida a compatibilidade de horários entre Luciana e Graziele no agendamento duplo.
 */
export function validateDualBookingSlots(params: {
    lucianaStartTime: string;
    lucianaEndTime: string;
    grazieleStartTime: string;
    grazieleEndTime: string;
}): { valid: boolean; errorMessage?: string } {
    const {
        lucianaStartTime,
        lucianaEndTime,
        grazieleStartTime,
        grazieleEndTime,
    } = params;

    if (!lucianaStartTime || !lucianaEndTime || !grazieleStartTime || !grazieleEndTime) {
        return { valid: false, errorMessage: 'Selecione os horários para ambas as especialistas.' };
    }

    if (lucianaStartTime === grazieleStartTime) {
        return {
            valid: false,
            errorMessage: `Horário das ${lucianaStartTime} selecionado para ambas. O cliente não pode estar em dois atendimentos simultâneos.`,
        };
    }

    const overlap = isTimeOverlapping(
        lucianaStartTime,
        lucianaEndTime,
        grazieleStartTime,
        grazieleEndTime
    );

    if (overlap) {
        return {
            valid: false,
            errorMessage: `O atendimento com a Luciana (${lucianaStartTime} às ${lucianaEndTime}) colide com o horário da Graziele (${grazieleStartTime} às ${grazieleEndTime}). Por favor, escolha horários sem sobreposição.`,
        };
    }

    return { valid: true };
}

/**
 * Formata um ticket padronizado para WhatsApp com todos os detalhes do agendamento
 */
export function formatWhatsAppTicket(params: {
    clientName: string;
    servicesText: string;
    totalPriceDisplay: string;
    professionalDisplayName: string;
    dateFormatted: string;
    startTime: string;
    endTime?: string;
    durationFormatted: string;
    notes?: string;
    appointmentId?: string;
}): string {
    const {
        clientName,
        servicesText,
        totalPriceDisplay,
        professionalDisplayName,
        dateFormatted,
        startTime,
        endTime,
        durationFormatted,
        notes,
        appointmentId,
    } = params;

    const timeRange = endTime && endTime !== startTime ? `${startTime} as ${endTime}` : startTime;
    const codeTag = appointmentId ? `#${appointmentId.slice(-6).toUpperCase()}` : '';

    const text = `*SOLICITACAO DE AGENDAMENTO - GLAMOUR STUDIO*
----------------------------------------
${codeTag ? `📋 *CODIGO:* ${codeTag}\n` : ''}*CLIENTE:* ${clientName.trim()}

${servicesText}

*VALOR ESTIMADO:* ${totalPriceDisplay}
*ESPECIALISTA(S):* ${professionalDisplayName}
*DATA:* ${dateFormatted}
*HORARIO:* ${timeRange}
*DURACAO ESTIMADA:* ${durationFormatted}
${notes && notes.trim() ? `*OBSERVACOES:* ${notes.trim()}\n` : ''}----------------------------------------
_Glamour Studio - Av. Tuxaua Farias, 259, Bonfim - RR_`;

    return cleanWhatsAppText(text);
}

/**
 * Formata um ticket consolidado para WhatsApp para agendamentos combinados com 2 especialistas
 */
export function formatDualWhatsAppTicket(params: {
    clientName: string;
    lucianaServicesText: string;
    lucianaTimeRange: string;
    lucianaDuration: string;
    grazieleServicesText: string;
    grazieleTimeRange: string;
    grazieleDuration: string;
    totalPriceDisplay: string;
    dateFormatted: string;
    notes?: string;
    bookingGroupCode?: string;
    lucianaAppointmentId?: string;
    grazieleAppointmentId?: string;
}): string {
    const {
        clientName,
        lucianaServicesText,
        lucianaTimeRange,
        lucianaDuration,
        grazieleServicesText,
        grazieleTimeRange,
        grazieleDuration,
        totalPriceDisplay,
        dateFormatted,
        notes,
        bookingGroupCode,
        lucianaAppointmentId,
        grazieleAppointmentId,
    } = params;

    const groupTag = bookingGroupCode ? `#${bookingGroupCode.slice(-6).toUpperCase()}` : '';
    const lucianaCodeTag = lucianaAppointmentId ? `#${lucianaAppointmentId.slice(-6).toUpperCase()}` : '';
    const grazieleCodeTag = grazieleAppointmentId ? `#${grazieleAppointmentId.slice(-6).toUpperCase()}` : '';

    const text = `*SOLICITACAO DE AGENDAMENTO COMBINADO - GLAMOUR STUDIO*
----------------------------------------
${groupTag ? `📋 *CODIGO DO PACOTE:* ${groupTag}\n` : ''}*CLIENTE:* ${clientName.trim()}
*DATA:* ${dateFormatted}

💇‍♀️ *1. ATENDIMENTO COM LUCIANA BEZERRA (Cabelos & Unhas):*
${lucianaCodeTag ? `📋 *Codigo do Agendamento:* ${lucianaCodeTag}\n` : ''}*Horario:* ${lucianaTimeRange} (⏱️ ${lucianaDuration})
${lucianaServicesText}

🌸 *2. ATENDIMENTO COM GRAZIELE BEZERRA (Sobrancelhas & Depilacao):*
${grazieleCodeTag ? `📋 *Codigo do Agendamento:* ${grazieleCodeTag}\n` : ''}*Horario:* ${grazieleTimeRange} (⏱️ ${grazieleDuration})
${grazieleServicesText}

----------------------------------------
*INVESTIMENTO TOTAL ESTIMADO:* ${totalPriceDisplay}
${notes && notes.trim() ? `*OBSERVACOES:* ${notes.trim()}\n` : ''}----------------------------------------
_Glamour Studio - Av. Tuxaua Farias, 259, Bonfim - RR_`;

    return cleanWhatsAppText(text);
}

/**
 * Determina se um agendamento já passou em relação ao horário atual do salão (America/Boa_Vista, UTC-4).
 * Retorna true se a data for anterior a hoje, ou se for hoje e o horário de término já tiver encerrado.
 */
export function isAppointmentPast(
    apt: {
        date: string;
        startTime: string;
        endTime?: string | null;
        durationMinutes?: number;
    },
    salonDateTime?: { todayStr: string; currentTotalMinutes: number }
): boolean {
    const current = salonDateTime || getSalonCurrentDateTime();
    if (!apt.date) return false;
    if (apt.date < current.todayStr) return true;
    if (apt.date > current.todayStr) return false;

    // Se a data for hoje, compara os minutos do término do agendamento com os minutos atuais
    let endMinutes: number;
    if (apt.endTime && apt.endTime.includes(':')) {
        endMinutes = timeToMinutes(apt.endTime);
    } else {
        const startMins = timeToMinutes(apt.startTime);
        endMinutes = startMins + (apt.durationMinutes && apt.durationMinutes > 0 ? apt.durationMinutes : 30);
    }

    return endMinutes <= current.currentTotalMinutes;
}
