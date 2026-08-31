/**
 * Utilitários para formatação e envio de mensagens limpas para o WhatsApp.
 * Garante que nenhum caractere ZWJ (Zero-Width Joiner), seletores de variação ou quebras incompatíveis
 * gerem caracteres estranhos (como  ou retângulos) nos aplicativos do WhatsApp (Mobile, Web, Desktop).
 */

/**
 * Remove caracteres invisíveis, ZWJ e seletores de variação que corrompem mensagens no WhatsApp.
 */
export function cleanWhatsAppText(rawText: string): string {
    if (!rawText) return '';

    return rawText
        // Normaliza para Unicode NFC
        .normalize('NFC')
        // Remove quebras de linha Windows \r
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Substitui emojis compostos com ZWJ problemáticos por equivalentes universais
        .replace(/\uD83D\uDC87\u200D\u2640\uFE0F/g, '🌸') // 💇‍♀️ -> 🌸
        .replace(/\uD83D\uDC86\u200D\u2640\uFE0F/g, '✨') // 💆‍♀️ -> ✨
        .replace(/\uD83D\uDC69\u200D\u2695\uFE0F/g, '🌸') // 👩‍⚕️ -> 🌸
        .replace(/💇‍♀️/g, '🌸')
        .replace(/💆‍♀️/g, '✨')
        .replace(/👩‍💼/g, '🌸')
        // Remove seletores de variação (VS15, VS16) e ZWJ que quebram no WhatsApp Web / Mobile
        .replace(/[\uFE0E\uFE0F\u200B\u200C\u200D\u200E\u200F\u2028\u2029]/g, '')
        // Normaliza espaços sem quebra
        .replace(/\u00A0/g, ' ')
        // Remove linhas em branco excessivas (mais de 2 seguidas)
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Higieniza o número de telefone para o padrão internacional do WhatsApp (ex: 5595984072160 ou 5926123456)
 */
export function sanitizeWhatsAppPhone(phone: string): string {
    let clean = phone.replace(/\D/g, '');
    if (clean.length === 0) return '';

    // Caso Lethem / Guiana (DDI 592)
    if (clean.startsWith('592')) {
        return clean;
    }
    if (clean.length === 7) {
        return `592${clean}`;
    }

    // Caso Brasil (DDI 55)
    if (!clean.startsWith('55') && (clean.length === 10 || clean.length === 11)) {
        clean = `55${clean}`;
    }
    return clean;
}

/**
 * Constrói o link oficial e seguro do WhatsApp com codificação UTF-8
 */
export function buildWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = sanitizeWhatsAppPhone(phone);
    const cleanedText = cleanWhatsAppText(text);
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(cleanedText)}`;
}

export type WhatsAppMessageType = 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO' | 'PENDENTE' | 'LEMBRETE';

export interface AdminMessageParams {
    clientName: string;
    date: string;
    startTime: string;
    endTime?: string;
    professionalName: string;
    serviceNames: string;
    totalPrice?: number;
    appointmentId?: string;
    status?: string;
}

/**
 * Formata a mensagem do WhatsApp de acordo com o status atual do agendamento
 */
export function formatAdminStatusMessage(type: WhatsAppMessageType | string, params: AdminMessageParams): string {
    const {
        clientName,
        date,
        startTime,
        endTime,
        professionalName,
        serviceNames,
        totalPrice,
        appointmentId,
    } = params;

    let dateFormatted = date;
    if (date && date.includes('-')) {
        const [y, m, d] = date.split('-');
        dateFormatted = `${d}/${m}/${y}`;
    }

    const timeRange = endTime && endTime !== startTime ? `${startTime} as ${endTime}` : startTime;
    const priceFormatted =
        totalPrice && totalPrice > 0
            ? `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
            : 'Sob consulta';

    const codeTag = appointmentId ? `#${appointmentId.slice(-6).toUpperCase()}` : '';
    const cleanName = clientName ? clientName.trim() : 'Cliente';

    switch (type.toUpperCase()) {
        case 'CONCLUIDO':
            return cleanWhatsAppText(`Ola, *${cleanName}*! 💖
Passando para agradecer pela sua presenca no *Glamour Studio*! ✨

${codeTag ? `📋 *Codigo do Atendimento:* ${codeTag}\n` : ''}Esperamos que voce tenha amado o resultado do seu atendimento de *${serviceNames}* com a especialista *${professionalName}*! 🌸

Sua satisfacao e nosso maior compromisso. Quando desejar agendar sua proxima sessao ou manutencao, estamos a total disposicao!

Tenha um dia incrivel e volte sempre! 💕✨
_Glamour Studio - Av. Tuxaua Farias, 259, Bonfim - RR_`);

        case 'CANCELADO':
            return cleanWhatsAppText(`Ola, *${cleanName}*.
Informamos que o seu agendamento no *Glamour Studio* para o dia *${dateFormatted} as ${timeRange}* (${serviceNames}) foi *CANCELADO*.

${codeTag ? `📋 *Codigo do Agendamento:* ${codeTag}\n` : ''}Caso tenha ocorrido algum imprevisto e deseje reagendar para outro dia ou horario que fique melhor para voce, estamos a disposicao para encontrar uma nova vaga! 🌸

Qualquer duvida, basta nos responder por aqui. ✨
_Glamour Studio - Av. Tuxaua Farias, 259, Bonfim - RR_`);

        case 'PENDENTE':
            return cleanWhatsAppText(`Ola, *${cleanName}*! ✨
Recebemos a sua solicitacao de agendamento no *Glamour Studio*! 💖

${codeTag ? `📋 *Codigo:* ${codeTag}\n` : ''}📅 *Data Solicitada:* ${dateFormatted}
⏰ *Horario:* ${timeRange}
🌸 *Especialista:* ${professionalName}
👑 *Procedimento(s):* ${serviceNames}

Estamos conferindo nossa agenda e em breve confirmaremos seu atendimento! Se precisar de algum ajuste ou informacao, pode nos avisar por aqui. 💕
_Glamour Studio - Av. Tuxaua Farias, 259, Bonfim - RR_`);

        case 'LEMBRETE':
            return cleanWhatsAppText(`Ola, *${cleanName}*! ✨
Passando para lembrar do seu agendamento no *Glamour Studio*! 💖

${codeTag ? `📋 *Codigo:* ${codeTag}\n` : ''}📅 *Data:* ${dateFormatted}
⏰ *Horario:* ${timeRange}
🌸 *Especialista:* ${professionalName}
👑 *Procedimento(s):* ${serviceNames}
📍 *Endereco:* Av. Tuxaua Farias, 259, Bonfim - RR

Estamos preparando tudo com muito carinho para receber voce. Ate breve! ✨`);

        case 'CONFIRMADO':
        default:
            return cleanWhatsAppText(`Ola, *${cleanName}*! ✨
Seu agendamento no *Glamour Studio* foi *CONFIRMADO* com sucesso! 💖

${codeTag ? `📋 *Codigo:* ${codeTag}\n` : ''}📅 *Data:* ${dateFormatted}
⏰ *Horario:* ${timeRange}
🌸 *Especialista:* ${professionalName}
👑 *Procedimento(s):* ${serviceNames}
💰 *Valor Estimado:* ${priceFormatted}
📍 *Endereco:* Av. Tuxaua Farias, 259, Bonfim - RR

Estamos ansiosas para receber voce! Qualquer duvida ou caso precise de ajuste, pode nos responder por aqui. Ate breve! ✨`);
    }
}

/**
 * Função mantida para compatibilidade direta
 */
export function formatAdminConfirmationMessage(params: AdminMessageParams): string {
    return formatAdminStatusMessage('CONFIRMADO', params);
}

/**
 * Formata o comprovante do agendamento público para o WhatsApp da Especialista
 */
export function formatPublicBookingTicket(params: {
    clientName: string;
    clientPhone: string;
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
        clientPhone,
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
*WHATSAPP:* ${clientPhone.trim()}

*PROCEDIMENTO(S):*
${servicesText}

*VALOR ESTIMADO:* ${totalPriceDisplay}
*ESPECIALISTA(S):* ${professionalDisplayName}
*DATA:* ${dateFormatted}
*HORARIO:* ${timeRange}
*DURACAO ESTIMADA:* ${durationFormatted}
${notes && notes.trim() ? `\n*OBSERVACOES:* ${notes.trim()}\n` : ''}----------------------------------------
_Glamour Studio - Av. Tuxaua Farias, 259, Bonfim - RR_`;

    return cleanWhatsAppText(text);
}
