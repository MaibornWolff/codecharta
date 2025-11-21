---
name: <name>
issue: <#issueid>
state: <todo | progress | complete>
component: <analysis | visualization | both>
version: <semantic version when completed, e.g., 1.138.0>
---

## Goal

<Describe the goal of this task in 1-3 sentences>

**Important:** When marking this plan as `state: complete`, update the `version` field with the current version of the affected component(s):
- For analysis changes: Use version from `analysis/gradle.properties` (currentVersion)
- For visualization changes: Use version from `visualization/package.json`
- For both: Use the higher version number or list both (e.g., "analysis: 1.138.0, visualization: 1.137.0")

## Tasks

<Detailed but concise breakdown and guidance for implementation. Describe what needs to be done, including context, rationale, but keep technical details to a minimum.>

### 1. <Task name>
- Subtask or detail
- Another subtask or detail
- ...

### 2. <Task name>
- Subtask or detail
- Another subtask or detail
- ...

### 3. <Task name>
- Subtask or detail
- ...

## Steps

<Trackable progress checkboxes. Each step should reference the tasks described above.>

- [ ] Complete Task 1: <Task name>
- [ ] Complete Task 2: <Task name>
- [ ] Complete Task 3: <Task name>
- [ ] ...

## Review Feedback Addressed

1. **<Location/Topic>**: Description of feedback and how it was addressed
2. **<Location/Topic>**: Description of feedback and how it was addressed

## Notes

- Additional context or decisions
- Implementation details worth remembering
- Future considerations
- Verification steps performed
