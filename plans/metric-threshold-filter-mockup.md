---
name: metric-threshold-filter-mockup
issue: <none>
state: complete
version: 1
---

## Goal

Mock up a filter that flattens or excludes buildings and folders by metric threshold, and explore
where in the UI creating such a rule belongs. Design only — no production code.

## Tasks

### 1. Ground the mockup in the running app
- Build and screenshot the current app; the repo `screenshot.png` is from v1.129.1 and is wrong
- Lift resolved values (daisyUI 5 sizes, theme colors, Roboto) rather than recalling them

### 2. Design the rule editor
- Target Buildings / Folders / Both, metric, operator, threshold, action Flatten / Exclude
- Live blast radius; folder metrics are aggregates and take the whole subtree
- Threshold rules must appear in the existing rule popovers as a third rule kind

### 3. Explore placement
- A: explorer search-actions menu + rule popovers (rules already live there)
- B: metrics-bar segment with cog popover
- C: dedicated dialog
- Low-fi wireframes; lead with A in the main frame

## Steps

- [x] Complete Task 1: ground the mockup in the running app
- [x] Complete Task 2: design the rule editor
- [x] Complete Task 3: explore placement
- [x] Publish the canvas and hand over

## Notes

- User declined the static-vs-clickable question, so: static mockups, offered as clickable on request
- Existing flatten/exclude vocabulary to reuse verbatim: "Flatten node and its children, keeping an
  empty space", "Exclude node from the map"; rule kinds today are RULE (primary) and MANUAL (warning)

- Canvas: https://claude.ai/code/artifact/6dd42353-c1ab-46a9-ac2f-e1ee0624bf43
- Working artboards: scratchpad/design/*.dc.html (session-local)
- Runtime theme is daisyUI's default light theme, not the `@theme` block in `visualization/app/tailwind.css`:
  primary resolves to #422ad5, not the CodeCharta blue #1b9cfc. Mockup matches the running app.
