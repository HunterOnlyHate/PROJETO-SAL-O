'use client';

import React, { useState, useEffect } from 'react';
import { ProductFormData } from '@/actions/adminProductActions';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProductFormData) => Promise<{ success: boolean; message?: string }>;
    initialData?: ProductFormData | null;
}

export function ProductModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: ProductModalProps) {
    const isEdit = Boolean(initialData?.id);

    const defaultState: ProductFormData = {
        name: '',
        brand: 'WePink',
        category: 'perfumes',
        description: '',
        volume: '100ml',
        price: 170.0,
        badge: '',
        image: '/assets/images/wepink-perfume-ruby-chocolate.jpg',
        stock: 10,
        featured: true,
        active: true,
    };

    const [formData, setFormData] = useState<ProductFormData>(defaultState);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const presetImages = [
        { label: 'Ruby Chocolate', url: '/assets/images/wepink-perfume-ruby-chocolate.jpg' },
        { label: 'VF 2.7 Birthday', url: '/assets/images/wepink-perfume-vf-27.jpg' },
        { label: 'VF Tradicional', url: '/assets/images/wepink-perfume-vf-tradicional.jpg' },
        { label: 'Perfume RED', url: '/assets/images/wepink-perfume-red.jpg' },
        { label: 'Liberté EDP', url: '/assets/images/wepink-perfume-liberte.jpg' },
        { label: 'FEIVE', url: '/assets/images/wepink-perfume-feive.jpg' },
        { label: 'Obsessed EDP', url: '/assets/images/wepink-perfume-obsessed.jpg' },
        { label: 'Fatal Black', url: '/assets/images/wepink-perfume-fatal-black.jpg' },
        { label: 'Universe Moon', url: '/assets/images/wepink-perfume-universe-moon.jpg' },
        { label: 'Booster Repair (Óleo)', url: '/assets/images/wepink-booster-repair-1.jpg' },
        { label: 'Hair Mist Liberté', url: '/assets/images/wepink-hairmist-liberte.jpg' },
        { label: 'Hair Mist Obsessed', url: '/assets/images/wepink-hairmist-obsessed.jpg' },
        { label: 'BS Vanilla Cuddle', url: '/assets/images/wepink-bs-vanilla-cuddle.jpg' },
        { label: 'BS Obsessed', url: '/assets/images/wepink-bs-obsessed.jpg' },
        { label: 'BS AURETX', url: '/assets/images/wepink-bs-auretx.jpg' },
        { label: 'BS One Touch Warm', url: '/assets/images/wepink-bs-onetouch-warm.jpg' },
        { label: 'BS Heaven', url: '/assets/images/wepink-bs-heaven.jpg' },
        { label: 'BS One Touch Latte', url: '/assets/images/wepink-bs-onetouch-latte.jpg' },
        { label: 'BS VF Onyx', url: '/assets/images/wepink-bs-vf-onyx.jpg' },
        { label: 'BS Liberté', url: '/assets/images/wepink-bs-liberte.jpg' },
        { label: 'BS Ruby', url: '/assets/images/wepink-ruby.jpg' },
        { label: 'BS Scarlette', url: '/assets/images/wepink-scarlette.jpg' },
        { label: 'BS VF Choices', url: '/assets/images/wepink-vf-choices.jpg' },
        { label: 'BS VF Golden', url: '/assets/images/wepink-vf-golden.jpg' },
        { label: 'Logo Glamour Studio', url: '/assets/images/logo-glamour-studio.jpg' },
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.name || '',
                brand: initialData.brand || 'WePink',
                category: initialData.category || 'perfumes',
                description: initialData.description || '',
                volume: initialData.volume || '100ml',
                price: initialData.price || 0,
                badge: initialData.badge || '',
                image: initialData.image || '/assets/images/wepink-perfume-ruby-chocolate.jpg',
                stock: initialData.stock ?? 10,
                featured: initialData.featured ?? true,
                active: initialData.active ?? true,
            });
        } else {
            setFormData(defaultState);
        }
        setErrorMessage(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const res = await onSave(formData);
            if (!res.success) {
                setErrorMessage(res.message || 'Ocorreu um erro ao salvar o produto.');
            } else {
                onClose();
            }
        } catch {
            setErrorMessage('Erro inesperado ao salvar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                overflowY: 'auto',
            }}
        >
            <div
                style={{
                    backgroundColor: '#1a161d',
                    border: '1px solid rgba(235, 100, 150, 0.25)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '1.2rem 1.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{isEdit ? '✏️' : '✨'}</span>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                            }}
                        >
                            {isEdit ? 'Editar Produto WePink' : 'Novo Produto WePink'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#a89fad',
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            padding: '4px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {errorMessage && (
                        <div
                            style={{
                                backgroundColor: 'rgba(230, 73, 128, 0.15)',
                                border: '1px solid rgba(230, 73, 128, 0.4)',
                                color: '#ff8787',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                marginBottom: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <span>⚠️</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Nome do Produto */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                Nome do Produto *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Perfume Liberté Eau de Parfum WePink"
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.85rem',
                                    borderRadius: '10px',
                                    backgroundColor: '#25202a',
                                    border: '1px solid rgba(235, 100, 150, 0.2)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {/* Grid de 2 Colunas Responsivo */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                            {/* Marca */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Marca
                                </label>
                                <input
                                    type="text"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="Ex: WePink"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#25202a',
                                        border: '1px solid rgba(235, 100, 150, 0.2)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Categoria */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Categoria *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#25202a',
                                        border: '1px solid rgba(235, 100, 150, 0.2)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                >
                                    <option value="perfumes">Perfumes Luxo</option>
                                    <option value="body-splash">Body Splashes</option>
                                    <option value="cabelo">Tratamento & Hair Mist (Cabelo)</option>
                                    <option value="outros">Outros Cosméticos</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                            {/* Preço */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Preço (R$) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="170.00"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#25202a',
                                        border: '1px solid rgba(235, 100, 150, 0.2)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Volume */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Volume / Tamanho
                                </label>
                                <input
                                    type="text"
                                    value={formData.volume || ''}
                                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                    placeholder="Ex: 100ml, 200ml, 30ml"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#25202a',
                                        border: '1px solid rgba(235, 100, 150, 0.2)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                            {/* Selo / Badge */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Selo / Badge Promocional
                                </label>
                                <input
                                    type="text"
                                    value={formData.badge || ''}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="Ex: Lançamento R$ 170"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#25202a',
                                        border: '1px solid rgba(235, 100, 150, 0.2)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Estoque */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Estoque (unidades)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                                    placeholder="10"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#25202a',
                                        border: '1px solid rgba(235, 100, 150, 0.2)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Imagem do Produto com Upload Cloudinary & Pré-visualização */}
                        <ImageUploadField
                            label="Imagem do Produto"
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                            presetImages={presetImages}
                        />

                        {/* Descrição */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                Descrição do Produto
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Notas olfativas, benefícios, modo de usar..."
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.85rem',
                                    borderRadius: '10px',
                                    backgroundColor: '#25202a',
                                    border: '1px solid rgba(235, 100, 150, 0.2)',
                                    color: '#fff',
                                    fontSize: '0.88rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        {/* Switches */}
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#d6336c' }}
                                />
                                <span>Destacar na Vitrine</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.86rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#51cf66' }}
                                />
                                <span>Produto Ativo na Loja</span>
                            </label>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.75rem',
                            marginTop: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '0.65rem 1.25rem',
                                borderRadius: '10px',
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#c3bcc9',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                minHeight: '42px',
                                flex: '1 1 auto',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.65rem 1.5rem',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #d6336c, #e64980)',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.88rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 14px rgba(214, 51, 108, 0.35)',
                                minHeight: '42px',
                                flex: '1 1 auto',
                            }}
                        >
                            {loading ? 'Salvando...' : isEdit ? 'Atualizar Produto' : 'Cadastrar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
