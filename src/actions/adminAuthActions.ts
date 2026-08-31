'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
    ADMIN_COOKIE_NAME,
    comparePassword,
    createSessionToken,
    getAdminSession,
} from '@/lib/auth';

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export async function loginAdminAction(formData: FormData): Promise<AuthResponse> {
    try {
        const email = formData.get('email')?.toString().trim().toLowerCase();
        const password = formData.get('password')?.toString();

        if (!email || !password) {
            return { success: false, message: 'Informe o e-mail e a senha.' };
        }

        const admin = await prisma.adminUser.findUnique({
            where: { email },
        });

        if (!admin) {
            return { success: false, message: 'Credenciais inválidas. Verifique os dados.' };
        }

        const isPasswordValid = await comparePassword(password, admin.password);
        if (!isPasswordValid) {
            return { success: false, message: 'Credenciais inválidas. Verifique os dados.' };
        }

        const token = await createSessionToken({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
        });

        const cookieStore = await cookies();
        cookieStore.set(ADMIN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        return {
            success: true,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
        };
    } catch (error) {
        console.error('Erro no login admin:', error);
        return { success: false, message: 'Ocorreu um erro interno ao realizar login.' };
    }
}

export async function logoutAdminAction(): Promise<{ success: boolean }> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(ADMIN_COOKIE_NAME);
        return { success: true };
    } catch {
        return { success: false };
    }
}

export async function getCurrentAdminAction() {
    return await getAdminSession();
}
