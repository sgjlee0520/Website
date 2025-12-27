'use client';

import { useState, useRef } from 'react';

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

export default function Home() {
  const [worry, setWorry] = useState('');
  const [stage, setStage] = useState<'input' | 'options' | 'loading' | 'result'>('input');
  const [result, setResult] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [lastType, setLastType] = useState<'verse' | 'homily' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h1 className="heading-divine" style={{ fontSize: '40px', marginBottom: '8px' }}>
              Share your burden
            </h1>
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
        </div>
      )}
    </main>
  );
}
