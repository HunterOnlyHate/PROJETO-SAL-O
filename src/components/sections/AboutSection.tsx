'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';

export function AboutSection() {
    const { openBookingModal } = useBooking();

    return (
        <section className="about-section" id="sobre">
            <div className="container">
                <div className="about-grid">
                    <div className="about-images-collage">
                        <img
                            src="/assets/images/logo-glamour-studio.jpg"
                            alt="Logo Glamour Studio"
                            className="about-main-image"
                        />
                        <img
                            src="/assets/images/cartao-visita-glamour.jpg"
                            alt="Cartão de Visita Glamour Studio"
                            className="about-sub-image"
                        />
                        <div className="about-experience-badge">
                            <strong>GS</strong>
                            <span>Glamour Studio</span>
                        </div>
                    </div>

                    <div className="about-content">
                        <div className="section-tag">Sobre o Glamour Studio</div>
                        <h2 className="heading-lg about-title">Onde arte, beleza e bem-estar se encontram</h2>

                        <p>
                            Criado por <strong>Graziele Bezerra</strong> e <strong>Luciana Bezerra</strong>, o{' '}
                            <strong>Glamour Studio</strong> nasceu do desejo de oferecer um atendimento acolhedor,
                            transparente e com técnica de excelência.
                        </p>
                        <p>
                            Cuidamos de cada detalhe: desde a escolha dos produtos importados mais seguros até a
                            esterilização completa dos materiais, garantindo que você se sinta confiante, linda e
                            renovada a cada visita.
                        </p>

                        <ul className="about-checklist">
                            <li>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                Design com Visagismo Facial
                            </li>
                            <li>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                Depilação Suave & Higiênica
                            </li>
                            <li>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                Autoclave e Biossegurança Total
                            </li>
                            <li>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                Ambiente Climatizado Aconchegante
                            </li>
                        </ul>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-primary" onClick={() => openBookingModal()}>
                                Agendar com as Especialistas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
