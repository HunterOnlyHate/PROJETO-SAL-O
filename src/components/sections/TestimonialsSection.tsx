'use client';

import React from 'react';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { salonData } from '@/data/salonData';

export function TestimonialsSection() {
    return (
        <section className="testimonials-section" id="depoimentos">
            <div className="container">
                <div className="section-header">
                    <div
                        className="section-tag"
                        style={{
                            background: 'rgba(223,199,155,0.1)',
                            borderColor: 'rgba(223,199,155,0.25)',
                            color: 'var(--gold-300)',
                        }}
                    >
                        Opiniões Reais
                    </div>
                    <h2 className="heading-lg section-title">O que nossas clientes dizem</h2>
                    <p className="section-subtitle">Mais de 5.000 atendimentos com máxima satisfação comprovada.</p>
                </div>

                <div className="testimonials-grid" id="testimonialsGrid">
                    {salonData.testimonials.map((t, idx) => (
                        <div key={idx} className="testimonial-card">
                            <div>
                                <div className="testimonial-stars">★★★★★</div>
                                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                            </div>
                            <div className="testimonial-author">
                                <Image
                                    src={t.avatar}
                                    alt={t.name}
                                    width={48}
                                    height={48}
                                    unoptimized={!isOptimizableImage(t.avatar)}
                                    className="author-avatar"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.srcset = '';
                                        target.src = '/assets/images/logo-glamour-studio.jpg';
                                    }}
                                />
                                <div className="author-info">
                                    <h5>{t.name}</h5>
                                    <p>
                                        {t.service} • {t.date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
