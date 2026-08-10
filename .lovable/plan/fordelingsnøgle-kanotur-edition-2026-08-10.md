# Fordelingsnøgle - Kanotur Edition

A mobile-first app for managing a canoe-trip crew: participants, beer-themed competitions, a live leaderboard, and an engine that splits everyone into canoes with roles. All data lives in the browser's local storage — no accounts, no backend.

## Look and feel
Outdoorsy beer & canoe vibe: river greens, birch/paper light mode, deep pine dark mode, amber/beer accents. Rounded cards, chunky tap targets, Lucide icons, Shadcn components. Dark/light toggle in the header, remembered between visits.

## Screens (each its own page with bottom/top nav)
1. **Deltagere** — add/edit/delete participants, assign them to a group (e.g. "Kanotur 2026"), switch active group, toggle each person active/inactive for afbud.
2. **Konkurrencer** — catalog of the 10 preloaded competitions (name, unit, scoring direction, multiplier), all editable and deletable, plus "add custom". Checkbox to mark which ones are active for this event.
3. **Scores** — pick an active competition, enter one value per active participant in a fast numeric form; shows the computed ranking points live.
4. **Leaderboard** — total points per participant, sorted, with a per-competition breakdown.
5. **Kanoer** — choose a canoe layout, choose a distribution strategy, generate the assignment.
6. **Oversigt** — canoe cards with roles and a "Kopiér resumé" button that puts a text summary on the clipboard for WhatsApp/SMS.

## The maths
**Points per competition:** rank the N participants who have a score, best first (direction depends on the competition). 1st gets N points, last gets 1. Ties share the same points (all tied people get the points of the best rank in the tie). Result multiplied by the competition multiplier. Participants with no score get 0 for that competition.

**Canoe layouts:** for N active participants, enumerate every pair (a canoes of 2, b canoes of 3) with 2a + 3b = N, a,b >= 0. Shown as e.g. "5x 2-mands + 1x 3-mands". N = 1 has no valid layout and shows a friendly message.

**Strategies:**
- Jævnbyrdig: sort by total points, then repeatedly pair the strongest remaining with the weakest remaining until each canoe is full.
- Elitær: sort by total points and fill canoes in order, so the top people ride together.
- Kaos: shuffle randomly, with a "shuffle again" button.

**Roles inside each canoe:** sort members by total points — highest = Styrmand (bagerst), lowest = Motor (forrest), middle (3-person canoes only) = Bartender (i midten).

## Technical notes
- TanStack Start file routes: `index.tsx` (Deltagere/home), `konkurrencer.tsx`, `scores.tsx`, `leaderboard.tsx`, `kanoer.tsx`, `oversigt.tsx`, each with its own head metadata.
- State in a single React context store (`src/lib/store`) holding groups, participants, competitions, scores, event settings and the last generated assignment; serialized to localStorage under one versioned key, hydrated after mount to avoid SSR mismatch, with the preloaded competition catalog as the seed.
- Pure helper modules with no UI dependencies: `scoring.ts` (ranking points, totals), `layouts.ts` (canoe combinations), `allocation.ts` (strategies + role assignment), `summary.ts` (text export).
- Theme toggle via a `dark` class on `<html>`, persisted; all colours added as oklch tokens in `src/styles.css`.
- Clipboard copy with a sonner toast fallback showing the text if the clipboard API is blocked.
