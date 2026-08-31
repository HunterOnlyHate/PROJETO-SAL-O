/**
 * Utilitários para formatação, máscaras e suporte a números de telefone do:
 * - 🇧🇷 Brasil (+55): (95) 9XXXX-XXXX / (XX) XXXXX-XXXX
 * - 🇬🇾 Lethem / Guiana (+592): +592 XXX-XXXX (7 dígitos locais de Digicel / GTT)
 */

export type CountryPhoneCode = 'BR' | 'GY';

export interface PhoneCountryOption {
    code: CountryPhoneCode;
    name: string;
    flag: string;
    ddi: string;
    placeholder: string;
    maskDescription: string;
}

export const PHONE_COUNTRIES: Record<CountryPhoneCode, PhoneCountryOption> = {
    BR: {
        code: 'BR',
        name: 'Brasil',
        flag: '🇧🇷',
        ddi: '+55',
        placeholder: '(95) 98400-0000',
        maskDescription: '(DDD) 9XXXX-XXXX',
    },
    GY: {
        code: 'GY',
        name: 'Lethem (Guiana)',
        flag: '🇬🇾',
        ddi: '+592',
        placeholder: '+592 612-3456',
        maskDescription: '+592 XXX-XXXX (7 dígitos)',
    },
};

/**
 * Formata um número de telefone aplicando máscara dinâmica para Brasil ou Lethem / Guiana
 */
export function formatPhoneWithCountry(value: string, country: CountryPhoneCode = 'BR'): string {
    if (!value) return '';

    // Se o valor digitado começar com "+592" ou "592", muda automaticamente para GY
    if (value.startsWith('+592') || value.startsWith('592')) {
        country = 'GY';
    }

    let clean = value.replace(/\D/g, '');

    if (country === 'GY') {
        // Se já digitou o 592 no início, remove para formatar os 7 dígitos
        if (clean.startsWith('592')) {
            clean = clean.slice(3);
        }
        if (clean.length > 7) clean = clean.slice(0, 7);

        if (clean.length === 0) return '';
        if (clean.length <= 3) {
            return `+592 ${clean}`;
        }
        return `+592 ${clean.slice(0, 3)}-${clean.slice(3)}`;
    }

    // Caso BR (+55)
    if (clean.startsWith('55') && clean.length > 11) {
        clean = clean.slice(2);
    }
    if (clean.length > 11) clean = clean.slice(0, 11);

    if (clean.length === 0) return '';
    if (clean.length <= 2) {
        return `(${clean}`;
    }
    if (clean.length <= 6) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    }
    if (clean.length <= 10) {
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
}

/**
 * Detecta se o telefone inserido pertence a Lethem (Guiana) ou Brasil
 */
export function detectCountryFromPhone(phone: string): CountryPhoneCode {
    if (!phone) return 'BR';
    const clean = phone.replace(/\D/g, '');
    if (phone.includes('+592') || clean.startsWith('592') || (clean.length === 7 && !phone.includes('('))) {
        return 'GY';
    }
    return 'BR';
}

/**
 * Higieniza o número de telefone para o padrão internacional do WhatsApp (ex: 5595984072160 ou 5926123456)
 */
export function sanitizeInternationalPhone(phone: string): string {
    let clean = phone.replace(/\D/g, '');
    if (clean.length === 0) return '';

    // Caso Lethem / Guiana (DDI 592)
    if (clean.startsWith('592')) {
        return clean;
    }
    if (clean.length === 7) {
        return `592${clean}`;
    }

    // Caso Brasil (DDI 55)
    if (!clean.startsWith('55') && (clean.length === 10 || clean.length === 11)) {
        clean = `55${clean}`;
    }
    return clean;
}

/**
 * Valida se o número possui a quantidade mínima e correta de dígitos para o país
 */
export function isPhoneValid(phone: string): boolean {
    if (!phone) return false;
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('592')) {
        return clean.length === 10; // 592 + 7 dígitos
    }
    if (clean.length === 7) {
        return true; // 7 dígitos Lethem
    }
    if (clean.startsWith('55')) {
        return clean.length === 12 || clean.length === 13;
    }
    return clean.length >= 10 && clean.length <= 11;
}
