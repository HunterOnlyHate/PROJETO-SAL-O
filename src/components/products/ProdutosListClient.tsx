'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { Product } from '@/data/salonData';
import { useCart } from '@/context/CartContext';

interface ProdutosListClientProps {
    initialProducts: Product[];
}

export function ProdutosListClient({ initialProducts }: ProdutosListClientProps) {
    const { addItem, openCart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const productCategories = [
        { id: 'all', name: 'Todos os Produtos', icon: '✨' },
        { id: 'perfumes', name: 'Perfumes Luxo (R$ 170)', icon: '💎' },
        { id: 'body-splash', name: 'Body Splashes (R$ 70)', icon: '🌸' },
        { id: 'cabelo', name: 'Tratamento & Hair Mist', icon: '💆‍♀️' },
    ];

    const filteredProducts = initialProducts.filter((prod) => {
        const matchCategory = activeCategory === 'all' || prod.category === activeCategory;
        const matchSearch =
            !searchQuery ||
            prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prod.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div style={{ paddingTop: '80px' }}>
            {/* BANNER HERO DA PÁGINA DE PRODUTOS */}
            <section className="hero-section" style={{ padding: '4.5rem 0 3rem 0', minHeight: 'auto' }}>
                <div className="container">
                    <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <div
                            className="section-tag"
                            style={{
                                background: 'rgba(235, 100, 150, 0.12)',
                                borderColor: 'rgba(235, 100, 150, 0.35)',
                                color: '#D6336C',
                                margin: '0 auto 1.2rem auto',
                                display: 'inline-flex',
                            }}
                        >
                            🌸 Boutique Oficial WePink • Pronta Entrega
                        </div>
                        <h1 className="heading-xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.15, marginBottom: '1rem' }}>
                            Perfumes, Body Splashes & Cuidados WePink
                        </h1>
                        <p className="section-subtitle" style={{ fontSize: '1.05rem', marginBottom: '2rem' }}>
                            Produtos 100% originais com <strong>Entrega 100% Grátis</strong> em Bonfim - RR ou retirada direta no salão com{' '}
                            <strong>Graziele Bezerra</strong>.
                        </p>

                        {/* Destaques / Vantagens WePink */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.6rem 1.1rem', borderRadius: '999px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🚚</span> <strong>Frete 100% Grátis</strong>
                            </div>
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.6rem 1.1rem', borderRadius: '999px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>✨</span> <strong>Produtos Originais WePink</strong>
                            </div>
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.6rem 1.1rem', borderRadius: '999px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>⚡</span> <strong>Pronta Entrega Imediata</strong>
                            </div>
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.6rem 1.1rem', borderRadius: '999px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>💬</span> <strong>Pedido Direto no WhatsApp</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FILTROS E BUSCA */}
            <div className="container" style={{ marginBottom: '1.5rem' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                    <input
                        type="text"
                        className="services-search-input"
                        placeholder="🔍 Pesquise perfumes, body splash, óleo capilar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    {productCategories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Contador de Quantidade Total de Produtos */}
                <div style={{ textAlign: 'center', marginTop: '1.2rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    <span>Mostrando <strong>{filteredProducts.length}</strong> produtos disponíveis para pronta entrega</span>
                </div>
            </div>

            {/* VITRINE DE PRODUTOS */}
            <section className="products-section" id="produtos" style={{ paddingTop: '0.5rem', paddingBottom: '3rem' }}>
                <div className="container">
                    <div className="products-grid" id="productsGrid">
                        {filteredProducts.map((prod) => {
                            const stockQty = prod.stock ?? 10;
                            const isLowStock = stockQty > 0 && stockQty <= 3;
                            const isOutOfStock = stockQty <= 0;

                            return (
                                <div key={prod.id} className="product-card">
                                    <div className="product-img-wrapper">
                                        <Image
                                            src={prod.image || '/assets/images/logo-glamour-studio.jpg'}
                                            alt={prod.name}
                                            fill
                                            unoptimized={!isOptimizableImage(prod.image)}
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            style={{ objectFit: 'contain', padding: '8px' }}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.srcset = '';
                                                target.src = '/assets/images/logo-glamour-studio.jpg';
                                            }}
                                        />
                                        {prod.badge && <span className="product-badge">{prod.badge}</span>}
                                    </div>
                                    <div className="product-body">
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                            <span className="product-brand">{prod.brand}</span>
                                            <span
                                                style={{
                                                    fontSize: '0.74rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '999px',
                                                    backgroundColor: isOutOfStock
                                                        ? 'rgba(255, 107, 107, 0.15)'
                                                        : isLowStock
                                                        ? 'rgba(252, 196, 25, 0.18)'
                                                        : 'rgba(81, 207, 102, 0.15)',
                                                    color: isOutOfStock ? '#e03131' : isLowStock ? '#d97706' : '#2b8a3e',
                                                    fontWeight: 700,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    border: `1px solid ${
                                                        isOutOfStock
                                                            ? 'rgba(255, 107, 107, 0.3)'
                                                            : isLowStock
                                                            ? 'rgba(252, 196, 25, 0.35)'
                                                            : 'rgba(81, 207, 102, 0.3)'
                                                    }`,
                                                }}
                                            >
                                                <span>📦</span>
                                                <span>
                                                    {isOutOfStock
                                                        ? 'Esgotado'
                                                        : isLowStock
                                                        ? `Últimas ${stockQty} un.`
                                                        : `${stockQty} un. em estoque`}
                                                </span>
                                            </span>
                                        </div>

                                        <h4 className="product-title">{prod.name}</h4>
                                        <p className="product-desc">{prod.description}</p>

                                        <div className="product-footer">
                                            <div className="product-price-box">
                                                <span className="product-volume">{prod.volume}</span>
                                                <div className="product-price">R$ {prod.price.toFixed(2).replace('.', ',')}</div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-add-cart"
                                                disabled={isOutOfStock}
                                                style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                                                onClick={() => {
                                                    if (!isOutOfStock) {
                                                        addItem(prod);
                                                    }
                                                }}
                                            >
                                                <span>🛒</span> {isOutOfStock ? 'Indisponível' : 'Comprar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* BANNER DE GARANTIA E ATENDIMENTO */}
            <section className="booking-banner" style={{ marginTop: '3rem' }}>
                <div className="container">
                    <div className="booking-banner-content">
                        <h2>Deseja tirar dúvidas sobre fragrâncias ou encomendar?</h2>
                        <p>Fale diretamente com Graziele Bezerra pelo WhatsApp oficial de vendas WePink e receba seu pedido em casa hoje mesmo!</p>
                        <div className="banner-buttons">
                            <a
                                href="https://wa.me/5595984298305?text=Ol%C3%A1%20Graziele!%20Gostaria%20de%20comprar%20produtos%20WePink."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp btn-lg"
                            >
                                <span>💬</span> Falar com Graziele no WhatsApp (95) 98429-8305
                            </a>
                            <button type="button" className="btn btn-secondary btn-lg" onClick={openCart}>
                                <span>🛍️</span> Abrir Sacola de Compras
                            </button>
                            <Link href="/" className="btn btn-secondary btn-lg">
                                <span>🏠</span> Voltar para Início
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
