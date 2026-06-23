# CodeCharta Documentation Site

Source for the CodeCharta user documentation published at **[codecharta.com](https://codecharta.com)**, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). This replaces the former Jekyll (Minimal Mistakes) site.

## Requirements

- Node **>= 22.12** (Astro 6)

## Commands

Run from this `gh-pages/` directory:

| Command           | Action                                              |
| :---------------- | :-------------------------------------------------- |
| `npm install`     | Install dependencies                                |
| `npm run dev`     | Start the local dev server at `localhost:4321`      |
| `npm run build`   | Build the production site to `./dist/`              |
| `npm run preview` | Preview the production build locally                |

## Project structure

```
gh-pages/
├── public/                 # static assets served as-is
│   ├── assets/             # images and showcase .cc.json files
│   ├── CNAME               # custom domain (codecharta.com)
│   └── .nojekyll           # stops GitHub Pages from running Jekyll on the output
├── src/
│   ├── assets/             # images processed/optimized by Astro (logo, hero)
│   ├── components/         # custom Astro components (hero, feature/showcase grids, overrides)
│   ├── content/docs/       # the documentation pages (.md / .mdx)
│   └── content.config.ts
└── astro.config.mjs        # site config: sidebar, redirects, integrations
```

## Editing the docs

- Pages live under `src/content/docs/`. Each `.md`/`.mdx` file is a route based on its path (e.g. `docs/overview/introduction.md` → `/docs/overview/introduction`).
- The sidebar, URL redirects, and site settings are configured in `astro.config.mjs`.
- Full-text search is provided by [Pagefind](https://pagefind.app/) and is generated automatically at build time.

## Deployment

Deployment is automated by [`.github/workflows/deploy-github-pages.yml`](../.github/workflows/deploy-github-pages.yml): on a push to `main` that touches `gh-pages/**`, the site is built and the contents of `dist/` are published to the **`gh-pages` branch**, which GitHub Pages serves at codecharta.com.

The Web Studio app (`/visualization/app`) and the staging site (`/stg`) are deployed to the same branch by other workflows and are preserved during this deploy (`clean-exclude`).
