'use client';

import React, { useState, useEffect } from 'react';
import { salonData } from '@/data/salonData';
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
    CountryPhoneCode,
    PHONE_COUNTRIES,
} from '@/lib/phoneUtils';

interface BookingWizardProps {
    initialServiceId?: string | null;
    onComplete?: () => void;
}

export function BookingWizard({ initialServiceId, onComplete }: BookingWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    // Telefone e País (Brasil ou Lethem / Guiana)
    const [phoneCountry, setPhoneCountry] = useState<CountryPhoneCode>('BR');

    const [selectedCategory, setSelectedCategory] = useState<string>('cabelo');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedServices, setSelectedServices] = useState<string[]>(
        initialServiceId ? [initialServiceId] : []
    );

    const [selectedDate, setSelectedDate] = useState<string>(
        getBrazilTodayDateString()
    );

    // Horário para agendamento simples
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

    // Dados do Cliente
    const [clientName, setClientName] = useState<string>('');
    const [clientPhone, setClientPhone] = useState<string>('');
    const [clientNotes, setClientNotes] = useState<string>('');

    // Feedback
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const resetWizard = () => {
        setCurrentStep(1);
        setSelectedServices(initialServiceId ? [initialServiceId] : []);
        setSelectedDate(getBrazilTodayDateString());
        setSelectedTime('');
        setLucianaTime('');
        setGrazieleTime('');
        setClientNotes('');
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (initialServiceId) {
            setSelectedServices([initialServiceId]);
            setCurrentStep(1);
        }
    }, [initialServiceId]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
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

    // Filtrar horários com anti-sobreposição
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

    // Sugestão sequencial
    const suggestedGrazieleSeq = lucianaEndTime
        ? suggestNextSequentialSlot(lucianaEndTime, filteredGrazieleSlots)
        : null;

    const suggestedLucianaSeq = grazieleEndTime
        ? suggestNextSequentialSlot(grazieleEndTime, filteredLucianaSlots)
        : null;

    // Buscar slots disponíveis
    useEffect(() => {
        if (!selectedDate) return;

        let isCancelled = false;

        async function fetchSlots() {
            if (isDual) {
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
                    }
                    setIsLoadingSlots(false);
                }
            }
        }

        fetchSlots();

        return () => {
            isCancelled = true;
        };
    }, [selectedDate, isDual, lucianaDuration, grazieleDuration]);

    const filteredServices = salonData.services.filter((s) => {
        const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
        const matchesQuery = !searchQuery.trim() || s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    const handleNext = () => {
        if (currentStep === 1) {
            if (selectedServices.length === 0) {
                showToast('Selecione pelo menos um procedimento para avançar.');
                return;
            }
        } else if (currentStep === 3) {
            if (!selectedDate) {
                showToast('Selecione uma data para o atendimento.');
                return;
            }

            if (isDual) {
                if (!isLucianaDayOpen) {
                    showToast(lucianaClosedReason || 'Luciana não atenderá nesta data.');
                    return;
                }
                if (!isGrazieleDayOpen) {
                    showToast(grazieleClosedReason || 'Graziele não atenderá nesta data.');
                    return;
                }
                if (!lucianaTime || !grazieleTime) {
                    showToast('Selecione os horários de ambas as especialistas.');
                    return;
                }

                const validation = validateDualBookingSlots({
                    lucianaStartTime: lucianaTime,
                    lucianaEndTime,
                    grazieleStartTime: grazieleTime,
                    grazieleEndTime,
                });

                if (!validation.valid) {
                    showToast(validation.errorMessage || 'Os horários selecionados colidem entre si.');
                    return;
                }
            } else {
                if (!isDayOpen) {
                    showToast(closedReason || 'Salão fechado nesta data selecionada.');
                    return;
                }
                if (!selectedTime) {
                    showToast('Por favor, selecione um horário disponível.');
                    return;
                }
            }
        }

        if (currentStep < totalSteps) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
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

    const handleComplete = async () => {
        if (!clientName.trim()) {
            showToast('Por favor, informe seu nome para o agendamento.');
            return;
        }
        if (!clientPhone.trim() || clientPhone.trim().length < 7) {
            showToast('Por favor, informe seu WhatsApp (Brasil ou Lethem/Guiana).');
            return;
        }

        setIsSubmitting(true);

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

            if (res.success && res.whatsappUrl) {
                showToast('Agendamento duplo registrado com sucesso! Abrindo WhatsApp...');
                setTimeout(() => {
                    window.open(res.whatsappUrl, '_blank');
                    resetWizard();
                    onComplete?.();
                }, 600);
            } else {
                showToast(res.message || 'Erro ao agendar. Tente outro horário.');
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

            if (res.success && res.whatsappUrl) {
                showToast('Agendamento registrado com sucesso! Abrindo WhatsApp...');
                setTimeout(() => {
                    window.open(res.whatsappUrl, '_blank');
                    resetWizard();
                    onComplete?.();
                }, 600);
            } else {
                showToast(res.message || 'Erro ao agendar. Tente outro horário.');
            }
        }
    };

    const priceDisplay =
        totalPrice > 0
            ? hasCustomPrice
                ? `R$ ${totalPrice.toFixed(2).replace('.', ',')} (+ sob consulta)`
                : `R$ ${totalPrice.toFixed(2).replace('.', ',')}`
            : 'A consultar no WhatsApp';

    return (
        <div className="booking-wizard" style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E5DFDC', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', color: '#1C1819', display: 'flex', flexDirection: 'column' }}>
            {/* Step Indicators */}
            <div
                className="step-indicators"
                style={{
                    flexShrink: 0,
                    display: 'flex',
                    borderBottom: '1px solid #E5DFDC',
                    background: '#F8F6F4',
                }}
            >
                {[
                    { num: 1, label: '1. Procedimentos' },
                    { num: 2, label: '2. Especialista' },
                    { num: 3, label: '3. Data & Horário' },
                    { num: 4, label: '4. Confirmação' },
                ].map((st) => (
                    <div
                        key={st.num}
                        className={`step-indicator ${currentStep >= st.num ? 'active' : ''}`}
                        style={{
                            flex: 1,
                            padding: '14px 8px',
                            textAlign: 'center',
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            color: currentStep >= st.num ? '#A68037' : '#887E82',
                            borderBottom: currentStep >= st.num ? '3px solid #C5A059' : '3px solid transparent',
                        }}
                    >
                        {st.label}
                    </div>
                ))}
            </div>

            {/* Toast Feedback */}
            {toastMessage && (
                <div
                    style={{
                        margin: '1rem 1.5rem 0',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: '#FFF5F5',
                        border: '1.5px solid #FFA8A8',
                        color: '#C92A2A',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                    }}
                >
                    ⚠️ {toastMessage}
                </div>
            )}

            {/* Step Content */}
            <div style={{ padding: '1.75rem', maxHeight: '65vh', overflowY: 'auto', flex: '1 1 auto' }}>
                {/* STEP 1: SERVIÇOS */}
                {currentStep === 1 && (
                    <div>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#1C1819', margin: 0, fontWeight: 700 }}>
                                Escolha os Procedimentos Desejados
                            </h3>
                            <span style={{ fontSize: '0.88rem', color: '#A68037', fontWeight: 700 }}>
                                {selectedServices.length} selecionado(s) • ⏱️ {durationFormatted}
                            </span>
                        </div>

                        {/* Barra de busca */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar procedimento (ex: progressiva, sobrancelhas, manicure)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #E5DFDC',
                                    background: '#FAF7F5',
                                    fontSize: '0.92rem',
                                    color: '#1C1819',
                                    fontWeight: 500,
                                }}
                            />
                        </div>

                        {/* Abas de Categoria */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                                overflowX: 'auto',
                                paddingBottom: '8px',
                                marginBottom: '1.25rem',
                            }}
                        >
                            {salonData.categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    style={{
                                        padding: '7px 14px',
                                        borderRadius: '20px',
                                        border: selectedCategory === cat.id ? '1.5px solid #C5A059' : '1.5px solid #E5DFDC',
                                        background: selectedCategory === cat.id ? '#FAF6EE' : '#FFFFFF',
                                        color: selectedCategory === cat.id ? '#A68037' : '#524B4E',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Lista de Procedimentos */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {filteredServices.map((service) => {
                                const isSelected = selectedServices.includes(service.id);
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service.id)}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: isSelected ? '2px solid #C5A059' : '1.5px solid #E5DFDC',
                                            background: isSelected ? '#FAF6EE' : '#FFFFFF',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1C1819', margin: 0 }}>
                                                    {service.name}
                                                </h4>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    style={{ accentColor: '#C5A059', width: '18px', height: '18px' }}
                                                />
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#524B4E', marginBottom: '8px' }}>
                                                {service.professionalName} • ⏱️ {service.duration}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                            <span style={{ fontWeight: 800, color: '#A68037', fontSize: '0.98rem' }}>
                                                {service.priceDisplay || (service.price > 0 ? `R$ ${service.price.toFixed(2).replace('.', ',')}` : 'Sob consulta')}
                                            </span>
                                            {service.badge && (
                                                <span style={{ fontSize: '0.74rem', background: '#EFE3CE', color: '#1C1819', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                                    {service.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: ESPECIALISTAS */}
                {currentStep === 2 && (
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#1C1819', marginBottom: '1rem', fontWeight: 700 }}>
                            Especialista Responsável pelos seus Procedimentos
                        </h3>

                        {isDual ? (
                            <div style={{ padding: '1.25rem', borderRadius: '14px', background: '#FAF6EE', border: '1.5px solid #DFC79B' }}>
                                <div style={{ fontWeight: 800, color: '#A68037', marginBottom: '12px', fontSize: '1.05rem' }}>
                                    ✨ Atendimento Combinado com Ambas as Especialistas
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                                    <div style={{ padding: '14px', background: '#FFF5F7', borderRadius: '10px', border: '1.5px solid #F3C5D1', borderLeft: '4px solid #9B2C4D' }}>
                                        <div style={{ fontWeight: 800, color: '#8A1C3E' }}>💇‍♀️ Luciana Bezerra</div>
                                        <div style={{ fontSize: '0.82rem', color: '#524B4E', marginTop: '4px' }}>
                                            Cabelos & Unhas: {lucianaServices.map((s) => s.name).join(', ')} ({lucianaDurationFormatted})
                                        </div>
                                    </div>
                                    <div style={{ padding: '14px', background: '#FFF8FA', borderRadius: '10px', border: '1.5px solid #F5CEDB', borderLeft: '4px solid #A33B6E' }}>
                                        <div style={{ fontWeight: 800, color: '#922B5C' }}>🌸 Graziele Bezerra</div>
                                        <div style={{ fontSize: '0.82rem', color: '#524B4E', marginTop: '4px' }}>
                                            Sobrancelhas & Depilação: {grazieleServices.map((s) => s.name).join(', ')} ({grazieleDurationFormatted})
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#524B4E', marginTop: '12px', fontWeight: 500 }}>
                                    🔒 Na próxima etapa você definirá os horários livres de cada especialista sem sobreposição.
                                </div>
                            </div>
                        ) : hasLuciana ? (
                            <div style={{ padding: '1.25rem', borderRadius: '14px', background: '#FFF9FA', border: '2px solid #F3C5D1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#9B2C4D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                        LB
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1C1819' }}>
                                            Luciana Bezerra
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#524B4E' }}>
                                            Master Hair Stylist & Visagista (Cabelos, Alisamentos & Unhas)
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#2B8A3E', fontWeight: 700, marginTop: '2px' }}>
                                            ✓ Especialista exclusiva designada ({durationFormatted})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : hasGraziele ? (
                            <div style={{ padding: '1.25rem', borderRadius: '14px', background: '#FFFBFD', border: '2px solid #F5CEDB' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#A33B6E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                        GB
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1C1819' }}>
                                            Graziele Bezerra
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#524B4E' }}>
                                            Designer de Sobrancelhas, Depilação Suave & WePink
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#2B8A3E', fontWeight: 700, marginTop: '2px' }}>
                                            ✓ Especialista exclusiva designada ({durationFormatted})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* STEP 3: DATA E HORA (ALTO CONTRASTE) */}
                {currentStep === 3 && (
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#1C1819', marginBottom: '0.4rem', fontWeight: 700 }}>
                            {isDual ? 'Agendas de Luciana & Graziele' : 'Escolha a Data e o Horário Desejado'}
                        </h3>
                        <p style={{ fontSize: '0.86rem', color: '#524B4E', marginBottom: '1.25rem' }}>
                            {isDual
                                ? 'Cada profissional possui sua agenda específica. Defina os horários em sequência ou livres sem colisão.'
                                : `Duração calculada: ${durationFormatted}. Vagas livres em tempo real.`}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Data */}
                            <div style={{ padding: '14px', background: '#FAF7F5', borderRadius: '12px', border: '1.5px solid #E5DFDC' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                    <label style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#1C1819' }}>
                                        📅 Data do Atendimento
                                    </label>
                                    {selectedDate && (
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8A1C3E', backgroundColor: '#FFF5F7', padding: '3px 10px', borderRadius: '6px', border: '1px solid #F3C5D1' }}>
                                            {formatDateToBR(selectedDate)} ({getWeekdayName(selectedDate)})
                                        </span>
                                    )}
                                </div>

                                {/* Chips de Escolha Rápida de Dias */}
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '6px',
                                        overflowX: 'auto',
                                        paddingBottom: '6px',
                                        marginBottom: '8px',
                                        WebkitOverflowScrolling: 'touch',
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
                                                    padding: '6px 11px',
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
                                                    fontSize: '0.82rem',
                                                    cursor: d.isSunday ? 'not-allowed' : 'pointer',
                                                    opacity: d.isSunday ? 0.6 : 1,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {d.label} {d.isSunday ? '(Fechado)' : ''}
                                            </button>
                                        );
                                    })}
                                </div>

                                <input
                                    type="date"
                                    lang="pt-BR"
                                    value={selectedDate}
                                    min={getBrazilTodayDateString()}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1.5px solid #C5A059',
                                        background: '#FFFFFF',
                                        fontSize: '0.95rem',
                                        color: '#1C1819',
                                        fontWeight: 600,
                                    }}
                                />
                                <span style={{ fontSize: '0.78rem', color: '#524B4E', display: 'block', marginTop: '6px' }}>
                                    Formato: <strong>DD/MM/AAAA</strong> • Segunda a Sábado das 10:00 às 18:00.
                                </span>
                            </div>

                            {/* CASO DUAL */}
                            {isDual ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                    {/* Luciana */}
                                    <div style={{ padding: '14px', background: '#FFF9FA', borderRadius: '12px', border: '1.5px solid #F3C5D1' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#8A1C3E' }}>
                                                💇‍♀️ Luciana ({lucianaDurationFormatted})
                                            </span>
                                            {isLoadingLucianaSlots && <span style={{ fontSize: '0.74rem', color: '#A68037', fontWeight: 700 }}>🔄...</span>}
                                        </div>

                                        {suggestedLucianaSeq && suggestedLucianaSeq !== lucianaTime && (
                                            <button
                                                type="button"
                                                onClick={() => setLucianaTime(suggestedLucianaSeq)}
                                                style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', background: '#FFF4D9', border: '1.5px solid #E6B800', color: '#7A4E00', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', marginBottom: '8px', textAlign: 'left' }}
                                            >
                                                ⚡ Agendar às <strong>{suggestedLucianaSeq}</strong> (após Graziele)
                                            </button>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 75px), 1fr))', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                            {filteredLucianaSlots.map((slot) => {
                                                const isSel = lucianaTime === slot.time;
                                                return (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        disabled={!slot.available}
                                                        onClick={() => slot.available && setLucianaTime(slot.time)}
                                                        title={slot.reason || 'Disponível'}
                                                        style={{
                                                            padding: '6px 2px',
                                                            borderRadius: '6px',
                                                            border: isSel ? '2px solid #8A1C3E' : slot.available ? '1.5px solid #E5DFDC' : '1px dashed #DDD',
                                                            background: isSel ? '#9B2C4D' : slot.available ? '#FFFFFF' : '#F0ECEB',
                                                            color: isSel ? '#FFFFFF' : slot.available ? '#1C1819' : '#887E82',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            cursor: slot.available ? 'pointer' : 'not-allowed',
                                                            opacity: slot.available ? 1 : 0.55,
                                                        }}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Graziele */}
                                    <div style={{ padding: '14px', background: '#FFFBFD', borderRadius: '12px', border: '1.5px solid #F5CEDB' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#922B5C' }}>
                                                🌸 Graziele ({grazieleDurationFormatted})
                                            </span>
                                            {isLoadingGrazieleSlots && <span style={{ fontSize: '0.74rem', color: '#A68037', fontWeight: 700 }}>🔄...</span>}
                                        </div>

                                        {suggestedGrazieleSeq && suggestedGrazieleSeq !== grazieleTime && (
                                            <button
                                                type="button"
                                                onClick={() => setGrazieleTime(suggestedGrazieleSeq)}
                                                style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', background: '#FFF4D9', border: '1.5px solid #E6B800', color: '#7A4E00', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', marginBottom: '8px', textAlign: 'left' }}
                                            >
                                                ⚡ Agendar às <strong>{suggestedGrazieleSeq}</strong> (após Luciana)
                                            </button>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 75px), 1fr))', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                                            {filteredGrazieleSlots.map((slot) => {
                                                const isSel = grazieleTime === slot.time;
                                                return (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        disabled={!slot.available}
                                                        onClick={() => slot.available && setGrazieleTime(slot.time)}
                                                        title={slot.reason || 'Disponível'}
                                                        style={{
                                                            padding: '6px 2px',
                                                            borderRadius: '6px',
                                                            border: isSel ? '2px solid #922B5C' : slot.available ? '1.5px solid #E5DFDC' : '1px dashed #DDD',
                                                            background: isSel ? '#A33B6E' : slot.available ? '#FFFFFF' : '#F0ECEB',
                                                            color: isSel ? '#FFFFFF' : slot.available ? '#1C1819' : '#887E82',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 700,
                                                            cursor: slot.available ? 'pointer' : 'not-allowed',
                                                            opacity: slot.available ? 1 : 0.55,
                                                        }}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* CASO SIMPLES */
                                <div style={{ padding: '14px', background: '#FAF7F5', borderRadius: '12px', border: '1.5px solid #E5DFDC' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1C1819', margin: 0 }}>
                                            🕒 Horários Livres ({durationFormatted})
                                        </label>
                                        {isLoadingSlots && (
                                            <span style={{ fontSize: '0.78rem', color: '#A68037', fontWeight: 700 }}>
                                                🔄 Buscando...
                                            </span>
                                        )}
                                    </div>

                                    {!isDayOpen ? (
                                        <div style={{ padding: '1rem', background: '#FFF5F5', color: '#C92A2A', borderRadius: '8px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600, border: '1px solid #FFA8A8' }}>
                                            🔒 {closedReason || 'Salão Fechado Nesta Data'}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 105px), 1fr))', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                                            {availableSlots.map((slot) => {
                                                const isSelected = selectedTime === slot.time;
                                                return (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        disabled={!slot.available}
                                                        onClick={() => slot.available && setSelectedTime(slot.time)}
                                                        title={slot.reason || 'Disponível'}
                                                        style={{
                                                            padding: '8px 4px',
                                                            borderRadius: '8px',
                                                            border: isSelected ? '2px solid #9E7A32' : slot.available ? '1.5px solid #E5DFDC' : '1px dashed #DDD',
                                                            background: isSelected ? '#C5A059' : slot.available ? '#FFFFFF' : '#F0ECEB',
                                                            color: isSelected ? '#FFFFFF' : slot.available ? '#1C1819' : '#887E82',
                                                            fontSize: '0.88rem',
                                                            fontWeight: 700,
                                                            cursor: slot.available ? 'pointer' : 'not-allowed',
                                                            opacity: slot.available ? 1 : 0.5,
                                                        }}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 4: IDENTIFICAÇÃO E RESUMO */}
                {currentStep === 4 && (
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#1C1819', marginBottom: '0.4rem', fontWeight: 700 }}>
                            Finalize seu Agendamento
                        </h3>
                        <p style={{ fontSize: '0.86rem', color: '#524B4E', marginBottom: '1.25rem' }}>
                            Preencha seus dados para receber a confirmação no WhatsApp.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            {/* Formulário */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1C1819', marginBottom: '4px' }}>
                                        Seu Nome Completo *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Maria Silva"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E5DFDC', background: '#FFFFFF', color: '#1C1819', fontSize: '16px', minHeight: '46px' }}
                                    />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
                                        <label style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1C1819' }}>
                                            WhatsApp para Contato *
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
                                                }}
                                            >
                                                🇬🇾 Lethem (+592)
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        id="clientPhoneWizard"
                                        inputMode="tel"
                                        placeholder={phoneCountry === 'GY' ? '+592 612-3456' : '(95) 98400-0000'}
                                        value={clientPhone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E5DFDC', background: '#FFFFFF', color: '#1C1819', fontSize: '16px', minHeight: '46px' }}
                                    />
                                    <span style={{ fontSize: '0.78rem', color: '#524B4E', display: 'block', marginTop: '4px' }}>
                                        {phoneCountry === 'GY'
                                            ? '🇬🇾 Lethem / Guiana: Digite os 7 dígitos do celular (ex: 612-3456 ou 700-1234).'
                                            : '🇧🇷 Brasil: Digite DDD + número (ex: 95 98400-0000).'}
                                    </span>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1C1819', marginBottom: '4px' }}>
                                        Observações (Opcional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Ex: Primeira vez no salão..."
                                        value={clientNotes}
                                        onChange={(e) => setClientNotes(e.target.value)}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E5DFDC', background: '#FFFFFF', color: '#1C1819', fontSize: '0.92rem' }}
                                    />
                                </div>
                            </div>

                            {/* Card de Resumo */}
                            <div style={{ padding: '16px', borderRadius: '12px', background: '#FAF7F5', border: '1.5px solid #E5DFDC', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#1C1819', borderBottom: '1px solid #E5DFDC', paddingBottom: '8px' }}>
                                    📋 Resumo do Pedido
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#524B4E' }}>
                                    📅 <strong>Data:</strong> {selectedDate.split('-').reverse().join('/')}
                                </div>

                                {isDual ? (
                                    <>
                                        <div style={{ fontSize: '0.85rem', color: '#1C1819', background: '#FFF5F7', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #9B2C4D' }}>
                                            <strong style={{ color: '#8A1C3E' }}>💇‍♀️ Luciana ({lucianaTime} às {lucianaEndTime}):</strong>
                                            <div>{lucianaServices.map((s) => s.name).join(', ')}</div>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#1C1819', background: '#FFF8FA', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #A33B6E' }}>
                                            <strong style={{ color: '#922B5C' }}>🌸 Graziele ({grazieleTime} às {grazieleEndTime}):</strong>
                                            <div>{grazieleServices.map((s) => s.name).join(', ')}</div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ fontSize: '0.85rem', color: '#1C1819' }}>
                                        🕒 <strong>Horário:</strong> {selectedTime} às {singleEndTime}
                                    </div>
                                )}

                                <div style={{ borderTop: '2px solid #E5DFDC', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, color: '#1C1819' }}>Total Estimado:</span>
                                    <span style={{ fontWeight: 800, color: '#A68037', fontSize: '1.15rem' }}>{priceDisplay}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Navigation - Fixado no rodapé */}
            <div
                style={{
                    flexShrink: 0,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 20,
                    padding: '1.25rem 1.75rem',
                    borderTop: '1.5px solid #E5DFDC',
                    background: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.08)',
                }}
            >
                {currentStep > 1 ? (
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={isSubmitting}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1.5px solid #E5DFDC',
                            background: '#FFFFFF',
                            color: '#1C1819',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        ← Voltar
                    </button>
                ) : (
                    <div></div>
                )}

                {currentStep < totalSteps ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        style={{
                            padding: '10px 22px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#C5A059',
                            color: '#FFFFFF',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Avançar →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleComplete}
                        disabled={isSubmitting}
                        style={{
                            padding: '10px 22px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #25d366, #128c7e)',
                            color: '#FFFFFF',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <span>💬</span> {isSubmitting ? 'Agendando...' : 'Confirmar no WhatsApp'}
                    </button>
                )}
            </div>
        </div>
    );
}
