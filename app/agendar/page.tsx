import React from 'react';
import { getPublicServices } from '@/actions/dataActions';
import { AgendarListClient } from '@/components/booking/AgendarListClient';

export const revalidate = 60;

export default async function AgendarPage() {
    const services = await getPublicServices();
    return <AgendarListClient initialServices={services} />;
}
