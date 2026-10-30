---
name: Local source review fixes
state: complete
version: 1
---

## Goal

Fix the findings picked from the independent review of the local source branch. Findings 3, 10 and 16 were not
picked and stay accepted.

## Tasks

### 1. Viewer
- Long files keep their real width and height; arrow keys scroll the viewer, not the map
- Files are decoded strictly, with a message instead of garbage when they are not text
- The button reads "Back"

### 2. Folders
- A folder has to match a share of the sampled files, not a single one
- Results of a lookup that was overtaken or whose view was left are dropped
- Saving a folder or path reads the saved record fresh

### 3. Paths and failures
- VS Code paths keep quotes out and UNC roots intact; a path that is not absolute is refused in the dialog
- Every failing path shows a message; a folder problem keeps its dialog open with the reason

### 4. Code quality
- One helper for the context menu handlers, the shared clipboard service in the viewer
- Remove restating comments, import through the facade, move the link click out of the paths module

## Steps

- [x] Complete Task 1: Viewer
- [x] Complete Task 2: Folders
- [x] Complete Task 3: Paths and failures
- [x] Complete Task 4: Code quality

## Notes

- A toast is drawn below a modal dialog, so problems inside a dialog are shown in the dialog itself
- How VS Code answers a `vscode://file//server/share/...` link for a network or WSL path was not run
