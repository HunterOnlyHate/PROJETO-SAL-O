'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export interface ServiceFormData {
    id?: string;
    name: string;
    category: string;
    professionalId: string;
    professionalName?: string;
    description: string;
    duration: string;
    durationMinutes: number;
    price: number;
    priceMax?: number | null;
    priceDisplay?: string | null;
    featured: boolean;
    badge?: string | null;
    image: string;
    active: boolean;
}

export async function getAdminServices() {
    const session = await getAdminSession();
    if (!session) {
        throw new Error('Acesso não autorizado.');
    }

    return await prisma.service.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
}

export async function createAdminService(data: ServiceFormData) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        if (!data.name || !data.category || !data.professionalId) {
            return { success: false, message: 'Preencha os campos obrigatórios (nome, categoria, profissional).' };
        }

        const proName =
            data.professionalName ||
            (data.professionalId === 'luciana-bezerra'
                ? 'Luciana Bezerra'
                : data.professionalId === 'graziele-bezerra'
                ? 'Graziele Bezerra'
                : data.professionalId);

        const generatedId =
            data.id?.trim() ||
            `serv-${data.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

        const service = await prisma.service.create({
            data: {
                id: generatedId,
                name: data.name.trim(),
                category: data.category.trim(),
                professionalId: data.professionalId.trim(),
                professionalName: proName,
                description: data.description.trim() || '',
                duration: data.duration?.trim() || '45min',
                durationMinutes: Number(data.durationMinutes ?? 45),
                price: Number(data.price ?? 0),
                priceMax: data.priceMax !== undefined && data.priceMax !== null && data.priceMax > 0 ? Number(data.priceMax) : null,
                priceDisplay: data.priceDisplay?.trim() || null,
                featured: Boolean(data.featured),
                badge: data.badge?.trim() || null,
                image: data.image?.trim() || '/assets/images/logo-glamour-studio.jpg',
                active: data.active !== undefined ? Boolean(data.active) : true,
            },
        });

        revalidatePath('/');
        revalidatePath('/agendar');
        revalidatePath('/admin/servicos');
        revalidatePath('/admin');

        return { success: true, service };
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        return { success: false, message: 'Erro ao cadastrar serviço no banco.' };
    }
}

export async function updateAdminService(id: string, data: Partial<ServiceFormData>) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        let proName = data.professionalName;
        if (!proName && data.professionalId) {
            proName =
                data.professionalId === 'luciana-bezerra'
                    ? 'Luciana Bezerra'
                    : data.professionalId === 'graziele-bezerra'
                    ? 'Graziele Bezerra'
                    : data.professionalId;
        }

        const updated = await prisma.service.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name.trim() }),
                ...(data.category && { category: data.category.trim() }),
                ...(data.professionalId && { professionalId: data.professionalId.trim() }),
                ...(proName && { professionalName: proName }),
                ...(data.description !== undefined && { description: data.description.trim() }),
                ...(data.duration !== undefined && { duration: data.duration.trim() }),
                ...(data.durationMinutes !== undefined && { durationMinutes: Number(data.durationMinutes) }),
                ...(data.price !== undefined && { price: Number(data.price) }),
                ...(data.priceMax !== undefined && {
                    priceMax: data.priceMax !== null && data.priceMax > 0 ? Number(data.priceMax) : null,
                }),
                ...(data.priceDisplay !== undefined && { priceDisplay: data.priceDisplay?.trim() || null }),
                ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
                ...(data.badge !== undefined && { badge: data.badge?.trim() || null }),
                ...(data.image !== undefined && { image: data.image.trim() }),
                ...(data.active !== undefined && { active: Boolean(data.active) }),
            },
        });

        revalidatePath('/');
        revalidatePath('/agendar');
        revalidatePath('/admin/servicos');
        revalidatePath('/admin');

        return { success: true, service: updated };
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        return { success: false, message: 'Erro ao atualizar dados do serviço.' };
    }
}

export async function deleteAdminService(id: string) {
    const session = await getAdminSession();
    if (!session) {
        return { success: false, message: 'Acesso não autorizado.' };
    }

    try {
        await prisma.service.delete({
            where: { id },
        });

        revalidatePath('/');
        revalidatePath('/agendar');
        revalidatePath('/admin/servicos');
        revalidatePath('/admin');

        return { success: true };
    } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        return { success: false, message: 'Erro ao remover serviço do banco.' };
    }
}

export async function toggleServiceActiveAction(id: string, active: boolean) {
    return updateAdminService(id, { active });
}
