'use client';

import { useState, useCallback } from 'react';
import type { ShareData } from '../types';

interface ShareButtonProps {
    /** Title for the share */
    title: string;
    /** Main text content to share */
    text: string;
    /** Optional URL to include */
    url?: string;
    /** Callback when share/copy is successful */
    onSuccess?: (method: 'share' | 'clipboard') => void;
    /** Callback when share/copy fails */
    onError?: (error: Error) => void;
    /** Optional custom className */
    className?: string;
}

/**
 * Share button with Web Share API support and clipboard fallback.
 * 
 * Behavior:
 * - Mobile: Opens native OS share sheet via navigator.share()
 * - Desktop (no Web Share API): Falls back to clipboard copy
 */
export function ShareButton({
    title,
    text,
    url,
    onSuccess,
    onError,
    className = 'button-secondary',
}: ShareButtonProps) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = useCallback(async () => {
        if (isSharing) return;
        setIsSharing(true);

        const shareData: ShareData = { title, text };
        if (url) shareData.url = url;

        try {
            // Check if Web Share API is available
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share(shareData);
                onSuccess?.('share');
            } else {
                // Fallback to clipboard
                await handleClipboardFallback();
            }
        } catch (error) {
            // User cancelled share is not an error
            if (error instanceof Error && error.name === 'AbortError') {
                // User cancelled - do nothing
            } else if (error instanceof Error) {
                console.error('Share failed:', error);
                // Try clipboard as last resort
                await handleClipboardFallback();
            }
        } finally {
            setIsSharing(false);
        }
    }, [title, text, url, onSuccess, isSharing]);

    const handleClipboardFallback = async () => {
        try {
            const clipboardText = url ? `${text}\n\n${url}` : text;
            await navigator.clipboard.writeText(clipboardText);
            onSuccess?.('clipboard');
        } catch (error) {
            if (error instanceof Error) {
                onError?.(error);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className={className}
            disabled={isSharing}
            aria-label="Share guidance"
        >
            {isSharing ? '📤 Sharing...' : '📤 Share'}
        </button>
    );
}

/**
 * Utility to check if Web Share API is available
 */
export function isShareSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.share;
}
