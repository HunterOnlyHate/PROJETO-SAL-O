'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export function Toast() {
    const { toastMessage } = useCart();

    if (!toastMessage) return null;

    return (
        <div className="toast-notification show" id="toastNotification">
            <span>✨</span>
            <span>{toastMessage}</span>
        </div>
    );
}
