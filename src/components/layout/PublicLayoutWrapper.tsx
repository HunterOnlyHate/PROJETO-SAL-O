'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopAnnouncement } from '@/components/layout/TopAnnouncement';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { BookingModal } from '@/components/booking/BookingModal';
import { FloatingButtons } from '@/components/layout/FloatingButtons';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { Toast } from '@/components/common/Toast';

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return (
            <>
                {children}
                <Toast />
            </>
        );
    }

    return (
        <>
            <TopAnnouncement />
            <Header />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <BookingModal />
            <FloatingButtons />
            <MobileBottomNav />
            <Toast />
        </>
    );
}
