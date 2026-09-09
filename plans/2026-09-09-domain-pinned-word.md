---
name: Domain view — pin the opened word above the word list
issue: -
state: complete
version: vis 2.1.2
---

## Goal

The word you open is lifted out of the list into a sticky pinned section at the top of the explorer,
so it is always in sight and the cloud's mark on it is always justified — whatever the search below
it is filtering.

## Tasks

### 1. Pin the opened word

- The word list lifts the opened word out of its rows into a sticky block at the top of the scrolling
  panel: a "Pinned" strip with an unpin button, the word's row, and its breakdown.
- The rows below are every *other* word, filtered by the search as before, so the pinned word is
  never listed twice.
- Clicking a word below replaces the pinned one; the unpin button and a click on the pinned row let
  it go, as does a click on the empty cloud.
- The breakdown inside the pin is capped in height and scrolls on its own, so a word that occurs in
  many folders cannot swallow the panel.
- The empty hint belongs to the search, so it stays out when the search matched the pinned word and
  nothing else.

### 2. Drop what the pin makes dead

Nothing is expanded inside the list any more, so the virtualisation no longer has to model one
irregular row, and nothing has to be scrolled into view.

- `WordListGeometry` loses `expandedIndex` and `expandedHeight`, and its offset maths goes back to
  uniform rows.
- `WordListViewport` loses `trackOpenBreakdown` and the remembered breakdown height.
- The list loses `scrollTheExpandedWordIntoView`, and `isRowOnScreen`/`offsetThatCentres` go with it.

## Steps

- [x] Complete Task 1: pin the opened word
- [x] Complete Task 2: drop what the pin makes dead

## Notes

- The marks are unchanged: the cloud marks the pinned word plus every word the search matched, and a
  click on the empty cloud unpins without touching the search.
- The pinned block is sticky inside the explorer's scroll host, which is the panel's own
  `overflow-auto` div — the list is a direct child of it, so `position: sticky` holds.
- The pin's own breakdown uses `overflow-y-auto`, not `overflow-auto`: the e2e locates the panel by
  `cc-sidebar-explorer .overflow-auto`, which a second `overflow-auto` inside the list made
  ambiguous.
- Verified in the browser: the pin holds its place while the list scrolls under it, survives a search
  that filters everything below it, and the word is never listed twice. 28 domain e2e tests green.
