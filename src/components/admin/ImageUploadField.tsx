'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

interface PresetOption {
    label: string;
    url: string;
}

interface ImageUploadFieldProps {
    label?: string;
    value: string;
    onChange: (url: string) => void;
    presetImages?: PresetOption[];
    folder?: string;
}

export function ImageUploadField({
    label = 'Imagem do Produto',
    value,
    onChange,
    presetImages = [],
}: ImageUploadFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showPresets, setShowPresets] = useState(false);
    const [showManualUrl, setShowManualUrl] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress(10);
        setUploadError(null);

        try {
            const result = await uploadToCloudinary(file, (percent) => {
                setProgress(percent);
            });

            if (result.success && result.url) {
                onChange(result.url);
                setProgress(100);
            } else {
                setUploadError(
                    result.error ||
                        'Não foi possível enviar a foto. Verifique as configurações do Cloudinary ou digite a URL manualmente.'
                );
            }
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Erro ao processar envio da foto.');
        } finally {
            setUploading(false);
            // Limpa o input para permitir selecionar o mesmo arquivo se quiser reenviar
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.82rem', color: '#c3bcc9', fontWeight: 600 }}>
                    {label} *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {presetImages.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowPresets(!showPresets)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#e64980',
                                fontSize: '0.78rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0,
                            }}
                        >
                            {showPresets ? 'Ocultar catálogo' : 'Escolher do catálogo'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowManualUrl(!showManualUrl)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#a89fad',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0,
                        }}
                    >
                        {showManualUrl ? 'Ocultar link' : 'Digitar URL'}
                    </button>
                </div>
            </div>

            {/* Input de arquivo invisível (acionado pelo botão bonito) */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={uploading}
            />

            {/* Caixa Principal de Upload / Captura */}
            <div
                style={{
                    border: '2px dashed rgba(235, 100, 150, 0.35)',
                    borderRadius: '14px',
                    padding: '1rem',
                    backgroundColor: 'rgba(37, 32, 42, 0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s ease',
                }}
            >
                {/* Visualização da Foto Atual / Preview */}
                {value ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            width: '100%',
                            backgroundColor: '#1e1922',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#130f16',
                                flexShrink: 0,
                                border: '1px solid rgba(235, 100, 150, 0.3)',
                                position: 'relative',
                            }}
                        >
                            <Image
                                src={value || '/assets/images/logo-glamour-studio.jpg'}
                                alt="Prévia"
                                fill
                                unoptimized={!isOptimizableImage(value)}
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.srcset = '';
                                    target.src = '/assets/images/logo-glamour-studio.jpg';
                                }}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8f9fa' }}>
                                Foto Selecionada
                            </div>
                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    color: '#a89fad',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginTop: '2px',
                                }}
                            >
                                {value.startsWith('data:') ? 'Imagem carregada localmente' : value}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(235, 100, 150, 0.15)',
                                    border: '1px solid rgba(235, 100, 150, 0.35)',
                                    color: '#fcc2d7',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Trocar Foto
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Nenhum arquivo selecionado ainda */
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '0.5rem 0',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(235, 100, 150, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.4rem',
                            }}
                        >
                            📸
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8f9fa' }}>
                                Tirar foto agora ou carregar arquivo
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#a89fad', marginTop: '2px' }}>
                                No celular abre a câmera / galeria. No PC abre seus arquivos.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                marginTop: '0.35rem',
                                padding: '0.55rem 1.25rem',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #d6336c, #e64980)',
                                border: 'none',
                                color: '#fff',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(214, 51, 108, 0.3)',
                            }}
                        >
                            <span>📷</span>
                            <span>Tirar Foto / Selecionar Imagem</span>
                        </button>
                    </div>
                )}

                {/* Barra de Progresso durante o Upload */}
                {uploading && (
                    <div style={{ width: '100%', marginTop: '0.25rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: '#ff8787',
                                marginBottom: '0.25rem',
                                fontWeight: 600,
                            }}
                        >
                            <span>Enviando e otimizando foto na nuvem...</span>
                            <span>{progress}%</span>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: '6px',
                                backgroundColor: '#130f16',
                                borderRadius: '999px',
                                overflow: 'hidden',
                            }}
                        >
                            <div
                                style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #d6336c, #ff8787)',
                                    transition: 'width 0.2s ease',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Mensagem de Erro de Upload */}
            {uploadError && (
                <div
                    style={{
                        backgroundColor: 'rgba(230, 73, 128, 0.15)',
                        border: '1px solid rgba(230, 73, 128, 0.35)',
                        color: '#ff8787',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}
                >
                    <span>⚠️</span>
                    <span>{uploadError}</span>
                </div>
            )}

            {/* Dropdown / Seletor de Imagens Predefinidas (Opcional) */}
            {showPresets && presetImages.length > 0 && (
                <div
                    style={{
                        backgroundColor: '#201b25',
                        border: '1px solid rgba(235, 100, 150, 0.2)',
                        borderRadius: '10px',
                        padding: '0.75rem',
                    }}
                >
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#c3bcc9', marginBottom: '0.4rem', fontWeight: 600 }}>
                        Selecione uma foto pré-cadastrada da WePink:
                    </label>
                    <select
                        value={presetImages.some((p) => p.url === value) ? value : ''}
                        onChange={(e) => {
                            if (e.target.value) {
                                onChange(e.target.value);
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: '#25202a',
                            border: '1px solid rgba(235, 100, 150, 0.25)',
                            color: '#fff',
                            fontSize: '0.82rem',
                            outline: 'none',
                        }}
                    >
                        <option value="">-- Escolher foto do catálogo --</option>
                        {presetImages.map((img) => (
                            <option key={img.url} value={img.url}>
                                {img.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Campo Manual para URL (Opcional) */}
            {showManualUrl && (
                <div>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://... ou /assets/images/..."
                        style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            backgroundColor: '#25202a',
                            border: '1px solid rgba(235, 100, 150, 0.2)',
                            color: '#fff',
                            fontSize: '0.82rem',
                            outline: 'none',
                        }}
                    />
                </div>
            )}
        </div>
    );
}
