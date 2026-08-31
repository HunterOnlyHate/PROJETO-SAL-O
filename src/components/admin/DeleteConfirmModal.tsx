'use client';

import React, { useState } from 'react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    title: string;
    itemName: string;
    itemType: 'produto' | 'serviço' | 'item';
    onClose: () => void;
    onConfirm: () => Promise<{ success: boolean; message?: string }>;
}

export function DeleteConfirmModal({
    isOpen,
    title,
    itemName,
    itemType,
    onClose,
    onConfirm,
}: DeleteConfirmModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await onConfirm();
            if (!res.success) {
                setError(res.message || 'Erro ao excluir item.');
            } else {
                onClose();
            }
        } catch {
            setError('Erro inesperado ao excluir.');
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
                animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div
                style={{
                    backgroundColor: '#1d171a',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '460px',
                    padding: '1.5rem',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                    color: '#fff',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 107, 107, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem',
                            flexShrink: 0,
                        }}
                    >
                        🗑️
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                            {title || `Excluir ${itemType}`}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#ff8787', fontWeight: 600 }}>
                            Ação irreversível
                        </span>
                    </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#c3bcc9', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                    Tem certeza que deseja excluir o {itemType}{' '}
                    <strong style={{ color: '#fff' }}>&ldquo;{itemName}&rdquo;</strong>? Esta ação removerá o registro
                    definitivamente do banco de dados.
                </p>

                {error && (
                    <div
                        style={{
                            backgroundColor: 'rgba(255, 107, 107, 0.15)',
                            border: '1px solid rgba(255, 107, 107, 0.35)',
                            color: '#ff8787',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            marginBottom: '1rem',
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            padding: '0.65rem 1.15rem',
                            borderRadius: '10px',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#c3bcc9',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            minHeight: '44px',
                            flex: '1 1 auto',
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading}
                        style={{
                            padding: '0.65rem 1.35rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #e03131, #c92a2a)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(224, 49, 49, 0.4)',
                            minHeight: '44px',
                            flex: '1 1 auto',
                        }}
                    >
                        {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </button>
                </div>
            </div>
        </div>
    );
}
