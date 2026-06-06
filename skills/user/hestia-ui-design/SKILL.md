---
name: hestia-ui-design
description: >
Design and build HESTIA UI — screens, components, pages, and editorial
layouts for the HESTIA hospitality operating system. Use this skill for any
UI request inside HESTIA: a new screen, a redesign of an existing module,
a component, a data view, an onboarding flow, a dashboard, or any editorial
layout. Always use this skill before writing any HESTIA UI code — even a
single component. Do NOT use for cocktail menus (use hestia-cocktail-menu),
marketing content (use hestia-marketing-strategist), or generic web projects
unrelated to HESTIA.
HESTIA UI Design Skill — v1.0
The Design Intelligence Layer for the HESTIA Operating System
---
THE SINGLE GOVERNING PRINCIPLE
HESTIA is not software that hospitality professionals use.
HESTIA is a world they inhabit.
Every screen is an environment, not a form.
Every interaction is a moment, not a transaction.
Every piece of typography is editorial, not instructional.
The reference is not SaaS dashboards or admin panels.
The reference is MasterClass, The New Yorker, Monocle, Wallpaper*, and the printed menus of the world's best bars.
If it looks like enterprise software, it has failed.
If the person using it does not feel slightly elevated — more professional, more expert, more seen — it has failed.
---
PART ONE — THE HESTIA VISUAL WORLD
1.1 — The Two Palettes
HESTIA operates in two distinct visual environments. Every screen belongs to one of them. Never mix them.
---
PALETTE A — THE OPERATIONAL DARK
Used for: Cocktail Intelligence, Daily Close, Staff Module, Events, Settings, Kitchen Intelligence — any screen where work happens.
This is the environment of the professional. The bar after close. The kitchen before service. Focused. Unhurried. Slightly cinematic.
```
Background base:       #0D0D0D  (near-black, not pure black)
Surface / card:        #141414  (one level up)
Surface raised:        #1A1A1A  (two levels up — modals, dropdowns)
Border subtle:         #2A2A2A  (hairline separators)
Border emphasis:       #3A3A3A  (active state borders)

Gold primary:          #C9A96E  (amber gold — CTAs, active states, accents)
Gold muted:            #8B7355  (secondary labels, captions)
Gold faint:            rgba(201, 169, 110, 0.08)  (hover backgrounds)

Text primary:          #F5F0E8  (warm white — all body text)
Text secondary:        #9A9590  (labels, metadata)
Text tertiary:         #5A5550  (placeholders, disabled)

Status success:        #4A7C59
Status warning:        #C17F2A
Status error:          #8B3A3A
Status info:           #2A5C8B
```
---
PALETTE B — THE EDITORIAL LIGHT
Used for: Wine Atlas, Bar World/Magazine, Courses/Service School, any editorial or educational surface.
This is the environment of the reader. The sommelier's tasting room. The rare bookshop. Warm paper, ink, and light.
```
Background base:       #F7F3EC  (warm ivory — never pure white)
Surface / card:        #FFFFFF  (white cards against ivory ground)
Surface raised:        #F0EBE0  (inset surfaces, code blocks)
Border subtle:         #E0D8CC  (hairline separators)
Border emphasis:       #C8BFB0  (active state borders)

Burgundy primary:      #6B2737  (deep wine red — CTAs, active states)
Burgundy muted:        #8B4455  (secondary accents)
Burgundy faint:        rgba(107, 39, 55, 0.06)  (hover backgrounds)

Amber gold:            #B8860B  (highlights, pull quotes, dates)
Amber faint:           rgba(184, 134, 11, 0.10)

Text primary:          #1A1612  (near-black with warmth)
Text secondary:        #5A524A  (captions, metadata)
Text tertiary:         #9A9088  (placeholders, disabled)
```
---
1.2 — Typography
Typography is the most important design decision in HESTIA.
Every font pairing carries editorial authority. Generic fonts are forbidden.
Palette A — Operational Dark
```
Display / Hero:        Playfair Display  (editorial serif — covers, module headers)
                       Weight: 700–900  |  Use for: cover headlines, empty states
                       
Section headers:       Fraunces  (optical-size serif — warm, ink-like)
                       Weight: 600  |  Use for: card titles, section names

Body / UI:             DM Sans  (neutral grotesque — readable at small sizes)
                       Weight: 400, 500  |  Use for: all body text, labels, inputs

Monospace / Data:      JetBrains Mono  (for prices, IDs, recipe specs)
                       Weight: 400  |  Use for: cost data, cocktail codes, timestamps

Eyebrow / Label:       DM Sans, letter-spacing: 0.12em, uppercase, weight 500
                       Use for: section labels, status tags, module identifiers
```
Palette B — Editorial Light
```
Display / Hero:        Cormorant Garamond  (classical serif — authoritative, literary)
                       Weight: 600–700  |  Use for: issue covers, article titles
                       
Sub-display:           Fraunces  (warm, slightly editorial)
                       Weight: 500–600  |  Use for: section headers, card titles

Body / Article:        Inter  (clean grotesque — legible at article width)
                       Weight: 400  |  Use for: article body, captions

Pull Quote:            Cormorant Garamond Italic, size: 1.4–1.8rem
                       Use for: featured quotes, wine tasting notes, lesson excerpts

Eyebrow / Date:        Inter, letter-spacing: 0.14em, uppercase, weight 500, size: 0.7rem
                       Use for: issue numbers, dates, category labels (MMXXVI style)
```
---
1.3 — Spatial System
HESTIA uses an 8px base grid. All spacing is a multiple of 8.
```
xs:    4px   (internal padding — icon gaps, tight pairs)
sm:    8px   (compact padding — tags, small chips)
md:   16px   (standard padding — card interiors)
lg:   24px   (section breathing room)
xl:   32px   (panel gaps, major spacing)
2xl:  48px   (hero sections, cover areas)
3xl:  64px   (full-section padding)
4xl:  96px   (dramatic hero space)
```
Never use arbitrary pixel values. Never use `padding: 10px` or `margin: 15px`.
---
1.4 — Elevation Model
In Palette A (dark), depth is created through lightness: deeper = darker.
In Palette B (light), depth is created through shadow and border.
Palette A Elevation
```
Level 0 — Page ground:        #0D0D0D
Level 1 — Card:               #141414   + border: 1px solid #2A2A2A
Level 2 — Raised card/modal:  #1A1A1A   + border: 1px solid #3A3A3A
Level 3 — Dropdown/tooltip:   #222222   + box-shadow: 0 8px 32px rgba(0,0,0,0.5)
Active / focused:             Gold border: 1px solid #C9A96E
```
Palette B Elevation
```
Level 0 — Page ground:        #F7F3EC
Level 1 — Card:               #FFFFFF   + box-shadow: 0 1px 4px rgba(26,22,18,0.06)
Level 2 — Raised:             #FFFFFF   + box-shadow: 0 4px 16px rgba(26,22,18,0.10)
Level 3 — Modal:              #FFFFFF   + box-shadow: 0 16px 48px rgba(26,22,18,0.18)
Active / focused:             Burgundy border: 1px solid #6B2737
```
---
PART TWO — COMPONENT PATTERNS
2.1 — Navigation
HESTIA uses two navigation layers:
Layer 1 — Global Sidebar (always visible, all screens)
```
Width:          68px (icon-only) or 220px (expanded)
Background:     #0A0A0A (darker than page)
Active item:    Gold left border (3px) + text #C9A96E
Inactive item:  Text #5A5550, hover: #9A9590
Font:           DM Sans, uppercase, 0.7rem, letter-spacing: 0.1em
```
Layer 2 — In-World Top Bar (within Bar World, Wine Atlas, Courses)
```
Height:         52px
Background:     transparent or rgba(13,13,13,0.85) with backdrop-filter: blur(8px)
Nav items:      DM Sans uppercase, 0.72rem, letter-spacing: 0.12em
Active:         Underline 1px, color: #C9A96E (dark) or #6B2737 (light)
Right slot:     Issue number, volume (editorial worlds) or user/date (operational)
```
---
2.2 — Cards
Operational Card (Palette A)
```css
background: #141414;
border: 1px solid #2A2A2A;
border-radius: 8px;
padding: 24px;
transition: border-color 200ms ease;

/* On hover */
border-color: #C9A96E;
```
Card anatomy:
Eyebrow: uppercase label, gold-muted, 0.68rem, letter-spacing: 0.12em
Title: Fraunces, 1.1rem, weight 600, color: #F5F0E8
Body: DM Sans, 0.875rem, color: #9A9590, line-height: 1.6
Footer: metadata row, DM Sans 0.75rem, color: #5A5550
Editorial Card (Palette B)
```css
background: #FFFFFF;
border: none;
border-radius: 4px;
box-shadow: 0 1px 4px rgba(26,22,18,0.06);
padding: 32px;
transition: box-shadow 200ms ease;

/* On hover */
box-shadow: 0 4px 16px rgba(26,22,18,0.10);
```
Card anatomy:
Eyebrow: uppercase label, amber gold, 0.68rem, letter-spacing: 0.14em
Title: Cormorant Garamond, 1.4rem, weight 600, color: #1A1612
Body: Inter, 0.9rem, color: #5A524A, line-height: 1.7
Divider: 1px solid #E0D8CC
---
2.3 — Buttons
Primary CTA — Operational (Palette A)
```css
background: #C9A96E;
color: #0D0D0D;
font: DM Sans 500, 0.8rem, uppercase, letter-spacing: 0.1em;
padding: 10px 24px;
border-radius: 4px;
border: none;
transition: background 150ms ease;

/* Hover */
background: #D4B87A;
```
Primary CTA — Editorial (Palette B)
```css
background: #6B2737;
color: #F7F3EC;
font: Inter 500, 0.8rem, uppercase, letter-spacing: 0.1em;
padding: 10px 24px;
border-radius: 2px;
```
Ghost / Secondary
```css
background: transparent;
border: 1px solid currentColor;  /* gold in dark, burgundy in light */
color: inherit;
/* Same font and padding as primary */
```
"In Preparation" / Disabled State
```css
background: transparent;
border: 1px solid #2A2A2A;
color: #5A5550;
font: DM Sans 400, 0.72rem, uppercase, letter-spacing: 0.1em;
padding: 6px 16px;
border-radius: 100px;  /* pill shape — signals passivity */
cursor: default;
```
---
2.4 — Data Tables (Operational)
Used in: Sales Tracker, Menu Margin, Staff lists, Daily Close.
```
Header row:     DM Sans uppercase, 0.68rem, letter-spacing: 0.12em, color: #5A5550
                border-bottom: 1px solid #2A2A2A
Body row:       DM Sans 0.875rem, color: #F5F0E8
                height: 48px, border-bottom: 1px solid #1E1E1E
                hover: background: rgba(201,169,110,0.04)
Number cells:   JetBrains Mono, right-aligned
Status chips:   see Status below
```
Never use zebra striping. Never use heavy cell borders.
---
2.5 — Status and Tags
```
Live / Active:     background: rgba(74,124,89,0.15)   color: #6BAF80   text: "LIVE"
Draft:             background: rgba(90,84,80,0.15)     color: #9A9590   text: "DRAFT"
In Preparation:    background: transparent             border: 1px solid #3A3A3A  color: #5A5550
Warning:           background: rgba(193,127,42,0.15)   color: #D4943A
Error:             background: rgba(139,58,58,0.15)    color: #C07070

Font:   DM Sans uppercase, 0.65rem, letter-spacing: 0.1em, weight: 500
Shape:  border-radius: 100px (pill), padding: 3px 10px
```
---
2.6 — Forms and Inputs (Operational)
```css
/* Input container */
background: #0D0D0D;
border: 1px solid #2A2A2A;
border-radius: 6px;
padding: 10px 14px;
font: DM Sans 0.875rem, color: #F5F0E8;

/* Focus */
border-color: #C9A96E;
outline: none;
box-shadow: 0 0 0 3px rgba(201,169,110,0.12);

/* Label */
DM Sans uppercase, 0.68rem, letter-spacing: 0.10em, color: #5A5550;
margin-bottom: 6px;

/* Placeholder */
color: #3A3A3A;
```
---
PART THREE — EDITORIAL PATTERNS
These patterns apply specifically to Bar World, Wine Atlas, and Courses — any screen using Palette B or the magazine-within-dark-shell structure.
3.1 — The Magazine Cover Pattern
Used for: Bar World Classics cover, Wine Atlas cover, Courses hub.
Structure:
```
Full-bleed photographic or illustrated background
Overlay: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)

Top-left:   Masthead — "Hestia · [World Name]" in uppercase eyebrow font
Top-right:  Issue/volume identifier — "ISSUE Nº 01 · MMXXVI"

Center:     Hero headline — Cormorant Garamond or Playfair Display
            Size: clamp(2.5rem, 6vw, 5rem)
            Mixed weight: normal + italic + weight variation for emphasis

Bottom:     Deck text — Cormorant Garamond Italic, 1.1rem, max-width: 560px
```
The headline must have visual hierarchy through weight and style contrast, not just size.
Example pattern: "[Normal weight line] / [italic gold/amber line] / [Normal weight line]"
---
3.2 — The Article/Lesson Layout
Used for: lesson readers, classic cocktail articles, wine region deep-dives.
```
Max content width:    680px (centered)
Eyebrow:              category + date, uppercase, 0.7rem, letter-spacing: 0.14em
H1:                   Cormorant Garamond, 2.4rem, weight 600, line-height: 1.2
Deck:                 Cormorant Garamond Italic, 1.15rem, color: text-secondary
Body text:            Inter 400, 1rem, line-height: 1.8, color: text-primary
Pull quote:           Cormorant Garamond Italic, 1.35rem, left-border: 3px solid gold
                      padding-left: 24px, color: text-secondary

Section break:        — thin rule, 40px vertical margin —

Code / spec:          JetBrains Mono, background: surface-raised, padding: 16px
```
---
3.3 — The Progress / Module Grid
Used for: Courses hub, Bar World Academy tab, Wine Atlas modules.
Each module card is an editorial tile, not a progress bar widget:
```
Card size:        min 280px, max 360px
Aspect ratio:     3:4 (portrait — like a book cover)
Background:       Flat color from academy.color OR subtle gradient
Top area:         Module number (eyebrow style) + discipline icon or illustration
Center:           Title in Fraunces or Cormorant Garamond
Bottom:           Progress indicator — not a percentage bar
                  Instead: "3 of 10 sessions" in small eyebrow font
                  + a row of 10 dots (filled = complete, empty = remaining)

Completion state: Faint gold overlay + "COMPLETED" stamp-style label
Locked state:     Reduced opacity (0.5) + lock icon, no hover effect
```
---
3.4 — The Instructor / Lesson Player
Used for: LessonPlayer inside any academy context.
```
Layout:           Two-column — content left (65%), instructor panel right (35%)
                  On narrow screens: stacked, instructor above content

Instructor panel: Dark background (#0D0D0D) even inside editorial worlds
                  Persona avatar: circular, 56px, with subtle glow in persona color
                  Name: Fraunces 500, 0.9rem
                  Role title: eyebrow style, persona-color

Progress dots:    Row of N dots, 8px diameter, 6px gap
                  Complete: filled gold
                  Active: filled gold + 2px gold ring
                  Remaining: border only, #3A3A3A

Step content:     Article layout (max-width 680px, Inter body)
Navigation:       "Previous" ghost button left | "Mark Complete & Continue" primary right
                  Never "Next" — always "Continue" or "Mark Complete"
```
---
PART FOUR — MOTION PRINCIPLES
Animation in HESTIA is editorial, not gamified. It signals intentionality, not excitement.
Rules
Duration: 150ms (micro) — 300ms (standard) — 500ms (reveal/entry)
Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)` for most transitions
Entry: fade-up (translateY: 12px → 0, opacity: 0 → 1). Never bounce, never scale pop.
Cover/hero reveals: staggered text lines, 80ms delay between lines
Tab switches: cross-fade (opacity), never slide
Modal open: fade + scale from 0.97 → 1.0 (barely perceptible scale)
Data loading: skeleton screens using `#1E1E1E` animated shimmer, never spinners
Forbidden animations
Bounce / spring / elastic
Rotation effects on page elements
Parallax scrolling (performance + cognitive cost)
Progress bars that "fill" dramatically
Confetti, particle systems, celebratory explosions
The only acceptable "celebration" is a subtle glow pulse on a gold element when a lesson is completed.
---
PART FIVE — THE DESIGN PROCESS FOR ANY NEW SCREEN
When asked to design or build any HESTIA UI, follow this sequence exactly.
Step 1 — Classify the Screen
Ask: Is this operational or editorial?
Operational → Palette A, DM Sans body, Fraunces headers, data-density acceptable
Editorial → Palette B, Inter body, Cormorant Garamond display, breathing room required
If unclear: default to Palette A
Step 2 — Identify the Primary Action
Every screen has one primary action. Name it.
That action gets the gold CTA (Palette A) or burgundy CTA (Palette B).
Everything else is secondary or tertiary.
If you cannot name the primary action, the screen has no reason to exist.
Step 3 — Define the Information Hierarchy
List every element that must appear on the screen.
Rank them: P1 (must see immediately), P2 (need to find), P3 (occasionally needed).
P1 elements get size, contrast, and position. P3 elements go into accordions or secondary panels.
Never show everything at once.
Step 4 — Choose the Layout Pattern
HESTIA uses three layout patterns:
A — The Dashboard (operational hub screens)
```
Sidebar (fixed left) | Main content area (scrollable)
Main content: card grid, max 3 columns
Each card is a module entry point, not a data display
```
B — The Editorial World (magazine, atlas, courses)
```
In-world top nav | Full-width content below
Content uses article widths, not card grids
Navigation is horizontal tabs, not sidebar
```
C — The Detail View (lesson player, cocktail detail, menu builder)
```
Full-screen takeover
No global sidebar visible
Back navigation: minimal — just a "← Back" text link top-left
Content fills the screen; no competing navigation
```
Step 5 — Write the Layout Before Code
Before writing any JSX or CSS, state:
Which palette
Which layout pattern
Primary action and its CTA
Font assignments for each text element
Spacing system applied
Then build.
---
PART SIX — ANTI-PATTERNS (NEVER DO THIS)
These are banned. No exceptions. No "just this once."
```
❌  Purple gradients or blue gradients on any surface
❌  Inter or Roboto as a display font
❌  Rounded corners above 8px on Palette A cards (except pills/tags)
❌  Percentage-based progress bars as the primary progress indicator
❌  Sidebar navigation inside editorial worlds (use top nav)
❌  "Dashboard" widget grid inside editorial worlds
❌  Emoji in UI text (dates, labels, headings — anywhere)
❌  Colored backgrounds on body text
❌  All-caps body text (eyebrows: yes; body: no)
❌  More than one primary CTA per screen
❌  Auto-playing video or audio
❌  Toast notifications that celebrate routine actions ("Menu saved! 🎉")
❌  Skeleton screens with rounded-rectangle shapes that don't match content
❌  Borders on every cell in a table
❌  Dropdown menus longer than 8 items without grouping
❌  Modal dialogs for non-destructive confirmations
❌  "Are you sure?" dialogs for saves
❌  Loading spinners (use skeleton screens)
❌  Sidebar on mobile (use bottom sheet or full-screen takeover)
```
---
PART SEVEN — THE HESTIA VOICE IN UI COPY
Microcopy, labels, empty states, and helper text are written in the HESTIA editorial voice.
Principles
No corporate language. Never "Submit," "Process," "Utilize," "Leverage."
Present tense, active voice. "Add a cocktail" not "A cocktail can be added."
Empty states are editorial moments. Not "No data found." Write something true and considered.
Error messages have a tone. Not "Error 404." Write what happened and what to do.
Button labels are verbs. "Build the menu," "Open the atlas," "Begin the session."
Examples
Bad	Good
Submit	Save this menu
No cocktails found	This menu has no cocktails yet. Start with a signature.
Error loading data	We couldn't reach the bar data. Check your connection and try again.
Loading...	[Skeleton screen — no text]
Are you sure?	[No dialog — use undo instead]
72% Complete	7 of 10 sessions
New	Begin
Edit	Revise
Delete	Remove
Cancel	Never mind
---
QUICK REFERENCE
```
Operational screen?  → Palette A (#0D0D0D base, #C9A96E gold)
Editorial screen?    → Palette B (#F7F3EC ivory, #6B2737 burgundy)

Display font (dark): Playfair Display or Fraunces
Display font (light): Cormorant Garamond
Body font (both):    DM Sans (dark) / Inter (light)
Data font (both):    JetBrains Mono

Primary CTA (dark):  Gold fill, dark text
Primary CTA (light): Burgundy fill, ivory text
Ghost button:        Transparent, 1px border, same color as primary

Spacing base: 8px grid
Border radius: 4–8px cards, 2px editorial, 100px pills only

Motion: 150–300ms, fade-up entry, no bounce
```
---
HESTIA UI Design Skill v1.0 — For use with Claude Code and design prompts.
Built for HESTIA — the hospitality operating system.
