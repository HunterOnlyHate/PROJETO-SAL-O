'use client';

import React from 'react';
import Image from 'next/image';
import { isOptimizableImage } from '@/lib/imageUtils';
import { salonData } from '@/data/salonData';
import { useBooking } from '@/context/BookingContext';

export function GallerySection() {
    const { openBookingModal } = useBooking();

    return (
        <section className="gallery-section">
            <div className="container">
                <div className="section-header">
                    <div className="section-tag">Portfólio Glamour Studio</div>
                    <h2 className="heading-lg section-title">Nosso Feed & Trabalhos</h2>
                    <p className="section-subtitle">
                        Acompanhe as tendências de mechas, sobrancelhas e unhas produzidas em nosso espaço.
                    </p>
                </div>

                <div className="gallery-grid" id="galleryGrid">
                    {salonData.gallery.map((item, index) => (
                        <div
                            key={index}
                            className="gallery-item"
                            onClick={() => openBookingModal()}
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                unoptimized={!isOptimizableImage(item.image)}
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                style={{ objectFit: 'contain' }}
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.srcset = '';
                                    target.src = '/assets/images/logo-glamour-studio.jpg';
                                }}
                            />
                            <div className="gallery-overlay">
                                <p>{item.category}</p>
                                <h4>{item.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
