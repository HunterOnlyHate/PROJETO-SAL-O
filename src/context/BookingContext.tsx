'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BookingContextType {
    isModalOpen: boolean;
    initialServiceId: string | null;
    openBookingModal: (serviceId?: string) => void;
    closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialServiceId, setInitialServiceId] = useState<string | null>(null);

    const openBookingModal = (serviceId?: string) => {
        if (serviceId) {
            setInitialServiceId(serviceId);
        } else {
            setInitialServiceId(null);
        }
        setIsModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsModalOpen(false);
        setInitialServiceId(null);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).bookingApp = {
                open: (serviceId?: string) => openBookingModal(serviceId),
                close: () => closeBookingModal(),
            };
        }
    }, []);

    return (
        <BookingContext.Provider
            value={{
                isModalOpen,
                initialServiceId,
                openBookingModal,
                closeBookingModal,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking deve ser usado dentro de BookingProvider');
    }
    return context;
}
