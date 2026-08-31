'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export interface ProductFormData {
    id?: string;
    name: string;
    brand: string;
    category: string;
    description: string;
    volume?: string;
    price: number;
    badge?: string;
    image: string;
    stock: number;
    featured: boolean;
    active: boolean;
}

export async function getAdminProducts() {
    const session = await getAdminSession();
    if (!session) {
        throw new Error('Acesso não autorizado.');
    }

    return await prisma.product.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
}

export async function createAdminProduct(data: ProductFormData) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        if (!data.name || !data.category || data.price === undefined) {
            return { success: false, message: 'Preencha os campos obrigatórios (nome, categoria, preço).' };
        }

        // Gerar ID seguro baseado no nome
        const generatedId =
            data.id?.trim() ||
            `prod-${data.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${data.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

        const product = await prisma.product.create({
            data: {
                id: generatedId,
                name: data.name.trim(),
                brand: data.brand.trim() || 'WePink',
                category: data.category.trim(),
                description: data.description.trim() || '',
                volume: data.volume?.trim() || null,
                price: Number(data.price),
                badge: data.badge?.trim() || null,
                image: data.image?.trim() || '/assets/images/logo-glamour-studio.jpg',
                stock: Number(data.stock ?? 10),
                featured: Boolean(data.featured),
                active: data.active !== undefined ? Boolean(data.active) : true,
            },
        });

        revalidatePath('/produtos');
        revalidatePath('/admin/produtos');
        revalidatePath('/admin');
        revalidatePath('/');

        return { success: true, product };
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return { success: false, message: 'Erro ao cadastrar produto no banco.' };
    }
}

export async function updateAdminProduct(id: string, data: Partial<ProductFormData>) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        const updated = await prisma.product.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name.trim() }),
                ...(data.brand !== undefined && { brand: data.brand.trim() }),
                ...(data.category && { category: data.category.trim() }),
                ...(data.description !== undefined && { description: data.description.trim() }),
                ...(data.volume !== undefined && { volume: data.volume?.trim() || null }),
                ...(data.price !== undefined && { price: Number(data.price) }),
                ...(data.badge !== undefined && { badge: data.badge?.trim() || null }),
                ...(data.image !== undefined && { image: data.image.trim() }),
                ...(data.stock !== undefined && { stock: Number(data.stock) }),
                ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
                ...(data.active !== undefined && { active: Boolean(data.active) }),
            },
        });

        revalidatePath('/produtos');
        revalidatePath('/admin/produtos');
        revalidatePath('/admin');
        revalidatePath('/');

        return { success: true, product: updated };
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        return { success: false, message: 'Erro ao atualizar dados do produto.' };
    }
}

export async function deleteAdminProduct(id: string) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        await prisma.product.delete({
            where: { id },
        });

        revalidatePath('/produtos');
        revalidatePath('/admin/produtos');
        revalidatePath('/admin');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        return { success: false, message: 'Erro ao remover produto do banco.' };
    }
}

export async function toggleProductActiveAction(id: string, active: boolean) {
    return updateAdminProduct(id, { active });
}
