'use client';

import React, { useState, useEffect } from 'react';
import { salonData } from '@/data/salonData';
import { useBooking } from '@/context/BookingContext';
import { getAvailableSlotsAction, createPublicBookingAction } from '@/actions/scheduleActions';
import {
    TimeSlot,
    addMinutesToTime,
    filterSlotsByClientOverlap,
    suggestNextSequentialSlot,
    validateDualBookingSlots,
    getBrazilTodayDateString,
    formatDateToBR,
    getWeekdayName,
    getUpcomingDates,
} from '@/lib/scheduleEngine';
import {
    formatPhoneWithCountry,
    detectCountryFromPhone,
    CountryPhoneCode,
    PHONE_COUNTRIES,
} from '@/lib/phoneUtils';

export function BookingModal() {
    const { isModalOpen, initialServiceId, closeBookingModal } = useBooking();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(getBrazilTodayDateString());

    // Filtros internos da Etapa 1
    const [step1Category, setStep1Category] = useState<string>('all');
    const [step1Search, setStep1Search] = useState<string>('');

    // Telefone e País (Brasil ou Lethem / Guiana)
    const [phoneCountry, setPhoneCountry] = useState<CountryPhoneCode>('BR');

    // Horário para agendamento simples (1 especialista)
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
    const [isDayOpen, setIsDayOpen] = useState<boolean>(true);
    const [closedReason, setClosedReason] = useState<string>('');

    // Horários para agendamento combinado (2 especialistas)
    const [lucianaTime, setLucianaTime] = useState<string>('');
    const [lucianaSlots, setLucianaSlots] = useState<TimeSlot[]>([]);
    const [isLoadingLucianaSlots, setIsLoadingLucianaSlots] = useState<boolean>(false);
    const [isLucianaDayOpen, setIsLucianaDayOpen] = useState<boolean>(true);
    const [lucianaClosedReason, setLucianaClosedReason] = useState<string>('');

    const [grazieleTime, setGrazieleTime] = useState<string>('');
    const [grazieleSlots, setGrazieleSlots] = useState<TimeSlot[]>([]);
    const [isLoadingGrazieleSlots, setIsLoadingGrazieleSlots] = useState<boolean>(false);
    const [isGrazieleDayOpen, setIsGrazieleDayOpen] = useState<boolean>(true);
    const [grazieleClosedReason, setGrazieleClosedReason] = useState<string>('');

    // Identificação do cliente
    const [clientName, setClientName] = useState<string>('');
    const [clientPhone, setClientPhone] = useState<string>('');
    const [clientNotes, setClientNotes] = useState<string>('');

    // Estados de Envio / Confirmação
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [confirmedAppointment, setConfirmedAppointment] = useState<{
        id: string;
        whatsappUrl: string;
        whatsappLucianaUrl?: string;
        whatsappGrazieleUrl?: string;
        ticketText: string;
        isDual?: boolean;
        bookingGroupCode?: string;
        lucianaAppointmentId?: string;
        grazieleAppointmentId?: string;
    } | null>(null);

    // Função para resetar completamente o formulário e voltar para a Etapa 1
    const resetBookingForm = (serviceId?: string | null) => {
        setCurrentStep(1);
        setSelectedServices(serviceId ? [serviceId] : []);
        setSelectedDate(getBrazilTodayDateString());
        setSelectedTime('');
        setLucianaTime('');
        setGrazieleTime('');
        setClientNotes('');
        setPhoneCountry('BR');
        setStep1Category('all');
        setStep1Search('');
        setConfirmedAppointment(null);
        setErrorMessage('');
        setIsSubmitting(false);
    };

    // Resetar para a etapa 1 e limpar dados sempre que o modal for aberto ou o serviço mudar
    useEffect(() => {
        if (isModalOpen) {
            resetBookingForm(initialServiceId);
        }
    }, [initialServiceId, isModalOpen]);

    // Bloquear rolagem do body e ocultar elementos flutuantes quando o modal estiver aberto no mobile
    useEffect(() => {
        if (isModalOpen) {
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }
        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const handleClose = () => {
        resetBookingForm(null);
        closeBookingModal();
    };

    const toggleService = (serviceId: string) => {
        setSelectedServices((prev) =>
            prev.includes(serviceId)
                ? prev.filter((id) => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const chosenServices = salonData.services.filter((s) => selectedServices.includes(s.id));
    const lucianaServices = chosenServices.filter((s) => s.professionalId === 'luciana-bezerra');
    const grazieleServices = chosenServices.filter((s) => s.professionalId === 'graziele-bezerra');

    const hasLuciana = lucianaServices.length > 0;
    const hasGraziele = grazieleServices.length > 0;
    const isDual = hasLuciana && hasGraziele;

    const lucianaDuration = lucianaServices.reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);
    const grazieleDuration = grazieleServices.reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);
    const totalMinutes = chosenServices.reduce((acc, curr) => acc + (curr.durationMinutes || 30), 0);

    const totalPrice = chosenServices.reduce((acc, curr) => acc + curr.price, 0);
    const hasCustomPrice = chosenServices.some((s) => s.price === 0);

    const formatMins = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0 && m > 0) return `${h}h${m}min`;
        if (h > 0) return `${h}h`;
        return `${m}min`;
    };

    const lucianaDurationFormatted = formatMins(lucianaDuration);
    const grazieleDurationFormatted = formatMins(grazieleDuration);
    const durationFormatted = formatMins(totalMinutes);

    // Calcular horários de término estimados
    const lucianaEndTime = lucianaTime ? addMinutesToTime(lucianaTime, lucianaDuration) : '';
    const grazieleEndTime = grazieleTime ? addMinutesToTime(grazieleTime, grazieleDuration) : '';

    const singleDuration = hasLuciana ? lucianaDuration : grazieleDuration;
    const singleEndTime = selectedTime ? addMinutesToTime(selectedTime, singleDuration) : '';

    // Filtrar horários com anti-sobreposição entre Luciana e Graziele para a cliente
    const filteredGrazieleSlots = filterSlotsByClientOverlap(
        grazieleSlots,
        lucianaTime,
        lucianaEndTime,
        'Luciana Bezerra'
    );

    const filteredLucianaSlots = filterSlotsByClientOverlap(
        lucianaSlots,
        grazieleTime,
        grazieleEndTime,
        'Graziele Bezerra'
    );

    // Sugestão de agendamento em sequência
    const suggestedGrazieleSeq = lucianaEndTime
        ? suggestNextSequentialSlot(lucianaEndTime, filteredGrazieleSlots)
        : null;

    const suggestedLucianaSeq = grazieleEndTime
        ? suggestNextSequentialSlot(grazieleEndTime, filteredLucianaSlots)
        : null;

    // Carregar horários dinamicamente ao mudar a data ou procedimentos
    useEffect(() => {
        if (!selectedDate || !isModalOpen) return;

        let isCancelled = false;

        async function fetchSlots() {
            setErrorMessage('');

            if (isDual) {
                // Buscar slots da Luciana
                setIsLoadingLucianaSlots(true);
                const resLuciana = await getAvailableSlotsAction({
                    date: selectedDate,
                    durationMinutes: lucianaDuration || 30,
                    professionalId: 'luciana-bezerra',
                });

                if (!isCancelled) {
                    if (resLuciana.success) {
                        setIsLucianaDayOpen(resLuciana.isOpen);
                        setLucianaClosedReason(resLuciana.closedReason || '');
                        setLucianaSlots(resLuciana.slots);

                        const validL = resLuciana.slots.find((s) => s.time === lucianaTime && s.available);
                        if (!validL) {
                            const firstFree = resLuciana.slots.find((s) => s.available);
                            setLucianaTime(firstFree ? firstFree.time : '');
                        }
                    }
                    setIsLoadingLucianaSlots(false);
                }

                // Buscar slots da Graziele
                setIsLoadingGrazieleSlots(true);
                const resGraziele = await getAvailableSlotsAction({
                    date: selectedDate,
                    durationMinutes: grazieleDuration || 30,
                    professionalId: 'graziele-bezerra',
                });

                if (!isCancelled) {
                    if (resGraziele.success) {
                        setIsGrazieleDayOpen(resGraziele.isOpen);
                        setGrazieleClosedReason(resGraziele.closedReason || '');
                        setGrazieleSlots(resGraziele.slots);

                        const validG = resGraziele.slots.find((s) => s.time === grazieleTime && s.available);
                        if (!validG) {
                            const firstFree = resGraziele.slots.find((s) => s.available);
                            setGrazieleTime(firstFree ? firstFree.time : '');
                        }
                    }
                    setIsLoadingGrazieleSlots(false);
                }
            } else {
                // Caso simples (1 profissional)
                setIsLoadingSlots(true);
                const targetPro = hasGraziele ? 'graziele-bezerra' : 'luciana-bezerra';
                const targetDur = hasGraziele ? grazieleDuration : lucianaDuration;

                const res = await getAvailableSlotsAction({
                    date: selectedDate,
                    durationMinutes: targetDur || 30,
                    professionalId: targetPro,
                });

                if (!isCancelled) {
                    if (res.success) {
                        setIsDayOpen(res.isOpen);
                        setClosedReason(res.closedReason || '');
                        setAvailableSlots(res.slots);

                        const currentSlotValid = res.slots.find((s) => s.time === selectedTime && s.available);
                        if (!currentSlotValid) {
                            const firstFree = res.slots.find((s) => s.available);
                            setSelectedTime(firstFree ? firstFree.time : '');
                        }
                    } else {
                        setErrorMessage(res.message || 'Não foi possível carregar os horários.');
                    }
                    setIsLoadingSlots(false);
                }
            }
        }

        fetchSlots();

        return () => {
            isCancelled = true;
        };
    }, [selectedDate, isDual, lucianaDuration, grazieleDuration, isModalOpen]);

    if (!isModalOpen) return null;

    const handleNext = () => {
        setErrorMessage('');

        if (currentStep === 1) {
            if (selectedServices.length === 0) {
                setErrorMessage('Por favor, selecione ao menos um procedimento para continuar.');
                return;
            }
        } else if (currentStep === 2) {
            if (!selectedDate) {
                setErrorMessage('Por favor, selecione a data do atendimento.');
                return;
            }

            if (isDual) {
                if (!isLucianaDayOpen) {
                    setErrorMessage(lucianaClosedReason || 'Luciana Bezerra não atenderá nesta data.');
                    return;
                }
                if (!isGrazieleDayOpen) {
                    setErrorMessage(grazieleClosedReason || 'Graziele Bezerra não atenderá nesta data.');
                    return;
                }
                if (!lucianaTime) {
                    setErrorMessage('Por favor, escolha um horário disponível para o atendimento com a Luciana.');
                    return;
                }
                if (!grazieleTime) {
                    setErrorMessage('Por favor, escolha um horário disponível para o atendimento com a Graziele.');
                    return;
                }

                const validResult = validateDualBookingSlots({
                    lucianaStartTime: lucianaTime,
                    lucianaEndTime,
                    grazieleStartTime: grazieleTime,
                    grazieleEndTime,
                });

                if (!validResult.valid) {
                    setErrorMessage(validResult.errorMessage || 'Os horários selecionados colidem entre si.');
                    return;
                }
            } else {
                if (!isDayOpen) {
                    setErrorMessage(closedReason || 'O salão não está funcionando nesta data selecionada.');
                    return;
                }
                if (!selectedTime) {
                    setErrorMessage('Por favor, escolha um dos horários disponíveis.');
                    return;
                }
            }
        } else if (currentStep === 3) {
            if (!clientName || clientName.trim().length < 2) {
                setErrorMessage('Por favor, informe seu nome completo.');
                return;
            }
            if (!clientPhone || clientPhone.trim().length < 7) {
                setErrorMessage('Por favor, informe seu WhatsApp (número do Brasil ou Lethem/Guiana).');
                return;
            }
        }

        if (currentStep < totalSteps) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        setErrorMessage('');
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const completeBooking = async () => {
        setIsSubmitting(true);
        setErrorMessage('');

        if (isDual) {
            const res = await createPublicBookingAction({
                clientName,
                clientPhone,
                notes: clientNotes,
                date: selectedDate,
                isDualBooking: true,
                lucianaBooking: {
                    startTime: lucianaTime,
                    serviceIds: lucianaServices.map((s) => s.id),
                    durationMinutes: lucianaDuration,
                },
                grazieleBooking: {
                    startTime: grazieleTime,
                    serviceIds: grazieleServices.map((s) => s.id),
                    durationMinutes: grazieleDuration,
                },
            });

            setIsSubmitting(false);

            if (res.success && res.whatsappUrl && res.appointmentId) {
                setConfirmedAppointment({
                    id: res.appointmentId,
                    whatsappUrl: res.whatsappUrl,
                    whatsappLucianaUrl: res.whatsappLucianaUrl,
                    whatsappGrazieleUrl: res.whatsappGrazieleUrl,
                    ticketText: res.ticketText || '',
                    isDual: true,
                    bookingGroupCode: res.bookingGroupCode,
                    lucianaAppointmentId: res.lucianaAppointmentId,
                    grazieleAppointmentId: res.grazieleAppointmentId,
                });

                window.open(res.whatsappUrl, '_blank');
            } else {
                setErrorMessage(res.message || 'Erro ao registrar agendamento. Verifique os horários e tente novamente.');
            }
        } else {
            const targetPro = hasGraziele ? 'graziele-bezerra' : 'luciana-bezerra';
            const res = await createPublicBookingAction({
                clientName,
                clientPhone,
                notes: clientNotes,
                date: selectedDate,
                startTime: selectedTime,
                serviceIds: selectedServices,
                professionalId: targetPro,
            });

            setIsSubmitting(false);

            if (res.success && res.whatsappUrl && res.appointmentId) {
                setConfirmedAppointment({
                    id: res.appointmentId,
                    whatsappUrl: res.whatsappUrl,
                    ticketText: res.ticketText || '',
                    isDual: false,
                });

                window.open(res.whatsappUrl, '_blank');
            } else {
                setErrorMessage(res.message || 'Erro ao registrar agendamento. Tente outro horário.');
            }
        }
    };

    const handlePhoneChange = (val: string, countryOverride?: CountryPhoneCode) => {
        const country = countryOverride || phoneCountry;
        if (val.startsWith('+592') || val.startsWith('592')) {
            setPhoneCountry('GY');
            setClientPhone(formatPhoneWithCountry(val, 'GY'));
            return;
        }
        const formatted = formatPhoneWithCountry(val, country);
        setClientPhone(formatted);
    };

    const togglePhoneCountry = (country: CountryPhoneCode) => {
        setPhoneCountry(country);
        if (clientPhone) {
            handlePhoneChange(clientPhone, country);
        }
    };

    const priceDisplay =
        totalPrice > 0
            ? hasCustomPrice
                ? `R$ ${totalPrice.toFixed(2).replace('.', ',')} (+ sob consulta)`
                : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
            : 'A consultar no WhatsApp';

    return (
        <div
            className="modal-backdrop active"
            id="bookingModal"
            onClick={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <div
                className="booking-modal"
                style={{
                    maxWidth: isDual && currentStep === 2 ? '880px' : '680px',
                    maxHeight: 'min(92vh, 92dvh)',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#FFFFFF',
                    color: '#1C1819',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
                    transition: 'max-width 0.25s ease',
                }}
            >
                {/* Modal Header com Barra de Toque para Mobile */}
                <div className="modal-header" style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5DFDC', position: 'relative', padding: '0.85rem 1.1rem 0.75rem' }}>
                    <div style={{ width: '100%' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '4px',
                                background: '#E0DAD6',
                                borderRadius: '4px',
                                margin: '0 auto 8px auto',
                            }}
                            className="mobile-drag-handle"
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.05rem, 3.8vw, 1.25rem)', color: '#1C1819', margin: 0, fontWeight: 700, lineHeight: 1.25, wordBreak: 'break-word' }}>
                                    Agendamento Online de Serviços
                                </h3>
                                <p style={{ fontSize: '0.78rem', color: '#524B4E', margin: '2px 0 0', fontWeight: 500, lineHeight: 1.3 }}>
                                    Glamour Studio • Luciana & Graziele Bezerra
                                </p>
                            </div>
                            <button
                                type="button"
                                className="modal-close-btn"
                                id="closeBookingModal"
                                aria-label="Fechar"
                                onClick={handleClose}
                                style={{ minWidth: '36px', minHeight: '36px', width: '36px', height: '36px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Progress Bar Responsiva */}
                {!confirmedAppointment && (
                    <div style={{ flexShrink: 0, backgroundColor: '#FAF7F5', borderBottom: '1px solid #E5DFDC', padding: '0.55rem 1.1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', fontSize: '0.78rem', fontWeight: 700, color: '#A68037', gap: '6px' }}>
                            <span style={{ minWidth: 0, wordBreak: 'break-word' }}>
                                Etapa {currentStep}/{totalSteps}:{' '}
                                {currentStep === 1 && 'Procedimentos'}
                                {currentStep === 2 && (isDual ? 'Horários (Luciana & Graziele)' : 'Data & Horário')}
                                {currentStep === 3 && 'Identificação'}
                                {currentStep === 4 && 'Resumo & Confirmação'}
                            </span>
                            <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>{Math.round((currentStep / totalSteps) * 100)}%</span>
                        </div>
                        <div className="modal-progress" style={{ padding: 0, background: 'transparent', border: 'none', gap: '0.35rem' }}>
                            <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}></div>
                            <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}></div>
                            <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}></div>
                            <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}></div>
                        </div>
                    </div>
                )}

                {/* Mensagem de Erro Global */}
                {errorMessage && (
                    <div
                        style={{
                            flexShrink: 0,
                            margin: '0.75rem 1.1rem 0',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '10px',
                            background: '#FFF5F5',
                            border: '1.5px solid #FFA8A8',
                            color: '#C92A2A',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            lineHeight: 1.35,
                        }}
                    >
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                        <span style={{ minWidth: 0, wordBreak: 'break-word' }}>{errorMessage}</span>
                    </div>
                )}

                {/* Modal Body */}
                <div className="modal-body" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '1rem 1.1rem' }}>
                    {/* TELA DE SUCESSO / CONFIRMAÇÃO */}
                    {confirmedAppointment ? (
                        <div style={{ textAlign: 'center', padding: '0.75rem 0.25rem' }}>
                            <div
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    background: '#E6F7ED',
                                    color: '#2B8A3E',
                                    fontSize: '1.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                    border: '2px solid #51CF66',
                                }}
                            >
                                ✓
                            </div>
                            <h3 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.35rem)', fontWeight: 700, margin: '0 0 0.4rem', color: '#1C1819', lineHeight: 1.3 }}>
                                {confirmedAppointment.isDual ? 'Agendamentos Combinados Registrados com Sucesso!' : 'Agendamento Registrado com Sucesso!'}
                            </h3>
                            <p style={{ color: '#524B4E', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto 1.25rem', lineHeight: 1.45 }}>
                                Seus horários foram reservados com exclusividade nas agendas específicas de cada especialista sob o código{' '}
                                <strong style={{ color: '#A68037', fontWeight: 800 }}>
                                    #{confirmedAppointment.bookingGroupCode || confirmedAppointment.id.slice(-6).toUpperCase()}
                                </strong>
                                .
                            </p>

                            <div
                                style={{
                                    background: '#FAF7F5',
                                    border: '1.5px solid #E5DFDC',
                                    borderRadius: '14px',
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.88rem',
                                    maxWidth: '560px',
                                    margin: '0 auto 1.25rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.65rem',
                                    color: '#1C1819',
                                }}
                            >
                                <div style={{ wordBreak: 'break-word' }}><strong>Cliente:</strong> {clientName} ({clientPhone})</div>
                                <div><strong>Data do Atendimento:</strong> {selectedDate.split('-').reverse().join('/')}</div>

                                {confirmedAppointment.isDual ? (
                                    <>
                                        <div style={{ padding: '8px 12px', background: '#FFF5F7', borderRadius: '10px', borderLeft: '4px solid #9B2C4D', border: '1px solid #F3C5D1', borderLeftWidth: '4px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                                <span style={{ fontWeight: 700, color: '#8A1C3E', fontSize: '0.88rem' }}>💇‍♀️ Luciana Bezerra (Cabelos & Unhas)</span>
                                                {confirmedAppointment.lucianaAppointmentId && (
                                                    <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#F3C5D1', color: '#8A1C3E', padding: '2px 6px', borderRadius: '4px' }}>
                                                        #{confirmedAppointment.lucianaAppointmentId.slice(-6).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '2px', color: '#1C1819', fontSize: '0.84rem' }}>Horário: <strong>{lucianaTime} às {lucianaEndTime}</strong> (⏱️ {lucianaDurationFormatted})</div>
                                            <div style={{ fontSize: '0.8rem', color: '#524B4E', marginTop: '2px', wordBreak: 'break-word' }}>Procedimentos: {lucianaServices.map((s) => s.name).join(', ')}</div>
                                        </div>

                                        <div style={{ padding: '8px 12px', background: '#FFF8FA', borderRadius: '10px', borderLeft: '4px solid #A33B6E', border: '1px solid #F5CEDB', borderLeftWidth: '4px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                                <span style={{ fontWeight: 700, color: '#922B5C', fontSize: '0.88rem' }}>🌸 Graziele Bezerra (Sobrancelhas & Depilação)</span>
                                                {confirmedAppointment.grazieleAppointmentId && (
                                                    <span style={{ fontSize: '0.74rem', fontWeight: 700, background: '#F5CEDB', color: '#922B5C', padding: '2px 6px', borderRadius: '4px' }}>
                                                        #{confirmedAppointment.grazieleAppointmentId.slice(-6).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '2px', color: '#1C1819', fontSize: '0.84rem' }}>Horário: <strong>{grazieleTime} às {grazieleEndTime}</strong> (⏱️ {grazieleDurationFormatted})</div>
                                            <div style={{ fontSize: '0.8rem', color: '#524B4E', marginTop: '2px', wordBreak: 'break-word' }}>Procedimentos: {grazieleServices.map((s) => s.name).join(', ')}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div><strong>Código do Agendamento:</strong> <span style={{ color: '#A68037', fontWeight: 700 }}>#{confirmedAppointment.id.slice(-6).toUpperCase()}</span></div>
                                        <div><strong>Especialista:</strong> {hasLuciana ? 'Luciana Bezerra' : 'Graziele Bezerra'}</div>
                                        <div><strong>Horário:</strong> {selectedTime} às {singleEndTime} (⏱️ {durationFormatted})</div>
                                        <div style={{ wordBreak: 'break-word' }}><strong>Procedimento(s):</strong> {chosenServices.map((s) => s.name).join(', ')}</div>
                                    </>
                                )}

                                <div style={{ borderTop: '1px solid #E5DFDC', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                    <span style={{ fontWeight: 600, color: '#524B4E' }}>Valor Estimado:</span>
                                    <span style={{ color: '#A68037', fontWeight: 800, fontSize: '1.05rem' }}>{priceDisplay}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: '440px', margin: '0 auto' }}>
                                <a
                                    href={confirmedAppointment.whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp"
                                    style={{ padding: '0.85rem 1.25rem', fontSize: '0.95rem', fontWeight: 700, minHeight: '48px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    💬 Abrir Confirmação no WhatsApp
                                </a>

                                {confirmedAppointment.isDual && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', width: '100%' }}>
                                        <a
                                            href={confirmedAppointment.whatsappLucianaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: '#FFFFFF', color: '#8A1C3E', border: '1.5px solid #F3C5D1', fontWeight: 700, minHeight: '42px', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                                        >
                                            💇‍♀️ WhatsApp Luciana
                                        </a>
                                        <a
                                            href={confirmedAppointment.whatsappGrazieleUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: '#FFFFFF', color: '#922B5C', border: '1.5px solid #F5CEDB', fontWeight: 700, minHeight: '42px', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                                        >
                                            🌸 WhatsApp Graziele
                                        </a>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                    style={{ backgroundColor: '#FAF7F5', color: '#1C1819', border: '1px solid #E5DFDC', minHeight: '44px', width: '100%', fontWeight: 600 }}
                                >
                                    Concluir & Fechar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* ETAPA 1: Seleção de Serviços */}
                            <div className={`step-container ${currentStep === 1 ? 'active' : ''}`} id="step1">
                                <h4 className="step-title" style={{ color: '#1C1819', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.3rem' }}>1. Escolha o(s) Procedimento(s)</h4>
                                <p className="step-subtitle" style={{ color: '#524B4E', fontSize: '0.84rem', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                                    Você pode selecionar serviços da <strong>Luciana</strong> (Cabelos/Unhas) e da <strong>Graziele</strong> (Sobrancelhas/Depilação) juntos! Na próxima etapa você definirá o horário de cada uma.
                                </p>

                                {/* Alerta de serviço selecionado */}
                                {selectedServices.length > 0 && (
                                    <div id="modalSelectedAlert" className="modal-selected-alert" style={{ display: 'flex', flexDirection: 'column', gap: '3px', backgroundColor: '#FAF6EE', border: '1.5px solid #DFC79B', padding: '0.7rem 0.85rem', borderRadius: '10px', marginBottom: '0.85rem' }}>
                                        <div className="modal-selected-alert-text" style={{ color: '#1C1819', fontSize: '0.84rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                            ✨ <strong>{selectedServices.length} serviço(s) selecionado(s)</strong> • ⏱️ <strong>{durationFormatted}</strong> • Total: <strong style={{ color: '#A68037' }}>{priceDisplay}</strong>
                                        </div>
                                        {isDual && (
                                            <div style={{ fontSize: '0.78rem', color: '#2B8A3E', fontWeight: 700, lineHeight: 1.35 }}>
                                                ✓ Atendimento Combinado: Luciana ({lucianaServices.length} serviços, {lucianaDurationFormatted}) + Graziele ({grazieleServices.length} serviços, {grazieleDurationFormatted})
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Barra de Busca e Filtros de Categoria */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.85rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="🔍 Buscar procedimento (ex: progressiva, botox, henna...)"
                                            value={step1Search}
                                            onChange={(e) => setStep1Search(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 12px',
                                                borderRadius: '10px',
                                                border: '1.5px solid #E5DFDC',
                                                fontSize: '16px',
                                                backgroundColor: '#FFFFFF',
                                                color: '#1C1819',
                                                fontWeight: 500,
                                                minHeight: '44px',
                                            }}
                                        />
                                        {step1Search && (
                                            <button
                                                type="button"
                                                onClick={() => setStep1Search('')}
                                                style={{
                                                    position: 'absolute',
                                                    right: '10px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#887E82',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    padding: '6px',
                                                }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Abas Rápidas de Categorias */}
                                    <div
                                        className="no-scrollbar"
                                        style={{
                                            display: 'flex',
                                            gap: '6px',
                                            overflowX: 'auto',
                                            paddingBottom: '4px',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                        }}
                                    >
                                        {[
                                            { id: 'all', name: '✨ Todos' },
                                            { id: 'cabelo', name: '💇‍♀️ Cabelos' },
                                            { id: 'sobrancelhas', name: '👁️ Sobrancelhas' },
                                            { id: 'depilacao', name: '🌸 Depilação' },
                                            { id: 'unhas', name: '💅 Manicure' },
                                        ].map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setStep1Category(cat.id)}
                                                style={{
                                                    flexShrink: 0,
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    border: step1Category === cat.id ? '1.5px solid #C5A059' : '1px solid #E5DFDC',
                                                    background: step1Category === cat.id ? '#FAF6EE' : '#FFFFFF',
                                                    color: step1Category === cat.id ? '#A68037' : '#524B4E',
                                                    fontWeight: step1Category === cat.id ? 700 : 600,
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                    minHeight: '34px',
                                                    touchAction: 'manipulation',
                                                }}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sugestões rápidas de combos */}
                                <div className="modal-quick-combos" style={{ backgroundColor: '#FAF7F5', border: '1px solid #E5DFDC', padding: '0.65rem 0.85rem', borderRadius: '12px', marginBottom: '0.85rem' }}>
                                    <div className="modal-quick-combos-title" style={{ color: '#1C1819', fontWeight: 700, fontSize: '0.8rem', marginBottom: '6px' }}>
                                        <span>💡</span> Sugestões para adicionar com 1 clique:
                                    </div>
                                    <div className="modal-combos-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        <button
                                            type="button"
                                            className={`combo-chip-btn ${selectedServices.includes('manicure-mao') ? 'selected' : ''}`}
                                            onClick={() => toggleService('manicure-mao')}
                                            style={{ touchAction: 'manipulation', fontSize: '0.78rem', padding: '5px 9px' }}
                                        >
                                            💅 + Manicure (Luciana)
                                        </button>
                                        <button
                                            type="button"
                                            className={`combo-chip-btn ${selectedServices.includes('designer-personalizado') ? 'selected' : ''}`}
                                            onClick={() => toggleService('designer-personalizado')}
                                            style={{ touchAction: 'manipulation', fontSize: '0.78rem', padding: '5px 9px' }}
                                        >
                                            👁️ + Sobrancelha (Graziele)
                                        </button>
                                        <button
                                            type="button"
                                            className={`combo-chip-btn ${selectedServices.includes('depilacao-axilas') ? 'selected' : ''}`}
                                            onClick={() => toggleService('depilacao-axilas')}
                                            style={{ touchAction: 'manipulation', fontSize: '0.78rem', padding: '5px 9px' }}
                                        >
                                            🌸 + Depilação Axilas (Graziele)
                                        </button>
                                        <button
                                            type="button"
                                            className={`combo-chip-btn ${selectedServices.includes('hidratacao-escova') ? 'selected' : ''}`}
                                            onClick={() => toggleService('hidratacao-escova')}
                                            style={{ touchAction: 'manipulation', fontSize: '0.78rem', padding: '5px 9px' }}
                                        >
                                            💇‍♀️ + Hidratação (Luciana)
                                        </button>
                                    </div>
                                </div>

                                <div className="modal-services-select" id="modalServicesList" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                    {salonData.services
                                        .filter((s) => {
                                             const matchCat = step1Category === 'all' || s.category === step1Category;
                                             const matchSearch =
                                                 !step1Search ||
                                                 s.name.toLowerCase().includes(step1Search.toLowerCase()) ||
                                                 s.description.toLowerCase().includes(step1Search.toLowerCase()) ||
                                                 s.professionalName.toLowerCase().includes(step1Search.toLowerCase());
                                             return matchCat && matchSearch;
                                         })
                                        .map((service) => {
                                            const isSelected = selectedServices.includes(service.id);
                                            const proIcon = service.professionalId === 'luciana-bezerra' ? '💇‍♀️' : '🌸';
                                            return (
                                                <div
                                                    key={service.id}
                                                    className={`modal-service-option ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => toggleService(service.id)}
                                                    style={{
                                                        backgroundColor: isSelected ? '#FAF6EE' : '#FFFFFF',
                                                        borderColor: isSelected ? '#C5A059' : '#E5DFDC',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '0.75rem 0.85rem',
                                                        borderRadius: '12px',
                                                        border: isSelected ? '2px solid #C5A059' : '1.5px solid #E5DFDC',
                                                        cursor: 'pointer',
                                                        gap: '8px',
                                                        touchAction: 'manipulation',
                                                        minHeight: '48px',
                                                    }}
                                                >
                                                    <div className="modal-service-left" style={{ flex: '1 1 auto', minWidth: 0 }}>
                                                        <div className="modal-service-name" style={{ color: '#1C1819', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.3, wordBreak: 'break-word' }}>
                                                            <span>{isSelected ? '✓ ' : ''}{service.name}</span>
                                                        </div>
                                                        <div className="modal-service-pro" style={{ color: '#524B4E', fontSize: '0.76rem', marginTop: '2px', lineHeight: 1.3 }}>
                                                            {proIcon} {service.professionalName} • ⏱️ {service.duration}
                                                        </div>
                                                    </div>
                                                    <div className="modal-service-price" style={{ color: '#A68037', fontWeight: 700, fontSize: '0.92rem', flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right' }}>
                                                        {service.priceDisplay || (service.price > 0 ? `R$ ${service.price.toFixed(2).replace('.', ',')}` : 'Sob consulta')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* ETAPA 2: Horários Independentes com Alto Contraste */}
                            <div className={`step-container ${currentStep === 2 ? 'active' : ''}`} id="step2">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                                    <h4 className="step-title" style={{ margin: 0, color: '#1C1819', fontWeight: 700, fontSize: '1.15rem' }}>
                                        2. {isDual ? 'Agendas de Luciana & Graziele' : 'Data & Horário'}
                                    </h4>
                                    <button type="button" className="btn-change-services" onClick={() => setCurrentStep(1)} style={{ fontSize: '0.8rem', touchAction: 'manipulation' }}>
                                        ✏️ + Alterar procedimentos
                                    </button>
                                </div>

                                <p className="step-subtitle" style={{ color: '#524B4E', fontSize: '0.84rem', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                                    {isDual
                                        ? 'Cada profissional possui sua agenda específica. Escolha a data e o horário disponível para cada uma sem sobreposição.'
                                        : `Duração calculada: ${durationFormatted}. Escolha o melhor horário disponível.`}
                                </p>

                                {/* Seletor Global de Data */}
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                        <label className="form-label" htmlFor="bookingDate" style={{ margin: 0, color: '#1C1819', fontWeight: 700, fontSize: '0.84rem' }}>
                                            📅 Data do Atendimento:
                                        </label>
                                        {selectedDate && (
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8A1C3E', backgroundColor: '#FFF5F7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #F3C5D1' }}>
                                                {formatDateToBR(selectedDate)} ({getWeekdayName(selectedDate)})
                                            </span>
                                        )}
                                    </div>

                                    {/* Chips de Escolha Rápida de Dias */}
                                    <div
                                        className="no-scrollbar"
                                        style={{
                                            display: 'flex',
                                            gap: '6px',
                                            overflowX: 'auto',
                                            paddingBottom: '4px',
                                            marginBottom: '8px',
                                            WebkitOverflowScrolling: 'touch',
                                            scrollbarWidth: 'none',
                                        }}
                                    >
                                        {getUpcomingDates(8).map((d) => {
                                            const isSelected = selectedDate === d.dateStr;
                                            return (
                                                <button
                                                    key={d.dateStr}
                                                    type="button"
                                                    disabled={d.isSunday}
                                                    onClick={() => setSelectedDate(d.dateStr)}
                                                    style={{
                                                        flexShrink: 0,
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        border: isSelected
                                                            ? '1.5px solid #A68037'
                                                            : d.isSunday
                                                            ? '1px dashed #E5DFDC'
                                                            : '1.5px solid #E5DFDC',
                                                        background: isSelected
                                                            ? '#FAF6EE'
                                                            : d.isSunday
                                                            ? '#FAF7F5'
                                                            : '#FFFFFF',
                                                        color: isSelected
                                                            ? '#A68037'
                                                            : d.isSunday
                                                            ? '#A09699'
                                                            : '#1C1819',
                                                        fontWeight: isSelected ? 700 : 600,
                                                        fontSize: '0.8rem',
                                                        cursor: d.isSunday ? 'not-allowed' : 'pointer',
                                                        opacity: d.isSunday ? 0.6 : 1,
                                                        whiteSpace: 'nowrap',
                                                        minHeight: '34px',
                                                        touchAction: 'manipulation',
                                                    }}
                                                >
                                                    {d.label} {d.isSunday ? '(Fechado)' : ''}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <input
                                        type="date"
                                        id="bookingDate"
                                        lang="pt-BR"
                                        className="form-control"
                                        value={selectedDate}
                                        min={getBrazilTodayDateString()}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={{ fontSize: '16px', backgroundColor: '#FFFFFF', color: '#1C1819', border: '1.5px solid #C5A059', fontWeight: 600, minHeight: '46px', width: '100%', borderRadius: '10px', padding: '10px 12px' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.76rem', color: '#524B4E' }}>
                                            Formato: <strong>DD/MM/AAAA</strong> • De Segunda a Sábado das 10h às 18h.
                                        </span>
                                    </div>
                                </div>

                                {/* CASO DUAL: DUAS AGENDAS COM ALTO CONTRASTE */}
                                {isDual ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                        {/* BANNER DE INSTRUÇÃO E LINHA DO TEMPO */}
                                        <div
                                            style={{
                                                padding: '0.75rem 0.85rem',
                                                background: '#FAF6EE',
                                                border: '1.5px solid #DFC79B',
                                                borderRadius: '10px',
                                                fontSize: '0.82rem',
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, color: '#A68037', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem' }}>
                                                <span>✨</span> Agendamento Duplo Anti-Conflito
                                            </div>
                                            <div style={{ color: '#524B4E', fontSize: '0.78rem', lineHeight: 1.35 }}>
                                                Ao marcar o horário da 1ª profissional, a agenda da 2ª bloqueará horários sobrepostos, liberando atendimentos em sequência ou horários livres.
                                            </div>

                                            {/* Linha do tempo visual */}
                                            {lucianaTime && grazieleTime && (
                                                <div
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.45rem 0.75rem',
                                                        borderRadius: '8px',
                                                        background: '#E6F7ED',
                                                        border: '1.5px solid #51CF66',
                                                        color: '#0F5132',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        flexWrap: 'wrap',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    <span>✓</span>
                                                    <span>
                                                        <strong>Ordem:</strong>{' '}
                                                        {lucianaTime <= grazieleTime
                                                            ? `💇‍♀️ Luciana (${lucianaTime} às ${lucianaEndTime}) ➔ 🌸 Graziele (${grazieleTime} às ${grazieleEndTime})`
                                                            : `🌸 Graziele (${grazieleTime} às ${grazieleEndTime}) ➔ 💇‍♀️ Luciana (${lucianaTime} às ${lucianaEndTime})`}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.85rem' }}>
                                            {/* AGENDA 1: LUCIANA BEZERRA (ALTO CONTRASTE) */}
                                            <div
                                                style={{
                                                    background: '#FFF9FA',
                                                    border: '1.5px solid #F3C5D1',
                                                    borderRadius: '12px',
                                                    padding: '0.9rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.65rem',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                                        <span style={{ fontWeight: 800, color: '#8A1C3E', fontSize: '0.92rem' }}>
                                                            💇‍♀️ 1. Luciana Bezerra
                                                        </span>
                                                        <span style={{ fontSize: '0.72rem', background: '#FBE0E7', color: '#8A1C3E', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                                                            ⏱️ {lucianaDurationFormatted}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.76rem', color: '#524B4E', marginTop: '2px', fontWeight: 500, wordBreak: 'break-word' }}>
                                                        {lucianaServices.map((s) => s.name).join(', ')}
                                                    </div>
                                                </div>

                                                {/* Chip de sugestão sequencial */}
                                                {suggestedLucianaSeq && suggestedLucianaSeq !== lucianaTime && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setLucianaTime(suggestedLucianaSeq)}
                                                        style={{
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: '#FFF4D9',
                                                            border: '1.5px solid #E6B800',
                                                            color: '#7A4E00',
                                                            fontSize: '0.76rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            touchAction: 'manipulation',
                                                        }}
                                                    >
                                                        ⚡ Agendar em sequência às <strong>{suggestedLucianaSeq}</strong> (após Graziele)
                                                    </button>
                                                )}

                                                {/* Grade de Slots Luciana */}
                                                {!isLucianaDayOpen ? (
                                                    <div style={{ padding: '0.75rem', background: '#FFF5F5', color: '#C92A2A', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, border: '1px solid #FFA8A8' }}>
                                                        🔒 {lucianaClosedReason || 'Indisponível nesta data'}
                                                    </div>
                                                ) : isLoadingLucianaSlots ? (
                                                    <div style={{ fontSize: '0.82rem', color: '#A68037', textAlign: 'center', padding: '0.75rem', fontWeight: 600 }}>
                                                        🔄 Buscando agenda da Luciana...
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 68px), 1fr))', gap: '5px', maxHeight: '180px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                                        {filteredLucianaSlots.map((slot) => {
                                                            const isSelected = lucianaTime === slot.time;
                                                            return (
                                                                <button
                                                                    key={slot.time}
                                                                    type="button"
                                                                    disabled={!slot.available}
                                                                    onClick={() => slot.available && setLucianaTime(slot.time)}
                                                                    title={slot.reason || 'Horário disponível para Luciana'}
                                                                    style={{
                                                                        padding: '5px 2px',
                                                                        borderRadius: '8px',
                                                                        border: isSelected ? '2px solid #8A1C3E' : slot.available ? '1.5px solid #E5DFDC' : '1px dashed #DDD',
                                                                        background: isSelected ? '#9B2C4D' : slot.available ? '#FFFFFF' : '#F0ECEB',
                                                                        color: isSelected ? '#FFFFFF' : slot.available ? '#1C1819' : '#887E82',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.8rem',
                                                                        cursor: slot.available ? 'pointer' : 'not-allowed',
                                                                        opacity: slot.available ? 1 : 0.55,
                                                                        boxShadow: isSelected ? '0 2px 8px rgba(155, 44, 77, 0.35)' : 'none',
                                                                        minHeight: '44px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        touchAction: 'manipulation',
                                                                    }}
                                                                >
                                                                    <div>{slot.time}</div>
                                                                    <div style={{ fontSize: '0.64rem', opacity: isSelected ? 0.95 : 0.75, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                                        {slot.available ? `até ${slot.endTime}` : 'Ocupado'}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {lucianaTime && (
                                                    <div style={{ fontSize: '0.78rem', color: '#0F5132', fontWeight: 700, background: '#E6F7ED', padding: '4px 8px', borderRadius: '6px', border: '1px solid #A3E635' }}>
                                                        ✓ Horário: {lucianaTime} às {lucianaEndTime}
                                                    </div>
                                                )}
                                            </div>

                                            {/* AGENDA 2: GRAZIELE BEZERRA (ALTO CONTRASTE) */}
                                            <div
                                                style={{
                                                    background: '#FFFBFD',
                                                    border: '1.5px solid #F5CEDB',
                                                    borderRadius: '12px',
                                                    padding: '0.9rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.65rem',
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                                        <span style={{ fontWeight: 800, color: '#922B5C', fontSize: '0.92rem' }}>
                                                            🌸 2. Graziele Bezerra
                                                        </span>
                                                        <span style={{ fontSize: '0.72rem', background: '#FCE4ED', color: '#922B5C', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                                                            ⏱️ {grazieleDurationFormatted}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.76rem', color: '#524B4E', marginTop: '2px', fontWeight: 500, wordBreak: 'break-word' }}>
                                                        {grazieleServices.map((s) => s.name).join(', ')}
                                                    </div>
                                                </div>

                                                {/* Chip de sugestão sequencial */}
                                                {suggestedGrazieleSeq && suggestedGrazieleSeq !== grazieleTime && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setGrazieleTime(suggestedGrazieleSeq)}
                                                        style={{
                                                            padding: '0.45rem 0.65rem',
                                                            borderRadius: '8px',
                                                            background: '#FFF4D9',
                                                            border: '1.5px solid #E6B800',
                                                            color: '#7A4E00',
                                                            fontSize: '0.76rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            touchAction: 'manipulation',
                                                        }}
                                                    >
                                                        ⚡ Agendar em sequência às <strong>{suggestedGrazieleSeq}</strong> (após Luciana)
                                                    </button>
                                                )}

                                                {/* Grade de Slots Graziele */}
                                                {!isGrazieleDayOpen ? (
                                                    <div style={{ padding: '0.75rem', background: '#FFF5F5', color: '#C92A2A', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, border: '1px solid #FFA8A8' }}>
                                                        🔒 {grazieleClosedReason || 'Indisponível nesta data'}
                                                    </div>
                                                ) : isLoadingGrazieleSlots ? (
                                                    <div style={{ fontSize: '0.82rem', color: '#A68037', textAlign: 'center', padding: '0.75rem', fontWeight: 600 }}>
                                                        🔄 Buscando agenda da Graziele...
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 68px), 1fr))', gap: '5px', maxHeight: '180px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                                        {filteredGrazieleSlots.map((slot) => {
                                                            const isSelected = grazieleTime === slot.time;
                                                            return (
                                                                <button
                                                                    key={slot.time}
                                                                    type="button"
                                                                    disabled={!slot.available}
                                                                    onClick={() => slot.available && setGrazieleTime(slot.time)}
                                                                    title={slot.reason || 'Horário disponível para Graziele'}
                                                                    style={{
                                                                        padding: '5px 2px',
                                                                        borderRadius: '8px',
                                                                        border: isSelected ? '2px solid #922B5C' : slot.available ? '1.5px solid #E5DFDC' : '1px dashed #DDD',
                                                                        background: isSelected ? '#A33B6E' : slot.available ? '#FFFFFF' : '#F0ECEB',
                                                                        color: isSelected ? '#FFFFFF' : slot.available ? '#1C1819' : '#887E82',
                                                                        fontWeight: 700,
                                                                        fontSize: '0.8rem',
                                                                        cursor: slot.available ? 'pointer' : 'not-allowed',
                                                                        opacity: slot.available ? 1 : 0.55,
                                                                        boxShadow: isSelected ? '0 2px 8px rgba(163, 59, 110, 0.35)' : 'none',
                                                                        minHeight: '44px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        touchAction: 'manipulation',
                                                                    }}
                                                                >
                                                                    <div>{slot.time}</div>
                                                                    <div style={{ fontSize: '0.64rem', opacity: isSelected ? 0.95 : 0.75, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                                        {slot.available ? `até ${slot.endTime}` : 'Ocupado'}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {grazieleTime && (
                                                    <div style={{ fontSize: '0.78rem', color: '#0F5132', fontWeight: 700, background: '#E6F7ED', padding: '4px 8px', borderRadius: '6px', border: '1px solid #A3E635' }}>
                                                        ✓ Horário: {grazieleTime} às {grazieleEndTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* CASO SIMPLES: APENAS 1 ESPECIALISTA (ALTO CONTRASTE) */
                                    <div className="form-group custom-time-wrapper" style={{ padding: '0.85rem', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '4px' }}>
                                            <label className="form-label" style={{ margin: 0, color: '#1C1819', fontWeight: 700, fontSize: '0.84rem' }}>
                                                🕒 Horários para {hasLuciana ? 'Luciana' : 'Graziele'} ({durationFormatted}):
                                            </label>
                                            {isLoadingSlots && (
                                                <span style={{ fontSize: '0.78rem', color: '#A68037', fontWeight: 700 }}>
                                                    🔄 Atualizando...
                                                </span>
                                            )}
                                        </div>

                                        {!isDayOpen ? (
                                            <div
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: '10px',
                                                    background: '#FFF5F5',
                                                    border: '1.5px solid #FFA8A8',
                                                    textAlign: 'center',
                                                    color: '#C92A2A',
                                                    fontSize: '0.88rem',
                                                    margin: '0.4rem 0',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>🔒</div>
                                                <strong>{closedReason || 'Salão Fechado Nesta Data'}</strong>
                                            </div>
                                        ) : availableSlots.length === 0 && !isLoadingSlots ? (
                                            <div style={{ padding: '1rem', textAlign: 'center', color: '#524B4E', fontSize: '0.86rem', background: '#FAF7F5', borderRadius: '10px', border: '1px solid #E5DFDC' }}>
                                                Nenhum horário disponível para esta data.
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: '0.4rem' }}>
                                                <div
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 78px), 1fr))',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    {availableSlots.map((slot) => {
                                                        const isSelected = selectedTime === slot.time;
                                                        return (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                disabled={!slot.available}
                                                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                                                title={slot.reason || 'Horário disponível'}
                                                                style={{
                                                                    padding: '6px 3px',
                                                                    borderRadius: '8px',
                                                                    border: isSelected
                                                                        ? '2px solid #9E7A32'
                                                                        : slot.available
                                                                        ? '1.5px solid #E5DFDC'
                                                                        : '1px dashed #DDD',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.85rem',
                                                                    background: isSelected
                                                                        ? '#C5A059'
                                                                        : slot.available
                                                                        ? '#FFFFFF'
                                                                        : '#F0ECEB',
                                                                    color: isSelected
                                                                        ? '#FFFFFF'
                                                                        : slot.available
                                                                        ? '#1C1819'
                                                                        : '#887E82',
                                                                    cursor: slot.available ? 'pointer' : 'not-allowed',
                                                                    opacity: slot.available ? 1 : 0.5,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '2px',
                                                                    boxShadow: isSelected ? '0 3px 10px rgba(197, 160, 89, 0.35)' : 'none',
                                                                    minHeight: '46px',
                                                                    touchAction: 'manipulation',
                                                                }}
                                                            >
                                                                <span>{slot.time}</span>
                                                                <span style={{ fontSize: '0.68rem', opacity: isSelected ? 0.95 : 0.75, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                                    {slot.available ? `até ${slot.endTime}` : slot.reason || 'Ocupado'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {selectedTime && (
                                                    <div
                                                        style={{
                                                            marginTop: '0.65rem',
                                                            padding: '0.55rem 0.75rem',
                                                            borderRadius: '8px',
                                                            background: '#E6F7ED',
                                                            border: '1.5px solid #51CF66',
                                                            color: '#0F5132',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                        }}
                                                    >
                                                        <span>✓</span>
                                                        <span>
                                                            Horário selecionado: <strong>{selectedTime} às {singleEndTime}</strong> ({durationFormatted})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ETAPA 3: Dados de Identificação (ALTO CONTRASTE) */}
                            <div className={`step-container ${currentStep === 3 ? 'active' : ''}`} id="step3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                                    <h4 className="step-title" style={{ margin: 0, color: '#1C1819', fontWeight: 700, fontSize: '1.15rem' }}>3. Identificação do Agendamento</h4>
                                    <button type="button" className="btn-change-services" onClick={() => setCurrentStep(1)} style={{ fontSize: '0.8rem', touchAction: 'manipulation' }}>
                                        ✏️ Alterar procedimentos
                                    </button>
                                </div>
                                <p className="step-subtitle" style={{ color: '#524B4E', fontSize: '0.84rem', lineHeight: 1.4, marginBottom: '0.85rem' }}>Informe seu nome e WhatsApp para registro e confirmação dos horários.</p>

                                <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                                    <label className="form-label" htmlFor="clientName" style={{ color: '#1C1819', fontWeight: 700, fontSize: '0.84rem', marginBottom: '4px' }}>Seu Nome Completo *</label>
                                    <input
                                        type="text"
                                        id="clientName"
                                        className="form-control"
                                        placeholder="Digite seu nome completo..."
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        style={{ backgroundColor: '#FFFFFF', color: '#1C1819', border: '1.5px solid #E5DFDC', fontWeight: 500, fontSize: '16px', minHeight: '46px', borderRadius: '10px' }}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                        <label className="form-label" htmlFor="clientPhone" style={{ margin: 0, color: '#1C1819', fontWeight: 700, fontSize: '0.84rem' }}>
                                            WhatsApp para Contato & Confirmação *
                                        </label>
                                        <div style={{ display: 'flex', gap: '6px', width: '100%', maxWidth: '320px' }}>
                                            <button
                                                type="button"
                                                onClick={() => togglePhoneCountry('BR')}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 8px',
                                                    borderRadius: '8px',
                                                    border: phoneCountry === 'BR' ? '1.5px solid #C5A059' : '1px solid #E5DFDC',
                                                    background: phoneCountry === 'BR' ? '#FAF6EE' : '#FFFFFF',
                                                    color: phoneCountry === 'BR' ? '#A68037' : '#524B4E',
                                                    fontWeight: phoneCountry === 'BR' ? 700 : 600,
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    minHeight: '38px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    touchAction: 'manipulation',
                                                }}
                                            >
                                                🇧🇷 Brasil (+55)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => togglePhoneCountry('GY')}
                                                style={{
                                                    flex: 1,
                                                    padding: '6px 8px',
                                                    borderRadius: '8px',
                                                    border: phoneCountry === 'GY' ? '1.5px solid #C5A059' : '1px solid #E5DFDC',
                                                    background: phoneCountry === 'GY' ? '#FAF6EE' : '#FFFFFF',
                                                    color: phoneCountry === 'GY' ? '#A68037' : '#524B4E',
                                                    fontWeight: phoneCountry === 'GY' ? 700 : 600,
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    minHeight: '38px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    touchAction: 'manipulation',
                                                }}
                                            >
                                                🇬🇾 Lethem (+592)
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        id="clientPhone"
                                        inputMode="tel"
                                        className="form-control"
                                        placeholder={phoneCountry === 'GY' ? '+592 612-3456' : '(95) 98400-0000'}
                                        value={clientPhone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        style={{ backgroundColor: '#FFFFFF', color: '#1C1819', border: '1.5px solid #E5DFDC', fontWeight: 600, fontSize: '16px', minHeight: '46px', borderRadius: '10px' }}
                                    />
                                    <span style={{ fontSize: '0.76rem', color: '#524B4E', display: 'block', marginTop: '4px', lineHeight: 1.3 }}>
                                        {phoneCountry === 'GY'
                                            ? '🇬🇾 Lethem / Guiana: Digite os 7 dígitos do celular (ex: 612-3456).'
                                            : '🇧🇷 Brasil: Digite DDD + número (ex: 95 98400-0000).'}
                                    </span>
                                </div>

                                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                    <label className="form-label" htmlFor="clientNotes" style={{ color: '#1C1819', fontWeight: 700, fontSize: '0.84rem', marginBottom: '4px' }}>Observações (opcional)</label>
                                    <textarea
                                        id="clientNotes"
                                        className="form-control"
                                        rows={2}
                                        placeholder="Ex: Primeira vez no salão, preferência de tom/esmalte, etc..."
                                        value={clientNotes}
                                        onChange={(e) => setClientNotes(e.target.value)}
                                        style={{ backgroundColor: '#FFFFFF', color: '#1C1819', border: '1.5px solid #E5DFDC', fontWeight: 500, fontSize: '16px', borderRadius: '10px', minHeight: '64px' }}
                                    ></textarea>
                                </div>
                            </div>

                            {/* ETAPA 4: Resumo & Confirmação (ALTO CONTRASTE) */}
                            <div className={`step-container ${currentStep === 4 ? 'active' : ''}`} id="step4">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.35rem' }}>
                                    <h4 className="step-title" style={{ margin: 0, color: '#1C1819', fontWeight: 700, fontSize: '1.15rem' }}>4. Resumo do Agendamento</h4>
                                    <button type="button" className="btn-change-services" onClick={() => setCurrentStep(1)} style={{ fontSize: '0.8rem', touchAction: 'manipulation' }}>
                                        ✏️ + Alterar serviços
                                    </button>
                                </div>
                                <p className="step-subtitle" style={{ color: '#524B4E', fontSize: '0.84rem', lineHeight: 1.4, marginBottom: '0.85rem' }}>Revise os detalhes abaixo antes de confirmar o agendamento.</p>

                                <div className="booking-summary-card" style={{ backgroundColor: '#FAF7F5', border: '1.5px solid #E5DFDC', color: '#1C1819', padding: '0.9rem', borderRadius: '12px' }}>
                                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                        <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>Cliente:</span>
                                        <strong style={{ color: '#1C1819', textAlign: 'right', wordBreak: 'break-word' }}>{clientName} ({clientPhone})</strong>
                                    </div>
                                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                        <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>Data:</span>
                                        <strong style={{ color: '#A68037', fontWeight: 800, textAlign: 'right' }}>
                                            {selectedDate.split('-').reverse().join('/')}
                                        </strong>
                                    </div>

                                    {isDual ? (
                                        <>
                                            <div style={{ background: '#FFF5F7', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #9B2C4D', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 800, color: '#8A1C3E', fontSize: '0.86rem' }}>💇‍♀️ 1. Luciana Bezerra ({lucianaTime} às {lucianaEndTime}):</span>
                                                <div style={{ paddingLeft: '6px', fontSize: '0.82rem', color: '#1C1819', marginTop: '2px' }}>
                                                    {lucianaServices.map((s) => (
                                                        <div key={s.id} style={{ wordBreak: 'break-word' }}>• {s.name} {s.price > 0 ? `(R$ ${s.price.toFixed(2).replace('.', ',')})` : ''}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ background: '#FFF8FA', padding: '8px 10px', borderRadius: '8px', borderLeft: '3px solid #A33B6E', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 800, color: '#922B5C', fontSize: '0.86rem' }}>🌸 2. Graziele Bezerra ({grazieleTime} às {grazieleEndTime}):</span>
                                                <div style={{ paddingLeft: '6px', fontSize: '0.82rem', color: '#1C1819', marginTop: '2px' }}>
                                                    {grazieleServices.map((s) => (
                                                        <div key={s.id} style={{ wordBreak: 'break-word' }}>• {s.name} {s.price > 0 ? `(R$ ${s.price.toFixed(2).replace('.', ',')})` : ''}</div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                                <span style={{ color: '#524B4E', fontWeight: 600 }}>Tempo Total:</span>
                                                <strong style={{ color: '#1C1819' }}>{durationFormatted}</strong>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                                <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>Especialista:</span>
                                                <strong style={{ color: '#1C1819', textAlign: 'right' }}>{hasLuciana ? 'Luciana Bezerra' : 'Graziele Bezerra'}</strong>
                                            </div>
                                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                                <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>Horário:</span>
                                                <strong style={{ color: '#A68037', fontWeight: 800, textAlign: 'right' }}>
                                                    {selectedTime} às {singleEndTime}
                                                </strong>
                                            </div>
                                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                                <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>Procedimento(s):</span>
                                                <div style={{ textAlign: 'right', fontWeight: 600, color: '#1C1819', wordBreak: 'break-word', minWidth: 0 }}>
                                                    {chosenServices.map((s) => (
                                                        <div key={s.id}>• {s.name}</div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                                                <span style={{ color: '#524B4E', fontWeight: 600, flexShrink: 0 }}>Duração Estimada:</span>
                                                <span style={{ color: '#1C1819', textAlign: 'right' }}>{durationFormatted}</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="summary-row total" style={{ borderTop: '2px solid #E5DFDC', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                        <span style={{ fontWeight: 700, color: '#1C1819', fontSize: '0.95rem' }}>Total Estimado:</span>
                                        <span id="summaryTotalPrice" style={{ color: '#A68037', fontWeight: 800, fontSize: '1.15rem' }}>
                                            {priceDisplay}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: '#524B4E', textAlign: 'center', fontWeight: 500, lineHeight: 1.35 }}>
                                    🔒 Ao confirmar, seus horários serão reservados no sistema e a confirmação será enviada para o WhatsApp.
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal Footer (Ações) - Fixado no rodapé com Safe Area */}
                {!confirmedAppointment && (
                    <div
                        className="modal-footer"
                        style={{
                            flexShrink: 0,
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 30,
                            backgroundColor: '#FFFFFF',
                            borderTop: '1.5px solid #E5DFDC',
                            padding: '0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px)) 1rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
                            gap: '0.5rem',
                        }}
                    >
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                id="modalPrevBtn"
                                onClick={handlePrev}
                                disabled={isSubmitting}
                                style={{ backgroundColor: '#FFFFFF', color: '#1C1819', border: '1.5px solid #E5DFDC', fontWeight: 600, minHeight: '44px', padding: '0.5rem 0.9rem', flex: 1, touchAction: 'manipulation', fontSize: '0.88rem' }}
                            >
                                ← Voltar
                            </button>
                        ) : null}

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                id="modalNextBtn"
                                onClick={handleNext}
                                style={{ backgroundColor: '#C5A059', color: '#FFFFFF', fontWeight: 700, minHeight: '44px', padding: '0.5rem 1rem', flex: currentStep === 1 ? 1 : 2, touchAction: 'manipulation', fontSize: '0.92rem' }}
                            >
                                Avançar →
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-whatsapp"
                                id="modalSubmitBtn"
                                onClick={completeBooking}
                                disabled={isSubmitting}
                                style={{ padding: '0.55rem 1rem', fontWeight: 700, minHeight: '44px', flex: 2, touchAction: 'manipulation', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                <span>💬</span> {isSubmitting ? 'Confirmando...' : 'Confirmar no WhatsApp'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
