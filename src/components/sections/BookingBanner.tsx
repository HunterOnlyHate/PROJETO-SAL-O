'use client';

import React from 'react';
import { useBooking } from '@/context/BookingContext';

export function BookingBanner() {
    const { openBookingModal } = useBooking();

    return (
        <section className="booking-banner">
            <div className="container">
                <div className="booking-banner-content">
                    <h2>Pronta para agendar seu momento de cuidado no Glamour Studio?</h2>
                    <p>
                        Agende seu horário online em segundos ou tire todas as suas dúvidas diretamente com nossa equipe pelo WhatsApp.
                    </p>
                    <div className="banner-buttons">
                        <button type="button" className="btn btn-secondary btn-lg" onClick={() => openBookingModal()}>
                            <span>📅</span> Agendar Horário Online
                        </button>
                        <a
                            href="https://wa.me/5595984072160?text=Ol%C3%A1%20Luciana!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20no%20Glamour%20Studio."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-lg"
                        >
                            <span>💬</span> Falar com Luciana (Salão)
                        </a>
                        <a
                            href="https://wa.me/5595984298305?text=Ol%C3%A1%20Graziele!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20os%20produtos%20WePink%20ou%20agendamento."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-whatsapp btn-lg"
                        >
                            <span>💬</span> Falar com Graziele (Vendas WePink)
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
