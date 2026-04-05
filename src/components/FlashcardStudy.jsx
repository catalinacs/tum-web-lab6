import { useState, useCallback } from 'react';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 14L4 9l5-5"/>
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
  </svg>
);

const ShuffleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"/>
    <line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/>
    <line x1="15" y1="15" x2="21" y2="21"/>
  </svg>
);

export default function FlashcardStudy({ deck, onBack }) {
  const [cards, setCards]             = useState(deck.cards);
  const [index, setIndex]             = useState(0);
  const [isFlipped, setIsFlipped]     = useState(false);
  const [known, setKnown]             = useState(new Set());
  const [learning, setLearning]       = useState(new Set());
  const [history, setHistory]         = useState([]);
  const [roundDone, setRoundDone]     = useState(false);
  const [allDone, setAllDone]         = useState(false);
  const [animState, setAnimState]     = useState(''); // 'exit-left' | 'exit-right' | 'enter' | ''

  const card = cards[index];
  const total = cards.length;

  const animateThen = useCallback((direction, callback) => {
    setAnimState(direction === 'left' ? 'exit-left' : 'exit-right');
    setTimeout(() => {
      callback();
      setIsFlipped(false);
      setAnimState('enter');
      setTimeout(() => setAnimState(''), 220);
    }, 200);
  }, []);

  const advance = (cardId, isKnown) => {
    setHistory(h => [...h, { index, cardId, wasKnown: known.has(cardId), wasLearning: learning.has(cardId) }]);

    if (isKnown) {
      setKnown(prev => new Set([...prev, cardId]));
      setLearning(prev => { const s = new Set(prev); s.delete(cardId); return s; });
    } else {
      setLearning(prev => new Set([...prev, cardId]));
      setKnown(prev => { const s = new Set(prev); s.delete(cardId); return s; });
    }

    animateThen(isKnown ? 'right' : 'left', () => {
      if (index + 1 >= total) {
        const newLearning = new Set(learning);
        if (isKnown) newLearning.delete(cardId); else newLearning.add(cardId);
        const newKnown = new Set(known);
        if (isKnown) newKnown.add(cardId); else newKnown.delete(cardId);
        const learningCards = deck.cards.filter(c => newLearning.has(c.id));
        if (learningCards.length === 0) setAllDone(true);
        else setRoundDone(true);
      } else {
        setIndex(i => i + 1);
      }
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    animateThen('left', () => {
      setIndex(last.index);
      setKnown(prev => { const s = new Set(prev); if (last.wasKnown) s.add(last.cardId); else s.delete(last.cardId); return s; });
      setLearning(prev => { const s = new Set(prev); if (last.wasLearning) s.add(last.cardId); else s.delete(last.cardId); return s; });
    });
  };

  const handleShuffle = () => {
    const remaining = cards.slice(index);
    const before = cards.slice(0, index);
    setCards([...before, ...shuffleArray(remaining)]);
    setIsFlipped(false);
  };

  const startNextRound = () => {
    const learningCards = deck.cards.filter(c => learning.has(c.id));
    setCards(shuffleArray(learningCards));
    setIndex(0);
    setIsFlipped(false);
    setHistory([]);
    setRoundDone(false);
  };

  const resetAll = () => {
    setCards(deck.cards);
    setIndex(0);
    setIsFlipped(false);
    setKnown(new Set());
    setLearning(new Set());
    setHistory([]);
    setRoundDone(false);
    setAllDone(false);
  };

  if (allDone) {
    return (
      <div className="flashcard-study-page">
        <div className="flashcard-study-header">
          <span className="flashcard-deck-name">{deck.name}</span>
          <button className="flashcard-close-btn" onClick={onBack} title="Exit">✕</button>
        </div>
        <div className="flashcard-done-screen">
            <h2 className="flashcard-done-title">You know all of them!</h2>
          <p className="flashcard-done-sub">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''} mastered</p>
          <button className="btn btn-primary" style={{ borderRadius: 999, fontFamily: "'Righteous', sans-serif", marginTop: '1rem' }} onClick={resetAll}>Study again</button>
          <button className="btn btn-ghost" style={{ marginTop: '0.5rem' }} onClick={onBack}>Back to decks</button>
        </div>
      </div>
    );
  }

  if (roundDone) {
    const learningCards = deck.cards.filter(c => learning.has(c.id));
    return (
      <div className="flashcard-study-page">
        <div className="flashcard-study-header">
          <span className="flashcard-deck-name">{deck.name}</span>
          <button className="flashcard-close-btn" onClick={onBack} title="Exit">✕</button>
        </div>
        <div className="flashcard-done-screen">
            <h2 className="flashcard-done-title">Round complete</h2>
          <p className="flashcard-done-sub">
            <span style={{ color: '#7a9e7e', fontWeight: 700 }}>{known.size} known</span>
            {' · '}
            <span style={{ color: '#5c4a4a', fontWeight: 700 }}>{learningCards.length} still learning</span>
          </p>
          <button className="btn btn-primary" style={{ borderRadius: 999, fontFamily: "'Righteous', sans-serif", marginTop: '1rem' }} onClick={startNextRound}>
            Keep studying
          </button>
          <button className="btn btn-ghost" style={{ marginTop: '0.5rem' }} onClick={onBack}>Stop for now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-study-page">
      <div className="flashcard-study-header">
        <span className="flashcard-deck-name">{deck.name}</span>
        <button className="flashcard-close-btn" onClick={onBack} title="Exit">✕</button>
      </div>

      <div className="flashcard-progress-bar-row">
        <span className="flashcard-progress-label learning">
          <span className="flashcard-progress-pill learning">{learning.size}</span>
          Still learning
        </span>
        <span className="flashcard-progress-center">{index + 1} / {total}</span>
        <span className="flashcard-progress-label known">
          Know
          <span className="flashcard-progress-pill known">{known.size}</span>
        </span>
      </div>

      <div className={`flashcard-scene${animState ? ` flashcard-scene--${animState}` : ''}`} onClick={() => !animState && setIsFlipped(f => !f)}>
        <div className={`flashcard-inner${isFlipped ? ' flipped' : ''}`}>
          <div className="flashcard-face flashcard-front">
            <span className="flashcard-label">Term</span>
            <p className="flashcard-text">{card.question}</p>
            <span className="flashcard-hint">Click to flip</span>
          </div>
          <div className="flashcard-face flashcard-back">
            <span className="flashcard-label">Definition</span>
            <p className="flashcard-text">{card.answer}</p>
          </div>
        </div>
      </div>

      <div className="flashcard-nav">
        <div className="flashcard-know-btns">
          <button className="flashcard-know-btn flashcard-know-btn--no" onClick={() => advance(card.id, false)} title="Still learning">✕</button>
          <button className="flashcard-know-btn flashcard-know-btn--yes" onClick={() => advance(card.id, true)} title="Know it">✓</button>
        </div>
        <div className="flashcard-nav-icons">
          <button className="flashcard-nav-icon-btn" onClick={handleUndo} disabled={history.length === 0} title="Undo">
            <UndoIcon />
          </button>
          <button className="flashcard-nav-icon-btn" onClick={handleShuffle} title="Shuffle remaining">
            <ShuffleIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
