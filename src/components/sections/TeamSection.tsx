'use client';

import React from 'react';
import { salonData } from '@/data/salonData';
import { useBooking } from '@/context/BookingContext';

export function TeamSection() {
    const { openBookingModal } = useBooking();

    return (
        <section className="team-section" id="equipe">
            <div className="container">
                <div className="section-header">
                    <div className="section-tag">Nossas Profissionais</div>
                    <h2 className="heading-lg section-title">Conheça Nossas Especialistas</h2>
                    <p className="section-subtitle">
                        Graziele Bezerra e Luciana Bezerra prontas para cuidar de você com todo carinho e excelência.
                    </p>
                </div>

                <div className="team-grid" id="teamGrid">
                    {salonData.professionals.map((p) => {
                        const initials = p.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2);

                        return (
                            <div key={p.id} className="team-card team-card-elegant">
                                <div className="team-header-badge">
                                    <div className="team-initials-badge">{initials}</div>
                                </div>
                                <div className="team-info">
                                    <h4 className="team-name">{p.name}</h4>
                                    <div className="team-role">{p.role}</div>

                                    <div className="team-specialty-box">
                                        <h5 className="team-specialty-title">✨ Especialidades:</h5>
                                        <p className="team-specialty">{p.specialty}</p>
                                    </div>

                                    <div
                                        className="team-actions"
                                        style={{
                                            marginTop: '1.5rem',
                                            display: 'flex',
                                            gap: '0.6rem',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <a
                                            href={`https://wa.me/${p.whatsapp}?text=Ol%C3%A1%20${encodeURIComponent(
                                                p.name.split(' ')[0]
                                            )}!%20Gostaria%20de%20conversar%20sobre%20atendimento%20no%20Glamour%20Studio.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm"
                                            style={{ fontSize: '0.82rem' }}
                                        >
                                            💬 WhatsApp
                                        </a>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            style={{ fontSize: '0.82rem' }}
                                            onClick={() => openBookingModal(p.id === 'luciana-bezerra' ? 'escova-progressiva' : 'designer-personalizado')}
                                        >
                                            📅 Agendar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
