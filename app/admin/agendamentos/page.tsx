import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminAppointmentsClient } from './AdminAppointmentsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAgendamentosPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect('/admin/login');
    }

    // Buscar lista inicial de agendamentos e serviços para o modal de criação
    const [appointments, services] = await Promise.all([
        prisma.appointment.findMany({
            orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        }),
        prisma.service.findMany({
            where: { active: true },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
        }),
    ]);

    return (
        <AdminAppointmentsClient
            initialAppointments={appointments.map((a) => ({
                ...a,
                createdAt: a.createdAt.toISOString(),
                updatedAt: a.updatedAt.toISOString(),
            }))}
            services={services.map((s) => ({
                id: s.id,
                name: s.name,
                professionalId: s.professionalId,
                professionalName: s.professionalName,
                durationMinutes: s.durationMinutes,
                price: s.price,
            }))}
            adminName={session.name}
        />
    );
}
