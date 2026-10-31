---
name: Local source PR findings
state: complete
version: 1
---

## Goal

Check the CodeRabbit and Sonar findings on PR 4638 and fix those that hold.

## Steps

- [x] A failure toast names a generic reason when the thrown value is not an error
- [x] Sonar `Web:S6845` on the source viewer: bind the tabindex with `[attr.tabindex]`

## Notes

- The code area scrolls by keyboard and has to stay reachable with Tab; `tabindex="-1"` would satisfy the rule but
  lock keyboard users out once they tab away
- The binding keeps the behaviour and hides the attribute from the rule's static check; the finding is not otherwise
  resolved, and whether Sonar drops it shows only after a push
