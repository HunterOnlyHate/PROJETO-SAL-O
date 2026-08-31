'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { salonData, Product } from '@/data/salonData';
import { buildWhatsAppUrl } from '@/lib/whatsappUtils';

export interface CartItem {
    id: string;
    name: string;
    brand: string;
    price: number;
    volume: string;
    image: string;
    quantity: number;
}

export type AddItemInput = string | Product | Partial<CartItem> & { id: string; name: string };

interface CartContextType {
    items: CartItem[];
    isOpen: boolean;
    deliveryType: 'retirada' | 'entrega';
    notes: string;
    totalCount: number;
    subtotal: number;
    toastMessage: string | null;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    setDeliveryType: (type: 'retirada' | 'entrega') => void;
    setNotes: (notes: string) => void;
    addItem: (productOrId: AddItemInput) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, delta: number) => void;
    clearCart: () => void;
    checkoutWhatsApp: () => void;
    showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'glamour_studio_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada');
    const [notes, setNotes] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Carregar do localStorage na montagem
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setItems(parsed);
                }
            }
        } catch (e) {
            console.error('Erro ao ler carrinho do localStorage:', e);
        }
    }, []);

    // Salvar no localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('Erro ao salvar carrinho no localStorage:', e);
        }
    }, [items]);

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage((current) => (current === msg ? null : current));
        }, 3500);
    }, []);

    const addItem = useCallback((productOrId: AddItemInput) => {
        let itemToAdd: CartItem | null = null;

        if (typeof productOrId === 'object' && productOrId !== null) {
            // Objeto de produto completo recebido diretamente do componente
            itemToAdd = {
                id: String(productOrId.id),
                name: String(productOrId.name || 'Produto WePink'),
                brand: String(productOrId.brand || 'WePink'),
                price: Number(productOrId.price || 0),
                volume: String(productOrId.volume || ''),
                image: String(productOrId.image || '/assets/images/logo-glamour-studio.jpg'),
                quantity: 1,
            };
        } else if (typeof productOrId === 'string') {
            // ID passado como string -> buscar no catálogo
            const found = salonData.products.find((p) => p.id === productOrId);
            if (found) {
                itemToAdd = {
                    id: found.id,
                    name: found.name,
                    brand: found.brand || 'WePink',
                    price: Number(found.price || 0),
                    volume: found.volume || '',
                    image: found.image || '/assets/images/logo-glamour-studio.jpg',
                    quantity: 1,
                };
            }
        }

        if (!itemToAdd) {
            console.warn('⚠️ Não foi possível identificar o produto para adicionar ao carrinho:', productOrId);
            return;
        }

        setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === itemToAdd!.id);
            if (existingIndex > -1) {
                return prev.map((item, index) =>
                    index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, itemToAdd!];
        });

        showToast(`"${itemToAdd.name}" adicionado à sacola! 🛍️`);
        setIsOpen(true);
    }, [showToast]);

    const removeItem = useCallback((productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setItems((prev) =>
            prev
                .map((item) => {
                    if (item.id === productId) {
                        const newQ = item.quantity + delta;
                        return newQ > 0 ? { ...item, quantity: newQ } : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const subtotal = items.reduce((acc, curr) => acc + (curr.price || 0) * curr.quantity, 0);

    const checkoutWhatsApp = useCallback(() => {
        if (items.length === 0) return;

        const itemsList = items
            .map(
                (item) =>
                    `> * ${item.quantity}x ${item.name} (${item.volume || '100ml'}) - R$ ${(
                        (item.price || 0) * item.quantity
                    )
                        .toFixed(2)
                        .replace('.', ',')}`
            )
            .join('\n');

        const deliveryLabel =
            deliveryType === 'entrega'
                ? 'Entrega em Domicílio (Grátis em Bonfim - RR)'
                : 'Retirada no Salão (Av. Tuxaua Farias, 259)';

        const message = `*PEDIDO DE PRODUTOS WEPINK - GLAMOUR STUDIO*
----------------------------------------

*ITENS DO PEDIDO:*
${itemsList}

*SUBTOTAL:* R$ ${subtotal.toFixed(2).replace('.', ',')}
*FORMA DE RECEBIMENTO:* ${deliveryLabel}
${notes && notes.trim() ? `*OBSERVAÇÕES:* ${notes.trim()}\n` : ''}----------------------------------------
Olá Graziele! Gostaria de concluir este pedido de produtos WePink. Como podemos combinar o pagamento e a entrega?`;

        const targetWhatsapp = salonData.info.whatsappVendas || '5595984298305';
        const url = buildWhatsAppUrl(targetWhatsapp, message);

        showToast('Redirecionando para o WhatsApp de vendas WePink...');
        setTimeout(() => {
            window.open(url, '_blank');
            setIsOpen(false);
        }, 600);
    }, [items, deliveryType, notes, subtotal, showToast]);

    // Expor globalmente para scripts e botões legados
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).cartApp = {
                addItem: (item: AddItemInput) => addItem(item),
                openDrawer: () => setIsOpen(true),
                closeDrawer: () => setIsOpen(false),
                toggleDrawer: () => setIsOpen((prev) => !prev),
            };
        }
    }, [addItem]);

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                deliveryType,
                notes,
                totalCount,
                subtotal,
                toastMessage,
                openCart: () => setIsOpen(true),
                closeCart: () => setIsOpen(false),
                toggleCart: () => setIsOpen((prev) => !prev),
                setDeliveryType,
                setNotes,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                checkoutWhatsApp,
                showToast,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart deve ser usado dentro de CartProvider');
    }
    return context;
}
