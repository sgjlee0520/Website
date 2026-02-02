/**
 * Represents a saved guidance entry in localStorage
 */
export interface SavedGuidance {
  /** Unique identifier (timestamp-based) */
  id: string;
  /** Unix timestamp when saved */
  timestamp: number;
  /** The user's original concern/worry */
  input_concern: string;
  /** Bible verse text (null if homily was selected) */
  verse_text: string | null;
  /** Homily text (null if verse was selected) */
  homily_text: string | null;
}

/**
 * Share data structure for Web Share API
 */
export interface ShareData {
  title: string;
  text: string;
  url?: string;
}
