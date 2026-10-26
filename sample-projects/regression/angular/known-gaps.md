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

## spec-compound-selector

A component selector names its element alone, so `button[appIconButton]` matches every `<button>`.

```text
extra file app/plain.component.html -> shared/icon-button.component.ts
extra leaf app/plain.component.html#plain_component_html -> shared/icon-button.component.ts#IconButtonComponent
```

## spec-attribute-value

A template reports the names of its elements and pipes, not of its attributes, and a selector with an attribute value names no element.

```text
missing file app/birthday.component.html -> shared/date-mask.directive.ts
missing leaf app/birthday.component.html#birthday_component_html -> shared/date-mask.directive.ts#DateMaskDirective
```

## spec-class-selector

A template reports the names of its elements and pipes, not its classes, and a class selector names no element.

```text
missing file app/panel.component.html -> shared/card-style.directive.ts
missing leaf app/panel.component.html#panel_component_html -> shared/card-style.directive.ts#CardStyleDirective
```

## spec-not-selector

A template reports the names of its elements and pipes, not of its attributes, and a selector with an attribute names no element.

```text
missing file app/link.component.html -> shared/link-tip.directive.ts
missing file app/note.component.html -> shared/focus.directive.ts
missing file app/note.component.html -> shared/tip.directive.ts
missing leaf app/link.component.html#link_component_html -> shared/link-tip.directive.ts#LinkTipDirective
missing leaf app/note.component.html#note_component_html -> shared/focus.directive.ts#FocusDirective
missing leaf app/note.component.html#note_component_html -> shared/tip.directive.ts#TipDirective
```

## spec-bound-attributes

A template reports the names of its elements and pipes, not of its bindings and events.

```text
missing file app/form.component.html -> shared/bind.directive.ts
missing file app/form.component.html -> shared/click.directive.ts
missing file app/form.component.html -> shared/on.directive.ts
missing file app/form.component.html -> shared/twoway.directive.ts
missing file app/form.component.html -> shared/value.directive.ts
missing leaf app/form.component.html#form_component_html -> shared/bind.directive.ts#BindDirective
missing leaf app/form.component.html#form_component_html -> shared/click.directive.ts#ClickDirective
missing leaf app/form.component.html#form_component_html -> shared/on.directive.ts#OnDirective
missing leaf app/form.component.html#form_component_html -> shared/twoway.directive.ts#TwowayDirective
missing leaf app/form.component.html#form_component_html -> shared/value.directive.ts#ValueDirective
```

## spec-structural-directive

A template reports the names of its elements and pipes, not its structural directives.

```text
missing file app/list.component.html -> shared/repeat.directive.ts
missing file app/list.component.html -> shared/track-by.directive.ts
missing file app/list.component.html -> shared/unless.directive.ts
missing leaf app/list.component.html#list_component_html -> shared/repeat.directive.ts#RepeatDirective
missing leaf app/list.component.html#list_component_html -> shared/track-by.directive.ts#TrackByDirective
missing leaf app/list.component.html#list_component_html -> shared/unless.directive.ts#UnlessDirective
```

## spec-several-matches

A template reports the names of its elements and pipes, not of its attributes, so only the component matches.

```text
missing file app/card.component.html -> shared/highlight.directive.ts
missing file app/card.component.html -> shared/tooltip.directive.ts
missing leaf app/card.component.html#card_component_html -> shared/highlight.directive.ts#HighlightDirective
missing leaf app/card.component.html#card_component_html -> shared/tooltip.directive.ts#TooltipDirective
```
