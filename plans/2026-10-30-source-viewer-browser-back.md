---
name: Source viewer and the browser's back button
state: complete
version: 1
---

## Goal

Mouse back while the source viewer is open returns to the map on the same view. No dialog inside a view survives
leaving that view, because a kept-alive view re-attached with an open dialog draws it under the side panels.

## Tasks

### 1. Back returns to the map
- Opening the viewer adds a history entry; going back closes the viewer and stays on the view
- Closing it with its button or Escape removes that entry again; forward does not reopen it

### 2. Dialogs close with their view
- Leaving a view closes the dialogs open inside it; dialogs outside the views stay as they are

### 3. Sonar issues of PR 4638
- Fix the open issues of the PR after the two tasks above

## Steps

- [x] Complete Task 1: Back returns to the map
- [x] Complete Task 2: Dialogs close with their view
- [x] Add e2e coverage and a changelog entry
- [x] Complete Task 3: Sonar issues of PR 4638
