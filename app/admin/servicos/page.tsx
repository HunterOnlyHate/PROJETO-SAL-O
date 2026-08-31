import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminServicesClient } from './AdminServicesClient';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect('/admin/login');
    }

    const services = await prisma.service.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return <AdminServicesClient initialServices={services} />;
}
