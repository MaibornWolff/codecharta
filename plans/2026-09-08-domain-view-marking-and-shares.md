---
name: Domain view — keep the cloud's mark, mark searched words, name every share
issue: -
state: todo
version: vis 2.1.2
---

## Goal

Three separate fixes to the domain view, one commit each: the cloud must keep marking the inspected
word after it re-lays out for a newly selected node, a word search must mark every hit on the cloud,
and the two percentages in the explorer must say what they are a share of.

## Tasks

### 1. Keep the cloud's mark through a progressive layout

Measured cause (Playwright probe against the built app, deep 400-word fixture): echarts-wordcloud
lays a large cloud out in chunks and reports `finished` for **every** chunk — nine times for 150
words. `WordCloudChartHost.restoreTheHighlightALayoutWiped()` consumes its one-shot flag on the
first of them, when one word is drawn and the marked word is not, so the `highlight` dispatch is a
no-op and no later `finished` retries it. The mark therefore survives a click in the word list (no
re-layout) but is lost the moment a node click re-scopes the cloud.

- Move the restore from the `finished` handler to the drawn-count settle callback, which already
  debounces past the last chunk; the flag still guards it, so a hover render never downplays.
- Test in `wordCloudChartHost.spec.ts`: several `finished` events, then the settle timer, and the
  `highlight` dispatch must land after the last chunk.

### 2. Mark every searched word on the cloud

- `WordCloudChartHost.highlightWord(string | null)` → `highlightWords(readonly string[])`; echarts
  takes an array `name` on the highlight action. Emphasis only — no dimming of the rest.
- `WordCloudComponent`'s `inspectedWord` input → `markedWords`, so the view decides what is marked.
- `DomainViewComponent` computes it: the inspected word, plus every project word matching the word
  query while the explorer browses words. On the Files tab the word query is invisible, so it marks
  nothing there.
- Guard the empty query — `"".includes("")` matches every word.

### 3. Name what each percentage is a share of

A word row's percent is the word's share of all word occurrences in the project; an occurrence row's
percent is that node's share of *that word*. Both render as "x% / count" with the same bar, which
reads as one scale.

- Word row decoration → `2% of all words · 42`.
- Occurrence row decoration → `62% of "invoice" · 26`; the row needs the word passed in.
- Give `ExplorerRowComponent` a bar tone so an occurrence row's bar is tinted apart from the word's.

## Steps

- [ ] Complete Task 1: keep the cloud's mark through a progressive layout
- [ ] Complete Task 2: mark every searched word on the cloud
- [ ] Complete Task 3: name what each percentage is a share of
- [ ] CHANGELOG entry per commit, `npm test` green, biome clean

## Notes

- Verified by probe, not by reading: the mark survives drilling down in the two bundled samples
  because their clouds lay out in a single chunk. It takes a cloud big enough to be laid out
  progressively (~150 words) to lose it.
- Clicking a word in the cloud sets the word query to that word, so after Task 2 a word that
  contains another word's text is marked alongside it. That follows from "mark what is in the
  search" and is left as is.
