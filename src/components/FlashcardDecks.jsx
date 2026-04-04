import { useState } from 'react';

export default function FlashcardDecks({ decks, courses, onAddDeck, onDeleteDeck, onStudy, onEdit }) {
  const [deckName, setDeckName]     = useState('');
  const [deckCourse, setDeckCourse] = useState('');

  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));

  const handleAddDeck = (e) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    onAddDeck(deckName.trim(), deckCourse || null);
    setDeckName('');
    setDeckCourse('');
  };

  const grouped = decks.reduce((acc, deck) => {
    const key = deck.courseId ?? '__none__';
    if (!acc[key]) acc[key] = [];
    acc[key].push(deck);
    return acc;
  }, {});

  return (
    <div className="flashcard-decks-page">
      <div className="card">
        <p className="section-title">New Deck</p>
        <form className="flashcard-new-deck-form" onSubmit={handleAddDeck}>
          <input
            className="input"
            type="text"
            placeholder="Deck name"
            value={deckName}
            onChange={e => setDeckName(e.target.value)}
            required
          />
          <select
            className="select"
            value={deckCourse}
            onChange={e => setDeckCourse(e.target.value)}
            style={{ borderRadius: 999, flex: 1, minWidth: 140, border: '1.5px solid var(--border)' }}
          >
            <option value="">No course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Create</button>
        </form>
      </div>

      {decks.length === 0 ? (
        <div className="card">
          <p className="empty-state">No decks yet. Create one above.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([courseId, groupDecks]) => {
          const course = courseMap[courseId];
          return (
            <div key={courseId} className="card">
              <p className="section-title" style={{ color: course?.color }}>
                {course?.name ?? 'No Course'}
              </p>
              <div className="deck-list">
                {groupDecks.map(deck => (
                  <div
                    key={deck.id}
                    className="deck-card"
                    style={{ borderLeftColor: course?.color ?? '#f4a7b9' }}
                  >
                    <div className="deck-info" onClick={() => onEdit(deck)} style={{ cursor: 'pointer' }}>
                      <span className="deck-name deck-name--clickable">{deck.name}</span>
                      <span className="deck-count">{deck.cards.length} card{deck.cards.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="deck-actions">
                      <button
                        className="btn btn-primary"
                        disabled={deck.cards.length === 0}
                        onClick={() => onStudy(deck)}
                      >
                        Study
                      </button>
                      <button className="btn btn-ghost" onClick={() => onEdit(deck)}>
                        Add Cards
                      </button>
                      <button className="btn btn-danger" onClick={() => onDeleteDeck(deck.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
