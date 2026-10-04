---
name: Go up from a focused folder in the radial layouts
issue:
state: complete
version:
---

## Goal

Clicking the centre of a radial layout while it shows the focused folder asks whether to unfocus and
go up, instead of doing nothing.

## Tasks

### 1. Ask before leaving the focus
- At the focused folder the centre click opens the house confirm dialog
- Yes unfocuses and centres on the parent folder, No leaves everything as it is

### 2. Announce it in the tooltip
- The centre's tooltip offers "unfocus and go up" where it used to offer nothing

## Steps

- [x] Complete Task 1: Ask before leaving the focus
- [x] Complete Task 2: Announce it in the tooltip
- [x] Run format, tests, lint and type check
- [x] Update the changelog

## Notes

- Decisions (asked): a confirm dialog rather than unfocusing directly or a toast; lands on the parent folder
