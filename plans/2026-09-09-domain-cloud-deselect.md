---
name: Domain view — click the cloud beside every word to let a selection go
issue: -
state: complete
version: vis 2.1.2
---

## Goal

Clicking the cloud where no word is drawn lets go of what clicking picked out — the broken-down word
and the node the cloud was scoped to — while the search box and whatever it marks are left alone.

## Tasks

### 1. Stop the word click from typing into the search box

Clicking a word wrote it into the word search, which narrowed the list to one row and left behind a
query the reader never typed. That made "the search box rules" untrue: a background click could not
let go of a word the app itself had put in the box. The click now only opens the explorer on the
word; the list already scrolls the expanded row into view.

### 2. Let go on a click beside every word

- The chart reports clicks on words only, so the blank canvas is read off zrender: a click whose
  event carries no target is a click on the empty cloud.
- The empty state ("No domain words for X") counts as empty cloud too; its own button stops the
  click from reaching it.
- The search box is untouched, so its matches stay marked — only the box clears those.

## Steps

- [x] Complete Task 1: stop the word click from typing into the search box
- [x] Complete Task 2: let go on a click beside every word

## Notes

- Right clicks and drags are deliberately not included: zrender reports those separately.
- The toolbox is a sibling of the cloud in the pane, so its clicks never reach the canvas.
- Verified in the browser: 25 domain e2e tests green, including one that clicks the bare corner of
  the canvas and one that proves a typed search survives it.
