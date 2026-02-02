'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    duration?: number;
    onClose: () => void;
}

/**
 * Lightweight toast notification component.
 * Auto-dismisses after duration (default 2s).
 */
export function Toast({ message, duration = 2000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '20px'})`,
                background: 'var(--accent-gold)',
                color: '#1a1a1a',
                padding: '12px 24px',
                borderRadius: '24px',
                fontWeight: 500,
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease',
                zIndex: 1000,
            }}
        >
            {message}
        </div>
    );
}

/**
 * Hook for managing toast state
 */
export function useToast() {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
    };

    const hideToast = () => {
        setToast(null);
    };

    return { toast, showToast, hideToast };
}
