'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductModal } from '@/components/admin/ProductModal';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import {
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    toggleProductActiveAction,
    ProductFormData,
} from '@/actions/adminProductActions';

interface ProductItem {
    id: string;
    name: string;
    brand: string;
    category: string;
    description: string;
    volume: string | null;
    price: number;
    badge: string | null;
    image: string;
    stock: number;
    featured: boolean;
    active: boolean;
}

interface AdminProductsClientProps {
    initialProducts: ProductItem[];
}

export function AdminProductsClient({ initialProducts }: AdminProductsClientProps) {
    const [products, setProducts] = useState<ProductItem[]>(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: ProductItem | null }>({
        isOpen: false,
        product: null,
    });

    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const filteredProducts = products.filter((p) => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSaveProduct = async (formData: ProductFormData) => {
        if (formData.id) {
            const res = await updateAdminProduct(formData.id, formData);
            if (res.success && res.product) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === formData.id ? (res.product as ProductItem) : p))
                );
                showToast(`Produto "${formData.name}" atualizado com sucesso!`);
                return { success: true };
            }
            return { success: false, message: res.message };
        } else {
            const res = await createAdminProduct(formData);
            if (res.success && res.product) {
                setProducts((prev) => [res.product as ProductItem, ...prev]);
                showToast(`Produto "${formData.name}" cadastrado com sucesso!`);
                return { success: true };
            }
            return { success: false, message: res.message };
        }
    };

    const handleDeleteProduct = async () => {
        if (!deleteModal.product) return { success: false };
        const id = deleteModal.product.id;
        const res = await deleteAdminProduct(id);
        if (res.success) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            showToast(`Produto removido com sucesso!`);
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const handleToggleActive = async (p: ProductItem) => {
        const newStatus = !p.active;
        setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, active: newStatus } : item)));
        const res = await toggleProductActiveAction(p.id, newStatus);
        if (!res.success) {
            setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, active: p.active } : item)));
            showToast('Erro ao atualizar status do produto.', 'error');
        } else {
            showToast(`Produto ${newStatus ? 'ativado' : 'desativado'} na loja.`);
        }
    };

    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <AdminHeader
                title="Gestão WePink"
                subtitle={`Total de ${products.length} produtos (${totalUnits} unidades em estoque).`}
                actionButton={{
                    label: 'Novo Produto',
                    icon: '➕',
                    onClick: () => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                    },
                }}
            />

            {/* Toast Flutuante */}
            {toastMessage && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        backgroundColor: toastMessage.type === 'success' ? '#2b8a3e' : '#e03131',
                        color: '#fff',
                        padding: '0.85rem 1.4rem',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        zIndex: 200,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        animation: 'fadeIn 0.3s ease',
                    }}
                >
                    <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
                    <span>{toastMessage.text}</span>
                </div>
            )}

            <main className="admin-content-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Filtros e Busca Responsiva */}
                <div
                    style={{
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(235, 100, 150, 0.15)',
                        borderRadius: '16px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                    }}
                >
                    {/* Categorias em Scroll Horizontal suave */}
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
                        {[
                            { id: 'all', label: 'Todos os Produtos' },
                            { id: 'perfumes', label: '💎 Perfumes Luxo' },
                            { id: 'body-splash', label: '🌸 Body Splashes' },
                            { id: 'cabelo', label: '💆‍♀️ Hair Mist' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    padding: '0.45rem 0.85rem',
                                    borderRadius: '10px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    backgroundColor: selectedCategory === cat.id ? '#d6336c' : '#231d27',
                                    color: selectedCategory === cat.id ? '#fff' : '#c3bcc9',
                                    border: selectedCategory === cat.id ? '1px solid #f783ac' : '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: '100%' }}>
                        <input
                            type="text"
                            placeholder="🔍 Buscar produto por nome, marca ou descrição..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '10px',
                                backgroundColor: '#231d27',
                                border: '1px solid rgba(235, 100, 150, 0.2)',
                                color: '#fff',
                                fontSize: '0.88rem',
                                outline: 'none',
                            }}
                        />
                    </div>
                </div>

                {/* CARDS MOBILE (Visível até 768px) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredProducts.length === 0 ? (
                        <div
                            style={{
                                padding: '3rem 1rem',
                                textAlign: 'center',
                                color: '#8b8491',
                                backgroundColor: '#17141b',
                                borderRadius: '16px',
                                border: '1px solid rgba(235, 100, 150, 0.15)',
                            }}
                        >
                            Nenhum produto encontrado com os filtros selecionados.
                        </div>
                    ) : (
                        filteredProducts.map((prod) => (
                            <div
                                key={prod.id}
                                style={{
                                    backgroundColor: '#17141b',
                                    border: '1px solid rgba(235, 100, 150, 0.15)',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                }}
                            >
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <img
                                        src={prod.image}
                                        alt={prod.name}
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            objectFit: 'cover',
                                            backgroundColor: '#25202a',
                                            flexShrink: 0,
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/assets/images/logo-glamour-studio.jpg';
                                        }}
                                    />

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                                                {prod.name}
                                            </span>
                                            {prod.badge && (
                                                <span
                                                    style={{
                                                        fontSize: '0.68rem',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        backgroundColor: 'rgba(247, 131, 172, 0.2)',
                                                        color: '#f783ac',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {prod.badge}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ fontSize: '0.76rem', color: '#a89fad', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ color: '#f783ac', fontWeight: 600 }}>{prod.brand}</span>
                                            <span>•</span>
                                            <span>{prod.volume || 'Cosmético'}</span>
                                            <span>•</span>
                                            <span style={{ color: prod.stock > 0 ? '#51cf66' : '#ff8787', fontWeight: 600 }}>
                                                {prod.stock > 0 ? `${prod.stock} em estoque` : 'Esgotado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: '0.4rem',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                    }}
                                >
                                    <div>
                                        <span style={{ fontSize: '0.7rem', color: '#8b8491', display: 'block' }}>Preço:</span>
                                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f783ac' }}>
                                            R$ {prod.price.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(prod)}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '999px',
                                                border: 'none',
                                                fontSize: '0.74rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                backgroundColor: prod.active ? 'rgba(81, 207, 102, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                                                color: prod.active ? '#51cf66' : '#ff8787',
                                                minHeight: '34px',
                                            }}
                                        >
                                            {prod.active ? '● Ativo' : '○ Inativo'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingProduct({
                                                    id: prod.id,
                                                    name: prod.name,
                                                    brand: prod.brand,
                                                    category: prod.category,
                                                    description: prod.description,
                                                    volume: prod.volume || '',
                                                    price: prod.price,
                                                    badge: prod.badge || '',
                                                    image: prod.image,
                                                    stock: prod.stock,
                                                    featured: prod.featured,
                                                    active: prod.active,
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            style={{
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                color: '#fff',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                minHeight: '34px',
                                            }}
                                        >
                                            ✏️ Editar
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeleteModal({
                                                    isOpen: true,
                                                    product: prod,
                                                })
                                            }
                                            style={{
                                                padding: '0.4rem 0.65rem',
                                                borderRadius: '8px',
                                                backgroundColor: 'rgba(224, 49, 49, 0.12)',
                                                border: '1px solid rgba(224, 49, 49, 0.3)',
                                                color: '#ff8787',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                minHeight: '34px',
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Modal de Criação / Edição */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                onSave={handleSaveProduct}
                initialData={editingProduct}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                title="Excluir Produto WePink"
                itemName={deleteModal.product?.name || ''}
                itemType="produto"
                onClose={() => setDeleteModal({ isOpen: false, product: null })}
                onConfirm={handleDeleteProduct}
            />
        </div>
    );
}
