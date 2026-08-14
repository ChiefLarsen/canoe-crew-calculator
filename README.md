# Canoe Crew Chief

Build a web app called "Fordelingsnøgle - Kanotur Edition" designed to manage participants, track competition results, and automatically calculate canoe assignments and roles.



### Key Tech & UI Requirements:

- Modern, clean, mobile-friendly UI (Tailwind CSS, React, Lucide Icons, Shadcn UI components if available).

- Dark/Light mode support with a fun, outdoorsy beer & canoe vibe.

- LocalStorage persistence so data is saved locally on the device.



---



### Core Data Structures & Features:



#### 1. Participant & Group Management

- Create, edit, and delete participants.

- Organize participants into "Groups" (e.g., "Kanotur 2026").

- Toggle participant active/inactive state (to handle last-minute dropouts/afbud).



#### 2. Competition Catalog & Setup

- Pre-loaded Competitions (editable/deletable):

  1. "Indiana Jones" (Unit: Gram deviation from 500g, Scoring: LOW IS BEST)

  2. "Øl-vægt gæt" (Unit: Gram deviation after a gulp of beer, Scoring: LOW IS BEST)

  3. "Ølkasse-balancen" (Unit: Seconds on 1 leg on beer crate, Scoring: HIGH IS BEST)

  4. "Kapsel-præcision" (Unit: Points out of 5 throws, Scoring: HIGH IS BEST)

  5. "Sømandsknuden" (Unit: Seconds to tie knot, Scoring: LOW IS BEST)

  6. "Øldrikning - Tættest på elastik" (Unit: mm deviation, Scoring: LOW IS BEST)

  7. "Øl på tid" (Unit: Seconds, Scoring: LOW IS BEST)

  8. "Kapsel op-knap" (Unit: dB / distance points, Scoring: HIGH IS BEST)

  9. "Musikquiz" (Unit: Points, Scoring: HIGH IS BEST)

  10. "Shuffleboard" (Unit: Distance points, Scoring: LOW IS BEST)

- Option to add custom competitions: Name, Unit (e.g., sec, cm, dB, pts), Scoring Direction ("High is Best" vs "Low is Best"), and Multiplier (e.g., 0.5x, 1x, 2x).



#### 3. Score Entry & Leaderboard

- Select active competitions for the current event.

- Easy score input form per participant per selected competition.

- Automatic point calculation:

  - For $N$ active participants in a competition, rank them from best to worst.

  - 1st place gets $N$ points, last place gets 1 point. (In case of ties, assign equal points).

  - Multiply ranking points by the competition's Multiplier.

- Real-time Leaderboard showing total accumulated points per participant.



#### 4. Dynamic Canoe Allocation Logic (Mathematical Engine)

Given $N$ active participants:

- Automatically calculate all valid canoe layout combinations using canoes of size 2 and 3 (never size 1).

  - Example $N=13$: Display option "5x 2-man canoes + 1x 3-man canoe".

  - Example $N=12$: Display options: "6x 2-man", "4x 3-man", or "3x 2-man + 2x 3-man".

- User selects their preferred canoe breakdown layout.



#### 5. Distribution Strategy & Role Assignment

Allow selecting one of 3 distribution strategies:

1. **Jævnbyrdig / Balance:** Pairs highest-scoring participants with lowest-scoring participants (Top + Bottom).

2. **Elitær / Top vs Bottom:** Pairs highest-scoring with highest-scoring, lowest with lowest.

3. **Kaos / Tilfældig:** 100% random distribution.



**Role Assignment within each assigned canoe:**

- Sort the members inside each individual canoe by their total overall points:

  - Highest score in canoe = **Styrmand** (Bagerst)

  - Lowest score in canoe = **Motor** (Forrest)

  - Middle score in canoe (only for 3-person canoes) = **Bartender** (I midten)



#### 6. Summary & Export View

- Display clear "Canoe Cards" (Canoe #1, Canoe #2, etc.) showing assigned participants and their roles.

- Include a "Copy/Share Summary as Text" button so results can easily be pasted into WhatsApp/Messenger/SMS.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f991792-ad0d-435c-8df2-e2b5ec4e8be1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
