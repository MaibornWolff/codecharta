---
name: word list sort options
issue: <#issueid>
state: todo
version: 1
---

## Goal

The explorer's word mode always lists words most frequent first. Give it the same sort control the
file mode has, offering **Occurrences**, **Name** and **Relevance** (TF-IDF) with the shared
ascending/descending toggle.

## Decisions

- Reuse `cc-explorer-sort-control`, picking the sort source by active mode exactly as the search bar
  picks its search source (`EXPLORER_WORD_SORT`, provided only by a view with a word mode).
- The options a view offers move out of `ExplorerCapabilities` into the sort source itself, so each
  mode states its own options in one place. Structural change, committed first.
- Word sort state is view local, like the word search query (`DomainWordSortStore`).
- Relevance falls back to a word's count when the project carries no TF-IDF, as the word cloud does.

## Tasks

### 1. Sort options move into the sort port (structural)
- `ExplorerSort` gains `options`; `ExplorerCapabilities.sortOptions` goes away.
- `ExplorerSortConfig` carries the options; metrics and domain views state theirs there.
- Sort control reads its options from the injected sort source; update mocks and specs.

### 2. Word sorting
- `sortWords(words, sorting)` in the word feature with `WordSortingOption` (Occurrences, Name,
  Relevance); `matchingWords` goes back to filtering only.
- `DomainWordListComponent` takes a `sorting` input and applies it to the filtered words.

### 3. Wiring
- `DomainWordSortStore` (view scoped) implements the sort port for words, defaulting to Occurrences
  descending, and is provided as `EXPLORER_WORD_SORT`.
- Sort control picks word vs file sort by active mode; the explorer shell renders it in every mode.
- Domain view passes the store's sorting to the word list.

### 4. Documentation
- CHANGELOG entry.

## Steps

- [ ] Complete Task 1: Sort options move into the sort port
- [ ] Complete Task 2: Word sorting
- [ ] Complete Task 3: Wiring
- [ ] Complete Task 4: Documentation

## Notes

- Tie-break stays word text ascending in every option and direction, so equal counts read alphabetically.
