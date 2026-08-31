import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { BookingProvider } from '@/context/BookingContext';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';

export const metadata: Metadata = {
    title: 'Glamour Studio | Graziele & Luciana Bezerra - Salão de Beleza & Boutique WePink',
    description:
        'Salão de beleza Glamour Studio por Graziele Bezerra & Luciana Bezerra. Especialistas em cabelos, alisamentos, mechas, cronograma capilar, sobrancelhas com henna, depilação, manicure e boutique oficial WePink com entrega grátis em Bonfim - RR.',
    icons: {
        icon: '/assets/images/logo-glamour-studio.jpg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=Great+Vibes&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <CartProvider>
                    <BookingProvider>
                        <PublicLayoutWrapper>
                            {children}
                        </PublicLayoutWrapper>
                    </BookingProvider>
                </CartProvider>
            </body>
        </html>
    );
}
