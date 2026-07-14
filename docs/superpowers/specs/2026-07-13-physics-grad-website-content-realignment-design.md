# Physics Grad Website Content Realignment — Design

**Date:** 2026-07-13  
**Repo:** `sgjlee0520/Website`  
**Live:** https://sgjlee0520.github.io/Website/index.html  
**Status:** Approved in brainstorming (Approach 2)

## Goal

Reposition the personal site as a **physics graduate school application / admissions** site: physics-first messaging, richer experimental + coursework content, newer software work present but secondary. No visual redesign or stack migration in this pass.

## Audience & positioning

- **Primary:** Physics graduate admissions committees
- **Research direction:** Broad within physics (experimental, computational, and theoretical coursework all visible; no specialty lock-in yet)
- **Not primary:** Quant/finance recruiting, consumer apps, business coursework

## Approach

**Content + information-architecture cleanup** on the existing static HTML/CSS/JS + GitHub Pages site.

- Realign Home / About / Projects / nav for physics admissions
- Add more lab/coursework artifacts (Canvas export + existing site folders)
- Add newer GitHub projects under a secondary Projects category
- Demote finance/personal utility pages out of primary nav; keep them reachable

## Site structure & navigation

### Primary nav

Home · About · Projects · Writing & Interests · Resume · Contact

### Demoted (footer links)

- Financial Portfolio (`portfolio.html`)
- Household Budget / 가계부 (`household-budget.html`, Korean guide as today)
- Health hub (`health/`) — keep footer link only; do not delete files

### Projects page filters

1. **Experimental** — PHYS 20AL/20BL/20CL labs, instrumentation, lab reports
2. **Computational & coursework** — Monte Carlo, PDE, spectral analysis, Poisson/photon counting, PHYS23 LA; light PHYS 103 / 115A only with clean artifacts
3. **Other / software** — Scrooge, bbterm, apps, warehouse, Divine Guidance, mole/doomblock/video tools, finance papers framed as side work

### Homepage composition

1. Physics student @ UCSB + PhD-prep pitch (specialty-agnostic)
2. Short evidence line: experimental sequence + computational coursework + teaching
3. Exactly four **physics-forward** featured projects (see Messaging table)
4. CTAs: Projects · Resume · Contact  
   No finance or budget in the first viewport

### About

Keep the resilience narrative (Busan → U.S. → UCSB). Lead skills with lab methods, analysis, computation, teaching. Side apps/finance as brief initiative outside coursework.

## Messaging

| Element | Direction |
|---|---|
| Tagline | Physics · UC Santa Barbara · Preparing for graduate study (replace finance-era / vague “aspiring” framing as hero lead) |
| Home body | Drop quant-style “data-driven models for complex systems” as the lead; lead with lab + computation + teaching |
| Featured projects | Fixed set of four: (1) Franck–Hertz, (2) 20CL final / jumping ring, (3) Numerical PDE (physics framing), (4) PHYS23 Learning Assistant. If jumping-ring page is too thin at implement time, substitute Diffraction & Interference or Monte Carlo. |
| CTAs | Resume, Projects, Contact, GitHub secondary |
| Voice | Specific and evidence-backed; shorten slogans |
| Language | Keep EN/KR toggle and parallel copy for Home, About, Projects labels, and main nav |

## Content inventory

### Elevate — Experimental

- Franck–Hertz
- Radioactive decay / γ absorption
- Diffraction & interference
- Speed of sound
- 20CL final project (jumping ring) if not already strong
- Strongest 20AL/20BL writeups from Canvas export (`/Users/slee/Downloads/2025-12-17 data export`)
- CAD / solder / 3D print only as supporting lab-skills evidence, not lead cards

### Elevate — Computational & coursework

- Monte Carlo / stochastic calculus
- Numerical PDE (physics framing, not option pricing)
- Time-series & spectral analysis
- Stochastic / Poisson / photon counting
- PHYS23 Learning Assistant
- PHYS 103 / 115A only if a clean, readable artifact exists (no raw muddy-question dumps)

### Add — Other / software (secondary)

- Scrooge (lab-adjacent OCR / plot→data — highest priority in this bucket)
- bbterm (optional)
- AI video editor, mole-ios / mole-cable, doomblock, iphone-photo-backup
- Divine Guidance, Agora, Kavanah, Sakinah, tutor waitlist
- Automated warehouse inventory (capstone)

### Demote (reachable, not hero)

- Financial Portfolio page + nav placement
- Household budget pages
- Kimchi premium / S&P papers, BI analytics → Other
- Health / personal schedule pages → demoted or footer only

### Do not use for admissions path

- EARTHW 20, WRIT 2, TMP 149 from the Canvas export
- Duplicate lab PDF versions (pick best final report per experiment)

### Writing & Interests

Retain for personality/voice; must not outcompete Projects or Resume.

## Constraints

- **Stack:** Existing static HTML/CSS/JS; GitHub Pages from `main`
- **Visual:** No redesign; only light CSS for demoted nav / filter tweaks if needed
- **Assets:** Prefer best-of PDFs from Canvas export + existing `physics_experimental_modeling/` and project folders; avoid uploading every duplicate
- **Resume:** Canonical file is `26.01_Lee,Songgun_(UC_Santa_Barbara,_2027)-Resume.pdf`; update `resume.html` / `resume.pdf` links to serve that (copy or symlink as needed for existing paths)
- **Source materials:** Canvas export at `/Users/slee/Downloads/2025-12-17 data export`; GitHub originals under `sgjlee0520`

## Success criteria

1. First viewport reads as physics graduate prep, not finance/apps
2. Projects page has three filters (Experimental / Computational & coursework / Other) with new/expanded items filled in
3. Finance / budget / health out of primary nav but still reachable
4. Site remains a working static GitHub Pages deployment on `main`
5. EN/KR bilingual behavior preserved for primary pages

## Out of scope (this pass)

- Visual redesign / new design system / abandoning Inter
- Migrating to Next.js, Astro, or another framework
- Specialty lock-in (CMT vs AMO vs etc.)
- Publishing full Canvas dump or private school materials wholesale
- Rewriting or productizing side apps

## Implementation notes (for plan)

1. Clone/work in repo locally; edit HTML pages + shared nav/footer patterns in `styles.css` / `script.js` as needed
2. Update nav on all primary pages consistently
3. Expand `projects.html` categories + add/update project detail pages under `projects/`
4. Copy selected PDFs into appropriate folders; link from project pages
5. Update Home featured set + About copy (EN + KR)
6. Smoke-check locally, then deploy via push to `main`
