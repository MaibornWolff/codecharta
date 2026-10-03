---
name: Screenshot feedback
issue:
state: complete
version:
---

## Goal

Taking a screenshot confirms on the button itself what happened: copied, saved or failed.

## Tasks

### 1. Report the outcome of a capture
- A capture that produced nothing rejects instead of returning silently

### 2. Show the outcome on the button
- The camera turns into a check with "Copied!" or "Saved!", or a warning with "Screenshot failed", for a moment
- Click and hotkeys give the same feedback; a failure also reaches the error handler

## Steps

- [x] Complete Task 1: Report the outcome of a capture
- [x] Complete Task 2: Show the outcome on the button
- [x] Run format, tests, lint and type check
- [x] Update the changelog

## Notes

- Decisions (asked): the button turns into a check rather than a toast or a flash; clipboard, file and failure all give feedback
