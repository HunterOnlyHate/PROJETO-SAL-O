import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { salonData } from '../src/data/salonData';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados Glamour Studio...');

    // 1. Criar usuário administrador pré-cadastrado no banco
    const adminEmail = 'teste@gmail.com';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'teste123';

    const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        await prisma.adminUser.create({
            data: {
                name: 'Administrador Glamour Studio',
                email: adminEmail,
                password: adminPassword,
                role: 'ADMIN',
            },
        });
        console.log(`✅ Usuário Administrador criado com sucesso: ${adminEmail} (Senha: ${adminPassword})`);
    } else {
        // Atualizar senha diretamente se necessário
        await prisma.adminUser.update({
            where: { email: adminEmail },
            data: { password: adminPassword },
        });
        console.log(`ℹ️ Usuário Administrador atualizado no banco (${adminEmail}) com senha em texto plano.`);
    }

    // 2. Semear Profissionais
    console.log('🌱 Semeando profissionais...');
    for (const pro of salonData.professionals) {
        await prisma.professional.upsert({
            where: { id: pro.id },
            update: {
                name: pro.name,
                role: pro.role,
                specialty: pro.specialty,
                image: pro.image || null,
                experience: pro.experience,
                whatsapp: pro.whatsapp,
            },
            create: {
                id: pro.id,
                name: pro.name,
                role: pro.role,
                specialty: pro.specialty,
                image: pro.image || null,
                experience: pro.experience,
                whatsapp: pro.whatsapp,
            },
        });
    }

    // 3. Semear Serviços
    console.log('🌱 Semeando serviços...');
    let serviceOrder = 0;
    for (const s of salonData.services) {
        serviceOrder++;
        await prisma.service.upsert({
            where: { id: s.id },
            update: {
                name: s.name,
                category: s.category,
                professionalId: s.professionalId,
                professionalName: s.professionalName,
                description: s.description,
                duration: s.duration,
                durationMinutes: s.durationMinutes,
                price: s.price,
                priceMax: s.priceMax ?? null,
                priceDisplay: s.priceDisplay ?? null,
                featured: s.featured,
                badge: s.badge ?? null,
                image: s.image,
                active: true,
                order: serviceOrder,
            },
            create: {
                id: s.id,
                name: s.name,
                category: s.category,
                professionalId: s.professionalId,
                professionalName: s.professionalName,
                description: s.description,
                duration: s.duration,
                durationMinutes: s.durationMinutes,
                price: s.price,
                priceMax: s.priceMax ?? null,
                priceDisplay: s.priceDisplay ?? null,
                featured: s.featured,
                badge: s.badge ?? null,
                image: s.image,
                active: true,
                order: serviceOrder,
            },
        });
    }

    // 4. Semear Produtos WePink
    console.log('🌱 Semeando produtos WePink...');
    let productOrder = 0;
    for (const p of salonData.products) {
        productOrder++;
        await prisma.product.upsert({
            where: { id: p.id },
            update: {
                name: p.name,
                brand: p.brand,
                category: p.category,
                description: p.description,
                volume: p.volume ?? null,
                price: p.price,
                badge: p.badge ?? null,
                image: p.image,
                stock: 15,
                featured: true,
                active: true,
                order: productOrder,
            },
            create: {
                id: p.id,
                name: p.name,
                brand: p.brand,
                category: p.category,
                description: p.description,
                volume: p.volume ?? null,
                price: p.price,
                badge: p.badge ?? null,
                image: p.image,
                stock: 15,
                featured: true,
                active: true,
                order: productOrder,
            },
        });
    }

    // 5. Semear Configurações de Horário de Funcionamento (Segunda a Sábado 10h-18h, Domingo Fechado)
    console.log('🌱 Semeando configurações de horários de funcionamento...');
    const defaultSchedules = [
        { dayOfWeek: 0, isOpen: false, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null }, // Domingo
        { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null },  // Segunda
        { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null },  // Terça
        { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null },  // Quarta
        { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null },  // Quinta
        { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null },  // Sexta
        { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '18:00', breakStart: null, breakEnd: null, slotIntervalMinutes: 30, professionalId: null },  // Sábado
    ];

    for (const sch of defaultSchedules) {
        const existing = await prisma.scheduleSetting.findFirst({
            where: { dayOfWeek: sch.dayOfWeek, professionalId: null },
        });

        if (!existing) {
            await prisma.scheduleSetting.create({
                data: sch,
            });
        }
    }

    console.log('🎉 Seed finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
