/**
 * Determina se a imagem pode ser otimizada pelo servidor do Next.js
 * ou se deve usar unoptimized={true} para prevenir erros de host não configurado
 * quando o administrador cadastra URLs externas arbitrárias (ex: Google Imagens, Pinterest, etc.).
 */
export function isOptimizableImage(src?: string | null): boolean {
    if (!src) return true;
    const trimmed = src.trim();

    // Imagens locais do projeto (/assets/...) são sempre otimizadas pelo Next.js
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
        return true;
    }

    // Imagens base64 ou blob URLs
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return false;
    }

    try {
        const url = new URL(trimmed);
        const host = url.hostname.toLowerCase();
        // Domínios homologados com garantia de funcionamento no Next.js
        return host === 'res.cloudinary.com' || host === 'images.unsplash.com';
    } catch {
        return false;
    }
}
