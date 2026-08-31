import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminScheduleClient } from './AdminScheduleClient';

export const dynamic = 'force-dynamic';

export default async function AdminHorariosPage() {
    const session = await getAdminSession();
    if (!session) {
        redirect('/admin/login');
    }

    // Buscar configurações de horário e bloqueios cadastrados
    const [settings, blocks, professionals] = await Promise.all([
        prisma.scheduleSetting.findMany({
            orderBy: { dayOfWeek: 'asc' },
        }),
        prisma.blockedSlot.findMany({
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        }),
        prisma.professional.findMany({
            orderBy: { name: 'asc' },
        }),
    ]);

    return (
        <AdminScheduleClient
            initialSettings={settings.map((s) => ({
                id: s.id,
                dayOfWeek: s.dayOfWeek,
                isOpen: s.isOpen,
                openTime: s.openTime,
                closeTime: s.closeTime,
                breakStart: s.breakStart,
                breakEnd: s.breakEnd,
                slotIntervalMinutes: s.slotIntervalMinutes,
                professionalId: s.professionalId,
            }))}
            initialBlocks={blocks.map((b) => ({
                id: b.id,
                date: b.date,
                startTime: b.startTime,
                endTime: b.endTime,
                professionalId: b.professionalId,
                reason: b.reason,
                createdAt: b.createdAt.toISOString(),
            }))}
            professionals={professionals.map((p) => ({
                id: p.id,
                name: p.name,
            }))}
            adminName={session.name}
        />
    );
}
