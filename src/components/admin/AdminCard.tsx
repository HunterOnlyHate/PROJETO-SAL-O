'use client';

import React, { useState } from 'react';

interface AdminCardProps {
    title: string;
    value: string | number;
    icon: string;
    subtitle?: string;
    trend?: string;
    trendColor?: string;
    accentColor?: string;
    onClick?: () => void;
    isActive?: boolean;
}

export function AdminCard({
    title,
    value,
    icon,
    subtitle,
    trend,
    trendColor = '#51cf66',
    accentColor = '#d6336c',
    onClick,
    isActive = false,
}: AdminCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isClickable = !!onClick;

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => isClickable && setIsHovered(true)}
            onMouseLeave={() => isClickable && setIsHovered(false)}
            onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            style={{
                backgroundColor: isActive
                    ? '#221b25'
                    : isHovered
                    ? '#201a23'
                    : '#1d1920',
                border: isActive
                    ? `1.5px solid ${accentColor}`
                    : isHovered
                    ? `1px solid ${accentColor}80`
                    : '1px solid rgba(235, 100, 150, 0.12)',
                borderRadius: '16px',
                padding: '1.15rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: isActive
                    ? `0 6px 24px rgba(0, 0, 0, 0.35), 0 0 16px ${accentColor}33`
                    : isHovered
                    ? `0 6px 20px rgba(0, 0, 0, 0.3), 0 0 10px ${accentColor}20`
                    : '0 4px 20px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                minWidth: 0,
                cursor: isClickable ? 'pointer' : 'default',
                transform: isClickable && isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                outline: 'none',
                userSelect: isClickable ? 'none' : 'auto',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: isActive ? '4px' : '3px',
                    background: `linear-gradient(90deg, ${accentColor}, transparent)`,
                }}
            />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.4rem',
                }}
            >
                <span
                    style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isActive ? '#fff' : '#a89fad',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </span>
                <div
                    style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '9px',
                        backgroundColor: isActive
                            ? `${accentColor}25`
                            : 'rgba(255, 255, 255, 0.05)',
                        border: isActive
                            ? `1px solid ${accentColor}50`
                            : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.15rem',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
            </div>

            <div
                style={{
                    fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: 'var(--font-heading, "Playfair Display", serif)',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >
                {value}
            </div>

            {(subtitle || trend) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.74rem',
                        color: '#8b8491',
                        flexWrap: 'wrap',
                        marginTop: 'auto',
                    }}
                >
                    {trend && (
                        <span style={{ color: trendColor, fontWeight: 600 }}>
                            {trend}
                        </span>
                    )}
                    {subtitle && <span style={{ opacity: 0.85 }}>{subtitle}</span>}
                </div>
            )}
        </div>
    );
}
