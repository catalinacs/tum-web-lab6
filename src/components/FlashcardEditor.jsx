import { useState, useEffect, useRef } from 'react';

function AutoTextarea({ value, onChange, placeholder, label }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div className="flashcard-editor-field">
      <textarea
        ref={ref}
        className="flashcard-editor-textarea"
        value={value}
        placeholder={placeholder}
        rows={1}
        onChange={onChange}
      />
      <span className="flashcard-editor-label">{label}</span>
    </div>
  );
}

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const BurgerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="8" x2="21" y2="8" />
    <line x1="3" y1="16" x2="21" y2="16" />
  </svg>
);

export default function FlashcardEditor({ deck, onBack, onAddCard, onDeleteCard, onUpdateCard, onReorderCards, onStudy, onRenameDeck, onAssignCourse, courses = [] }) {
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [dragIndex, setDragIndex]         = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [renamingDeck, setRenamingDeck]   = useState(false);
  const [renameValue, setRenameValue]     = useState(deck.name);
  const renameInputRef = useRef(null);

  const startRename = () => {
    setRenameValue(deck.name);
    setRenamingDeck(true);
    setTimeout(() => renameInputRef.current?.select(), 0);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== deck.name) onRenameDeck?.(deck.id, trimmed);
    setRenamingDeck(false);
  };

  const handleAddCard = () => {
    if (!newQ.trim() || !newA.trim()) return;
    onAddCard(deck.id, newQ.trim(), newA.trim());
    setNewQ('');
    setNewA('');
  };

  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Slight delay so the ghost image renders before opacity drops
    setTimeout(() => setDragIndex(index), 0);
  };

  const handleDragEnter = (index) => {
    if (index !== dragIndex) setDragOverIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      onReorderCards(deck.id, dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flashcard-editor-page">
      <div className="flashcard-study-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        {renamingDeck ? (
          <input
            ref={renameInputRef}
            className="flashcard-deck-rename-input"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingDeck(false); }}
          />
        ) : (
          <button className="flashcard-deck-name flashcard-deck-name--editable" onClick={startRename} title="Rename deck">
            {deck.name}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6, opacity: 0.5 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        <button className="btn btn-primary flashcard-done-btn" onClick={onBack}>Done</button>
      </div>

      {courses.length > 0 && (
        <div className="deck-course-assign-row">
          <span className="deck-course-assign-label">Course</span>
          <select
            className="select"
            value={deck.courseId ?? ''}
            onChange={e => onAssignCourse?.(deck.id, e.target.value || null)}
            style={{ borderRadius: 999, fontSize: '0.85rem', padding: '0.25rem 0.75rem', width: 'fit-content' }}
          >
            <option value="">No course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flashcard-editor-list">
        {deck.cards.map((card, i) => {
          const isDragging  = dragIndex === i;
          const isDropTarget = dragOverIndex === i;

          return (
            <div
              key={card.id}
              className={[
                'flashcard-editor-row',
                isDragging   ? 'flashcard-editor-row--dragging'    : '',
                isDropTarget ? 'flashcard-editor-row--drop-target' : '',
              ].join(' ')}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
            >
              <div className="flashcard-row-side">
                <span className="flashcard-editor-num">{i + 1}</span>
                <button className="flashcard-icon-btn flashcard-drag-handle" title="Drag to reorder">
                  <BurgerIcon />
                </button>
              </div>

              <div className="flashcard-editor-fields">
                <AutoTextarea
                  value={card.question}
                  onChange={e => onUpdateCard(deck.id, card.id, e.target.value, card.answer)}
                  placeholder="Enter term"
                  label="TERM"
                />
                <div className="flashcard-editor-divider" />
                <AutoTextarea
                  value={card.answer}
                  onChange={e => onUpdateCard(deck.id, card.id, card.question, e.target.value)}
                  placeholder="Enter a definition"
                  label="DEFINITION"
                />
              </div>

              <button
                className="flashcard-icon-btn flashcard-delete-btn"
                onClick={() => onDeleteCard(deck.id, card.id)}
                title="Delete card"
              >
                <TrashIcon />
              </button>
            </div>
          );
        })}

        <div className="flashcard-editor-row flashcard-editor-row--new">
          <div className="flashcard-row-side">
            <span className="flashcard-editor-num">{deck.cards.length + 1}</span>
            <span className="flashcard-icon-btn" style={{ visibility: 'hidden' }}><BurgerIcon /></span>
          </div>
          <div className="flashcard-editor-fields">
            <AutoTextarea
              value={newQ}
              onChange={e => setNewQ(e.target.value)}
              placeholder="Enter term"
              label="TERM"
            />
            <div className="flashcard-editor-divider" />
            <AutoTextarea
              value={newA}
              onChange={e => setNewA(e.target.value)}
              placeholder="Enter a definition"
              label="DEFINITION"
            />
          </div>
          <button
            className="flashcard-icon-btn flashcard-delete-btn"
            onClick={() => { setNewQ(''); setNewA(''); }}
            title="Clear"
            style={{ visibility: (newQ || newA) ? 'visible' : 'hidden' }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="flashcard-editor-bottom-row">
        <button className="add-card-btn" onClick={handleAddCard}>Add a card</button>
        <button
          className="btn btn-primary flashcard-study-now-btn"
          onClick={() => onStudy(deck)}
          disabled={deck.cards.length === 0}
        >
          Study
        </button>
      </div>
    </div>
  );
}
