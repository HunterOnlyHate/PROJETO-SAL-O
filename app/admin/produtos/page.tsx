import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminProductsClient } from './AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect('/admin/login');
    }

    const products = await prisma.product.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return <AdminProductsClient initialProducts={products} />;
}
