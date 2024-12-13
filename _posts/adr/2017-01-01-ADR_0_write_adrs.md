---
categories:
  - ADR
title: "ADR 0: We'll write architecture decision records"
---

CodeCharta is an agile project and will grow and change over time. Along the way we'll make many (architecture) decisions and revert previous decisions. Instead of trying to decide everything up front, we want to document our decisions when we make them.

We'll use Architecture Decision Records (ADR) to document our decisions. They are a template to document architecture decisions, [first proposed](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard. They allow us to document decisions, why we made them and also if we changed our decisions.

An ADR is not a concept or an instruction. It simply remembers the why of our decision. If you need to document a concept (f.ex. how to use angular in our project), you should write a separate document for that. Our ADRs follow the format from Michael Nygard with some additions by [Joel Parker Henderson](https://github.com/joelparkerhenderson/architecture_decision_record):

- The file name and title has a present tense imperative verb phrase. This matches our commit message format.
- The name should not include a technology but focus on the context for which we picked a technology.
  - that leaves room to change the tech later.
- The name starts with the Jekyll date and uses lowercase and underscores for the title.
- The extension is markdown `md`.

# title: <short present tense imperative phrase, less than 50 characters, like a git commit message.>

# Context (dont write the header so the excerpt looks good)

<what is the issue that we're seeing that is motivating this decision or change.>

# Status

<proposed, accepted, rejected, deprecated, superseded, etc.>

# Decision

<what is the change that we're actually proposing or doing.>

# Consequences

<what becomes easier or more difficult to do because of this change.>
