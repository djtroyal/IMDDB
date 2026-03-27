# IMDDB — Internet Movie Death Database

A visually rich, interactive web application for exploring the mortality statistics of on-screen cast members for any movie.

## Features

- **Movie Search** — Search any movie with live autocomplete
- **Death Statistics** — Median & mean age at death, earliest/most recent death, youngest/oldest death, oldest living cast member, % deceased
- **Interactive Death Timeline** — Color-coded chronological timeline of deaths, hover for details
- **Age Distribution Chart** — Bar chart showing decades of death ages
- **Cast Grid** — All on-screen cast (actors only, no crew) with alive/deceased indicators and filtering
- **Cast Detail Modal** — Click any cast member for full details including:
  - Birth and death dates
  - Cause of death (sourced from Find a Grave)
  - Final resting place (cemetery + location)
  - Link to Find a Grave memorial
- **Dark cinematic UI** — Responsive, mobile-friendly design

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** (dark theme)
- **Recharts** (age distribution bar chart)
- **Cheerio** (server-side Find a Grave scraping)
- **TMDB API** (movie data, cast, photos)
- **Find a Grave** (cause of death, resting place)

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with your TMDB API key:
   ```
   TMDB_API_KEY=your_tmdb_key_here
   ```
   Get a free key at [themoviedb.org](https://www.themoviedb.org/settings/api)

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Data Sources

- Movie and cast data: [The Movie Database (TMDB)](https://www.themoviedb.org)
- Death information: [Find a Grave](https://www.findagrave.com)

This project is not affiliated with IMDb or TMDB.
