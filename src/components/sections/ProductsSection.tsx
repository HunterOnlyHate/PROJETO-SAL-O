'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { salonData } from '@/data/salonData';
import { useCart } from '@/context/CartContext';

interface ProductsSectionProps {
    isFullPage?: boolean;
}

export function ProductsSection({ isFullPage = false }: ProductsSectionProps) {
    const { addItem } = useCart();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const productCategories = [
        { id: 'all', name: 'Todos os Produtos', icon: '✨' },
        { id: 'perfumes', name: 'Perfumes Luxo (R$ 170)', icon: '💎' },
        { id: 'body-splash', name: 'Body Splashes (R$ 70)', icon: '🌸' },
        { id: 'cabelo', name: 'Tratamento & Hair Mist', icon: '💆‍♀️' },
    ];

    const filteredProducts = salonData.products.filter((p) => {
        const matchCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch =
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const displayProducts = isFullPage ? filteredProducts : filteredProducts.slice(0, 8);

    return (
        <section className="section products-section" id="produtos" style={{ background: 'var(--bg-surface)' }}>
            <div className="container">
                <div className="section-header text-center">
                    <span className="section-subtitle">Boutique Oficial WePink Pronta Entrega</span>
                    <h2 className="section-title">Fragrâncias & Cuidados de Luxo</h2>
                    <p className="section-desc">
                        Tenha os produtos virais da Virginia Fonseca diretamente em Bonfim - RR com{' '}
                        <strong>ENTREGA 100% GRÁTIS</strong> e atendimento especializado por{' '}
                        <strong>Graziele Bezerra</strong>.
                    </p>
                </div>

                {/* Filtros e Busca */}
                <div style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
                    <input
                        type="text"
                        placeholder="🔍 Pesquise perfumes, body splash, óleo capilar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 18px',
                            borderRadius: '50px',
                            border: '1px solid var(--border-gray)',
                            background: 'var(--bg-body)',
                            fontSize: '0.92rem',
                            color: 'var(--text-primary)',
                            outline: 'none',
                        }}
                    />
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '2rem',
                    }}
                >
                    {productCategories.map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Grid de Produtos */}
                <div
                    className="products-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '24px',
                    }}
                >
                    {displayProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-img-wrapper">
                                <Image
                                    src={product.image || '/assets/images/logo-glamour-studio.jpg'}
                                    alt={product.name}
                                    fill
                                    unoptimized={!isOptimizableImage(product.image)}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    style={{ objectFit: 'contain', padding: '8px' }}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.srcset = '';
                                        target.src = '/assets/images/logo-glamour-studio.jpg';
                                    }}
                                />
                                {product.badge && (
                                    <span className="product-badge">{product.badge}</span>
                                )}
                            </div>

                            <div className="product-card-body">
                                <div className="product-brand-tag">
                                    {product.brand} • {product.volume}
                                </div>
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-description">{product.description}</p>

                                <div className="product-footer">
                                    <div className="product-price">
                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            addItem(product);
                                        }}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <span>🛒</span> Comprar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isFullPage && (
                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link href="/produtos" className="btn btn-secondary btn-lg wepink-highlight">
                            <span>🛍️</span> Ver Catálogo Completo WePink ({salonData.products.length} itens)
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
