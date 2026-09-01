'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <div className="hero-badge">
                                <span className="star">★★★★★</span>
                                <span>Espaço Conceito em Beleza & Bem-Estar</span>
                            </div>

                            <div className="font-script">Glamour Studio</div>

                            <h1 className="heading-xl hero-title">
                                Realce sua beleza natural com a sofisticação do{' '}
                                <span className="text-gold-gradient">dourado & cuidado exclusivo</span>
                            </h1>

                            <p className="hero-subtitle">
                                Especialistas em <strong>Alinhamentos Capilares</strong> (Progressiva & Botox),{' '}
                                <strong>Design de Sobrancelhas</strong>, <strong>Depilação Suave</strong> e{' '}
                                <strong>Boutique Oficial WePink</strong> em Bonfim - RR.
                            </p>

                            <div className="hero-actions">
                                <Link href="/agendar" className="btn btn-primary btn-lg">
                                    <span>📅</span> Agendar Horário Online
                                </Link>
                                <Link href="/produtos" className="btn btn-outline btn-lg">
                                    <span>🌸</span> Ver Perfumes & Cosméticos WePink
                                </Link>
                            </div>

                            <div className="hero-stats">
                                <div className="stat-item">
                                    <h4>+5.000</h4>
                                    <p>Clientes satisfeitas</p>
                                </div>
                                <div className="stat-item">
                                    <h4>2 Especialistas</h4>
                                    <p>Graziele & Luciana</p>
                                </div>
                                <div className="stat-item">
                                    <h4>5.0 ★</h4>
                                    <p>Avaliação máxima</p>
                                </div>
                            </div>
                        </div>

                        {/* Imagem Hero & Card Flutuante */}
                        <div className="hero-media">
                            <div className="hero-image-wrapper">
                                <Image
                                    src="/assets/images/hero-glamour-studio.jpg"
                                    alt="Ambiente Conceito Glamour Studio"
                                    width={600}
                                    height={520}
                                    className="hero-main-img"
                                    preload={true}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                                />
                            </div>

                            <div className="hero-floating-card">
                                <div className="card-icon-circle">✨</div>
                                <div className="floating-card-info">
                                    <h5>Atendimento VIP</h5>
                                    <p>Ambiente climatizado, café especial e esterilização hospitalar.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / Diferenciais Strip */}
            <section className="features-strip">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-pill">
                            <div className="feature-pill-icon">✨</div>
                            <div className="feature-pill-text">
                                <h5>Cuidado Personalizado</h5>
                                <p>Visagismo e diagnóstico sob medida para você.</p>
                            </div>
                        </div>
                        <div className="feature-pill">
                            <div className="feature-pill-icon">🌿</div>
                            <div className="feature-pill-text">
                                <h5>Produtos de Alta Performance</h5>
                                <p>Kérastase, Braé, Wella e linhas veganas.</p>
                            </div>
                        </div>
                        <div className="feature-pill">
                            <div className="feature-pill-icon">🛡️</div>
                            <div className="feature-pill-text">
                                <h5>Biossegurança Total</h5>
                                <p>Autoclave hospitalar e materiais esterilizados.</p>
                            </div>
                        </div>
                        <div className="feature-pill">
                            <div className="feature-pill-icon">📍</div>
                            <div className="feature-pill-text">
                                <h5>Fácil Acesso</h5>
                                <p>Av. Tuxaua Farias, 259, Bonfim - RR</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
