'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdminAction } from '@/actions/adminAuthActions';

export default function AdminLoginPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        startTransition(async () => {
            const res = await loginAdminAction(formData);
            if (res.success) {
                router.push('/admin');
                router.refresh();
            } else {
                setError(res.message || 'Erro ao realizar login.');
            }
        });
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#0c0a0e',
                backgroundImage:
                    'radial-gradient(ellipse at 50% 20%, rgba(214, 51, 108, 0.15) 0%, rgba(12, 10, 14, 0.95) 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
                fontFamily: 'var(--font-sans, "Plus Jakarta Sans", sans-serif)',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    backgroundColor: '#17141b',
                    border: '1px solid rgba(235, 100, 150, 0.25)',
                    borderRadius: '24px',
                    padding: '2rem 1.5rem',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(214, 51, 108, 0.15)',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Top glow line */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #d6336c, #f783ac, #d6336c)',
                    }}
                />

                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div
                        style={{
                            width: '58px',
                            height: '58px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #d6336c, #e64980)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            boxShadow: '0 8px 24px rgba(214, 51, 108, 0.4)',
                            marginBottom: '0.75rem',
                        }}
                    >
                        👑
                    </div>
                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            margin: '0 0 0.35rem',
                            fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                            letterSpacing: '0.3px',
                        }}
                    >
                        Glamour Studio
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#a89fad' }}>
                        Painel de Controle • Gestão do Salão & Produtos
                    </p>
                </div>

                

                {error && (
                    <div
                        style={{
                            backgroundColor: 'rgba(224, 49, 49, 0.15)',
                            border: '1px solid rgba(224, 49, 49, 0.35)',
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
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.15rem' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '0.82rem',
                                color: '#c3bcc9',
                                marginBottom: '0.35rem',
                                fontWeight: 600,
                            }}
                        >
                            E-mail de Acesso
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@gmail.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem 0.85rem',
                                borderRadius: '12px',
                                backgroundColor: '#231d27',
                                border: '1px solid rgba(235, 100, 150, 0.2)',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.35rem' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '0.82rem',
                                color: '#c3bcc9',
                                marginBottom: '0.35rem',
                                fontWeight: 600,
                            }}
                        >
                            Senha
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 2.8rem 0.75rem 0.85rem',
                                    borderRadius: '12px',
                                    backgroundColor: '#231d27',
                                    border: '1px solid rgba(235, 100, 150, 0.2)',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#a89fad',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    padding: '6px',
                                    minHeight: '34px',
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        style={{
                            width: '100%',
                            padding: '0.85rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #d6336c 0%, #e64980 100%)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            opacity: isPending ? 0.7 : 1,
                            boxShadow: '0 6px 20px rgba(214, 51, 108, 0.4)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            minHeight: '48px',
                        }}
                    >
                        {isPending ? 'Entrando no Painel...' : 'Acessar Painel Administrativo'}
                    </button>
                </form>

                <div
                    style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingTop: '1.15rem',
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            color: '#a89fad',
                            fontSize: '0.82rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '6px 10px',
                            minHeight: '38px',
                        }}
                    >
                        <span>←</span> Voltar para a Loja & Salão Glamour Studio
                    </Link>
                </div>
            </div>
        </div>
    );
}
