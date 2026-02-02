'use client';

import { useState } from 'react';

interface SaveButtonProps {
    /** User's original concern/worry */
    concern: string;
    /** Verse text (if verse was requested) */
    verseText?: string | null;
    /** Homily text (if homily was requested) */
    homilyText?: string | null;
    /** Callback when save is successful */
    onSave: () => void;
    /** Optional custom className */
    className?: string;
}

/**
 * Save button component for persisting guidance to localStorage.
 * Triggers onSave callback which should handle the actual save logic
 * via useSavedGuidance hook.
 */
export function SaveButton({
    concern,
    verseText,
    homilyText,
    onSave,
    className = 'button-secondary',
}: SaveButtonProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (isSaving) return;

        // Validate that we have content to save
        if (!concern || (!verseText && !homilyText)) {
            console.warn('Cannot save: missing content');
            return;
        }

        setIsSaving(true);
        onSave();

        // Brief visual feedback
        setTimeout(() => setIsSaving(false), 500);
    };

    return (
        <button
            onClick={handleSave}
            className={className}
            disabled={isSaving}
            aria-label="Save to Journal"
        >
            {isSaving ? '✓ Saved' : '💾 Save to Journal'}
        </button>
    );
}
