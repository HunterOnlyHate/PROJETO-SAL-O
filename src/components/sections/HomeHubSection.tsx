'use client';

import React from 'react';
import Link from 'next/link';

export function HomeHubSection() {
    return (
        <section className="home-hub-section" id="servicos-e-produtos">
            <div className="container">
                <div className="section-header">
                    <div className="section-tag">Experiência Completa Glamour Studio</div>
                    <h2 className="heading-lg section-title">Nossos Serviços & Boutique WePink</h2>
                    <p className="section-subtitle">
                        Escolha abaixo o que deseja acessar: nosso menu de procedimentos para agendamento ou a boutique com entrega grátis.
                    </p>
                </div>

                <div className="home-hub-grid">
                    {/* Card 1: Procedimentos & Serviços */}
                    <div className="home-hub-card services-hub-card">
                        <div className="hub-card-header-img">
                            <img
                                src="/assets/images/progressiva-depois.jpg"
                                alt="Procedimentos Capilares Glamour Studio"
                                loading="lazy"
                            />
                            <div className="hub-card-overlay">
                                <span className="hub-badge-pill gold">
                                    <span>👑</span> Menu de Procedimentos
                                </span>
                            </div>
                        </div>
                        <div className="hub-card-body">
                            <h3 className="hub-card-title">Procedimentos & Serviços</h3>
                            <p className="hub-card-description">
                                Técnicas modernas desenvolvidas por Graziele e Luciana Bezerra para transformar e valorizar seus fios, sobrancelhas e bem-estar.
                            </p>
                            <ul className="hub-highlights-list">
                                <li><span className="bullet-icon">✨</span> <strong>Alisamentos & Progressiva:</strong> Curtos R$ 150 | Longos R$ 270</li>
                                <li><span className="bullet-icon">💇‍♀️</span> <strong>Hidratação + Escova:</strong> Fios soltos e tratados (R$ 120)</li>
                                <li><span className="bullet-icon">👁️</span> <strong>Designer de Sobrancelhas:</strong> Visagismo & Henna (R$ 20)</li>
                                <li><span className="bullet-icon">💅</span> <strong>Manicure & Pedicure:</strong> Cuidado e biossegurança (R$ 30)</li>
                                <li><span className="bullet-icon">🌸</span> <strong>Depilação Corporal & Facial:</strong> Cera morna suave</li>
                            </ul>
                            <div className="hub-card-actions">
                                <Link href="/agendar" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                                    <span>📅</span> Ver Todos os Serviços & Agendar
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Boutique Oficial WePink */}
                    <div className="home-hub-card products-hub-card">
                        <div className="hub-card-header-img">
                            <img
                                src="/assets/images/wepink-bs-liberte.jpg"
                                alt="Boutique WePink Glamour Studio"
                                loading="lazy"
                            />
                            <div className="hub-card-overlay">
                                <span className="hub-badge-pill pink">
                                    <span>🌸</span> Pronta Entrega • Frete Grátis
                                </span>
                            </div>
                        </div>
                        <div className="hub-card-body">
                            <h3 className="hub-card-title">Boutique Oficial WePink</h3>
                            <p className="hub-card-description">
                                Linha completa de cosméticos e perfumaria de luxo WePink com pronta entrega imediata sem taxa de entrega em Bonfim - RR.
                            </p>
                            <ul className="hub-highlights-list">
                                <li><span className="bullet-icon">💖</span> <strong>Perfumes Luxo Virginia Fonseca:</strong> Fixação de alta performance</li>
                                <li><span className="bullet-icon">🌸</span> <strong>Body Splashes:</strong> Fragrâncias irresistíveis e marcantes</li>
                                <li><span className="bullet-icon">✨</span> <strong>Booster Repair & Hair Mist:</strong> Tratamento e brilho capilar</li>
                                <li><span className="bullet-icon">🚚</span> <strong>Entrega Grátis:</strong> Sem taxa em toda a região de Bonfim</li>
                                <li><span className="bullet-icon">🛍️</span> <strong>Sacola Interativa:</strong> Pedido rápido e direto no WhatsApp</li>
                            </ul>
                            <div className="hub-card-actions">
                                <Link href="/produtos" className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                                    <span>🛍️</span> Acessar Boutique WePink
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
