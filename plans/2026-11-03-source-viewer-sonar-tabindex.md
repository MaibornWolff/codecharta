---
name: Source viewer Sonar tabindex
state: complete
version: 1
---

## Goal

Clear Sonar `Web:S6845` on PR 4638: the source viewer's scrollable code area has a tabindex on a plain div.

## Steps

- [x] Spec: the code area is a read-only, multi-line textbox named "Source code" that Tab reaches
- [x] Template: `role="textbox"`, `aria-readonly`, `aria-multiline`, plain `tabindex="0"` instead of the binding

## Notes

- The `[attr.tabindex]` binding from 2026-10-31 did not clear the finding
- The tabindex stays: Safari scrolls the code by keys only when it is focusable, and the viewer focuses it on open
- The textbox role follows CodeMirror's read-only code area; screen readers announce a read-only text field
