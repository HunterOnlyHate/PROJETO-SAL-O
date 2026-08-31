'use client';

import React, { useState, useEffect } from 'react';
import { ServiceFormData } from '@/actions/adminServiceActions';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ServiceFormData) => Promise<{ success: boolean; message?: string }>;
    initialData?: ServiceFormData | null;
}

export function ServiceModal({
    isOpen,
    onClose,
    onSave,
    initialData,
}: ServiceModalProps) {
    const isEdit = Boolean(initialData?.id);

    const defaultState: ServiceFormData = {
        name: '',
        category: 'cabelo',
        professionalId: 'luciana-bezerra',
        professionalName: 'Luciana Bezerra',
        description: '',
        duration: '1h',
        durationMinutes: 60,
        price: 120.0,
        priceMax: null,
        priceDisplay: '',
        featured: true,
        badge: '',
        image: '/assets/images/hidratacao-escova.jpg',
        active: true,
    };

    const [formData, setFormData] = useState<ServiceFormData>(defaultState);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const presetImages = [
        { label: 'Progressiva / Liso', url: '/assets/images/progressiva-depois.jpg' },
        { label: 'Realinhamento Capilar', url: '/assets/images/realinhamento-trabalho.jpg' },
        { label: 'Hidratação + Escova', url: '/assets/images/hidratacao-escova.jpg' },
        { label: 'Banho de Brilho', url: '/assets/images/banho-de-brilho.jpg' },
        { label: 'Cronograma Capilar', url: '/assets/images/cronograma-capilar.jpg' },
        { label: 'Designer de Sobrancelhas', url: '/assets/images/designer-personalizado.jpg' },
        { label: 'Designer + Henna', url: '/assets/images/designer-henna.jpg' },
        { label: 'Depilação Íntimo', url: '/assets/images/depilacao-intimo-completo.jpg' },
        { label: 'Depilação Perna Completa', url: '/assets/images/depilacao-perna-completa.jpg' },
        { label: 'Depilação Meia Perna', url: '/assets/images/depilacao-meia-perna.jpg' },
        { label: 'Depilação Axilas', url: '/assets/images/depilacao-axilas.jpg' },
        { label: 'Depilação Braços', url: '/assets/images/depilacao-bracos.jpg' },
        { label: 'Depilação Facial', url: '/assets/images/depilacao-facial.jpg' },
        { label: 'Pedicure & Spa', url: '/assets/images/pedicure-servico.jpg' },
        { label: 'Combo Pé e Mão', url: '/assets/images/combo-pe-mao.jpg' },
        { label: 'Pedicure Galeria', url: '/assets/images/pedicure-galeria.jpg' },
        { label: 'Logo Glamour Studio', url: '/assets/images/logo-glamour-studio.jpg' },
    ];

    const quickDurations = [
        { label: '15 min', minutes: 15, text: '15min' },
        { label: '30 min', minutes: 30, text: '30min' },
        { label: '45 min', minutes: 45, text: '45min' },
        { label: '1 hora', minutes: 60, text: '1h' },
        { label: '1h 30m', minutes: 90, text: '1h30' },
        { label: '2 horas', minutes: 120, text: '2h' },
        { label: '2h 30m', minutes: 150, text: '2h30' },
        { label: '3 horas', minutes: 180, text: '3h' },
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                name: initialData.name || '',
                category: initialData.category || 'cabelo',
                professionalId: initialData.professionalId || 'luciana-bezerra',
                professionalName: initialData.professionalName || 'Luciana Bezerra',
                description: initialData.description || '',
                duration: initialData.duration || '1h',
                durationMinutes: initialData.durationMinutes || 60,
                price: initialData.price || 0,
                priceMax: initialData.priceMax ?? null,
                priceDisplay: initialData.priceDisplay || '',
                featured: initialData.featured ?? true,
                badge: initialData.badge || '',
                image: initialData.image || '/assets/images/hidratacao-escova.jpg',
                active: initialData.active ?? true,
            });
        } else {
            setFormData(defaultState);
        }
        setErrorMessage(null);
    }, [initialData, isOpen]);

    // Fechamento com tecla ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const res = await onSave(formData);
            if (!res.success) {
                setErrorMessage(res.message || 'Ocorreu um erro ao salvar o serviço.');
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
                backgroundColor: 'rgba(0, 0, 0, 0.82)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem',
                overflowY: 'auto',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                style={{
                    backgroundColor: '#17141b',
                    border: '1px solid rgba(235, 100, 150, 0.25)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '92vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                    color: '#fff',
                    overflow: 'hidden',
                }}
            >
                {/* Modal Header (Fixo no topo do modal) */}
                <div
                    style={{
                        padding: '1.1rem 1.4rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#1b1720',
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>{isEdit ? '✏️' : '✨'}</span>
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: '1.15rem',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                                    color: '#fff',
                                }}
                            >
                                {isEdit ? 'Editar Procedimento' : 'Novo Procedimento / Serviço'}
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#a89fad' }}>
                                Preencha os detalhes para atualizar o menu do salão
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modal"
                        style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            color: '#c3bcc9',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body (Scrollável) */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        flex: 1,
                    }}
                >
                    <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {errorMessage && (
                            <div
                                style={{
                                    backgroundColor: 'rgba(230, 73, 128, 0.15)',
                                    border: '1px solid rgba(230, 73, 128, 0.4)',
                                    color: '#ff8787',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '10px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <span>⚠️</span>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Nome do Serviço */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                Título do Procedimento *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Escova Progressiva Glamour..."
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.85rem',
                                    borderRadius: '10px',
                                    backgroundColor: '#231d27',
                                    border: '1px solid rgba(235, 100, 150, 0.25)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        {/* Grid de 2 Colunas Responsivo: Categoria & Profissional */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                            {/* Categoria */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Categoria do Menu *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#231d27',
                                        border: '1px solid rgba(235, 100, 150, 0.25)',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="alinhamento">👑 Alisamentos & Alinhamento</option>
                                    <option value="cabelo">💇‍♀️ Cabelos & Escovas</option>
                                    <option value="depilacao">🌸 Depilação Corporal & Facial</option>
                                    <option value="sobrancelhas">👁️ Designer de Sobrancelhas</option>
                                    <option value="unhas">💅 Manicure e Pedicure</option>
                                </select>
                            </div>

                            {/* Profissional */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Especialista Responsável *
                                </label>
                                <select
                                    value={formData.professionalId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const name =
                                            val === 'luciana-bezerra'
                                                ? 'Luciana Bezerra'
                                                : val === 'graziele-bezerra'
                                                ? 'Graziele Bezerra'
                                                : 'Equipe Glamour';
                                        setFormData({ ...formData, professionalId: val, professionalName: name });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#231d27',
                                        border: '1px solid rgba(235, 100, 150, 0.25)',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="luciana-bezerra">💇‍♀️ Luciana Bezerra (Cabelos & Unhas)</option>
                                    <option value="graziele-bezerra">🌸 Graziele Bezerra (Sobrancelhas & Depilação)</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid de Preço Base & Preço Máximo */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                            {/* Preço Base */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Preço Base (R$) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    placeholder="150.00"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#231d27',
                                        border: '1px solid rgba(235, 100, 150, 0.25)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Preço Longo/Máximo */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Preço Máximo / Longos (R$ Opcional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.priceMax || ''}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            priceMax: e.target.value ? parseFloat(e.target.value) : null,
                                        })
                                    }
                                    placeholder="Ex: 270.00"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#231d27',
                                        border: '1px solid rgba(235, 100, 150, 0.25)',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Texto de Exibição & Selo */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Texto Customizado de Preço (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.priceDisplay || ''}
                                    onChange={(e) => setFormData({ ...formData, priceDisplay: e.target.value })}
                                    placeholder="Ex: Curtos R$ 150 | Longos R$ 270"
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#231d27',
                                        border: '1px solid rgba(235, 100, 150, 0.25)',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                    Selo / Badge Destaque (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.badge || ''}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    placeholder="Ex: Mais Pedido, Oferta, Destaque..."
                                    style={{
                                        width: '100%',
                                        padding: '0.7rem 0.85rem',
                                        borderRadius: '10px',
                                        backgroundColor: '#231d27',
                                        border: '1px solid rgba(235, 100, 150, 0.25)',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Bloco de Duração com Chips Rápidos */}
                        <div
                            style={{
                                backgroundColor: '#1d1822',
                                border: '1px solid rgba(235, 100, 150, 0.15)',
                                borderRadius: '12px',
                                padding: '0.85rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.65rem',
                            }}
                        >
                            <label style={{ fontSize: '0.82rem', color: '#f783ac', fontWeight: 700 }}>
                                ⏱️ Duração do Procedimento
                            </label>

                            {/* Atalhos Rápidos de Duração */}
                            <div
                                className="no-scrollbar"
                                style={{
                                    display: 'flex',
                                    gap: '0.4rem',
                                    overflowX: 'auto',
                                    WebkitOverflowScrolling: 'touch',
                                    paddingBottom: '2px',
                                }}
                            >
                                {quickDurations.map((qd) => {
                                    const isSelected = formData.durationMinutes === qd.minutes;
                                    return (
                                        <button
                                            key={qd.minutes}
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    ...formData,
                                                    durationMinutes: qd.minutes,
                                                    duration: qd.text,
                                                })
                                            }
                                            style={{
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                backgroundColor: isSelected ? '#d6336c' : '#28212e',
                                                color: isSelected ? '#fff' : '#c3bcc9',
                                                border: isSelected ? '1px solid #f783ac' : '1px solid rgba(255,255,255,0.08)',
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {qd.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.2rem' }}>
                                <div>
                                    <span style={{ fontSize: '0.74rem', color: '#8b8491', display: 'block', marginBottom: '2px' }}>
                                        Texto Exibido
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="Ex: 1h, 45min, 2h30"
                                        style={{
                                            width: '100%',
                                            padding: '0.55rem 0.75rem',
                                            borderRadius: '8px',
                                            backgroundColor: '#28212e',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                        }}
                                    />
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.74rem', color: '#8b8491', display: 'block', marginBottom: '2px' }}>
                                        Minutos no Sistema
                                    </span>
                                    <input
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={formData.durationMinutes}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                durationMinutes: parseInt(e.target.value, 10) || 30,
                                            })
                                        }
                                        style={{
                                            width: '100%',
                                            padding: '0.55rem 0.75rem',
                                            borderRadius: '8px',
                                            backgroundColor: '#28212e',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upload de Imagem com Cloudinary */}
                        <ImageUploadField
                            label="Imagem do Procedimento"
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                            presetImages={presetImages}
                        />

                        {/* Descrição */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.82rem', color: '#c3bcc9', marginBottom: '0.35rem', fontWeight: 600 }}>
                                Descrição Detalhada
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Explicação do procedimento, benefícios, cuidados..."
                                style={{
                                    width: '100%',
                                    padding: '0.7rem 0.85rem',
                                    borderRadius: '10px',
                                    backgroundColor: '#231d27',
                                    border: '1px solid rgba(235, 100, 150, 0.25)',
                                    color: '#fff',
                                    fontSize: '0.88rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                        </div>

                        {/* Switches: Destaque & Ativo */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '1.25rem',
                                flexWrap: 'wrap',
                                padding: '0.65rem 0.85rem',
                                backgroundColor: '#1d1822',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                        >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.86rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#d6336c' }}
                                />
                                <span>⭐ Destacar no Menu Principal</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.86rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#51cf66' }}
                                />
                                <span>🟢 Procedimento Ativo para Clientes</span>
                            </label>
                        </div>
                    </div>

                    {/* Modal Footer (Fixo na parte inferior do modal) */}
                    <div
                        style={{
                            padding: '1rem 1.4rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: '#1b1720',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.75rem',
                            flexShrink: 0,
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
                            }}
                        >
                            {loading ? 'Salvando...' : isEdit ? 'Atualizar Serviço' : 'Cadastrar Serviço'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
