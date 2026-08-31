import { HeroSection } from '@/components/sections/HeroSection';
import { HomeHubSection } from '@/components/sections/HomeHubSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { AboutSection } from '@/components/sections/AboutSection';
import { TeamSection } from '@/components/sections/TeamSection';
import { BookingBanner } from '@/components/sections/BookingBanner';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <HomeHubSection />
            <GallerySection />
            <AboutSection />
            <TeamSection />
            <BookingBanner />
            <TestimonialsSection />
            <FaqSection />
            <ContactSection />
        </>
    );
}
