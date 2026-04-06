import { useState } from 'react';
import FlashcardDecks from './FlashcardDecks';
import AddCourseForm from './AddCourseForm';
import CourseList from './CourseList';

const TABS = ['Flashcard sets', 'Courses'];

export default function Library({
  decks, courses, sessions,
  onAddDeck, onDeleteDeck, onStudy, onEdit,
  onAddCourse, onDeleteCourse, onSelectCourse, onRenameCourse,
}) {
  const [activeTab, setActiveTab] = useState('Flashcard sets');
  const [search, setSearch] = useState('');

  const filteredDecks = decks.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="library-page">
      <h1 className="library-title">Your Library</h1>

      <div className="library-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`library-tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Flashcard sets' && (
        <div className="library-flashcards">
          <div className="library-search-row">
            <input
              className="input library-search"
              type="text"
              placeholder="Search flashcards"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <FlashcardDecks
            decks={filteredDecks}
            courses={courses}
            onAddDeck={onAddDeck}
            onDeleteDeck={onDeleteDeck}
            onStudy={onStudy}
            onEdit={onEdit}
          />
        </div>
      )}

      {activeTab === 'Courses' && (
        <div className="library-courses">
          <div className="card">
            <p className="section-title">Add Course</p>
            <AddCourseForm onAddCourse={onAddCourse} />
          </div>
          <div className="card">
            <p className="section-title">My Courses</p>
            <CourseList
              courses={courses}
              setCourses={() => {}}
              sessions={sessions}
              selectedCourse={null}
              setSelectedCourse={onSelectCourse}
              onRenameCourse={onRenameCourse}
            />
          </div>
        </div>
      )}
    </div>
  );
}
