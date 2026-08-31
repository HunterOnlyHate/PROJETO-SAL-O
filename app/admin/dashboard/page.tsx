import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminDashboardClient, RawAppointment, RawProduct, RawService } from '../AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardAliasPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect('/admin/login');
    }

    const [appointments, products, services] = await Promise.all([
        prisma.appointment.findMany({
            orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        }),
        prisma.product.findMany({
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
        }),
        prisma.service.findMany({
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
        }),
    ]);

    const formattedAppointments: RawAppointment[] = appointments.map((apt) => ({
        id: apt.id,
        clientName: apt.clientName,
        clientPhone: apt.clientPhone,
        clientEmail: apt.clientEmail,
        notes: apt.notes,
        date: apt.date,
        startTime: apt.startTime,
        endTime: apt.endTime,
        durationMinutes: apt.durationMinutes,
        professionalId: apt.professionalId,
        professionalName: apt.professionalName,
        serviceIds: apt.serviceIds,
        serviceNames: apt.serviceNames,
        totalPrice: apt.totalPrice,
        status: apt.status,
        whatsappSent: apt.whatsappSent,
        createdAt: apt.createdAt.toISOString(),
    }));

    const formattedProducts: RawProduct[] = products.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: p.price,
        stock: p.stock,
        image: p.image,
        active: p.active,
    }));

    const formattedServices: RawService[] = services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        professionalId: s.professionalId,
        professionalName: s.professionalName,
        price: s.price,
        durationMinutes: s.durationMinutes,
        active: s.active,
    }));

    return (
        <AdminDashboardClient
            initialAppointments={formattedAppointments}
            products={formattedProducts}
            services={formattedServices}
            adminName={session.name}
        />
    );
}
