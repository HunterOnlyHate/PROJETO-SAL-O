'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdminLayoutContextType {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    toggleMobileOpen: () => void;
    closeMobileMenu: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    // Fechar automaticamente a sidebar mobile ao navegar de página
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevenir scroll do body quando a sidebar mobile estiver aberta
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const toggleMobileOpen = () => setMobileOpen((prev) => !prev);
    const closeMobileMenu = () => setMobileOpen(false);

    return (
        <AdminLayoutContext.Provider
            value={{
                mobileOpen,
                setMobileOpen,
                toggleMobileOpen,
                closeMobileMenu,
            }}
        >
            {children}
        </AdminLayoutContext.Provider>
    );
}

export function useAdminLayout() {
    const context = useContext(AdminLayoutContext);
    if (!context) {
        // Fallback seguro caso usado fora do provider
        return {
            mobileOpen: false,
            setMobileOpen: () => {},
            toggleMobileOpen: () => {},
            closeMobileMenu: () => {},
        };
    }
    return context;
}
