'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';

export function ContactSection() {
    const { openBookingModal } = useBooking();

    return (
        <section className="contact-section" id="contato">
            <div className="container">
                <div className="section-header">
                    <div className="section-tag">Venha nos Visitar</div>
                    <h2 className="heading-lg section-title">Localização & Contato</h2>
                    <p className="section-subtitle">Ambiente climatizado e aconchegante para receber você.</p>
                </div>

                <div className="contact-grid">
                    <div className="contact-info-wrapper">
                        <div className="contact-info-list">
                            <div className="contact-info-item">
                                <div className="contact-icon-box">📍</div>
                                <div className="contact-item-detail">
                                    <h5>Endereço</h5>
                                    <p>Av. Tuxaua Farias, 259, Bonfim - RR, 69380-000</p>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <div className="contact-icon-box">🕒</div>
                                <div className="contact-item-detail">
                                    <h5>Horários de Funcionamento</h5>
                                    <p>
                                        Segunda a Sábado: <strong>10:00 às 18:00</strong>
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        Domingo: Fechado para descanso da equipe
                                    </p>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <div className="contact-icon-box">📞</div>
                                <div className="contact-item-detail">
                                    <h5>Telefones & WhatsApp</h5>
                                    <p>
                                        💇‍♀️ <strong>Luciana Bezerra</strong> (Salão & Procedimentos):{' '}
                                        <strong>(95) 98407-2160</strong>
                                    </p>
                                    <p>
                                        🛍️ <strong>Graziele Bezerra</strong> (Vendas WePink & Procedimentos):{' '}
                                        <strong>(95) 98429-8305</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="contact-info-item">
                                <div className="contact-icon-box">📷</div>
                                <div className="contact-item-detail">
                                    <h5>Instagram Oficial</h5>
                                    <p>
                                        <a
                                            href="https://www.instagram.com/glamourstudio_lg/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'var(--gold-600)', textDecoration: 'none', fontWeight: 600 }}
                                        >
                                            @glamourstudio_lg
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-primary" onClick={() => openBookingModal()}>
                                <span>📅</span> Agendar Horário Online
                            </button>
                            <a
                                href="https://maps.google.com/?q=Av.+Tuxaua+Farias,+259,+Bonfim+-+RR,+69380-000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                <span>🗺️</span> Abrir no Google Maps
                            </a>
                        </div>
                    </div>

                    {/* Mapa Interativo do Google Maps */}
                    <div className="map-container">
                        <iframe
                            title="Localização Glamour Studio"
                            src="https://maps.google.com/maps?q=Av.+Tuxaua+Farias,+259,+Bonfim+-+RR,+69380-000&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0, width: '100%', height: '100%' }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
}
