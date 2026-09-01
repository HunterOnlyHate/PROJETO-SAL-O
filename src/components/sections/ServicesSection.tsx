'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { salonData } from '@/data/salonData';
import { useBooking } from '@/context/BookingContext';

export function ServicesSection() {
    const { openBookingModal } = useBooking();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery] = useState('');

    const filteredServices = salonData.services.filter((service) => {
        const matchCategory = activeCategory === 'all' || service.category === activeCategory;
        const matchSearch =
            !searchQuery ||
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.professionalName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <section className="section services-section" id="servicos">
            <div className="container">
                <div className="section-header text-center">
                    <span className="section-subtitle">Tabela Oficial de Procedimentos</span>
                    <h2 className="section-title">Menu Exclusivo de Beleza</h2>
                    <p className="section-desc">
                        Cada atendimento é planejado com produtos de alta performance e técnicas especializadas
                        por <strong>Luciana Bezerra</strong> (Cabelos e Unhas) e <strong>Graziele Bezerra</strong> (Sobrancelhas e Depilação).
                    </p>
                </div>

                {/* Filtros de Categoria */}
                <div className="services-filter-bar" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                    {salonData.categories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Grid de Serviços Responsivo */}
                <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                    {filteredServices.map((service) => (
                        <div key={service.id} className="service-card">
                            <div className="service-card-image">
                                <Image
                                    src={service.image || '/assets/images/logo-glamour-studio.jpg'}
                                    alt={service.name}
                                    fill
                                    unoptimized={!isOptimizableImage(service.image)}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    style={{ objectFit: 'contain', padding: '6px' }}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.srcset = '';
                                        target.src = '/assets/images/logo-glamour-studio.jpg';
                                    }}
                                />
                                {service.badge && (
                                    <span className="service-badge">{service.badge}</span>
                                )}
                            </div>

                            <div className="service-card-body">
                                <div className="service-meta-top">
                                    <span className="service-pro-tag">
                                        {service.professionalId === 'luciana-bezerra' ? '💇‍♀️' : '🌸'}{' '}
                                        {service.professionalName}
                                    </span>
                                    <span className="service-duration-tag">⏱️ {service.duration}</span>
                                </div>

                                <h3 className="service-name">{service.name}</h3>

                                <p
                                    className="service-description"
                                    dangerouslySetInnerHTML={{ __html: service.description }}
                                />

                                <div className="service-footer">
                                    <div className="service-price-box">
                                        <span className="service-price-label">Investimento</span>
                                        <span className="service-price-value">
                                            {service.priceDisplay ||
                                                (service.price > 0
                                                    ? `R$ ${service.price.toFixed(2).replace('.', ',')}`
                                                    : 'Sob consulta')}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => openBookingModal(service.id)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <span>📅</span> Agendar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
