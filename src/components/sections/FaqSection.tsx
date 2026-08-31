'use client';

import React, { useState } from 'react';
import { salonData } from '@/data/salonData';

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (idx: number) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <section className="faq-section" id="faq">
            <div className="container">
                <div className="section-header">
                    <div className="section-tag">Tire Suas Dúvidas</div>
                    <h2 className="heading-lg section-title">Perguntas Frequentes</h2>
                    <p className="section-subtitle">Tudo o que você precisa saber antes do seu atendimento no Glamour Studio.</p>
                </div>

                <div className="faq-accordion" id="faqAccordion">
                    {salonData.faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div key={index} className={`faq-item ${isOpen ? 'active' : ''}`}>
                                <button className="faq-question-btn" type="button" onClick={() => toggle(index)}>
                                    <span>{faq.question}</span>
                                    <span className="faq-icon">▼</span>
                                </button>
                                <div className="faq-answer" style={{ maxHeight: isOpen ? '250px' : '0px' }}>
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
