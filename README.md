# StudySync

## Description
A client-side study productivity app built with React + Vite. StudySync helps students manage their courses, study sessions, flashcards, and upcoming events all in one place — with a pastel aesthetic and full light/dark theme support.

## Features

- **Home Dashboard** — See upcoming events grouped by urgency (Today / This Week / Later), dismiss events, and get a daily motivational quote
- **Courses** — Add and manage your courses, each auto-assigned a pastel color; log study sessions directly from the course list
- **Pomodoro Timer** — Customizable work/break timer linked to a selected course; sessions are automatically logged on completion
- **Flashcards** — Create decks per course:
  - Side-by-side Term / Definition layout
  - Drag-and-drop card reordering
  - Auto-resizing textareas
  - Click deck name to view and edit cards
- **Flashcard Study Mode** — Flip cards with a 3D animation, mark cards as *Know* or *Still Learning*, track progress across rounds, and keep studying wrong cards until all are mastered; smooth slide animation between cards
- **Calendar** — Monthly calendar view; click any day to add events (Test, Quiz, Assignment, Deadline); upcoming events listed on the right
- **Stats** — Track total sessions, total minutes studied, and your current daily streak
- **Light / Dark theme** — Toggle between pastel light mode and dark mode; preference persists across sessions
- **Persistent data** — All courses, sessions, events, and flashcard decks saved in `localStorage`

## Tech Stack

- React 18 + Vite
- CSS custom properties for theming (light/dark via `data-theme` attribute)
- HTML5 Drag and Drop API for flashcard reordering
- `localStorage` for client-side persistence
- Google Fonts: Righteous, Allura, Playfair Display, PT Serif, Pinyon Script

## Live Demo

[StudySync](https://catalinacs.github.io/tum-web-lab6)

## How to run locally

```bash
npm install
npm run dev
```
