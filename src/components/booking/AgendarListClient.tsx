'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { salonData, Service } from '@/data/salonData';
import { useBooking } from '@/context/BookingContext';

interface AgendarListClientProps {
    initialServices: Service[];
}

export function AgendarListClient({ initialServices }: AgendarListClientProps) {
    const { openBookingModal } = useBooking();
    const [currentCategory, setCurrentCategory] = useState<string>('all');
    const [currentProfessional, setCurrentProfessional] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredServices = useMemo(() => {
        return initialServices.filter((s) => {
            const matchCategory = currentCategory === 'all' || s.category === currentCategory;
            const matchPro = currentProfessional === 'all' || s.professionalId === currentProfessional;
            const matchSearch =
                !searchQuery ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.professionalName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCategory && matchPro && matchSearch;
        });
    }, [initialServices, currentCategory, currentProfessional, searchQuery]);

    const resetFilters = () => {
        setCurrentCategory('all');
        setCurrentProfessional('all');
        setSearchQuery('');
    };

    const isFiltered = currentCategory !== 'all' || currentProfessional !== 'all' || searchQuery.trim() !== '';

    // Contadores para os filtros
    const countLuciana = useMemo(
        () => initialServices.filter((s) => s.professionalId === 'luciana-bezerra').length,
        [initialServices]
    );
    const countGraziele = useMemo(
        () => initialServices.filter((s) => s.professionalId === 'graziele-bezerra').length,
        [initialServices]
    );

    return (
        <div style={{ paddingTop: 'calc(var(--header-height, 70px) + 0.5rem)', overflowX: 'hidden' }}>
            {/* SEÇÃO PRINCIPAL DE AGENDAMENTO (HERO) */}
            <section className="hero-section" style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0 2rem 0', minHeight: 'auto' }}>
                <div className="container">
                    <div className="hero-content" style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
                        <div
                            className="section-tag"
                            style={{
                                margin: '0 auto 1rem auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 1rem',
                                fontSize: '0.82rem',
                            }}
                        >
                            <span>📅</span> Agendamento Online & Catálogo Oficial
                        </div>

                        <h1
                            className="heading-xl"
                            style={{
                                fontSize: 'clamp(1.75rem, 4.5vw, 2.9rem)',
                                lineHeight: 1.18,
                                marginBottom: '1rem',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Escolha seu Procedimento e Reserve seu Horário
                        </h1>

                        <p
                            className="section-subtitle"
                            style={{
                                fontSize: 'clamp(0.92rem, 1.8vw, 1.05rem)',
                                marginBottom: '1.75rem',
                                maxWidth: '700px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Consulte todos os tratamentos com preços, duração e especialista responsável.
                            Agende com <strong>Luciana</strong> (Cabelos & Unhas) ou <strong>Graziele</strong> (Sobrancelhas & Depilação).
                        </p>

                        {/* Ações Rápidas Responsivas */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.75rem',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                marginBottom: '1.5rem',
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                onClick={() => openBookingModal()}
                                style={{
                                    boxShadow: '0 8px 24px rgba(197, 160, 89, 0.35)',
                                    fontWeight: 700,
                                    fontSize: '0.96rem',
                                    minHeight: '48px',
                                }}
                            >
                                <span>📅</span> Iniciar Agendamento Interativo
                            </button>
                            <button
                                type="button"
                                className={`btn ${currentProfessional === 'luciana-bezerra' ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                                onClick={() => {
                                    setCurrentProfessional('luciana-bezerra');
                                    const el = document.getElementById('servicos-agendamento');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                style={{ fontSize: '0.9rem', minHeight: '48px' }}
                            >
                                <span>💇‍♀️</span> Luciana (Cabelos & Unhas)
                            </button>
                            <button
                                type="button"
                                className={`btn ${currentProfessional === 'graziele-bezerra' ? 'btn-primary' : 'btn-secondary'} btn-lg`}
                                onClick={() => {
                                    setCurrentProfessional('graziele-bezerra');
                                    const el = document.getElementById('servicos-agendamento');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                style={{ fontSize: '0.9rem', minHeight: '48px' }}
                            >
                                <span>🌸</span> Graziele (Sobrancelhas & Depilação)
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO COMPLETA DE SERVIÇOS & PROCEDIMENTOS */}
            <section className="services-section" id="servicos-agendamento" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
                <div className="container">
                    <div className="section-header" style={{ marginBottom: '1.8rem' }}>
                        <div className="section-tag">Catálogo Completo</div>
                        <h2 className="heading-lg section-title" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
                            Procedimentos Disponíveis
                        </h2>
                        <p className="section-subtitle" style={{ fontSize: '0.92rem' }}>
                            Selecione a especialista ou categoria desejada e clique em <strong>Agendar</strong>.
                        </p>
                    </div>

                    {/* Filtro por Especialista com Toque Suave */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                            marginBottom: '1.25rem',
                        }}
                    >
                        <button
                            type="button"
                            className={`tab-btn pro-filter-btn ${currentProfessional === 'all' ? 'active' : ''}`}
                            onClick={() => setCurrentProfessional('all')}
                            style={{ minHeight: '42px', fontSize: '0.85rem' }}
                        >
                            <span>✨</span>
                            <span>Todas ({initialServices.length})</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-btn pro-filter-btn ${currentProfessional === 'luciana-bezerra' ? 'active' : ''}`}
                            onClick={() => setCurrentProfessional('luciana-bezerra')}
                            style={{ minHeight: '42px', fontSize: '0.85rem' }}
                        >
                            <span>💇‍♀️</span>
                            <span>Luciana Bezerra ({countLuciana})</span>
                        </button>
                        <button
                            type="button"
                            className={`tab-btn pro-filter-btn ${currentProfessional === 'graziele-bezerra' ? 'active' : ''}`}
                            onClick={() => setCurrentProfessional('graziele-bezerra')}
                            style={{ minHeight: '42px', fontSize: '0.85rem' }}
                        >
                            <span>🌸</span>
                            <span>Graziele Bezerra ({countGraziele})</span>
                        </button>
                    </div>

                    {/* Filtros por Categoria & Busca Responsiva */}
                    <div className="services-filter-container" style={{ marginBottom: '1.75rem' }}>
                        {/* Barra de Busca com Botão de Limpar */}
                        <div className="services-search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                            <span className="services-search-icon" style={{ pointerEvents: 'none' }}>🔍</span>
                            <input
                                type="text"
                                id="serviceSearchInput"
                                className="services-search-input"
                                placeholder="Buscar procedimento (ex: progressiva, botox, henna, manicure...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ paddingRight: searchQuery ? '2.5rem' : '1.2rem', minHeight: '46px' }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    aria-label="Limpar busca"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Abas de Categorias com Rolagem por Toque */}
                        <div
                            style={{
                                width: '100%',
                                overflowX: 'auto',
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'none',
                                paddingBottom: '6px',
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    margin: '0 auto',
                                    flexWrap: 'nowrap',
                                    padding: '0 4px',
                                }}
                            >
                                {salonData.categories.map((cat) => {
                                    const isActive = currentCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`tab-btn ${isActive ? 'active' : ''}`}
                                            onClick={() => setCurrentCategory(cat.id)}
                                            style={{
                                                flexShrink: 0,
                                                whiteSpace: 'nowrap',
                                                minHeight: '40px',
                                                fontSize: '0.84rem',
                                                padding: '0.45rem 1rem',
                                            }}
                                        >
                                            <span>{cat.icon}</span>
                                            <span>{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Indicador de Status dos Filtros */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '860px',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                padding: '0 0.5rem',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                            }}
                        >
                            <span>
                                Mostrando <strong>{filteredServices.length}</strong> de {initialServices.length} procedimentos
                            </span>
                            {isFiltered && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--gold-500)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: 0,
                                    }}
                                >
                                    <span>🔄</span> Limpar todos os filtros
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Grade Dinâmica de Serviços */}
                    <div className="services-grid" id="servicesGrid">
                        {filteredServices.length === 0 ? (
                            <div
                                style={{
                                    gridColumn: '1 / -1',
                                    textAlign: 'center',
                                    padding: '3.5rem 1.5rem',
                                    color: 'var(--text-muted)',
                                    background: 'var(--bg-surface)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px dashed var(--border-gray)',
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                                    Nenhum procedimento encontrado
                                </h3>
                                <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                                    Não encontramos nenhum serviço com os filtros selecionados. Tente buscar outro termo.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={resetFilters}
                                    style={{ minHeight: '40px' }}
                                >
                                    <span>🔄</span> Ver Todos os Procedimentos
                                </button>
                            </div>
                        ) : (
                            filteredServices.map((s) => {
                                const isLuciana = s.professionalId === 'luciana-bezerra';
                                const proIcon = isLuciana ? '💇‍♀️' : '🌸';
                                const proName = s.professionalName;

                                return (
                                    <div key={s.id} className="service-card">
                                        <div className="service-card-image">
                                            <Image
                                                src={s.image || '/assets/images/logo-glamour-studio.jpg'}
                                                alt={s.name}
                                                fill
                                                unoptimized={!isOptimizableImage(s.image)}
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                style={{ objectFit: 'contain', padding: '6px' }}
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.srcset = '';
                                                    target.src = '/assets/images/logo-glamour-studio.jpg';
                                                }}
                                            />
                                            {s.badge && <span className="service-badge">{s.badge}</span>}
                                        </div>

                                        <div className="service-card-body">
                                            <div
                                                className="service-meta"
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: '0.4rem',
                                                    marginBottom: '0.6rem',
                                                }}
                                            >
                                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                                    ⏱️ {s.duration}
                                                </span>
                                                <span
                                                    className="service-pro-pill"
                                                    style={{
                                                        fontSize: '0.76rem',
                                                        fontWeight: 700,
                                                        background: isLuciana ? 'rgba(155, 44, 77, 0.12)' : 'rgba(163, 59, 110, 0.12)',
                                                        color: isLuciana ? '#8A1C3E' : '#922B5C',
                                                        padding: '0.2rem 0.65rem',
                                                        borderRadius: '999px',
                                                        border: isLuciana ? '1px solid rgba(155, 44, 77, 0.25)' : '1px solid rgba(163, 59, 110, 0.25)',
                                                    }}
                                                >
                                                    {proIcon} {proName}
                                                </span>
                                            </div>

                                            <h3 className="service-title" style={{ fontSize: '1.2rem', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                                                {s.name}
                                            </h3>

                                            <p
                                                className="service-description"
                                                dangerouslySetInnerHTML={{ __html: s.description }}
                                                style={{ fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1.25rem' }}
                                            />

                                            <div className="service-card-footer" style={{ marginTop: 'auto' }}>
                                                <div className="service-price" style={{ fontSize: '1.25rem' }}>
                                                    {s.priceDisplay || (s.price > 0 ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Consultar')}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => openBookingModal(s.id)}
                                                    style={{ minHeight: '40px', padding: '0.5rem 1.1rem', fontWeight: 700 }}
                                                >
                                                    <span>📅</span> Agendar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* CARDS DAS ESPECIALISTAS & ESPECIALIDADES */}
            <section className="team-section" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem', background: 'var(--bg-surface-alt)' }}>
                <div className="container">
                    <div className="section-header" style={{ marginBottom: '2rem' }}>
                        <div className="section-tag">Nossas Profissionais</div>
                        <h2 className="heading-lg section-title" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)' }}>
                            Conheça Nossas Especialistas
                        </h2>
                        <p className="section-subtitle" style={{ fontSize: '0.92rem' }}>
                            Profissionais qualificadas prontas para cuidar de você com total biossegurança e alto padrão.
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                            gap: '1.5rem',
                            maxWidth: '1000px',
                            margin: '0 auto',
                        }}
                    >
                        {/* CARD LUCIANA */}
                        <div
                            className="service-card"
                            style={{
                                padding: 'clamp(1.25rem, 3vw, 2rem)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: 'var(--bg-surface)',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
                                    <div className="card-icon-circle" style={{ width: '50px', height: '50px', fontSize: '1.5rem', flexShrink: 0 }}>
                                        💇‍♀️
                                    </div>
                                    <div>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--gold-300)', margin: 0, fontWeight: 700 }}>
                                            Luciana Bezerra
                                        </h3>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--gold-600)', fontWeight: 600 }}>
                                            Especialista Capilar & Manicure
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
                                    Especialista em escovas progressivas, botox reconstrutor, realinhamento térmico, banho de brilho, cronograma capilar completo, manicure e pedicure com autoclave hospitalar.
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gap: '0.35rem' }}>
                                    <li>✨ Escova Progressiva (Curtos R$ 150 | Longos R$ 270)</li>
                                    <li>✨ Realinhamento Orgânico & Botox Capilar</li>
                                    <li>✨ Hidratação + Escova (R$ 120)</li>
                                    <li>✨ Manicure & Pedicure (Autoclave)</li>
                                </ul>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}
                                    onClick={() => openBookingModal('escova-progressiva')}
                                >
                                    <span>📅</span> Agendar com Luciana
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', minHeight: '40px' }}
                                    onClick={() => {
                                        setCurrentProfessional('luciana-bezerra');
                                        const el = document.getElementById('servicos-agendamento');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span>🔍</span> Ver Serviços da Luciana
                                </button>
                                <a
                                    href="https://wa.me/5595984072160?text=Ol%C3%A1%20Luciana!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20com%20voc%C3%AA%20no%20sal%C3%A3o."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', minHeight: '40px' }}
                                >
                                    💬 WhatsApp Luciana: (95) 98407-2160
                                </a>
                            </div>
                        </div>

                        {/* CARD GRAZIELE */}
                        <div
                            className="service-card"
                            style={{
                                padding: 'clamp(1.25rem, 3vw, 2rem)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: 'var(--bg-surface)',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
                                    <div className="card-icon-circle" style={{ width: '50px', height: '50px', fontSize: '1.5rem', flexShrink: 0 }}>
                                        🌸
                                    </div>
                                    <div>
                                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--gold-300)', margin: 0, fontWeight: 700 }}>
                                            Graziele Bezerra
                                        </h3>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--gold-600)', fontWeight: 600 }}>
                                            Visagista de Sobrancelhas & Depilação
                                        </span>
                                    </div>
                                </div>

                                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
                                    Especialista em design personalizado de sobrancelhas, aplicação de henna de alta fixação, depilação corporal completa com cera suave e consultora oficial WePink.
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gap: '0.35rem' }}>
                                    <li>✨ Design de Sobrancelhas Personalizado (R$ 20)</li>
                                    <li>✨ Sobrancelhas com Henna (R$ 35)</li>
                                    <li>✨ Depilação Íntima, Pernas, Axilas e Braços</li>
                                    <li>✨ Vendas & Pronta Entrega WePink (Frete Grátis)</li>
                                </ul>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ width: '100%', minHeight: '44px', fontWeight: 700 }}
                                    onClick={() => openBookingModal('designer-personalizado')}
                                >
                                    <span>📅</span> Agendar com Graziele
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', minHeight: '40px' }}
                                    onClick={() => {
                                        setCurrentProfessional('graziele-bezerra');
                                        const el = document.getElementById('servicos-agendamento');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <span>🔍</span> Ver Serviços da Graziele
                                </button>
                                <a
                                    href="https://wa.me/5595984298305?text=Ol%C3%A1%20Graziele!%20Gostaria%20de%20agendar%20sobrancelhas%20ou%20depila%C3%A7%C3%A3o%20com%20voc%C3%AA."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-whatsapp btn-sm"
                                    style={{ width: '100%', justifyContent: 'center', minHeight: '40px' }}
                                >
                                    💬 WhatsApp Graziele: (95) 98429-8305
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* INFORMAÇÕES DE ATENDIMENTO & LOCALIZAÇÃO */}
            <section className="booking-banner" style={{ marginTop: '0.5rem' }}>
                <div className="container">
                    <div className="booking-banner-content" style={{ padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)' }}>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '0.75rem' }}>
                            Horários & Localização do Glamour Studio
                        </h2>
                        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            📍 Av. Tuxaua Farias, 259, Bonfim - RR &nbsp;|&nbsp; ⏰ Segunda a Sábado: 10:00 às 18:00 (Domingo fechado)
                        </p>
                        <div
                            className="banner-buttons"
                            style={{
                                display: 'flex',
                                gap: '0.75rem',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                onClick={() => openBookingModal()}
                                style={{ minHeight: '48px', fontWeight: 700 }}
                            >
                                <span>📅</span> Agendar Agora
                            </button>
                            <Link href="/produtos" className="btn btn-secondary btn-lg" style={{ minHeight: '48px' }}>
                                <span>🌸</span> Ver Produtos WePink
                            </Link>
                            <Link href="/" className="btn btn-secondary btn-lg" style={{ minHeight: '48px' }}>
                                <span>🏠</span> Voltar para Início
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

