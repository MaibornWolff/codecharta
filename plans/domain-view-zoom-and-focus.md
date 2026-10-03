---
name: Domain view zoom and focus
issue: n/a
state: complete
version: n/a
---

## Goal

Let the reader magnify and pan the word cloud, and let Focus on a folder — the same focus the map and
dependency views share — scope the domain view's cloud and word list.

## Tasks

### 1. Zoom
- Wheel magnifies the laid-out cloud towards the pointer, dragging pans it; words keep their places
- The cloud never zooms out past the whole cloud, and never pans out of sight
- "Show whole cloud" tool in the domain toolbox

### 2. Focus
- Offer Focus / Unfocus on folders in the domain view's context menu
- Cloud and word list show the focused folder's words while nothing is selected
- Focusing lets go of a selection outside the focus
- Unfocus tool in the domain toolbox; "Show whole map" in the empty cloud unfocuses too
- TF-IDF stays project-wide

## Steps

- [x] Complete Task 1: Zoom
- [x] Complete Task 2: Focus
- [x] Checks: format, tests, lint, tsc
- [x] CHANGELOG

## Review Feedback Addressed

1. **Word list empty hint**: a focused folder without words is now named as such instead of claiming the whole project carries none
2. **Click after dragging the cloud**: skipped — zrender already drops the click once the pointer moved more than 4px between press and release, so a drag never reports a word or background click

## Notes

- Zoom transforms the series' zrender group, so words stay crisp and clickable; no re-layout
- Zoom survives a re-layout (not reset on selection change, as decided)
- The explorer's file tree lists the focused folder alone, so no node outside the focus can be selected; a node handed over from outside clears the focus
- Not yet tried in a running app: the specs mock ECharts
- The map and dependency explorers list the focused folder alone as well; their count and rule chips stay project-wide
- Focus is offered for folders only, in every view; "Show in Metrics" on a node outside the focus clears the focus
- A focus replaces the one before it; Unfocus All is gone and a single Unfocus shows the whole project
- A "Focus mode · Show whole project" banner between search and sort in every explorer leaves the focus on click
