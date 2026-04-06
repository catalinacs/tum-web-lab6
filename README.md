# StudySync

## Description
A client-side study productivity app built with React + Vite. StudySync helps students manage their courses, study sessions, flashcards, and upcoming events all in one place — with a pastel aesthetic and full light/dark theme support.

## Live Demo

[StudySync](https://catalinacs.github.io/tum-web-lab6)

## Features

- **Home Dashboard** — Daily motivational quote, inline monthly calendar with day-click event editing, and a Recents section showing your latest flashcard sets
- **Your Library** — Unified page with tabs for Flashcard Sets and Courses
  - Flashcard sets grouped by course, with search; create decks and assign them to a course at any time
  - Courses list with rename and delete; one-click Study Now to jump to the timer
- **Timer** — Minimal timer with customizable duration; Start / Pause / Continue / Reset / Skip controls; audio chime on completion; sessions auto-logged on finish
- **Flashcards** — Create and manage decks per course:
  - Rename deck inline from the editor header
  - Assign or reassign a deck to any course after creation
  - Drag-and-drop card reordering
  - Auto-resizing text areas
- **Flashcard Study Mode** — Flip cards with a 3D animation, mark cards as *Know* or *Still Learning*, track progress across rounds
- **Calendar** — Monthly calendar embedded on the home page; click any day to view, add, edit, or delete events (Test, Quiz, Assignment, Deadline); upcoming events listed beside the calendar
- **Stats** — Track total sessions, total minutes studied, and your current daily streak; bar chart of sessions by course; session log with per-entry delete
- **Light / Dark theme** — Pastel light mode and dark mode; preference persists across sessions
- **Mobile layout** — Hamburger menu on mobile, responsive calendar and card layouts
- **Persistent data** — All data saved in `localStorage`

## Tech Stack

- React 18 + Vite
- CSS custom properties for theming (light/dark via `data-theme` attribute)
- Web Audio API for timer completion chime
- HTML5 Drag and Drop API for flashcard reordering
- `localStorage` for client-side persistence
- Google Fonts: Righteous, Allura, Playfair Display

## How to run locally

```bash
npm install
npm run dev
```
