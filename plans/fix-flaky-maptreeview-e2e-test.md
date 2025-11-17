---
name: Fix flaky mapTreeView E2E test
issue: N/A
state: complete
version: 1.137.0
---

## Goal

Fix the flaky E2E test "NodeContextMenu path should remain marked when hovering over another mapTreeView Element" that fails in CI due to race condition when waiting for child elements after folder expansion.

## Tasks

### 1. Add explicit wait in openContextMenu method
- Add `waitForSelector` with increased timeout (15s) before clicking element
- Ensures element is fully rendered and interactive before attempting context menu action
- Fixes race condition where child elements aren't ready after folder expansion in CI environments

### 2. Verify fix doesn't break existing tests
- Run all mapTreeView E2E tests locally
- Confirm both test cases still pass

## Steps

- [x] Create plan
- [x] Add explicit wait in openContextMenu method
- [x] Update plan state to complete

## Notes

- Root cause: In CI environments, folder expansion triggers Angular change detection and CSS layout updates that take longer than the current 100ms buffer
- The `clickButtonOnPageElement` helper has a 10s timeout, but the element might not exist yet when that's called
- Adding the wait inside `openContextMenu` fixes it for all callers, not just this specific test
