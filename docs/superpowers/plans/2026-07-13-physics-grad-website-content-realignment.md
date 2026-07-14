# Physics Grad Website Content Realignment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Realign `sgjlee0520/Website` for physics graduate admissions: physics-first nav/messaging, remapped project categories with added lab + GitHub work, demoted finance pages — previewed locally before any remote push.

**Architecture:** Stay on the existing multi-page static HTML/CSS/JS + GitHub Pages site. Sidebar markup is duplicated across top-level pages (not shared via includes); apply a canonical primary-nav + footer-links pattern page-by-page. Project detail pages already use a finance-free top navbar — leave that pattern, only keep its primary six links. New content is new/updated HTML under `projects/` plus selected PDFs copied into `physics_experimental_modeling/`.

**Tech Stack:** HTML5, CSS3 (`styles.css`), vanilla JS (`script.js` filter + `setLang`), GitHub Pages static hosting, local preview via `python3 -m http.server`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-13-physics-grad-website-content-realignment-design.md`
- Audience: physics graduate admissions; research direction stays broad within physics
- No visual redesign / no framework migration / keep Inter + existing palette
- Keep EN/KR toggle and parallel copy on primary pages
- Primary nav only: Home · About · Projects · Writing & Interests · Resume · Contact
- Demote to footer links: Financial Portfolio, Household Budget / 가계부, Health hub
- Projects filters: `experimental` | `computational-coursework` | `other` (plus `all`)
- Featured home cards (exactly four): Franck–Hertz, jumping ring (20CL final), Numerical PDE (physics framing), PHYS23 LA
- Canonical resume PDF already wired: `26.01_Lee,Songgun_(UC_Santa_Barbara,_2027)-Resume.pdf` — do not break
- Canvas export source: `/Users/slee/Downloads/2025-12-17 data export`
- **Never `git push` until the user explicitly asks.** Local preview + local commits only unless told otherwise.
- Work in `/Users/slee/Projects/Website`

## File map

| Path | Responsibility |
|---|---|
| `index.html` | Hero messaging + featured four; sidebar/footer |
| `about.html` | Physics-admissions narrative; skills order; sidebar/footer |
| `projects.html` | Filter buttons + all project cards + categories |
| `contact.html`, `resume.html`, `writing-interests.html` | Sidebar/footer parity |
| `portfolio.html`, `household-budget.html`, `가계부_guide.html`, `health/*.html` | Keep pages; sidebar/footer demoted pattern (optional on health) |
| `styles.css` | Light styles for `.sidebar-more` / footer demoted links only if needed |
| `script.js` | `filterProjects(category)` — unchanged API; new category string values |
| `projects/jumping-ring.html` | New 20CL final experiment page |
| `projects/scrooge.html` (+ other new Other pages as listed) | Short case pages + GitHub links |
| `projects/numerical-pde-solver.html` | Strip option-pricing framing |
| `physics_experimental_modeling/final_jumping_ring.pdf` | Canonical PDF copy from Canvas export |
| `docs/superpowers/specs/...-design.md` | Source of truth (already written) |

---

### Task 1: Canonical sidebar — demote finance/budget/health to footer

**Files:**
- Modify: `index.html`, `about.html`, `projects.html`, `contact.html`, `resume.html`, `writing-interests.html`
- Modify (same demotion if they still list finance in primary nav): `portfolio.html`, `household-budget.html`, `가계부_guide.html`
- Modify (optional light CSS): `styles.css` — only if footer links need spacing

**Interfaces:**
- Consumes: existing `.sidebar`, `.nav-menu`, `.sidebar-footer` structure
- Produces: Primary `.nav-menu` with exactly six admissions links; demoted links live inside `.sidebar-footer` as `.sidebar-more`

- [ ] **Step 1: Define the canonical primary nav + footer block (root pages)**

Replace the finance/budget `<li>` entries in `.nav-menu` with nothing (delete those two `nav-item`s). Inside `.sidebar-footer`, **before** the social icons (or immediately after them, before copyright), insert:

```html
<nav class="sidebar-more" aria-label="More">
    <a href="portfolio.html" class="sidebar-more-link"><span class="nav-en">Financial Portfolio</span><span class="nav-kr">금융 포트폴리오</span></a>
    <a href="household-budget.html" class="sidebar-more-link nav-en-item"><span class="nav-en">Household Budget</span></a>
    <a href="가계부_guide.html" class="sidebar-more-link nav-kr-item">가계부</a>
    <a href="health/index.html" class="sidebar-more-link"><span class="nav-en">Health</span><span class="nav-kr">건강</span></a>
</nav>
```

Keep brand tagline update for Task 2; this task only moves nav items.

- [ ] **Step 2: Apply to all six primary pages**

Edit in order: `index.html`, `about.html`, `projects.html`, `writing-interests.html`, `resume.html`, `contact.html`. On each page, ensure the active `nav-link` class stays on the current page.

- [ ] **Step 3: Apply same demotion on portfolio/budget pages so they do not re-promote themselves**

Same pattern on `portfolio.html`, `household-budget.html`, `가계부_guide.html` (fix `href`s relative to each file’s location — root-relative as today).

- [ ] **Step 4: Add minimal CSS if footer crowding breaks layout**

Append to `styles.css` only if needed after visual check:

```css
.sidebar-more {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 1rem;
    font-size: 0.8rem;
}
.sidebar-more-link {
    color: inherit;
    opacity: 0.75;
    text-decoration: none;
}
.sidebar-more-link:hover {
    opacity: 1;
}
```

- [ ] **Step 5: Verify locally (no push)**

```bash
cd /Users/slee/Projects/Website
# Primary nav on index must NOT contain Financial Portfolio
! rg -n "Financial Portfolio" index.html -g '' || true
rg -n "sidebar-more" index.html about.html projects.html contact.html resume.html writing-interests.html
# Expect: Financial Portfolio only under sidebar-more / portfolio page body, not inside .nav-menu
python3 - <<'PY'
from pathlib import Path
import re
for name in ["index.html","about.html","projects.html","contact.html","resume.html","writing-interests.html"]:
    text = Path(name).read_text()
    menu = re.search(r'<ul class="nav-menu">([\s\S]*?)</ul>', text).group(1)
    assert "portfolio.html" not in menu, name
    assert "sidebar-more" in text, name
print("nav OK")
PY
```

Expected: `nav OK`

- [ ] **Step 6: Commit locally (do not push)**

```bash
git add index.html about.html projects.html contact.html resume.html writing-interests.html portfolio.html household-budget.html 가계부_guide.html styles.css
git commit -m "$(cat <<'EOF'
Demote finance and budget links to sidebar footer.

Keep primary nav physics-admissions focused.
EOF
)"
```

---

### Task 2: Home + About messaging (physics-grad framing)

**Files:**
- Modify: `index.html`
- Modify: `about.html`

**Interfaces:**
- Consumes: Task 1 sidebar
- Produces: Updated taglines + hero copy + About skills framing used by later featured-card task

- [ ] **Step 1: Update brand tagline + page title on `index.html`**

Replace sidebar + hero taglines:

```html
<p class="brand-tagline">Physics · UC Santa Barbara<br>Preparing for graduate study</p>
```

```html
<title>Songgun Lee - Physics · UC Santa Barbara</title>
...
<p class="hero-tagline">Physics · UC Santa Barbara · Preparing for graduate study</p>
<p class="hero-summary"><span data-lang="en">Physics student at UC Santa Barbara preparing for graduate study. My training spans experimental labs (PHYS 20AL/BL/CL), computational and theoretical coursework, and teaching as a PHYS 23 Learning Assistant. Research interests are still broad within physics.</span><span data-lang="kr">UC 산타바바라 물리학과에서 대학원 진학을 준비하는 학생입니다. PHYS 20AL/BL/CL 실험 과정, 계산·이론 수업, PHYS 23 Learning Assistant 경험을 쌓았으며, 연구 관심사는 아직 물리학 전반에 걸쳐 열려 있습니다.</span></p>
```

Keep CTAs: Projects + Resume. Add a third text link to Contact only if it does not crowd the existing button row; otherwise leave Contact in nav.

- [ ] **Step 2: Mirror brand tagline on `about.html` sidebar**

Same `.brand-tagline` string as index.

- [ ] **Step 3: Soften finance-forward About lines; keep resilience story**

In `about.html`:
- Change page subtitle lead if needed to emphasize physics training over “computational physics” alone as a finance adjacent phrase is fine; keep journey.
- In “Military Forge” paragraph, change “physics and finance” → “physics”.
- Keep entrepreneurship section but treat it as secondary character evidence (do not delete); ensure a later skills/quick-facts block leads with lab / computation / teaching.

Exact military line replacement (EN):

```html
This "one step at a time" fortitude now drives my approach to complex problems in physics.
```

KR parallel: replace `물리와 금융의` with `물리학의` in that sentence.

- [ ] **Step 4: Verify copy locally**

```bash
rg -n "option pricing|data-driven models for complex systems|Aspiring Physicist" index.html about.html || true
# Expect: no matches on those finance-era hero phrases
rg -n "Preparing for graduate study|PHYS 20AL" index.html
```

- [ ] **Step 5: Commit locally**

```bash
git add index.html about.html
git commit -m "$(cat <<'EOF'
Reframe Home and About for physics graduate admissions.

EOF
)"
```

---

### Task 3: Remap Projects filters and recategorize existing cards

**Files:**
- Modify: `projects.html`
- Modify: `script.js` only if `filterProjects` needs a bugfix (keep using `dataset.category`)

**Interfaces:**
- Consumes: `filterProjects(category)` in `script.js` comparing `project.dataset.category`
- Produces: Category slugs `experimental`, `computational-coursework`, `other`

- [ ] **Step 1: Replace filter buttons**

```html
<button class="filter-btn active" onclick="filterProjects('all')"><span data-lang="en">All</span><span data-lang="kr">전체</span></button>
<button class="filter-btn" onclick="filterProjects('experimental')"><span data-lang="en">Experimental</span><span data-lang="kr">실험</span></button>
<button class="filter-btn" onclick="filterProjects('computational-coursework')"><span data-lang="en">Computational & Coursework</span><span data-lang="kr">계산 · 수업</span></button>
<button class="filter-btn" onclick="filterProjects('other')"><span data-lang="en">Other / Software</span><span data-lang="kr">기타 · 소프트웨어</span></button>
```

- [ ] **Step 2: Rewrite page subtitle**

```html
<span data-lang="en">Experimental labs, computational coursework, and other software projects — with physics work first.</span>
<span data-lang="kr">실험 연구, 계산 수업 프로젝트, 그리고 기타 소프트웨어 작업 — 물리학 관련 작업을 우선으로 정리했습니다.</span>
```

- [ ] **Step 3: Reassign `data-category` on every existing card**

| Project | New `data-category` |
|---|---|
| Franck–Hertz, Radioactive Decay, Diffraction & Interference, Speed of Sound | `experimental` |
| Monte Carlo, Numerical PDE, Stochastic Poisson, Time-Series & Spectral | `computational-coursework` |
| PHYS23 Learning Assistant | `computational-coursework` |
| S&P500 paper, Kimchi paper, Business Intelligence | `other` |
| Warehouse, Divine Guidance, Systems Programming, Data Engineering, Computer Graphics | `other` |

Reorder the grid in HTML so Experimental cards appear first, then Computational & coursework, then Other.

- [ ] **Step 4: Verify filter wiring**

```bash
rg -n 'data-category="(quantitative-finance|software-engineering|physics-experimental)"' projects.html
# Expect: no matches
rg -n 'data-category="(experimental|computational-coursework|other)"' projects.html
python3 -m http.server 8765
# Browser: open http://127.0.0.1:8765/projects.html — click each filter
```

Expected: only matching cards visible per filter; All shows everything.

- [ ] **Step 5: Commit locally**

```bash
git add projects.html
git commit -m "$(cat <<'EOF'
Remap project filters to experimental, coursework, and other.

EOF
)"
```

---

### Task 4: Add jumping-ring (20CL final) project page + PDF

**Files:**
- Create: `physics_experimental_modeling/final_jumping_ring.pdf` (copy from Canvas)
- Create: `projects/jumping-ring.html`
- Modify: `projects.html` (add Experimental card)
- Modify: `index.html` (featured set in Task 6 — only add list card here)

**Interfaces:**
- Consumes: Canvas PDF  
  `/Users/slee/Downloads/2025-12-17 data export/PHYS 20CL - EXPERIMENTAL PHYS - Spring 2025/Week 10 - Final Report/final_jumping)ring.pdf`
- Produces: Detail page pattern matching `projects/franck-hertz.html` (top navbar, EN/KR blocks, PDF link)

- [ ] **Step 1: Copy canonical PDF (rename to drop `)`)**

```bash
cp "/Users/slee/Downloads/2025-12-17 data export/PHYS 20CL - EXPERIMENTAL PHYS - Spring 2025/Week 10 - Final Report/final_jumping)ring.pdf" \
  /Users/slee/Projects/Website/physics_experimental_modeling/final_jumping_ring.pdf
ls -la physics_experimental_modeling/final_jumping_ring.pdf
```

- [ ] **Step 2: Create `projects/jumping-ring.html`**

Use `projects/franck-hertz.html` as the structural template (same top `navbar`, lang switcher, `content-block` sections). Required content:

- Title: Jumping Ring Experiment (PHYS 20CL Final)
- Overview: electromagnetic induction / Lenz’s law lab final project (2–3 short paragraphs EN+KR)
- Link: `<a href="../physics_experimental_modeling/final_jumping_ring.pdf">Download final report (PDF)</a>`
- Tags: Experimental Physics, Electromagnetism, PHYS 20CL
- Do **not** paste the full report into HTML

- [ ] **Step 3: Add card to `projects.html` under Experimental (near other 20CL labs)**

```html
<div class="project-item" data-category="experimental">
    <div class="project-image">
        <div class="thumb-fallback thumb-physics">
            <div class="project-initials">JR</div>
            <div class="project-category-label">PHYS 20CL</div>
        </div>
    </div>
    <div class="project-content">
        <h3 class="project-title">Jumping Ring Experiment (PHYS 20CL Final)</h3>
        <p class="project-description">Final experimental project on electromagnetic induction and Lenz’s law — measurement, analysis, and written report.</p>
        <div class="project-tech">
            <span class="tech-tag">Electromagnetism</span>
            <span class="tech-tag">PHYS 20CL</span>
            <span class="tech-tag">Lab Report</span>
        </div>
        <a href="projects/jumping-ring.html" class="project-link">View Project</a>
    </div>
</div>
```

(If `.thumb-physics` does not exist, reuse an existing physics thumb class from nearby experimental cards.)

- [ ] **Step 4: Local verify**

```bash
python3 -m http.server 8765
# Open http://127.0.0.1:8765/projects/jumping-ring.html
# Open PDF link; confirm 200
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8765/physics_experimental_modeling/final_jumping_ring.pdf
```

Expected: `200`

- [ ] **Step 5: Commit locally**

```bash
git add physics_experimental_modeling/final_jumping_ring.pdf projects/jumping-ring.html projects.html
git commit -m "$(cat <<'EOF'
Add PHYS 20CL jumping-ring experiment page and report PDF.

EOF
)"
```

---

### Task 5: Expand Experimental cards from Canvas + strip PDE finance language

**Files:**
- Modify: `projects/numerical-pde-solver.html`
- Modify: card text for Numerical PDE on `projects.html` and (later) `index.html`
- Optionally copy any stronger 20CL finals already not linked (Atomic Spectra / Photoelectric) only if time — **YAGNI default: skip unless PDF already on site**

**Interfaces:**
- Consumes: existing PDE project page
- Produces: Physics-only framing for Laplace/relaxation method (electrostatics language already on site images)

- [ ] **Step 1: Edit PDE overview / descriptions to remove option pricing**

In `projects.html` card and `projects/numerical-pde-solver.html`, replace option-pricing mentions with physics electrostatics / boundary-value problem language, e.g.:

```html
<p class="project-description">Numerical solution of elliptic PDEs with the relaxation method, applied to electrostatic boundary-value problems.</p>
```

Same change in the detail page EN+KR paragraphs wherever “option pricing” appears.

```bash
rg -n "option pricing|options" projects/numerical-pde-solver.html projects.html
# Expect: no matches after edit
```

- [ ] **Step 2: Confirm experimental PDFs already linked**

For Franck–Hertz, RA, Diffraction, Speed of Sound: ensure each detail page links a PDF under `physics_experimental_modeling/`. If a link 404s, copy the matching final PDF from the Canvas `PHYS 20CL` / `20BL` folders using the same naming style.

- [ ] **Step 3: Local smoke**

```bash
rg -n "option pricing" projects.html projects/numerical-pde-solver.html || echo "clean"
```

- [ ] **Step 4: Commit locally**

```bash
git add projects/numerical-pde-solver.html projects.html
git commit -m "$(cat <<'EOF'
Frame numerical PDE work in physics language, not finance.

EOF
)"
```

---

### Task 6: Homepage featured four + contact CTA clarity

**Files:**
- Modify: `index.html` featured-projects section only

**Interfaces:**
- Consumes: `projects/franck-hertz.html`, `projects/jumping-ring.html`, `projects/numerical-pde-solver.html`, `projects/phys23-learning-assistant.html`

- [ ] **Step 1: Replace featured grid with exactly these four cards (in order)**

1. Franck–Hertz → `projects/franck-hertz.html`  
2. Jumping Ring → `projects/jumping-ring.html`  
3. Numerical PDE (physics blurb from Task 5) → `projects/numerical-pde-solver.html`  
4. PHYS23 Learning Assistant → `projects/phys23-learning-assistant.html`

Delete warehouse, stochastic, Monte Carlo, S&P, kimchi, and any other featured cards from the home grid.

- [ ] **Step 2: Verify**

```bash
python3 - <<'PY'
from pathlib import Path
import re
html = Path('index.html').read_text()
section = re.search(r'featured-projects([\s\S]*?)</section>', html).group(1)
links = re.findall(r'href="(projects/[^"]+)"', section)
assert links == [
  'projects/franck-hertz.html',
  'projects/jumping-ring.html',
  'projects/numerical-pde-solver.html',
  'projects/phys23-learning-assistant.html',
], links
print('featured OK', links)
PY
```

- [ ] **Step 3: Commit locally**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Feature four physics projects on the homepage.

EOF
)"
```

---

### Task 7: Add Other / Software project cards (GitHub work)

**Files:**
- Create: `projects/scrooge.html` (required)
- Create (short pages OK): `projects/bbterm.html`, `projects/ai-video-editor.html`, `projects/mole-ios.html`, `projects/doomblock.html` — **minimum viable: Scrooge required; add the rest as cards linking straight to GitHub if page time is tight**
- Modify: `projects.html`

**Interfaces:**
- Produces: `data-category="other"` cards; Scrooge highest priority in this bucket

- [ ] **Step 1: Create `projects/scrooge.html`**

Template from `projects/divine-guidance.html` or franck-hertz navbar pattern. Content:

- Title: Scrooge — PDF/Image → Text & Plot → Data  
- 2 short paragraphs: local OCR + plot digitization to cut token cost for AI agents; lab-adjacent utility  
- Links: https://github.com/sgjlee0520/scrooge and https://sgjlee0520-scrooge.hf.space/  
- Category framing: Other / Software (not Experimental)

- [ ] **Step 2: Add Other cards to `projects.html`**

At minimum add Scrooge. Prefer also adding card-only entries (GitHub external links acceptable in `project-link` with `target="_blank"`) for:

- bbterm — https://github.com/sgjlee0520/bbterm  
- AI Video Editor — https://github.com/sgjlee0520/video-editor  
- mole-ios — https://github.com/sgjlee0520/mole-ios  
- doomblock — https://github.com/sgjlee0520/doomblock  

Existing Other cards (warehouse, Divine Guidance, finance papers, etc.) remain.

- [ ] **Step 3: Verify Other filter**

```bash
rg -n 'data-category="other"' projects.html | wc -l
# Expect: previous other count + new cards (>= 1 for Scrooge)
curl -s http://127.0.0.1:8765/projects/scrooge.html | head -5
```

- [ ] **Step 4: Commit locally**

```bash
git add projects/scrooge.html projects.html projects/bbterm.html projects/ai-video-editor.html projects/mole-ios.html projects/doomblock.html 2>/dev/null || git add projects/scrooge.html projects.html
git commit -m "$(cat <<'EOF'
Add secondary software projects led by Scrooge.

EOF
)"
```

---

### Task 8: Full local QA pass (gate before any push)

**Files:** none required unless fixes

- [ ] **Step 1: Start local server**

```bash
cd /Users/slee/Projects/Website
python3 -m http.server 8765
```

- [ ] **Step 2: Checklist in browser**

1. Home first viewport: physics grad framing; featured four physics projects; no finance cards  
2. Primary sidebar: six links only  
3. Footer: Portfolio / Budget / Health reachable  
4. Projects filters: Experimental / Computational & coursework / Other all work  
5. Jumping-ring PDF opens  
6. EN ↔ KR toggle still works on Home, About, Projects  
7. Resume iframe still loads `26.01_…Resume.pdf`

- [ ] **Step 3: Automated greps**

```bash
cd /Users/slee/Projects/Website
python3 - <<'PY'
from pathlib import Path
import re
primary = ["index.html","about.html","projects.html","contact.html","resume.html","writing-interests.html"]
for name in primary:
    text = Path(name).read_text()
    menu = re.search(r'<ul class="nav-menu">([\s\S]*?)</ul>', text).group(1)
    assert "portfolio.html" not in menu, f"nav leak {name}"
    assert "sidebar-more" in text, f"missing footer more {name}"
assert "Preparing for graduate study" in Path("index.html").read_text()
assert Path("physics_experimental_modeling/final_jumping_ring.pdf").exists()
assert Path("projects/jumping-ring.html").exists()
assert Path("projects/scrooge.html").exists()
print("QA OK")
PY
```

Expected: `QA OK`

- [ ] **Step 4: Stop — ask user to review localhost before push**

Do **not** run `git push`. Tell the user: open `http://127.0.0.1:8765/` and approve before any online deploy.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|---|---|
| Primary nav six links; demote finance/budget/health | Task 1 |
| Physics messaging Home/About; EN/KR kept | Task 2 |
| Filters Experimental / Computational & coursework / Other | Task 3 |
| Add jumping ring + lab PDF | Task 4 |
| Elevate experimental; PDE physics framing | Task 5 |
| Featured four physics cards | Task 6 |
| Add GitHub Others led by Scrooge | Task 7 |
| Local preview before push; success criteria | Task 8 |
| No redesign / no framework migration | Global Constraints |
| Resume canonical PDF | Global Constraints (already on resume.html) |

## Placeholder scan

No TBD steps. External GitHub-only cards allowed in Task 7 if detail pages are skipped beyond Scrooge.
