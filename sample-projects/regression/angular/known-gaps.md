# Known gaps: Angular templates

The probes of this folder whose output deviates from their `expected.txt` today, against the rules in
`analysis/analysers/parsers/DependencyParser/docs/name-resolution/typescript.md`. In each block, `missing <line>` is
an expected line the parser does not draw yet and `extra <line>` a wrong line it draws; `ProbeRegressionTest` fails
once a gap closes, and the closed lines are deleted here.

## spec-attribute-directive

A template reports the names of its elements and pipes, not of its attributes.

```text
missing file app/card.component.html -> shared/highlight.directive.ts
missing file app/card.component.html -> shared/tooltip.directive.ts
missing leaf app/card.component.html#card_component_html -> shared/highlight.directive.ts#HighlightDirective
missing leaf app/card.component.html#card_component_html -> shared/tooltip.directive.ts#TooltipDirective
```
