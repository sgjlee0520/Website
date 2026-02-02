'use client';

import { useState, useRef } from 'react';
import { SaveButton, ShareButton, Toast, useToast } from './components';
import { useSavedGuidance } from './hooks';
import type { SavedGuidance } from './types';

// Simple markdown parser for bold text
function parseMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Helper to format timestamp as readable date
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export default function Home() {
  const [worry, setWorry] = useState('');
  const [stage, setStage] = useState<'input' | 'options' | 'loading' | 'result' | 'journal'>('input');
  const [result, setResult] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [lastType, setLastType] = useState<'verse' | 'homily' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the new hooks
  const { savedGuidance, saveGuidance, deleteGuidance, count } = useSavedGuidance();
  const { toast, showToast, hideToast } = useToast();

  // Handle save using the new hook
  const handleSave = () => {
    saveGuidance({
      input_concern: worry,
      verse_text: lastType === 'verse' ? result : null,
      homily_text: lastType === 'homily' ? result : null,
    });
    showToast('Saved to Journal!');
  };

  // Handle share success callback
  const handleShareSuccess = (method: 'share' | 'clipboard') => {
    if (method === 'clipboard') {
      showToast('Copied to Clipboard!');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && worry.trim() !== '') {
      setStage('options');
    }
  };

  const fetchGuidance = async (type: 'verse' | 'homily') => {
    // Set loading state with appropriate message
    if (type === 'verse') {
      setLoadingMessage('Looking Through the Bible...');
    } else {
      setLoadingMessage('Seeking Wisdom From Priests...');
    }
    setStage('loading');
    setResult('');
    setLastType(type);

    try {
      const res = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worry, type }),
      });

      const data = await res.json();
      if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult(data.content);
      }
      setStage('result');
    } catch (err) {
      setResult('Something went wrong. Please try again.');
      setStage('result');
    }
  };

  const reset = () => {
    setWorry('');
    setStage('input');
    setResult('');
    setLoadingMessage('');
    setLastType(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Build share text
  const shareText = `My Concern: "${worry}"\n\nGuidance:\n${result}`;
  const shareUrl = 'https://divine-guidance.vercel.app';

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '48px 24px 32px',
    }}>
      {/* Center content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '720px' }}>

        {stage === 'input' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', width: '100%' }}>
            <h1 className="heading-divine" style={{ fontSize: '40px', marginBottom: '8px' }}>
              Share your burden
            </h1>
            {count > 0 && (
              <button
                onClick={() => setStage('journal')}
                className="button-secondary"
                style={{ margin: '16px auto 0' }}
              >
                📖 My Journal ({count})
              </button>
            )}
          </div>
        )}

        {stage === 'options' && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              "{worry}"
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => fetchGuidance('verse')}
                className="button-primary"
              >
                Verse
              </button>
              <button
                onClick={() => fetchGuidance('homily')}
                className="button-primary"
              >
                Homily
              </button>
            </div>
            <button
              onClick={() => setStage('input')}
              style={{ marginTop: '24px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}
            >
              Cancel
            </button>
          </div>
        )}

        {stage === 'loading' && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '20px', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
              {loadingMessage}
            </p>
          </div>
        )}

        {stage === 'result' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', width: '100%' }}>
            <div className="result-panel" style={{ textAlign: 'left' }}>
              {result.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: '12px', lineHeight: '1.7' }}>
                  {parseMarkdown(line)}
                </p>
              ))}
            </div>

            {/* Action Bar: Share, Save */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              <ShareButton
                title="Divine Guidance"
                text={shareText}
                url={shareUrl}
                onSuccess={handleShareSuccess}
              />
              <SaveButton
                concern={worry}
                verseText={lastType === 'verse' ? result : null}
                homilyText={lastType === 'homily' ? result : null}
                onSave={handleSave}
              />
            </div>
          </div>
        )}

        {stage === 'journal' && (
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="heading-divine" style={{ fontSize: '28px', textAlign: 'left' }}>My Journal</h2>
              <button onClick={() => setStage('input')} className="button-secondary">Close</button>
            </div>

            {savedGuidance.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No entries yet.</p>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                {savedGuidance.map((item) => {
                  const itemType = item.verse_text ? 'verse' : 'homily';
                  const content = item.verse_text || item.homily_text || '';
                  return (
                    <div key={item.id} className="journal-entry">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p className="journal-date">{formatDate(item.timestamp)} • {itemType === 'verse' ? 'Verse' : 'Homily'}</p>
                          <p className="journal-worry">"{item.input_concern}"</p>
                        </div>
                        <button
                          onClick={() => deleteGuidance(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.5 }}
                          title="Delete Entry"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="journal-preview">{content}</p>
                      <button
                        onClick={() => {
                          setWorry(item.input_concern);
                          setResult(content);
                          setStage('result');
                          setLastType(itemType);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '13px', marginTop: '8px', cursor: 'pointer', padding: 0 }}
                      >
                        View Full Entry →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom buttons - shown on result stage */}
      {stage === 'result' && (
        <div style={{ width: '100%', maxWidth: '720px', marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => fetchGuidance(lastType === 'verse' ? 'homily' : 'verse')}
              className="button-primary"
            >
              {lastType === 'verse' ? 'Homily' : 'Verse'}
            </button>
            <button
              onClick={reset}
              className="button-primary"
            >
              Seek Again
            </button>
          </div>
        </div>
      )}

      {/* Bottom chat input - Gemini style */}
      {stage === 'input' && (
        <div style={{ width: '100%', maxWidth: '720px', marginTop: '48px' }}>
          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              value={worry}
              onChange={(e) => setWorry(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What is worrying you today?"
              className="chat-input"
              autoFocus
            />
          </div>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-placeholder)' }}>
            Press Enter to seek guidance
          </p>
          <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.3, fontSize: '10px' }}>
            v1.1 (Share & Save)
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && <Toast message={toast} onClose={hideToast} />}
    </main>
  );
}
