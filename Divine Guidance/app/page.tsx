'use client';

import { useState, useRef, useEffect } from 'react';

interface JournalEntry {
  id: string;
  date: string;
  worry: string;
  type: 'verse' | 'homily';
  content: string;
}

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
  const [stage, setStage] = useState<'input' | 'options' | 'loading' | 'result' | 'journal'>('input');
  const [result, setResult] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [lastType, setLastType] = useState<'verse' | 'homily' | null>(null);
  const [savedItems, setSavedItems] = useState<JournalEntry[]>([]);
  const [copyFeedback, setCopyFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load journal from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('divine-journal');
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse journal', e);
      }
    }
  }, []);

  const saveEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      worry,
      type: lastType || 'verse',
      content: result,
    };

    const updated = [newEntry, ...savedItems];
    setSavedItems(updated);
    localStorage.setItem('divine-journal', JSON.stringify(updated));
    setCopyFeedback('Saved to Journal!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const deleteEntry = (id: string) => {
    const updated = savedItems.filter(item => item.id !== id);
    setSavedItems(updated);
    localStorage.setItem('divine-journal', JSON.stringify(updated));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Divine Guidance',
      text: `My Worry: "${worry}"\n\nGuidance:\n${result}\n\nSeek wisdom at: https://divine-guidance.vercel.app`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const text = `My Worry: "${worry}"\n\nGuidance:\n${result}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Copied to Clipboard!');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
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
            {savedItems.length > 0 && (
              <button
                onClick={() => setStage('journal')}
                className="button-secondary"
                style={{ margin: '16px auto 0' }}
              >
                📖 My Journal ({savedItems.length})
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

            {/* Action Bar: Copy, Share, Save */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              <button onClick={handleCopy} className="button-secondary">
                📄 Copy
              </button>
              <button onClick={handleShare} className="button-secondary">
                📤 Share
              </button>
              <button onClick={saveEntry} className="button-secondary">
                💾 Save to Journal
              </button>
            </div>
            {copyFeedback && (
              <p style={{ color: 'var(--accent-gold)', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                {copyFeedback}
              </p>
            )}
          </div>
        )}

        {stage === 'journal' && (
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 className="heading-divine" style={{ fontSize: '28px', textAlign: 'left' }}>My Journal</h2>
              <button onClick={() => setStage('input')} className="button-secondary">Close</button>
            </div>

            {savedItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No entries yet.</p>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                {savedItems.map((item) => (
                  <div key={item.id} className="journal-entry">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p className="journal-date">{item.date} • {item.type === 'verse' ? 'Verse' : 'Homily'}</p>
                        <p className="journal-worry">"{item.worry}"</p>
                      </div>
                      <button
                        onClick={() => deleteEntry(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.5 }}
                        title="Delete Entry"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="journal-preview">{item.content}</p>
                    <button
                      onClick={() => {
                        setWorry(item.worry);
                        setResult(item.content);
                        setStage('result');
                        setLastType(item.type);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '13px', marginTop: '8px', cursor: 'pointer', padding: 0 }}
                    >
                      View Full Entry →
                    </button>
                  </div>
                ))}
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
        </div>
      )}
    </main>
  );
}
