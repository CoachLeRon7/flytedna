

# B.coming Curriculum -- Integrated Learning Modules

## Summary
Add the B.coming Curriculum as an interactive, visually engaging learning modules experience on the website. This will be a new `/curriculum` page accessible from the Growth Plan and Dashboard, presenting the 16-module program as a structured learning journey that students progress through after taking their FLDI assessment.

## What gets built

### 1. New `/curriculum` page with module browser
A dedicated page displaying the B.coming curriculum as an interactive accordion/card-based module viewer. The page will be split into two tracks:
- **Middle School Modules** (8 modules)
- **High School Modules** (8 modules)

Each module card will show:
- Module number, title, and inspirational quote (where available)
- Learning objectives as a checklist-style list
- Key concepts as tags/badges
- Activities section (collapsible) with activity descriptions
- Assessment criteria (formative + summative)
- A visual progress indicator showing locked/unlocked/completed state

The page will feature:
- A hero section with the "B.coming Learning Loop" visualization (B-C-O-M-I-N-G steps as a circular/stepped diagram)
- Track selector tabs (Middle School vs High School)
- Module cards that expand to show full content via accordion/collapsible UI

### 2. Curriculum data file
A new `src/lib/curriculumData.ts` file containing all module content structured as TypeScript data -- titles, objectives, key concepts, activities, and assessments for all modules (Modules 1-5 fully detailed, Modules 6-8 as placeholders with titles only).

### 3. Integration points
- Add a "B.coming Curriculum" button/link on the Growth Plan page sidebar
- Add a route `/curriculum` in App.tsx
- Link from the student Dashboard as a "Learning Modules" card
- The page will use the existing design system (navy primary, amber accent, collapsible UI components)

### 4. B.coming Learning Loop visual
A creative stepped visualization showing the 7-step learning loop:
**B**egin with Identity Prompt, **C**hallenge the Mind, **O**bserve the Concept, **M**ake It Personal, **I**ntegrate Through Action, **N**avigate Feedback, **G**row Through Retrieval

## Technical details

### Files to create
- `src/lib/curriculumData.ts` -- module content data (both MS and HS tracks)
- `src/pages/Curriculum.tsx` -- main curriculum page component
- `src/components/curriculum/ModuleCard.tsx` -- individual module display card
- `src/components/curriculum/LearningLoopVisual.tsx` -- B.coming loop diagram

### Files to modify
- `src/App.tsx` -- add `/curriculum` route
- `src/pages/GrowthPlan.tsx` -- add link to curriculum
- `src/pages/Dashboard.tsx` -- add "Learning Modules" navigation card

### No database changes needed
All curriculum content is static and will be stored as TypeScript data. No new tables or migrations required.

