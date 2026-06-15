# برا السالفة / Bra Salfa

A mobile-first Moroccan Darija party game built with React + Vite. The game runs fully in the browser with no backend, database, login, or network requirement after the static files are loaded.

## Features

- RTL Arabic/Darija interface.
- Player setup with remove controls and 3-player minimum.
- Category mode or Global mode using a Moroccan-friendly word bank.
- One outsider by default, or two outsiders when there are at least 6 players.
- Safe phone-passing reveal flow that hides each previous role.
- Optional random question pairs where the same player never asks themselves.
- Restart with the same players or start a new game.
- Ready for GitHub Pages deployment.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repository includes `.github/workflows/deploy.yml`. To deploy:

1. Push the project to GitHub.
2. In repository settings, enable **Pages** and choose **GitHub Actions** as the source.
3. Push to the `main` branch. The workflow builds the Vite app and publishes `dist/` to GitHub Pages.

The Vite config sets the Pages base path to `/imposter/` when the GitHub repository name is `imposter`, and `/` for local development.
