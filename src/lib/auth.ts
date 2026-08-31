import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'glamour_studio_super_secret_jwt_key_2026_bonfim_rr_secure_app'
);

export const ADMIN_COOKIE_NAME = 'glamour_admin_session';

export interface AdminSessionUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export async function hashPassword(password: string): Promise<string> {
    return password;
}

export async function comparePassword(password: string, storedPassword: string): Promise<boolean> {
    if (!storedPassword || !password) return false;
    if (password === storedPassword) return true;
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
        try {
            return await bcrypt.compare(password, storedPassword);
        } catch {
            return false;
        }
    }
    return false;
}

export async function createSessionToken(user: AdminSessionUser): Promise<string> {
    return new SignJWT({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AdminSessionUser | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return {
            id: payload.id as string,
            email: payload.email as string,
            name: payload.name as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

export async function getAdminSession(): Promise<AdminSessionUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
        if (!token) return null;
        return await verifySessionToken(token);
    } catch {
        return null;
    }
}
