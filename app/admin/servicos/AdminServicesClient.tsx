'use client';

import React, { useState, useMemo } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ServiceModal } from '@/components/admin/ServiceModal';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import {
    createAdminService,
    updateAdminService,
    deleteAdminService,
    toggleServiceActiveAction,
    ServiceFormData,
} from '@/actions/adminServiceActions';

interface ServiceItem {
    id: string;
    name: string;
    category: string;
    professionalId: string;
    professionalName: string;
    description: string;
    duration: string;
    durationMinutes: number;
    price: number;
    priceMax: number | null;
    priceDisplay: string | null;
    featured: boolean;
    badge: string | null;
    image: string;
    active: boolean;
}

interface AdminServicesClientProps {
    initialServices: ServiceItem[];
}

export function AdminServicesClient({ initialServices }: AdminServicesClientProps) {
    const [services, setServices] = useState<ServiceItem[]>(initialServices);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPro, setSelectedPro] = useState('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
    const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'price-asc' | 'price-desc' | 'duration'>('default');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modais
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceFormData | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; service: ServiceItem | null }>({
        isOpen: false,
        service: null,
    });

    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Categorias Oficiais
    const categories = [
        { id: 'all', label: 'Todos' },
        { id: 'alinhamento', label: 'Alinhamento' },
        { id: 'cabelo', label: 'Cabelos' },
        { id: 'depilacao', label: 'Depilação' },
        { id: 'sobrancelhas', label: 'Sobrancelhas' },
        { id: 'unhas', label: 'Unhas' },
    ];

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: services.length };
        services.forEach((s) => {
            counts[s.category] = (counts[s.category] || 0) + 1;
        });
        return counts;
    }, [services]);

    // Métricas Estatísticas Rápidas
    const stats = useMemo(() => {
        return {
            total: services.length,
            active: services.filter((s) => s.active).length,
            luciana: services.filter((s) => s.professionalId === 'luciana-bezerra').length,
            graziele: services.filter((s) => s.professionalId === 'graziele-bezerra').length,
            featured: services.filter((s) => s.featured).length,
        };
    }, [services]);

    // Filtragem & Ordenação
    const filteredServices = useMemo(() => {
        const filtered = services.filter((s) => {
            const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
            const matchesPro = selectedPro === 'all' || s.professionalId === selectedPro;

            let matchesStatus = true;
            if (statusFilter === 'active') matchesStatus = s.active;
            else if (statusFilter === 'inactive') matchesStatus = !s.active;
            else if (statusFilter === 'featured') matchesStatus = s.featured;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                s.name.toLowerCase().includes(q) ||
                s.professionalName.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q) ||
                (s.badge && s.badge.toLowerCase().includes(q));

            return matchesCategory && matchesPro && matchesStatus && matchesSearch;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'pt-BR');
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
            return 0;
        });
    }, [services, selectedCategory, selectedPro, statusFilter, searchQuery, sortBy]);

    const resetFilters = () => {
        setSelectedCategory('all');
        setSelectedPro('all');
        setStatusFilter('all');
        setSearchQuery('');
        setSortBy('default');
    };

    const hasActiveFilters =
        selectedCategory !== 'all' ||
        selectedPro !== 'all' ||
        statusFilter !== 'all' ||
        searchQuery.trim() !== '' ||
        sortBy !== 'default';

    const handleSaveService = async (formData: ServiceFormData) => {
        if (formData.id) {
            const res = await updateAdminService(formData.id, formData);
            if (res.success && res.service) {
                setServices((prev) =>
                    prev.map((s) => (s.id === formData.id ? (res.service as ServiceItem) : s))
                );
                showToast(`Procedimento "${formData.name}" atualizado!`);
                return { success: true };
            }
            return { success: false, message: res.message };
        } else {
            const res = await createAdminService(formData);
            if (res.success && res.service) {
                setServices((prev) => [res.service as ServiceItem, ...prev]);
                showToast(`Procedimento "${formData.name}" cadastrado!`);
                return { success: true };
            }
            return { success: false, message: res.message };
        }
    };

    const handleDeleteService = async () => {
        if (!deleteModal.service) return { success: false };
        const id = deleteModal.service.id;
        const res = await deleteAdminService(id);
        if (res.success) {
            setServices((prev) => prev.filter((s) => s.id !== id));
            showToast(`Procedimento excluído com sucesso!`);
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const handleToggleActive = async (s: ServiceItem) => {
        const newStatus = !s.active;
        setServices((prev) => prev.map((item) => (item.id === s.id ? { ...item, active: newStatus } : item)));
        const res = await toggleServiceActiveAction(s.id, newStatus);
        if (!res.success) {
            setServices((prev) => prev.map((item) => (item.id === s.id ? { ...item, active: s.active } : item)));
            showToast('Erro ao atualizar status.', 'error');
        } else {
            showToast(newStatus ? 'Procedimento ativado' : 'Procedimento desativado');
        }
    };

    const getCategoryBadge = (cat: string) => {
        switch (cat) {
            case 'alinhamento': return { label: 'Alinhamento', color: '#ffd43b' };
            case 'cabelo': return { label: 'Cabelos', color: '#f783ac' };
            case 'depilacao': return { label: 'Depilação', color: '#e599f7' };
            case 'sobrancelhas': return { label: 'Sobrancelhas', color: '#74c0fc' };
            case 'unhas': return { label: 'Unhas', color: '#69db7c' };
            default: return { label: cat, color: '#c3bcc9' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <AdminHeader
                title="Catálogo de Serviços"
                subtitle={`${services.length} procedimentos cadastrados no salão.`}
                actionButton={{
                    label: 'Novo Serviço',
                    icon: '➕',
                    onClick: () => {
                        setEditingService(null);
                        setIsModalOpen(true);
                    },
                }}
            />

            {/* Toast Flutuante Seguro */}
            {toastMessage && (
                <div
                    className="admin-floating-toast"
                    style={{
                        backgroundColor: toastMessage.type === 'success' ? '#2b8a3e' : '#e03131',
                        color: '#fff',
                    }}
                >
                    <span>{toastMessage.type === 'success' ? '✅' : '⚠️'}</span>
                    <span>{toastMessage.text}</span>
                </div>
            )}

            <main className="admin-content-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* BARRA DE MÉTRICAS COMPACTA & MINIMALISTA */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        paddingBottom: '2px',
                    }}
                    className="no-scrollbar"
                >
                    <button
                        type="button"
                        onClick={resetFilters}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            backgroundColor: !hasActiveFilters ? 'rgba(214, 51, 108, 0.15)' : '#17141b',
                            border: !hasActiveFilters ? '1px solid #d6336c' : '1px solid rgba(255,255,255,0.06)',
                            color: !hasActiveFilters ? '#f783ac' : '#a89fad',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                        }}
                    >
                        <span>Total:</span>
                        <strong style={{ color: '#fff' }}>{stats.total}</strong>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            backgroundColor: statusFilter === 'active' ? 'rgba(81, 207, 102, 0.15)' : '#17141b',
                            border: statusFilter === 'active' ? '1px solid #51cf66' : '1px solid rgba(255,255,255,0.06)',
                            color: statusFilter === 'active' ? '#51cf66' : '#a89fad',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                        }}
                    >
                        <span>🟢 Ativos:</span>
                        <strong style={{ color: '#fff' }}>{stats.active}</strong>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedPro(selectedPro === 'luciana-bezerra' ? 'all' : 'luciana-bezerra')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            backgroundColor: selectedPro === 'luciana-bezerra' ? 'rgba(247, 131, 172, 0.15)' : '#17141b',
                            border: selectedPro === 'luciana-bezerra' ? '1px solid #f783ac' : '1px solid rgba(255,255,255,0.06)',
                            color: selectedPro === 'luciana-bezerra' ? '#f783ac' : '#a89fad',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                        }}
                    >
                        <span>💇‍♀️ Luciana:</span>
                        <strong style={{ color: '#fff' }}>{stats.luciana}</strong>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSelectedPro(selectedPro === 'graziele-bezerra' ? 'all' : 'graziele-bezerra')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            backgroundColor: selectedPro === 'graziele-bezerra' ? 'rgba(174, 62, 201, 0.15)' : '#17141b',
                            border: selectedPro === 'graziele-bezerra' ? '1px solid #ae3ec9' : '1px solid rgba(255,255,255,0.06)',
                            color: selectedPro === 'graziele-bezerra' ? '#e599f7' : '#a89fad',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                        }}
                    >
                        <span>🌸 Graziele:</span>
                        <strong style={{ color: '#fff' }}>{stats.graziele}</strong>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === 'featured' ? 'all' : 'featured')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '8px',
                            backgroundColor: statusFilter === 'featured' ? 'rgba(255, 212, 59, 0.15)' : '#17141b',
                            border: statusFilter === 'featured' ? '1px solid #ffd43b' : '1px solid rgba(255,255,255,0.06)',
                            color: statusFilter === 'featured' ? '#ffd43b' : '#a89fad',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                        }}
                    >
                        <span>⭐ VIPs:</span>
                        <strong style={{ color: '#fff' }}>{stats.featured}</strong>
                    </button>
                </div>

                {/* PAINEL DE FILTROS & BUSCA CLEAN */}
                <div
                    style={{
                        backgroundColor: '#17141b',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        padding: '0.85rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    {/* Abas de Categorias Minimalistas */}
                    <div
                        className="no-scrollbar"
                        style={{
                            display: 'flex',
                            gap: '0.35rem',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            paddingBottom: '2px',
                        }}
                    >
                        {categories.map((cat) => {
                            const count = categoryCounts[cat.id] || 0;
                            const isSelected = selectedCategory === cat.id;

                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    style={{
                                        padding: '0.35rem 0.75rem',
                                        borderRadius: '8px',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        backgroundColor: isSelected ? '#d6336c' : 'transparent',
                                        color: isSelected ? '#fff' : '#8b8491',
                                        border: isSelected ? '1px solid #f783ac' : '1px solid transparent',
                                        transition: 'all 0.15s',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                    }}
                                >
                                    {cat.label} <span style={{ opacity: 0.7 }}>({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Linha de Busca & Seletores Compactos */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Busca Rápida */}
                        <div style={{ flex: '1 1 200px', minWidth: 0, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar serviço..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 1.8rem 0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: '#231d27',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#fff',
                                    fontSize: '0.84rem',
                                    outline: 'none',
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute',
                                        right: '6px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#8b8491',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        padding: '2px',
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Profissional */}
                        <select
                            value={selectedPro}
                            onChange={(e) => setSelectedPro(e.target.value)}
                            style={{
                                padding: '0.5rem 0.65rem',
                                borderRadius: '8px',
                                backgroundColor: '#231d27',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="all">Todas Especialistas</option>
                            <option value="luciana-bezerra">Luciana</option>
                            <option value="graziele-bezerra">Graziele</option>
                        </select>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            style={{
                                padding: '0.5rem 0.65rem',
                                borderRadius: '8px',
                                backgroundColor: '#231d27',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="all">Todos Status</option>
                            <option value="active">🟢 Ativos</option>
                            <option value="inactive">🔴 Inativos</option>
                            <option value="featured">⭐ VIP</option>
                        </select>

                        {/* Ordenação */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            style={{
                                padding: '0.5rem 0.65rem',
                                borderRadius: '8px',
                                backgroundColor: '#231d27',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="default">Padrão</option>
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="price-asc">Preço (Menor)</option>
                            <option value="price-desc">Preço (Maior)</option>
                            <option value="duration">Duração</option>
                        </select>

                        {/* Alternador de Visualização */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#231d27',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                padding: '2px',
                                marginLeft: 'auto',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                title="Visualizar em Cards"
                                style={{
                                    padding: '0.35rem 0.6rem',
                                    borderRadius: '6px',
                                    backgroundColor: viewMode === 'grid' ? '#d6336c' : 'transparent',
                                    color: viewMode === 'grid' ? '#fff' : '#8b8491',
                                    border: 'none',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                ▦ Cards
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                title="Visualizar em Tabela"
                                style={{
                                    padding: '0.35rem 0.6rem',
                                    borderRadius: '6px',
                                    backgroundColor: viewMode === 'table' ? '#d6336c' : 'transparent',
                                    color: viewMode === 'table' ? '#fff' : '#8b8491',
                                    border: 'none',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                ☰ Tabela
                            </button>
                        </div>
                    </div>

                    {/* Reset de Filtros quando houver seleção */}
                    {hasActiveFilters && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: '0.3rem',
                                fontSize: '0.75rem',
                                color: '#8b8491',
                            }}
                        >
                            <span>
                                {filteredServices.length} de {services.length} procedimentos
                            </span>
                            <button
                                type="button"
                                onClick={resetFilters}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#f783ac',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    textDecoration: 'underline',
                                    padding: 0,
                                }}
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>

                {/* LISTAGEM DE SERVIÇOS: CARDS OU TABELA */}
                {filteredServices.length === 0 ? (
                    <div
                        style={{
                            padding: '3rem 1.5rem',
                            textAlign: 'center',
                            color: '#8b8491',
                            backgroundColor: '#17141b',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                            Nenhum serviço encontrado
                        </div>
                        <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                            Ajuste os filtros ou o termo de busca.
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            style={{
                                marginTop: '0.75rem',
                                padding: '0.45rem 1rem',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(214, 51, 108, 0.2)',
                                border: '1px solid #d6336c',
                                color: '#f783ac',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Restaurar Filtros
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    /* MODO TABELA LIMPO & DE ALTA DENSIDADE */
                    <div className="admin-table-container">
                        <table className="admin-custom-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '48px', textAlign: 'center' }}>Foto</th>
                                    <th>Procedimento</th>
                                    <th>Categoria</th>
                                    <th>Especialista</th>
                                    <th>Duração</th>
                                    <th>Investimento</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                    <th style={{ textAlign: 'right', width: '100px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServices.map((serv) => {
                                    const cat = getCategoryBadge(serv.category);
                                    const isLuciana = serv.professionalId === 'luciana-bezerra';

                                    return (
                                        <tr key={serv.id} className="admin-table-row">
                                            <td style={{ textAlign: 'center' }}>
                                                <img
                                                    src={serv.image}
                                                    alt={serv.name}
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '8px',
                                                        objectFit: 'cover',
                                                        backgroundColor: '#25202a',
                                                        display: 'inline-block',
                                                    }}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/assets/images/logo-glamour-studio.jpg';
                                                    }}
                                                />
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>
                                                        {serv.name}
                                                    </span>
                                                    {serv.featured && <span title="Destaque VIP">⭐</span>}
                                                </div>
                                            </td>

                                            <td>
                                                <span style={{ fontSize: '0.78rem', color: cat.color, fontWeight: 500 }}>
                                                    {cat.label}
                                                </span>
                                            </td>

                                            <td>
                                                <span style={{ fontSize: '0.8rem', color: isLuciana ? '#f783ac' : '#74c0fc' }}>
                                                    {isLuciana ? 'Luciana' : 'Graziele'}
                                                </span>
                                            </td>

                                            <td>
                                                <span style={{ fontSize: '0.78rem', color: '#a89fad' }}>
                                                    ⏱️ {serv.duration}
                                                </span>
                                            </td>

                                            <td>
                                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f783ac' }}>
                                                    {serv.priceDisplay ||
                                                        (serv.priceMax
                                                            ? `R$ ${serv.price.toFixed(0)} - ${serv.priceMax.toFixed(0)}`
                                                            : serv.price > 0
                                                            ? `R$ ${serv.price.toFixed(2).replace('.', ',')}`
                                                            : 'Sob consulta')}
                                                </span>
                                            </td>

                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(serv)}
                                                    style={{
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '999px',
                                                        border: 'none',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        backgroundColor: serv.active ? 'rgba(81, 207, 102, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                                                        color: serv.active ? '#51cf66' : '#ff8787',
                                                    }}
                                                >
                                                    {serv.active ? 'Ativo' : 'Inativo'}
                                                </button>
                                            </td>

                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingService({
                                                                id: serv.id,
                                                                name: serv.name,
                                                                category: serv.category,
                                                                professionalId: serv.professionalId,
                                                                professionalName: serv.professionalName,
                                                                description: serv.description,
                                                                duration: serv.duration,
                                                                durationMinutes: serv.durationMinutes,
                                                                price: serv.price,
                                                                priceMax: serv.priceMax,
                                                                priceDisplay: serv.priceDisplay,
                                                                featured: serv.featured,
                                                                badge: serv.badge,
                                                                image: serv.image,
                                                                active: serv.active,
                                                            });
                                                            setIsModalOpen(true);
                                                        }}
                                                        title="Editar"
                                                        style={{
                                                            padding: '0.3rem 0.5rem',
                                                            borderRadius: '6px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                                            border: 'none',
                                                            color: '#fff',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteModal({
                                                                isOpen: true,
                                                                service: serv,
                                                            })
                                                        }
                                                        title="Excluir"
                                                        style={{
                                                            padding: '0.3rem 0.5rem',
                                                            borderRadius: '6px',
                                                            backgroundColor: 'rgba(224, 49, 49, 0.1)',
                                                            border: 'none',
                                                            color: '#ff8787',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* MODO CARDS LIMPO, SLEEK & COMPACTO */
                    <div className="admin-services-grid">
                        {filteredServices.map((serv) => {
                            const cat = getCategoryBadge(serv.category);
                            const isLuciana = serv.professionalId === 'luciana-bezerra';

                            return (
                                <div
                                    key={serv.id}
                                    style={{
                                        backgroundColor: '#17141b',
                                        border: '1px solid rgba(255, 255, 255, 0.07)',
                                        borderRadius: '14px',
                                        padding: '0.85rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '0.75rem',
                                        transition: 'border-color 0.2s',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        {/* Foto Compacta */}
                                        <img
                                            src={serv.image}
                                            alt={serv.name}
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                borderRadius: '10px',
                                                objectFit: 'cover',
                                                backgroundColor: '#25202a',
                                                flexShrink: 0,
                                            }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/assets/images/logo-glamour-studio.jpg';
                                            }}
                                        />

                                        {/* Título & Meta */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        color: '#fff',
                                                        fontSize: '0.9rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {serv.name}
                                                </span>
                                                {serv.featured && <span title="Destaque VIP">⭐</span>}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '0.74rem',
                                                    color: '#8b8491',
                                                    marginTop: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                }}
                                            >
                                                <span style={{ color: isLuciana ? '#f783ac' : '#74c0fc', fontWeight: 500 }}>
                                                    {isLuciana ? 'Luciana' : 'Graziele'}
                                                </span>
                                                <span>•</span>
                                                <span style={{ color: cat.color }}>{cat.label}</span>
                                                <span>•</span>
                                                <span>⏱️ {serv.duration}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rodapé Clean: Preço + Ações Rápidas */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingTop: '0.5rem',
                                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                                        }}
                                    >
                                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f783ac' }}>
                                            {serv.priceDisplay ||
                                                (serv.priceMax
                                                    ? `R$ ${serv.price.toFixed(0)} - ${serv.priceMax.toFixed(0)}`
                                                    : serv.price > 0
                                                    ? `R$ ${serv.price.toFixed(2).replace('.', ',')}`
                                                    : 'Sob consulta')}
                                        </span>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            {/* Status Badge Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(serv)}
                                                style={{
                                                    padding: '0.25rem 0.55rem',
                                                    borderRadius: '999px',
                                                    border: 'none',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    backgroundColor: serv.active ? 'rgba(81, 207, 102, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                                                    color: serv.active ? '#51cf66' : '#ff8787',
                                                }}
                                            >
                                                {serv.active ? 'Ativo' : 'Inativo'}
                                            </button>

                                            {/* Editar */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingService({
                                                        id: serv.id,
                                                        name: serv.name,
                                                        category: serv.category,
                                                        professionalId: serv.professionalId,
                                                        professionalName: serv.professionalName,
                                                        description: serv.description,
                                                        duration: serv.duration,
                                                        durationMinutes: serv.durationMinutes,
                                                        price: serv.price,
                                                        priceMax: serv.priceMax,
                                                        priceDisplay: serv.priceDisplay,
                                                        featured: serv.featured,
                                                        badge: serv.badge,
                                                        image: serv.image,
                                                        active: serv.active,
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                title="Editar"
                                                style={{
                                                    padding: '0.3rem 0.5rem',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                                    border: 'none',
                                                    color: '#fff',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✏️
                                            </button>

                                            {/* Excluir */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteModal({
                                                        isOpen: true,
                                                        service: serv,
                                                    })
                                                }
                                                title="Excluir"
                                                style={{
                                                    padding: '0.3rem 0.5rem',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(224, 49, 49, 0.1)',
                                                    border: 'none',
                                                    color: '#ff8787',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal de Criação / Edição */}
            <ServiceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingService(null);
                }}
                onSave={handleSaveService}
                initialData={editingService}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                title="Excluir Procedimento"
                itemName={deleteModal.service?.name || ''}
                itemType="serviço"
                onClose={() => setDeleteModal({ isOpen: false, service: null })}
                onConfirm={handleDeleteService}
            />
        </div>
    );
}


