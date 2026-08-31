import { prisma } from '@/lib/prisma';
import { salonData, Product, Service } from '@/data/salonData';

export async function getPublicProducts(): Promise<Product[]> {
    try {
        const dbProducts = await prisma.product.findMany({
            where: { active: true },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        });

        if (dbProducts && dbProducts.length > 0) {
            return dbProducts.map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                category: p.category,
                description: p.description,
                volume: p.volume || '',
                price: p.price,
                badge: p.badge || undefined,
                image: p.image,
                stock: p.stock,
            }));
        }
    } catch (error) {
        console.warn('⚠️ Falha ao buscar produtos no banco, utilizando dados de fallback:', error);
    }

    return salonData.products;
}

export async function getPublicServices(): Promise<Service[]> {
    try {
        const dbServices = await prisma.service.findMany({
            where: { active: true },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        });

        if (dbServices && dbServices.length > 0) {
            return dbServices.map((s) => ({
                id: s.id,
                category: s.category,
                professionalId: s.professionalId,
                professionalName: s.professionalName,
                name: s.name,
                description: s.description,
                duration: s.duration,
                durationMinutes: s.durationMinutes,
                price: s.price,
                priceMax: s.priceMax ?? undefined,
                priceDisplay: s.priceDisplay ?? undefined,
                featured: s.featured,
                badge: s.badge ?? undefined,
                image: s.image,
            }));
        }
    } catch (error) {
        console.warn('⚠️ Falha ao buscar serviços no banco, utilizando dados de fallback:', error);
    }

    return salonData.services;
}
